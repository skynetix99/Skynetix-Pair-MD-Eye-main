module.exports = async function safeBugNotice(sock, chatId, msg, isOwner) {
    if (!isOwner) {
        await sock.sendMessage(chatId, { text: '❌ Owner only.' }, { quoted: msg });
        return;
    }

    await sock.sendMessage(chatId, {
        text: '🛡️ The .bug command has been disabled. It no longer sends crash, lag, flood, or disruptive payloads. Use the bot’s diagnostic and support commands instead.'
    }, { quoted: msg });
};
