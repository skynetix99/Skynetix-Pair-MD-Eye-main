const axios = require('axios');
const { toPTT } = require('../lib/converter');

module.exports = async function(sock, chatId, msg, q) {
    if (!q) return await sock.sendMessage(chatId, { text: '⚠️ Usage: .tts <text>' }, { quoted: msg });
    
    try {
        await sock.sendMessage(chatId, { text: '👂 Generating Voice...' }, { quoted: msg });
        
        // Google Translate TTS URL (returns MP3)
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=en&client=tw-ob`;
        
        const response = await axios.get(ttsUrl, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });
        
        const mp3Buffer = Buffer.from(response.data);
        
        // Convert MP3 to OGG/Opus for proper WhatsApp PTT support
        const pttBuffer = await toPTT(mp3Buffer, 'mp3');
        
        await sock.sendMessage(chatId, { 
            audio: pttBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: msg });
        
    } catch (e) {
        console.error('TTS Error:', e);
        // Fallback: just send as text message
        await sock.sendMessage(chatId, { text: `👂 TTS: "${q}"` }, { quoted: msg });
    }
};
