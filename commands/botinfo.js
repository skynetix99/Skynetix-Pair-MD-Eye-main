// =====================================================================
//  SKYNETIX BOTINFO — show the bot's own profile details
// =====================================================================

const os = require('os');

function uptimeText(ms) {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);
    return `${d ? d + 'd ' : ''}${h}h ${m}m ${s}s`;
}

module.exports = async function botinfoCommand(sock, chatId, msg) {
    let info = '';
    try {
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const meta = await sock.fetchStatus(botNumber).catch(() => ({ status: null }));
        const prof = await sock.profilePictureUrl(botNumber, 'image').catch(() => null);
        const name = sock.user.name || sock.user.verifiedName || 'Unknown';

        info =
`*🤖 BOT INFORMATION*\n\n` +
`👤 *Name:* ${name}\n` +
`🔢 *Number:* ${botNumber.split('@')[0]}\n` +
`📝 *Bio:* ${meta?.status || 'Not set'}\n` +
`🖼️ *Profile Picture:* ${prof ? '✅ Set' : '❌ Not set'}\n\n` +
`*🖥️ SYSTEM*\n` +
`⏱️ *Uptime:* ${uptimeText(process.uptime() * 1000)}\n` +
`💾 *RAM Usage:* ${(process.memoryUsage().heapUsed / 1048576).toFixed(1)} MB / ${(os.totalmem() / 1048576).toFixed(0)} MB\n` +
`📦 *Platform:* ${os.type()} ${os.release()}`;
    } catch {
        info = '⚠️ Could not load bot information. Please try again later.';
    }

    try {
        await sock.sendMessage(chatId, { text: info }, { quoted: msg });
    } catch {
        await sock.sendMessage(chatId, { text: info.replace(/\*/g, '') });
    }
};
