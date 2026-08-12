module.exports = async function disabledDisruptiveCommand(sock, chatId, msg, isOwner) {
    if (isOwner === false) {
        await sock.sendMessage(chatId, { text: '❌ This command is disabled for safety.' }, { quoted: msg });
        return;
    }

    await sock.sendMessage(chatId, {
        text: '🛡️ This command has been disabled because it could flood, crash, freeze, or otherwise disrupt a WhatsApp account or chat. Use the bot’s moderation, support, or diagnostic commands instead.'
    }, { quoted: msg });
};
