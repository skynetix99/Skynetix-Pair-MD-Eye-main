// =====================================================================
// SKYNETIX AI PROVIDER
//
// Provider order:
//   1. Configured OpenAI-compatible endpoint (OPENAI_API_KEY)
//   2. Configured/public Siputzx AI Gateway (AI_GATEWAY_URL)
//   3. Optional authenticated Pollinations endpoint (POLLINATIONS_API_KEY)
//
// The old Siputzx `/api/ai/chatgpt` and Widipe endpoints were removed because
// they are no longer reliable. Every provider has a bounded timeout and
// returns a useful diagnostic when it cannot be used.
// =====================================================================

const fetchImpl = globalThis.fetch || require('node-fetch');

const LLM_MODEL = process.env.AI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini';
const REQUEST_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 7000);
const TOTAL_TIMEOUT_MS = Number(process.env.AI_TOTAL_TIMEOUT_MS || 10000);
const GATEWAY_URL = (process.env.AI_GATEWAY_URL || 'https://ai.siputzx.my.id/').replace(/\/$/, '');
const GATEWAY_MODEL = process.env.AI_GATEWAY_MODEL || 'gemini';

const SYSTEM_PROMPT =
`You are a helpful AI assistant built into a WhatsApp bot named SKYNETIX.
Answer ONLY the user's question directly and stay strictly on topic.
- Do not change the subject or answer a different question.
- Keep replies concise, clear, and friendly for WhatsApp.
- If you genuinely do not know, say so briefly instead of guessing wildly.`;

const chatMemory = new Map();

function remember(userJid, text) {
    const list = chatMemory.get(userJid) || [];
    list.push({ role: 'user', content: String(text).slice(0, 2000) });
    if (list.length > 6) list.splice(0, list.length - 6);
    chatMemory.set(userJid, list);
}

function rememberAnswer(userJid, answer) {
    const list = chatMemory.get(userJid) || [];
    list.push({ role: 'assistant', content: String(answer).slice(0, 2000) });
    if (list.length > 7) list.splice(0, list.length - 7);
    chatMemory.set(userJid, list);
}

async function requestJson(url, options = {}, providerName = 'AI provider') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetchImpl(url, { ...options, signal: controller.signal });
        const raw = await response.text();
        let data = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw }; }
        if (!response.ok) {
            const detail = data?.error?.message || data?.message || data?.error || `HTTP ${response.status}`;
            throw new Error(`${providerName}: ${response.status} ${String(detail).slice(0, 180)}`);
        }
        return data;
    } catch (error) {
        if (error.name === 'AbortError') throw new Error(`${providerName}: request timed out`);
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

function nonEmptyAnswer(value, providerName) {
    const answer = typeof value === 'string' ? value.trim() : String(value || '').trim();
    if (!answer) throw new Error(`${providerName}: empty response`);
    return answer;
}

async function askOpenAI(userJid, userMessage) {
    const key = String(process.env.OPENAI_API_KEY || '').trim();
    if (!key) throw new Error('OpenAI: OPENAI_API_KEY is not configured');
    const base = (process.env.AI_BASE_URL || process.env.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, '');
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(chatMemory.get(userJid) || []),
        { role: 'user', content: userMessage }
    ];
    const data = await requestJson(`${base}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: LLM_MODEL, messages, max_tokens: 1000, temperature: 0.4 })
    }, 'OpenAI');
    return nonEmptyAnswer(data?.choices?.[0]?.message?.content, 'OpenAI');
}

async function askGateway(userJid, userMessage) {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.AI_GATEWAY_KEY) headers.Authorization = `Bearer ${process.env.AI_GATEWAY_KEY}`;
    const data = await requestJson(GATEWAY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            content: userMessage,
            user: String(userJid || 'skynetix-user'),
            model: GATEWAY_MODEL,
            prompt: SYSTEM_PROMPT
        })
    }, 'AI Gateway');
    return nonEmptyAnswer(data?.result || data?.answer || data?.data || data?.message, 'AI Gateway');
}

async function askPollinations(userMessage) {
    const key = String(process.env.POLLINATIONS_API_KEY || '').trim();
    if (!key) throw new Error('Pollinations: POLLINATIONS_API_KEY is not configured');
    const prompt = `${SYSTEM_PROMPT}\n\nUser question:\n${userMessage}`;
    const url = `https://gen.pollinations.ai/text/${encodeURIComponent(prompt)}?model=${encodeURIComponent(process.env.POLLINATIONS_MODEL || 'openai')}`;
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${key}` } });
    const raw = await response.text();
    if (!response.ok) throw new Error(`Pollinations: ${response.status} ${raw.slice(0, 180)}`);
    return nonEmptyAnswer(raw, 'Pollinations');
}

async function getAIResponse(userJid, userMessage) {
    const question = String(userMessage || '').trim();
    if (!question) throw new Error('Empty question');
    remember(userJid, question);

    const providers = [];
    if (String(process.env.OPENAI_API_KEY || '').trim()) {
        providers.push(['OpenAI', () => askOpenAI(userJid, question)]);
    }
    if (GATEWAY_URL) {
        providers.push(['AI Gateway', () => askGateway(userJid, question)]);
    }
    if (String(process.env.POLLINATIONS_API_KEY || '').trim()) {
        providers.push(['Pollinations', () => askPollinations(question)]);
    }
    if (!providers.length) {
        throw new Error('No AI provider configured. Set OPENAI_API_KEY or AI_GATEWAY_URL.');
    }

    const errors = [];
    const attempts = providers.map(([name, provider]) => (async () => {
        try {
            const answer = await provider();
            if (typeof answer !== 'string' || answer.trim().length < 2) {
                throw new Error(`${name}: empty response`);
            }
            return answer.trim();
        } catch (error) {
            const message = error?.message || `${name}: request failed`;
            console.error(`[AI] ${message}`);
            errors.push(message);
            throw error;
        }
    })());

    let timer;
    try {
        const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('AI providers timed out. Please try again.')), TOTAL_TIMEOUT_MS);
        });
        const answer = await Promise.any([Promise.all(attempts).then(([first]) => first), ...attempts, timeout]);
        rememberAnswer(userJid, answer);
        return answer;
    } catch (error) {
        if (error?.message?.startsWith('AI providers timed out')) throw error;
        throw new Error(`AI providers unavailable. Please try again shortly. ${errors.slice(0, 3).join(' | ')}`);
    } finally {
        if (timer) clearTimeout(timer);
    }
}

function clearMemory(userJid) {
    chatMemory.delete(userJid);
}

module.exports = { getAIResponse, SYSTEM_PROMPT, clearMemory };
