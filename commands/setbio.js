// =====================================================================
//  SKYNETIX SETBIO — set the bot's WhatsApp bio once
// =====================================================================

module.exports = async function setbioCommand(sock, chatId, msg, isOwner, q) {
    if (!isOwner) return await sock.sendMessage(chatId, { text: '❌ Owner only!' }, { quoted: msg });

    const bio = (q || '').trim();
    if (!bio) return await sock.sendMessage(chatId, { text: '❌ Provide a bio!\nUsage: .setbio Your bio here' }, { quoted: msg });

    if (bio.length > 139) return await sock.sendMessage(chatId, { text: '❌ Bio too long (max 139 characters).' }, { quoted: msg });

    try {
        await sock.updateProfileStatus(bio);
        await sock.sendMessage(chatId, { text: `✅ Bot bio updated to: *${bio}*` }, { quoted: msg });
    } catch (e) {
        console.error('[SetBio] Error:', e.message);
        await sock.sendMessage(chatId, { text: '❌ Failed to update bio. Try again later.' }, { quoted: msg });
    }
};
