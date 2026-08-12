// =====================================================================
//  SKYNETIX BLOCKLIST — view and manage the bot's block list
// =====================================================================

module.exports = async function blocklistCommand(sock, chatId, msg, isOwner, args) {
    if (!isOwner) return await sock.sendMessage(chatId, { text: '❌ Owner only!' }, { quoted: msg });

    try {
        const list = await sock.fetchBlocklist();

        if (!list || !list.length) {
            return await sock.sendMessage(chatId, { text: '✅ Your block list is empty.' }, { quoted: msg });
        }

        // Default action: show list
        if (!args[0]) {
            const nums = list.slice(0, 30).map(j => j.split('@')[0]).join('\n');
            const more = list.length > 30 ? `\n...and ${list.length - 30} more` : '';
            return await sock.sendMessage(chatId, {
                text: `*🚫 BLOCK LIST* (${list.length} users)\n\n${nums}${more}`
            }, { quoted: msg });
        }

        const action = args[0].toLowerCase();
        const target = args[1];

        if (action === 'clear') {
            for (const jid of list) {
                try { await sock.updateBlockStatus(jid, 'unblock'); } catch {}
            }
            return await sock.sendMessage(chatId, { text: `✅ Unblocked all ${list.length} users.` }, { quoted: msg });
        }

        if ((action === 'add' || action === 'remove') && target) {
            const jid = target.includes('@') ? target : target + '@s.whatsapp.net';
            await sock.updateBlockStatus(jid, action === 'add' ? 'block' : 'unblock');
            return await sock.sendMessage(chatId, {
                text: action === 'add' ? `🚫 Blocked ${target}` : `✅ Unblocked ${target}`
            }, { quoted: msg });
        }

        return await sock.sendMessage(chatId, {
            text: `*🚫 BLOCK LIST*\n\nUsage:\n.blocklist — show blocked users\n.blocklist add <num> — block a user\n.blocklist remove <num> — unblock a user\n.blocklist clear — unblock everyone`,
            quoted: msg
        });
    } catch (e) {
        console.error('[BlockList] Error:', e.message);
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch block list.' }, { quoted: msg });
    }
};
