async function antiviewonceCommand(sock, from, msg, isAdmin, botData, saveBotData, session, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ Only admin can use this command." }, { quoted: msg });
    
    const action = args[0]?.toLowerCase();
    const userId = session.userId;

    if (!botData.statusSettings) botData.statusSettings = {};
    if (!botData.statusSettings[userId]) botData.statusSettings[userId] = {};

    if (action === 'on') {
        session.antiViewOnce = true;
        botData.statusSettings[userId].antiViewOnce = true;
        if (typeof saveBotData === 'function') await saveBotData();
        await sock.sendMessage(from, { text: "✅ Anti-ViewOnce Enabled!" }, { quoted: msg });
    } else if (action === 'off') {
        session.antiViewOnce = false;
        botData.statusSettings[userId].antiViewOnce = false;
        if (typeof saveBotData === 'function') await saveBotData();
        await sock.sendMessage(from, { text: "❌ Anti-ViewOnce Disabled!" }, { quoted: msg });
    } else {
        const status = session.antiViewOnce ? "✅ Enabled" : "❌ Disabled";
        await sock.sendMessage(from, { text: `👁️ *Anti-ViewOnce Status*\n\nCurrent: ${status}\n\nUsage: .antiviewonce [on/off]` }, { quoted: msg });
    }
}

module.exports = antiviewonceCommand;
