// =====================================================================
//  SKYNETIX SETBOTNAME — change the bot's own profile name
// =====================================================================

module.exports = async function setbotnameCommand(sock, chatId, msg, isOwner, q) {
    if (!isOwner) return await sock.sendMessage(chatId, { text: '❌ Owner only!' }, { quoted: msg });

    const name = (q || '').trim();
    if (!name) return await sock.sendMessage(chatId, { text: '❌ Provide a name!\nUsage: .setbotname Skynetix' }, { quoted: msg });

    if (name.length > 25) return await sock.sendMessage(chatId, { text: '❌ Name too long (max 25 characters).' }, { quoted: msg });

    try {
        await sock.updateProfileName(name);
        await sock.sendMessage(chatId, { text: `✅ Bot name changed to: *${name}*` }, { quoted: msg });
    } catch (e) {
        console.error('[SetBotName] Error:', e.message);
        await sock.sendMessage(chatId, { text: '❌ Failed to change bot name. Try again later.' }, { quoted: msg });
    }
};
