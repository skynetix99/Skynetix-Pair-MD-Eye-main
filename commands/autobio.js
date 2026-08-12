// =====================================================================
//  SKYNETIX AUTOBIO — automatically update the bot's WhatsApp bio
// =====================================================================

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'autobio.json');

function loadConfig() {
    try {
        fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
        if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch {}
    return { enabled: false, intervalMs: 15 * 60 * 1000 }; // default: every 15 min
}

function saveConfig(config) {
    try {
        fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (e) {
        console.error('[AutoBio] Config save error:', e.message);
    }
}

let autobioTimer = null;
const bios = [
    '⚡ Powered by SKYNETIX MINI BOT',
    '🌙 24/7 Online & Active',
    '☠️ SKYNETIX MD TEAM',
    '🤖 Multi-Device Automation Bot',
    '⏱️ Uptime: Running since {boot}',
    '🔐 Premium Encrypted Connection',
    '📡 Status: Fully Operational',
    '👑 Owner: SKY',
    '🚀 Fast • Smart • Reliable',
    '☕ Always here to serve you'
];

function startTimer(sock) {
    stopTimer();
    autobioTimer = setInterval(async () => {
        try {
            const config = loadConfig();
            if (!config.enabled) { stopTimer(); return; }
            const bio = bios[Math.floor(Math.random() * bios.length)]
                .replace('{boot}', 'today');
            await sock.updateProfileStatus(bio);
        } catch {}
    }, loadConfig().intervalMs);
}

function stopTimer() {
    if (autobioTimer) { clearInterval(autobioTimer); autobioTimer = null; }
}

async function autobioCommand(sock, chatId, msg, isOwner, args) {
    if (!isOwner) return await sock.sendMessage(chatId, { text: '❌ Owner only!' }, { quoted: msg });

    const action = (args[0] || '').toLowerCase();
    const config = loadConfig();

    if (action === 'on') {
        config.enabled = true;
        saveConfig(config);
        startTimer(sock);
        return await sock.sendMessage(chatId, { text: '✅ Auto-bio is now ON.\nBot bio will rotate every 15 minutes.' }, { quoted: msg });
    }
    if (action === 'off') {
        config.enabled = false;
        saveConfig(config);
        stopTimer();
        return await sock.sendMessage(chatId, { text: '❌ Auto-bio is now OFF.' }, { quoted: msg });
    }

    // Default: one-time bio update if text provided
    const custom = args.join(' ').trim();
    if (custom && custom !== 'on' && custom !== 'off') {
        try {
            await sock.updateProfileStatus(custom);
            return await sock.sendMessage(chatId, { text: `✅ Bio updated to: *${custom}*` }, { quoted: msg });
        } catch {
            return await sock.sendMessage(chatId, { text: '❌ Failed to update bio. Try again.' }, { quoted: msg });
        }
    }

    const status = config.enabled ? '✅ ON (rotating every 15 min)' : '❌ OFF';
    await sock.sendMessage(chatId, {
        text: `*⚙️ AUTO-BIO*\n\nStatus: ${status}\n\nUsage:\n.setbio on — enable rotating bio\n.setbio off — disable\n.setbio <text> — set a custom bio once`,
        quoted: msg
    });
}

module.exports = autobioCommand;
module.exports.start = startTimer;
