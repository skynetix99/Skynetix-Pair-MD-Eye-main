async function autotypingCommand(sock, from, msg, isAdmin, botData, saveBotData, session, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ Only owner can use this command." }, { quoted: msg });
    
    const action = args[0]?.toLowerCase();
    const userId = session.userId;

    if (!botData.statusSettings) botData.statusSettings = {};
    if (!botData.statusSettings[userId]) botData.statusSettings[userId] = {};

    if (action === 'on') {
        session.autoTyping = true;
        botData.statusSettings[userId].autoTyping = true;
        if (typeof saveBotData === 'function') await saveBotData();
        await sock.sendMessage(from, { text: "✅ Auto-Typing Enabled!" }, { quoted: msg });
    } else if (action === 'off') {
        session.autoTyping = false;
        botData.statusSettings[userId].autoTyping = false;
        if (typeof saveBotData === 'function') await saveBotData();
        await sock.sendMessage(from, { text: "❌ Auto-Typing Disabled!" }, { quoted: msg });
    } else {
        const status = session.autoTyping ? "✅ Enabled" : "❌ Disabled";
        await sock.sendMessage(from, { text: `⌨️ *Auto-Typing Status*\n\nCurrent: ${status}\n\nUsage: .autotyping [on/off]` }, { quoted: msg });
    }
}

module.exports = autotypingCommand;
