async function autoreactCommand(sock, from, msg, isAdmin, botData, saveBotData, session, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ Only owner can use this command." }, { quoted: msg });
    
    const action = args[0]?.toLowerCase();
    const userId = session.userId;

    if (!botData.statusSettings) botData.statusSettings = {};
    if (!botData.statusSettings[userId]) botData.statusSettings[userId] = {};

    if (action === 'on') {
        session.autoReact = true;
        botData.statusSettings[userId].autoReact = true;
        if (typeof saveBotData === 'function') await saveBotData();
        await sock.sendMessage(from, { text: "✅ Auto-React Enabled!" }, { quoted: msg });
    } else if (action === 'off') {
        session.autoReact = false;
        botData.statusSettings[userId].autoReact = false;
        if (typeof saveBotData === 'function') await saveBotData();
        await sock.sendMessage(from, { text: "❌ Auto-React Disabled!" }, { quoted: msg });
    } else {
        const status = session.autoReact ? "✅ Enabled" : "❌ Disabled";
        await sock.sendMessage(from, { text: `✨ *Auto-React Status*\n\nCurrent: ${status}\n\nUsage: .autoreact [on/off]` }, { quoted: msg });
    }
}

module.exports = autoreactCommand;
