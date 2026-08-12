const axios = require('axios');

async function killCommand(sock, from, msg) {
    try {
        await sock.sendMessage(from, { text: "⚔️ Executing..." }, { quoted: msg });
        
        const response = await axios.get('https://api.waifu.pics/sfw/kill');
        const url = response.data.url;
        
        let mention = "";
        if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.participant) {
            mention = `@${msg.message.extendedTextMessage.contextInfo.participant.split('@')[0]}`;
        }

        await sock.sendMessage(from, { 
            video: { url: url }, 
            caption: mention ? `💀 ${mention} has been killed!` : `💀 Targeted!`,
            gifPlayback: true,
            mentions: mention ? [msg.message.extendedTextMessage.contextInfo.participant] : []
        }, { quoted: msg });

    } catch (e) {
        await sock.sendMessage(from, { text: "❌ Error fetching reaction: " + e.message }, { quoted: msg });
    }
}

module.exports = killCommand;
