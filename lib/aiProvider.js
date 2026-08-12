// =====================================================================
//  SKYNETIX AI PROVIDER — reliable, on-topic AI responses
//
//  Response chain (primary -> fallback):
//    1. OpenAI-compatible API (via OPENAI_API_KEY / OPENAI_API_BASE, or
//       OPENAI_API_KEY with the official api.openai.com endpoint)
//    2. api.siputzx.my.id ChatGPT (free)
//    3. widipe.com openai (free)
//
//  Every call carries a strict system prompt so the answer is always
//  directly related to what the user asked.
// =====================================================================

const axios = require('axios');

// ---- Configurable via env (defaults keep the bot working out of the box) ----
const LLM_MODEL = process.env.AI_MODEL || process.env.LLM_MODEL || 'gpt-5-nano';

const SYSTEM_PROMPT =
`You are a helpful AI assistant built into a WhatsApp bot named SKYNETIX.
Answer ONLY the user's question directly and stay strictly on topic.
- Do not change the subject, do not answer a different question, and do not
  add unsolicited commentary or promotional text.
- Keep replies concise, clear, and friendly (WhatsApp-friendly, plain text).
- If you genuinely do not know, say so briefly instead of guessing wildly.`;

// ---- Simple in-memory memory: recent per-chat messages for context ----
const chatMemory = new Map(); // jid -> [{role, content}]

function remember(userJid, text) {
    try {
        const list = chatMemory.get(userJid) || [];
        list.push({ role: 'user', content: text.slice(0, 2000) });
        if (list.length > 6) list.splice(0, list.length - 6);
        chatMemory.set(userJid, list);
    } catch {}
}

function rememberAnswer(userJid, answer) {
    try {
        const list = chatMemory.get(userJid) || [];
        list.push({ role: 'assistant', content: answer.slice(0, 2000) });
        if (list.length > 7) list.splice(0, list.length - 7);
        chatMemory.set(userJid, list);
    } catch {}
}

// =====================================================================
//  Source 1: OpenAI-compatible endpoint (best quality, on-topic)
// =====================================================================
async function askOpenAI(userJid, userMessage) {
    const key = process.env.OPENAI_API_KEY;
    const base = (process.env.AI_BASE_URL || process.env.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, '');
    if (!key) throw new Error('No OpenAI key configured');

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(chatMemory.get(userJid) || []),
        { role: 'user', content: userMessage }
    ];

    const payload = {
        model: LLM_MODEL,
        messages,
        max_completion_tokens: 1000,
        temperature: 0.4
    };

    const res = await axios.post(`${base}/chat/completions`, payload, {
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        timeout: 60000
    });

    const choice = res.data && res.data.choices && res.data.choices[0];
    const content = choice && choice.message && choice.message.content;
    if (!content || !content.trim()) throw new Error('Empty OpenAI response');
    return content.trim();
}

// =====================================================================
//  Source 2: siputzx free ChatGPT API
// =====================================================================
async function askSiputzx(userMessage) {
    const url = `https://api.siputzx.my.id/api/ai/chatgpt?prompt=${encodeURIComponent(SYSTEM_PROMPT)}&text=${encodeURIComponent(userMessage)}`;
    const res = await axios.get(url, { timeout: 30000 });
    const data = res.data || {};
    // The API wraps the answer in data.data; require an actual answer string
    const answer = data.status ? data.data : data.result || data.message;
    if (!answer || !String(answer).trim()) throw new Error('Empty siputzx response');
    return String(answer).trim();
}

// =====================================================================
//  Source 3: widipe free openai API
// =====================================================================
async function askWidipe(userMessage) {
    const url = `https://widipe.com/openai?text=${encodeURIComponent(userMessage)}`;
    const res = await axios.get(url, { timeout: 30000 });
    const data = res.data || {};
    const answer = data.result || data.answer || data.data;
    if (!answer || !String(answer).trim()) throw new Error('Empty widipe response');
    return String(answer).trim();
}

// =====================================================================
//  Main entry: tries each source in order, returns the first good answer
// =====================================================================
async function getAIResponse(userJid, userMessage) {
    userMessage = (userMessage || '').trim();
    if (!userMessage) throw new Error('Empty question');

    remember(userJid, userMessage);

    const errors = [];
    const tryAll = async (fn, name, ...args) => {
        try {
            const answer = await fn(...args);
            // Sanity: the answer should be a non-empty string
            if (typeof answer !== 'string' || answer.length < 2) throw new Error(`${name} returned garbage`);
            rememberAnswer(userJid, answer);
            return answer;
        } catch (e) {
            console.error(`[AI] ${name} failed:`, e.message);
            errors.push(`${name}: ${e.message}`);
            return null;
        }
    };

    let answer = null;

    // Primary: reliable OpenAI-compatible engine
    answer = await tryAll(askOpenAI, 'OpenAI', userJid, userMessage);
    if (answer) return answer;

    // Fallbacks: free public APIs
    answer = await tryAll(askSiputzx, 'Siputzx', userMessage);
    if (answer) return answer;

    answer = await tryAll(askWidipe, 'Widipe', userMessage);
    if (answer) return answer;

    throw new Error(`All AI sources failed (${errors.join(' | ')})`);
}

function clearMemory(userJid) {
    chatMemory.delete(userJid);
}

module.exports = { getAIResponse, SYSTEM_PROMPT, clearMemory };
