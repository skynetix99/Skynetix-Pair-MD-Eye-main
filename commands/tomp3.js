const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { toAudio } = require('../lib/converter');

module.exports = async function(sock, chatId, msg) {
    try {
        const quoted = msg.message?.videoMessage ||
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
            msg.message?.audioMessage ||
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage;
        
        if (!quoted) return await sock.sendMessage(chatId, { text: '⚠️ Reply to a video or audio!' }, { quoted: msg });
        
        await sock.sendMessage(chatId, { text: '🎵 Converting to MP3...' }, { quoted: msg });
        
        const type = quoted.seconds ? 'audio' : 'video';
        const stream = await downloadContentFromMessage(quoted, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        
        // Convert to proper MP3
        const audioBuffer = await toAudio(buffer, type === 'video' ? 'mp4' : 'ogg');
        
        await sock.sendMessage(chatId, { 
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: 'converted.mp3'
        }, { quoted: msg });
    } catch (e) {
        console.error('ToMP3 Error:', e);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + e.message }, { quoted: msg });
    }
};
