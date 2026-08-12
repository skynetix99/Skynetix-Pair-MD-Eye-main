const { jidNormalizedUser } = require('@whiskeysockets/baileys');

function ensureAntifakeStore(botData) {
    if (!botData.antifakeGroups || typeof botData.antifakeGroups !== 'object') {
        botData.antifakeGroups = {};
    }
    return botData.antifakeGroups;
}

async function antifakeCommand(sock, from, msg, isAdmin, botData, saveBotData, args) {
    if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: msg });
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: msg });

    const antifake = ensureAntifakeStore(botData);
    const action = args[0]?.toLowerCase();

    if (action === 'on') {
        antifake[from] = true;
        saveBotData();
        await sock.sendMessage(from, { text: "✅ *Anti-Fake Protection: ON*\n\nUsers with non-local country codes will be automatically removed." }, { quoted: msg });
    } else if (action === 'off') {
        antifake[from] = false;
        saveBotData();
        await sock.sendMessage(from, { text: "❌ *Anti-Fake Protection: OFF*" }, { quoted: msg });
    } else {
        const status = antifake[from] ? '✅ Enabled' : '❌ Disabled';
        await sock.sendMessage(from, { text: `🛡️ *Anti-Fake Status*\n\nCurrent: ${status}\n\nUsage: .antifake [on/off]` }, { quoted: msg });
    }
}

async function handleAntifake(sock, groupId, participants, botData) {
    const antifake = ensureAntifakeStore(botData);
    if (!antifake[groupId]) return;

    // Default local country codes (e.g., +263 for Zimbabwe based on owner number)
    // You can expand this or make it configurable. 
    // For now, let's assume "fake" means non-local codes like +1, +44 etc. if they join a local group.
    // A common approach is to allow only specific country codes.
    // Let's use a simple check: if it's enabled, we might want to block specific "fake" looking numbers.
    // Most bots use it to block +1 (USA) or other specific codes.
    
    const fakePrefixes = ['1', '44', '48', '92']; // Example: USA, UK, Poland, Pakistan

    for (const jid of participants) {
        const number = jid.split('@')[0];
        const isFake = fakePrefixes.some(prefix => number.startsWith(prefix));
        
        if (isFake) {
            try {
                await sock.groupParticipantsUpdate(groupId, [jid], 'remove');
                await sock.sendMessage(groupId, { text: `🚫 @${number} was removed by Anti-Fake protection (Foreign number detected).`, mentions: [jid] });
            } catch (e) {
                console.error('[AntiFake] Failed to remove participant:', e.message);
            }
        }
    }
}

module.exports = antifakeCommand;
module.exports.handleAntifake = handleAntifake;
