// =====================================================================
//  SKYNETIX AI PROVIDER — with web search and multiple sources
// =====================================================================

const axios = require('axios');
const cheerio = require('cheerio'); // For parsing web content

// ---- Configurable via env ----
const LLM_MODEL = 'gpt-3.5-turbo';

const SYSTEM_PROMPT =
`You are a helpful AI assistant built into a WhatsApp bot named SKYNETIX.
Answer the user's question directly and stay strictly on topic.
- Use the provided information from search results to answer accurately
- If information is not available, say so honestly
- Keep replies concise, clear, and friendly
- Cite sources when possible
- Be conversational but informative`;

// ---- Simple in-memory memory ----
const chatMemory = new Map();

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
//  Source 1: OpenAI-compatible endpoint
// =====================================================================
async function askOpenAI(userJid, userMessage, context = '') {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('No OpenAI key configured');

    const base = (process.env.AI_BASE_URL || process.env.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, '');
    
    const systemPrompt = context ? 
        `${SYSTEM_PROMPT}\n\nContext from search results:\n${context}` : 
        SYSTEM_PROMPT;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...(chatMemory.get(userJid) || []),
        { role: 'user', content: userMessage }
    ];

    const payload = {
        model: LLM_MODEL,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
    };

    const res = await axios.post(`${base}/chat/completions`, payload, {
        headers: { 
            'Authorization': `Bearer ${key}`, 
            'Content-Type': 'application/json'
        },
        timeout: 60000
    });

    const content = res.data?.choices?.[0]?.message?.content;
    if (!content || !content.trim()) throw new Error('Empty OpenAI response');
    return content.trim();
}

// =====================================================================
//  Source 2: Web Search using DuckDuckGo (free, reliable)
// =====================================================================
async function webSearch(query) {
    try {
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const response = await axios.get(searchUrl, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = response.data;
        let results = [];

        // Get abstract
        if (data.AbstractText) {
            results.push(data.AbstractText);
        }

        // Get related topics
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            for (const topic of data.RelatedTopics.slice(0, 3)) {
                if (topic.Text) {
                    results.push(topic.Text);
                }
            }
        }

        // Get definition
        if (data.Definition) {
            results.push(`Definition: ${data.Definition}`);
        }

        return results.length > 0 ? results.join('\n\n') : null;
    } catch (e) {
        console.error('Web search error:', e.message);
        return null;
    }
}

// =====================================================================
//  Source 3: Wikipedia search
// =====================================================================
async function wikipediaSearch(query) {
    try {
        const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = response.data;
        if (data.extract) {
            return data.extract;
        }
        return null;
    } catch (e) {
        console.error('Wikipedia search error:', e.message);
        return null;
    }
}

// =====================================================================
//  Source 4: News API (free)
// =====================================================================
async function searchNews(query) {
    try {
        const apiKey = process.env.NEWS_API_KEY || 'YOUR_NEWS_API_KEY';
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=3&apiKey=${apiKey}`;
        const response = await axios.get(url, { timeout: 10000 });
        
        const articles = response.data?.articles || [];
        if (articles.length === 0) return null;

        return articles.map(a => 
            `- ${a.title}: ${a.description || ''} (${a.source?.name || 'News'})`
        ).join('\n');
    } catch (e) {
        console.error('News search error:', e.message);
        return null;
    }
}

// =====================================================================
//  Source 5: Built-in knowledge base for common questions
// =====================================================================
function getKnowledgeBaseResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();
    
    const knowledgeBase = {
        // Programming questions
        'javascript|js|node|react|vue|angular|code|programming': {
            answer: "I can help with programming questions! I have knowledge about JavaScript, Python, React, Node.js, and many other technologies. Could you be more specific about what you need?",
            fallback: "For detailed programming help, I'd recommend checking MDN Web Docs, Stack Overflow, or the official documentation for the language/framework you're using."
        },
        
        // Math questions
        'math|calculate|equation|formula|sum|add|subtract|multiply|divide': {
            answer: "I can help with math calculations and explain mathematical concepts. What specific math problem are you trying to solve?",
            fallback: "For complex math problems, I recommend using Wolfram Alpha or Desmos for interactive calculations."
        },
        
        // Health questions
        'health|doctor|symptom|medicine|disease|illness|pain': {
            answer: "⚠️ I can provide general health information, but please note: I'm not a medical professional. Always consult a doctor for medical advice. What specific health question do you have?",
            fallback: "For health information, I recommend checking trusted sources like Mayo Clinic, WebMD, or consulting a healthcare professional."
        },
        
        // Science questions
        'science|physics|chemistry|biology|astronomy|planet|star': {
            answer: "I love science! 🌌 I can help explain scientific concepts, theories, and discoveries. What area of science are you interested in?",
            fallback: "For more detailed scientific information, check out ScienceDaily, Nature, or other scientific publications."
        },
        
        // History questions
        'history|historical|ancient|war|king|queen|empire': {
            answer: "History is fascinating! 📚 I can help with historical facts, events, and figures. What period or event are you curious about?",
            fallback: "For historical research, I recommend checking Britannica, History.com, or academic history journals."
        },
        
        // Geography questions
        'geography|country|capital|city|river|mountain|ocean|continent': {
            answer: "I can help with geography questions! 🌍 What specific location or geographical feature would you like to know about?",
            fallback: "For detailed geographic information, check out National Geographic, CIA World Factbook, or Google Maps."
        },
        
        // Technology questions
        'technology|tech|computer|phone|internet|software|hardware|ai': {
            answer: "Tech questions are my specialty! 💻 I can help with technology topics, trends, and explanations. What tech topic interests you?",
            fallback: "For the latest tech news and information, check out TechCrunch, The Verge, or Wired."
        }
    };
    
    // Check if question matches any category
    for (const [pattern, data] of Object.entries(knowledgeBase)) {
        if (msg.match(new RegExp(pattern, 'i'))) {
            return data.answer;
        }
    }
    
    return null;
}

// =====================================================================
//  Source 6: Free AI APIs (multiple fallbacks)
// =====================================================================
async function askFreeAI(userMessage) {
    const apis = [
        {
            name: 'Maher AI',
            url: `https://api.maher-zubair.tech/ai/chatgpt?q=${encodeURIComponent(userMessage)}`,
            extractor: (data) => data.result || data.reply || data.response || data.answer
        },
        {
            name: 'Ryan AI',
            url: `https://api.ryanstore.xyz/api/ai/chatgpt?text=${encodeURIComponent(userMessage)}`,
            extractor: (data) => data.result || data.data || data.answer || data.response
        },
        {
            name: 'AEMT AI',
            url: `https://aemt.me/api/gpt?text=${encodeURIComponent(userMessage)}`,
            extractor: (data) => data.result || data.data || data.answer || data.response || data.message
        }
    ];

    for (const api of apis) {
        try {
            const response = await axios.get(api.url, {
                timeout: 15000,
                headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
            });
            
            const data = response.data || {};
            let answer = api.extractor(data);
            
            if (typeof answer === 'string' && answer.trim().length > 5) {
                return answer.trim();
            }
        } catch (e) {
            console.error(`${api.name} failed:`, e.message);
        }
    }
    
    throw new Error('All free AI APIs failed');
}

// =====================================================================
//  Main AI response function with web search and multiple sources
// =====================================================================
async function getAIResponse(userJid, userMessage) {
    userMessage = (userMessage || '').trim();
    if (!userMessage) {
        throw new Error('Empty question');
    }

    console.log(`📝 Processing question: ${userMessage}`);
    remember(userJid, userMessage);

    let answer = null;
    let contextInfo = '';

    // === STEP 1: Check knowledge base first (fastest) ===
    console.log('🔍 Checking knowledge base...');
    const kbAnswer = getKnowledgeBaseResponse(userMessage);
    if (kbAnswer) {
        console.log('✅ Knowledge base hit!');
        const finalAnswer = `💡 ${kbAnswer}\n\nIs there anything specific you'd like me to explain further?`;
        rememberAnswer(userJid, finalAnswer);
        return finalAnswer;
    }

    // === STEP 2: Web search for latest information ===
    console.log('🌐 Searching web for information...');
    try {
        const searchResults = await webSearch(userMessage);
        if (searchResults) {
            contextInfo += `\nWeb Search Results:\n${searchResults}\n\n`;
            console.log('✅ Web search successful');
        }
    } catch (e) {
        console.log('Web search failed, trying other sources...');
    }

    // === STEP 3: Wikipedia search ===
    console.log('📚 Searching Wikipedia...');
    try {
        const wikiResult = await wikipediaSearch(userMessage);
        if (wikiResult) {
            contextInfo += `\nWikipedia Information:\n${wikiResult}\n\n`;
            console.log('✅ Wikipedia search successful');
        }
    } catch (e) {
        console.log('Wikipedia search failed...');
    }

    // === STEP 4: News search for current events ===
    console.log('📰 Searching news...');
    try {
        const newsResult = await searchNews(userMessage);
        if (newsResult) {
            contextInfo += `\nLatest News:\n${newsResult}\n\n`;
            console.log('✅ News search successful');
        }
    } catch (e) {
        console.log('News search failed...');
    }

    // === STEP 5: Try OpenAI with context ===
    if (process.env.OPENAI_API_KEY) {
        console.log('🤖 Trying OpenAI with context...');
        try {
            answer = await askOpenAI(userJid, userMessage, contextInfo);
            if (answer) {
                console.log('✅ OpenAI responded successfully');
                rememberAnswer(userJid, answer);
                return answer;
            }
        } catch (e) {
            console.log('OpenAI failed:', e.message);
        }
    }

    // === STEP 6: Try free AI APIs ===
    console.log('🔄 Trying free AI APIs...');
    try {
        answer = await askFreeAI(userMessage);
        if (answer) {
            console.log('✅ Free AI responded successfully');
            rememberAnswer(userJid, answer);
            return answer;
        }
    } catch (e) {
        console.log('Free AI APIs failed:', e.message);
    }

    // === STEP 7: Final fallback with context ===
    console.log('💡 Using smart fallback with context...');
    let fallbackMessage = userMessage;
    
    // If we have context, use it
    if (contextInfo) {
        const contextPreview = contextInfo.slice(0, 300);
        fallbackMessage = `Based on available information:\n${contextPreview}\n\nI found some relevant information, but I'm not able to fully process it right now. Here are the key points I found. Could you please ask a more specific question? 🙏`;
    } else {
        // Generic helpful fallback
        const genericResponses = [
            `I appreciate your question! 🤔 While I couldn't find specific information about "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}", I'm here to help. Could you rephrase your question or provide more details?`,
            
            `That's a great question! 🌟 I want to give you the most accurate answer possible. Could you please provide more context or specify what you're looking for? This will help me assist you better.`,
            
            `I'm here to help, but I need a bit more information. 🤝 Could you tell me more about what you'd like to know regarding "${userMessage.slice(0, 40)}${userMessage.length > 40 ? '...' : ''}"?`
        ];
        fallbackMessage = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
    
    rememberAnswer(userJid, fallbackMessage);
    return fallbackMessage;
}

function clearMemory(userJid) {
    chatMemory.delete(userJid);
}

// =====================================================================
//  Test function
// =====================================================================
async function testProviders() {
    console.log('🔍 Testing AI system...\n');
    
    const testQuestions = [
        'What is artificial intelligence?',
        'Tell me about the weather',
        'Who is the president of the United States?',
        'What happened in the news today?'
    ];
    
    for (const question of testQuestions) {
        console.log(`\n📝 Question: ${question}`);
        try {
            const answer = await getAIResponse('test-user', question);
            console.log(`✅ Response: ${answer.slice(0, 150)}...\n`);
        } catch (e) {
            console.log(`❌ Failed: ${e.message}`);
        }
    }
}

// Uncomment to test
// testProviders();

module.exports = { 
    getAIResponse, 
    SYSTEM_PROMPT, 
    clearMemory,
    testProviders
};
