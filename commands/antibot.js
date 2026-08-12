const GROUP_SUFFIX = '@g.us';
const USER_SUFFIX = '@s.whatsapp.net';

function normalizeJid(value = '') {
    const raw = String(value).trim().replace(/^@/, '');
    if (!raw) return '';
    if (raw.endsWith('@s.whatsapp.net') || raw.endsWith('@lid')) return raw;
    const digits = raw.replace(/\D/g, '');
    return digits ? `${digits}${USER_SUFFIX}` : '';
}

function getConfig(botData, groupId) {
    if (!botData.antiBotGroups || typeof botData.antiBotGroups !== 'object') {
        botData.antiBotGroups = {};
    }

    const existing = botData.antiBotGroups[groupId];
    if (typeof existing === 'string') {
        botData.antiBotGroups[groupId] = { mode: existing, bots: [] };
    } else if (!existing || typeof existing !== 'object') {
        botData.antiBotGroups[groupId] = { mode: 'delete', bots: [] };
    } else {
        existing.mode = existing.mode === 'kick' ? 'kick' : 'delete';
        existing.bots = Array.isArray(existing.bots)
            ? [...new Set(existing.bots.map(normalizeJid).filter(Boolean))]
            : [];
    }

    return botData.antiBotGroups[groupId];
}

function formatBotList(bots) {
    return bots.length
        ? bots.map((jid, index) => `${index + 1}. @${jid.split('@')[0]}`).join('\n')
        : 'No bot numbers are configured.';
}

async function antibotCommand(sock, chatId, msg, isAdmin, botData, saveBotData, args = []) {
    if (!chatId.endsWith(GROUP_SUFFIX)) {
        return sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
    }

    if (!isAdmin) {
        return sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' }, { quoted: msg });
    }

    const action = String(args[0] || 'status').toLowerCase();
    const existingConfig = botData.antiBotGroups?.[chatId];
    if (action === 'status' && !existingConfig) {
        return sock.sendMessage(chatId, {
            text: '🤖 *Anti-Bot Status*\n\nEnabled: *no*\n\nEnable it with *.antibot on [delete|kick]*'
        }, { quoted: msg });
    }
    const config = getConfig(botData, chatId);
    const target = normalizeJid(args[1]);

    if (action === 'on' || action === 'enable') {
        const requestedMode = String(args[1] || 'delete').toLowerCase();
        config.mode = requestedMode === 'kick' ? 'kick' : 'delete';
        saveBotData();
        return sock.sendMessage(chatId, {
            text: `✅ Anti-bot protection enabled in *${config.mode}* mode.\n\nAdd bot numbers with: *.antibot add <number>*`
        }, { quoted: msg });
    }

    if (action === 'off' || action === 'disable') {
        delete botData.antiBotGroups[chatId];
        saveBotData();
        return sock.sendMessage(chatId, { text: '✅ Anti-bot protection disabled for this group.' }, { quoted: msg });
    }

    if (action === 'add') {
        if (!target) {
            return sock.sendMessage(chatId, { text: '⚠️ Usage: *.antibot add <phone number>*' }, { quoted: msg });
        }
        if (!config.bots.includes(target)) config.bots.push(target);
        saveBotData();
        return sock.sendMessage(chatId, {
            text: `✅ Added @${target.split('@')[0]} to the anti-bot list.`,
            mentions: [target]
        }, { quoted: msg });
    }

    if (action === 'remove' || action === 'delete') {
        if (!target) {
            return sock.sendMessage(chatId, { text: '⚠️ Usage: *.antibot remove <phone number>*' }, { quoted: msg });
        }
        botData.antiBotGroups[chatId].bots = config.bots.filter(jid => jid !== target);
        saveBotData();
        return sock.sendMessage(chatId, {
            text: `✅ Removed @${target.split('@')[0]} from the anti-bot list.`,
            mentions: [target]
        }, { quoted: msg });
    }

    if (action === 'list') {
        return sock.sendMessage(chatId, {
            text: `🤖 *Anti-Bot List*\n\n${formatBotList(config.bots)}`,
            mentions: config.bots
        }, { quoted: msg });
    }

    if (action === 'mode') {
        const mode = String(args[1] || '').toLowerCase();
        if (!['delete', 'kick'].includes(mode)) {
            return sock.sendMessage(chatId, { text: '⚠️ Usage: *.antibot mode delete|kick*' }, { quoted: msg });
        }
        config.mode = mode;
        saveBotData();
        return sock.sendMessage(chatId, { text: `✅ Anti-bot mode changed to *${mode}*.` }, { quoted: msg });
    }

    if (action === 'status') {
        return sock.sendMessage(chatId, {
            text: `🤖 *Anti-Bot Status*\n\nEnabled: *yes*\nMode: *${config.mode}*\nTracked bots: *${config.bots.length}*\n\nCommands:\n.antibot on [delete|kick]\n.antibot add <number>\n.antibot remove <number>\n.antibot list\n.antibot mode delete|kick\n.antibot off`
        }, { quoted: msg });
    }

    return sock.sendMessage(chatId, {
        text: '🤖 *Anti-Bot Usage*\n\n.antibot on [delete|kick]\n.antibot add <number>\n.antibot remove <number>\n.antibot list\n.antibot mode delete|kick\n.antibot off'
    }, { quoted: msg });
}

function isTrackedBot(botData, groupId, senderJid) {
    const config = botData.antiBotGroups?.[groupId];
    if (!config || !Array.isArray(config.bots)) return false;
    return config.bots.includes(senderJid);
}

module.exports = antibotCommand;
module.exports.isTrackedBot = isTrackedBot;
module.exports.getConfig = getConfig;
module.exports.normalizeJid = normalizeJid;
