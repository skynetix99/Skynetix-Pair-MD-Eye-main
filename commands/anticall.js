function ensureAntiCallStore(botData) {
    if (!botData || typeof botData !== 'object') {
        throw new TypeError('Bot data is unavailable.');
    }
    if (!botData.antiCall || typeof botData.antiCall !== 'object') {
        botData.antiCall = {};
    }
    return botData.antiCall;
}

async function anticallCommand(sock, from, msg, isAdmin, botData, saveBotData, userId, args = []) {
    try {
        if (!isAdmin) {
            return await sock.sendMessage(from, { text: '❌ Only the owner or an authorized admin can use this command.' }, { quoted: msg });
        }

        const antiCall = ensureAntiCallStore(botData);
        const action = String(args[0] || 'status').toLowerCase();
        const key = String(userId || '').trim();
        if (!key) throw new Error('The bot session identifier is missing.');

        if (action === 'on' || action === 'enable') {
            antiCall[key] = true;
            if (typeof saveBotData === 'function') await Promise.resolve(saveBotData());
            return await sock.sendMessage(from, { text: '✅ Anti-Call enabled. Incoming calls to this bot session will be rejected.' }, { quoted: msg });
        }

        if (action === 'off' || action === 'disable') {
            antiCall[key] = false;
            if (typeof saveBotData === 'function') await Promise.resolve(saveBotData());
            return await sock.sendMessage(from, { text: '✅ Anti-Call disabled. Incoming calls will no longer be automatically rejected.' }, { quoted: msg });
        }

        if (action === 'status') {
            return await sock.sendMessage(from, {
                text: `📞 *Anti-Call Status*\n\n${antiCall[key] ? '✅ Enabled' : '❌ Disabled'}\n\nUse .anticall on or .anticall off to change it.`
            }, { quoted: msg });
        }

        return await sock.sendMessage(from, {
            text: '📞 *Anti-Call*\n\n.anticall on\n.anticall off\n.anticall status'
        }, { quoted: msg });
    } catch (error) {
        console.error('[Anti-Call] Command error:', error);
        try {
            return await sock.sendMessage(from, { text: `❌ Anti-Call error: ${error.message || 'Unable to update the setting.'}` }, { quoted: msg });
        } catch (replyError) {
            console.error('[Anti-Call] Error response failed:', replyError);
        }
    }
}

module.exports = anticallCommand;
module.exports.ensureAntiCallStore = ensureAntiCallStore;
