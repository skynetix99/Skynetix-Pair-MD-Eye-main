const DEFAULT_CONFIG = Object.freeze({
    enabled: false,
    words: [],
    mode: 'delete'
});

function ensureConfig(botData, groupJid) {
    if (!botData || typeof botData !== 'object') {
        throw new TypeError('Bot data is unavailable.');
    }

    if (!botData.antiBadwordGroups || typeof botData.antiBadwordGroups !== 'object') {
        botData.antiBadwordGroups = {};
    }

    const existing = botData.antiBadwordGroups[groupJid];
    if (!existing || typeof existing !== 'object') {
        botData.antiBadwordGroups[groupJid] = { ...DEFAULT_CONFIG, words: [] };
    } else {
        existing.enabled = Boolean(existing.enabled);
        existing.mode = existing.mode === 'kick' ? 'kick' : 'delete';
        existing.words = Array.isArray(existing.words)
            ? existing.words.filter(word => typeof word === 'string' && word.trim()).map(normalizeWord)
            : [];
    }

    return botData.antiBadwordGroups[groupJid];
}

function normalizeWord(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

async function saveConfig(saveBotData) {
    if (typeof saveBotData === 'function') {
        await Promise.resolve(saveBotData());
    }
}

async function reply(sock, from, msg, text) {
    return sock.sendMessage(from, { text }, { quoted: msg });
}

async function antibadwordCommand(sock, from, msg, isAdmin, botData, saveBotData, args = []) {
    try {
        if (!from || !from.endsWith('@g.us')) {
            return reply(sock, from, msg, '❌ This command can only be used in groups.');
        }
        if (!isAdmin) {
            return reply(sock, from, msg, '❌ Only group admins can use this command.');
        }

        const config = ensureConfig(botData, from);
        const safeArgs = Array.isArray(args) ? args.filter(Boolean).map(String) : [];
        const action = (safeArgs[0] || 'help').toLowerCase();

        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            await saveConfig(saveBotData);
            return reply(sock, from, msg, '✅ Anti-Badword is enabled. Matching messages will be deleted.');
        }

        if (action === 'off' || action === 'disable') {
            config.enabled = false;
            await saveConfig(saveBotData);
            return reply(sock, from, msg, '✅ Anti-Badword is disabled.');
        }

        if (action === 'mode') {
            const mode = (safeArgs[1] || '').toLowerCase();
            if (!['delete', 'kick'].includes(mode)) {
                return reply(sock, from, msg, '❌ Usage: .antibadword mode delete|kick');
            }
            config.mode = mode;
            await saveConfig(saveBotData);
            return reply(sock, from, msg, `✅ Anti-Badword mode set to: *${mode}*`);
        }

        if (action === 'add') {
            const input = safeArgs.slice(1).join(' ');
            const newWords = input.split(',').map(normalizeWord).filter(Boolean);
            if (!newWords.length) {
                return reply(sock, from, msg, '❌ Usage: .antibadword add word1, word2');
            }

            const added = [];
            for (const word of newWords) {
                if (!config.words.includes(word)) {
                    config.words.push(word);
                    added.push(word);
                }
            }

            if (!added.length) {
                return reply(sock, from, msg, 'ℹ️ All provided words are already in the blacklist.');
            }

            await saveConfig(saveBotData);
            return reply(sock, from, msg, `✅ Added ${added.length} word(s): ${added.join(', ')}`);
        }

        if (action === 'remove' || action === 'del') {
            const word = normalizeWord(safeArgs.slice(1).join(' '));
            if (!word) {
                return reply(sock, from, msg, '❌ Usage: .antibadword remove word');
            }

            const index = config.words.indexOf(word);
            if (index === -1) {
                return reply(sock, from, msg, `ℹ️ “${word}” is not in the blacklist.`);
            }

            config.words.splice(index, 1);
            await saveConfig(saveBotData);
            return reply(sock, from, msg, `✅ Removed “${word}” from the blacklist.`);
        }

        if (action === 'list' || action === 'status') {
            const words = config.words.length ? config.words.join(', ') : 'None';
            return reply(sock, from, msg,
                `🛡️ *Anti-Badword Status*\n\n` +
                `Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                `Mode: *${config.mode}*\n` +
                `Blacklist: ${words}`
            );
        }

        return reply(sock, from, msg,
            '🛡️ *Anti-Badword Help*\n\n' +
            '.antibadword on\n' +
            '.antibadword off\n' +
            '.antibadword mode delete|kick\n' +
            '.antibadword add word1, word2\n' +
            '.antibadword remove word\n' +
            '.antibadword list'
        );
    } catch (error) {
        console.error('[Anti-Badword] Command error:', error);
        try {
            return await reply(sock, from, msg, `❌ Anti-Badword error: ${error.message || 'Unable to process the command.'}`);
        } catch (replyError) {
            console.error('[Anti-Badword] Error response failed:', replyError);
        }
    }
}

function checkBadword(text, botData, from) {
    try {
        if (typeof text !== 'string' || !text.trim()) return false;
        const config = botData?.antiBadwordGroups?.[from];
        if (!config?.enabled || !Array.isArray(config.words)) return false;

        const lowerText = text.toLowerCase();
        return config.words.some(word => {
            const normalized = normalizeWord(word);
            return normalized && lowerText.includes(normalized);
        });
    } catch (error) {
        console.error('[Anti-Badword] Check error:', error);
        return false;
    }
}

module.exports = antibadwordCommand;
module.exports.checkBadword = checkBadword;
module.exports.ensureConfig = ensureConfig;
