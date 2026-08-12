const { ensureState } = require('./welcomegoodbye');

async function wdash(sock, from, msg, isAdmin, botData, saveBotData, args) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: "❌ This command can only be used in groups!" }, { quoted: msg });
    if (!isAdmin) return sock.sendMessage(from, { text: "❌ Admin only command!" }, { quoted: msg });

    const state = ensureState(botData);
    const action = (args[0] || '').toLowerCase();

    if (action === 'togglew') {
        state.enabledWelcome[from] = !state.enabledWelcome[from];
        saveBotData();
        return sock.sendMessage(from, { text: `✅ Welcome messages turned ${state.enabledWelcome[from] ? 'ON' : 'OFF'}!` }, { quoted: msg });
    }
    if (action === 'toggleg') {
        state.enabledGoodbye[from] = !state.enabledGoodbye[from];
        saveBotData();
        return sock.sendMessage(from, { text: `✅ Goodbye messages turned ${state.enabledGoodbye[from] ? 'ON' : 'OFF'}!` }, { quoted: msg });
    }

    const wStatus = state.enabledWelcome[from] ? "✅ ON" : "❌ OFF";
    const gStatus = state.enabledGoodbye[from] ? "✅ ON" : "❌ OFF";

    const dashboardText = `*📊 WELCOME & GOODBYE DASHBOARD*\n\n` +
        `*👋 WELCOME*\n` +
        `• Status: ${wStatus}\n\n` +
        `*👋 GOODBYE*\n` +
        `• Status: ${gStatus}\n\n` +
        `*Quick Commands:*\n` +
        `• .welcome on/off/status\n` +
        `• .goodbye on/off/status\n` +
        `• .setwelcome <message>\n` +
        `• .setgoodbye <message>\n\n` +
        `> © SKYNETIX MINI BOT`;

    const buttons = [
        { buttonId: '.wdash togglew', buttonText: { displayText: 'Toggle Welcome' }, type: 1 },
        { buttonId: '.wdash toggleg', buttonText: { displayText: 'Toggle Goodbye' }, type: 1 },
        { buttonId: '.welcome', buttonText: { displayText: 'Detailed Help' }, type: 1 }
    ];

    await sock.sendMessage(from, {
        text: dashboardText,
        buttons: buttons,
        footer: "Select an option below to configure",
        headerType: 1
    }, { quoted: msg });
}

module.exports = wdash;
