async function jid(sock, from, msg) {
    try {
        let targetJid = from;
        
        // Check if there is a mention
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } 
        // Check if it's a reply
        else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = msg.message.extendedTextMessage.contextInfo.participant;
        }

        await sock.sendMessage(from, { text: `🆔 *JID:* ${targetJid}` }, { quoted: msg });
    } catch (error) {
        console.error('Error in jid command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to retrieve JID.' }, { quoted: msg });
    }
}

module.exports = jid;
