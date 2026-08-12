async function autolikeCommand(sock, from, msg, isAdmin, botData, saveBotData, userId, args) {
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
        botData.statusSettings[userId].autoLike = true;
        botData.statusSettings[userId].autoStatus = true;
        saveBotData();
        await sock.sendMessage(from, { text: "✅ *Auto Like: ON*" }, { quoted: msg });
    } else if (action === 'off') {
        botData.statusSettings[userId].autoLike = false;
        saveBotData();
        await sock.sendMessage(from, { text: "❌ *Auto Like: OFF*" }, { quoted: msg });
    } else {
        const status = botData.statusSettings[userId].autoLike ? '✅ Enabled' : '❌ Disabled';
        await sock.sendMessage(from, { text: `❤️ *Auto Like Status*\n\nCurrent: ${status}\n\nUsage: .autolike [on/off]` }, { quoted: msg });
    }
}

module.exports = autolikeCommand;
