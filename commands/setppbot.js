// =====================================================================
//  SKYNETIX SETPPBOT — change the bot's own profile picture
//  Uses sharp (already in package.json) to convert any image to JPEG.
// =====================================================================
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function toJpeg(buffer) {
    try {
        const sharp = require('sharp');
        return await sharp(buffer).jpeg({ quality: 80, chromaSubsampling: '4:4:4' }).toBuffer();
    } catch (e) {
        console.error('[SetPPBot] JPEG conversion error:', e.message);
        return buffer;
    }
}

module.exports = async function setppbotCommand(sock, chatId, msg, isOwner) {
    if (!isOwner) return await sock.sendMessage(chatId, { text: '❌ Owner only!' }, { quoted: msg });

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) return await sock.sendMessage(chatId, { text: '❌ Reply to an image with .setppbot to set it as your profile picture.' }, { quoted: msg });

    const isImage = quotedMsg.imageMessage || quotedMsg.stickerMessage;
    if (!isImage) return await sock.sendMessage(chatId, { text: '❌ The replied message must be an image.' }, { quoted: msg });

    try {
        const imageContent = quotedMsg.imageMessage || quotedMsg.stickerMessage;
        const stream = await downloadContentFromMessage(imageContent, imageContent.imageMessage ? 'image' : 'sticker');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        const jpegBuffer = await toJpeg(buffer);

        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        await sock.updateProfilePicture(botNumber, { url: undefined, buffer: jpegBuffer });
        await sock.sendMessage(chatId, { text: '✅ Bot profile picture updated!' }, { quoted: msg });
    } catch (e) {
        console.error('[SetPPBot] Error:', e.message);
        await sock.sendMessage(chatId, { text: '❌ Failed to update profile picture. Make sure you replied to a valid image.' }, { quoted: msg });
    }
};
