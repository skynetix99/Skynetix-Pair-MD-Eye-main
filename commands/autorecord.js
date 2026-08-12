async function autorecordCommand(sock, from, msg, isAdmin, botData, saveBotData, session, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ Only owner can use this command." }, { quoted: msg });
    
    const action = args[0]?.toLowerCase();
    const userId = session.userId;

    if (!botData.statusSettings) botData.statusSettings = {};
    if (!botData.statusSettings[userId]) botData.statusSettings[userId] = {};

    if (action === 'on') {
        session.autoRecord = true;
        botData.statusSettings[userId].autoRecord = true;
        if (typeof saveBotData === 'function') await saveBotData();
        await sock.sendMessage(from, { text: "✅ Auto-Record Enabled!" }, { quoted: msg });
    } else if (action === 'off') {
        session.autoRecord = false;
        botData.statusSettings[userId].autoRecord = false;
        if (typeof saveBotData === 'function') await saveBotData();
        await sock.sendMessage(from, { text: "❌ Auto-Record Disabled!" }, { quoted: msg });
    } else {
        const status = session.autoRecord ? "✅ Enabled" : "❌ Disabled";
        await sock.sendMessage(from, { text: `🎙️ *Auto-Record Status*\n\nCurrent: ${status}\n\nUsage: .autorecord [on/off]` }, { quoted: msg });
    }
}

module.exports = autorecordCommand;
