async function autoseenCommand(sock, from, msg, isAdmin, botData, saveBotData, userId, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ Only owner can use this command." }, { quoted: msg });
    
    if (!botData.statusSettings[userId]) {
        botData.statusSettings[userId] = {
            autoStatus: false,
            autoSeen: false,
            autoLike: false,
            autoDownload: false,
            system: 1,
            isPublic: true
        };
    }
    
    const action = args[0]?.toLowerCase();
    
    if (action === 'on') {
        botData.statusSettings[userId].autoSeen = true;
        botData.statusSettings[userId].autoStatus = true;
        saveBotData();
        await sock.sendMessage(from, { text: "✅ *Auto Seen: ON*" }, { quoted: msg });
    } else if (action === 'off') {
        botData.statusSettings[userId].autoSeen = false;
        saveBotData();
        await sock.sendMessage(from, { text: "❌ *Auto Seen: OFF*" }, { quoted: msg });
    } else {
        const status = botData.statusSettings[userId].autoSeen ? '✅ Enabled' : '❌ Disabled';
        await sock.sendMessage(from, { text: `👀 *Auto Seen Status*\n\nCurrent: ${status}\n\nUsage: .autoseen [on/off]` }, { quoted: msg });
    }
}

module.exports = autoseenCommand;
