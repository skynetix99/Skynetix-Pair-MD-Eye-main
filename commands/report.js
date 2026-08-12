const settings = require('../settings');

function onlyDigits(s = '') { 
    return String(s).replace(/\D/g, ''); 
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toBold = (text) => {
    const boldChars = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

module.exports = async function(sock, chatId, message, isOwner, q) {
    // OWNER ONLY CHECK
    if (!isOwner) {
        return sock.sendMessage(chatId, { text: '❌ *Access Denied!* This command is restricted to the bot owner only.' }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        
        if (!q) return await sock.sendMessage(chatId, { text: '⚠️ Usage: .report <number/mention>' }, { quoted: message });

        let target = onlyDigits(q);
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            target = onlyDigits(message.message.extendedTextMessage.contextInfo.mentionedJid[0]);
        }
        
        if (target.length < 10) return await sock.sendMessage(chatId, { text: '❌ Invalid number' }, { quoted: message });

        const tJid = target + '@s.whatsapp.net';
        const reportTypes = ['spam', 'abuse', 'harassment', 'fraud', 'illegal_content'];
        
        await sock.sendMessage(chatId, { 
            text: `🚨 ${toBold("SKYNETIX MASS REPORTER")} 🚨\n\n👤 ${toBold("Target:")} +${target}\n📊 ${toBold("Action:")} Sending 90 Official Abuse Reports\n\n_This may take a moment. Please wait..._` 
        }, { quoted: message });

        let successCount = 0;
        const totalReports = 90;

        for (let i = 0; i < totalReports; i++) {
            const type = reportTypes[i % reportTypes.length];
            try {
                await sock.query({
                    tag: 'iq',
                    type: 'set',
                    attrs: {
                        to: 's.whatsapp.net',
                        id: sock.generateMessageTag(),
                        xmlns: 'abuse',
                    },
                    content: [
                        {
                            tag: 'report',
                            attrs: {
                                jid: tJid,
                                type: type,
                            },
                        },
                    ],
                });
                successCount++;
                
                // Small delay to prevent flooding and ensure stability
                if (i % 10 === 0 && i !== 0) {
                    await delay(500);
                }
            } catch (e) {
                console.error(`Report ${i+1} failed:`, e.message);
            }
        }

        await sock.sendMessage(chatId, { 
            text: `✅ ${toBold("MASS REPORTING COMPLETE")}\n\n👤 ${toBold("Target:")} +${target}\n🛡️ ${toBold("Total Reports Sent:")} ${successCount}/${totalReports}\n⚡ ${toBold("Status:")} Target has been reported 90 times for multiple violations.` 
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch(err) { 
        console.error('Report Error:', err);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + err.message }, { quoted: message }); 
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
};
