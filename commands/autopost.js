// =====================================================================
//  SKYNETIX AUTOPOST — automatically post status updates (stories)
// =====================================================================

module.exports = async function autopostCommand(sock, chatId, msg, isOwner, args, q) {
    if (!isOwner) return await sock.sendMessage(chatId, { text: '❌ Owner only!' }, { quoted: msg });

    const action = (args[0] || '').toLowerCase();

    if (action === 'on' || action === 'post') {
        const text = q || '⚡ Powered by SKYNETIX MINI BOT';
        try {
            await sock.sendMessage('status@broadcast', { text });
            await sock.sendMessage(chatId, { text: `✅ Status posted: *${text}*` }, { quoted: msg });
        } catch (e) {
            console.error('[AutoPost] Error:', e.message);
            await sock.sendMessage(chatId, { text: '❌ Failed to post status.' }, { quoted: msg });
        }
        return;
    }

    await sock.sendMessage(chatId, {
        text: `*📡 AUTO POST*\n\nUsage:\n.autopost — post default status\n.autopost <text> — post custom status text\n\nNote: only text statuses are supported.`,
        quoted: msg
    });
};
