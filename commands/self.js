async function selfCommand(sock, from, msg, isOwner, session, botData, saveBotData) {
    if (!isOwner) return await sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: msg });

    session.isPublic = false;
    if (!botData.statusSettings) botData.statusSettings = {};
    if (!botData.statusSettings[session.userId]) botData.statusSettings[session.userId] = {};
    botData.statusSettings[session.userId].isPublic = false;

    if (typeof saveBotData === 'function') await saveBotData();

    await sock.sendMessage(from, { 
        text: "🔒 *Bot is now in SELF mode.*\n\nOnly the owner can use the bot now. Use `.public` to allow everyone to use it." 
    }, { quoted: msg });
}

module.exports = selfCommand;
