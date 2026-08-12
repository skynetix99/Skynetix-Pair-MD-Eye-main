const settings = require('../settings');

async function delsudoCommand(sock, from, msg, isOwner, q) {
    if (!isOwner) return await sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: msg });

    let target;
    if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.participant) {
        target = msg.message.extendedTextMessage.contextInfo.participant.split('@')[0];
    } else if (q) {
        target = q.replace(/\D/g, '');
    }

    if (!target) {
        return await sock.sendMessage(from, { text: "❌ Please mention a user or provide a number to remove from sudo." }, { quoted: msg });
    }

    if (!settings.sudo) settings.sudo = [];
    
    const index = settings.sudo.indexOf(target);
    if (index === -1) {
        return await sock.sendMessage(from, { text: `❌ User *${target}* is not in the sudo list.` }, { quoted: msg });
    }

    settings.sudo.splice(index, 1);
    await sock.sendMessage(from, { text: `✅ Successfully removed *${target}* from sudo list.` }, { quoted: msg });
}

module.exports = delsudoCommand;
