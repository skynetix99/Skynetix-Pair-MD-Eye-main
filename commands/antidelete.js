const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');

const messageStore = new Map();
const DATA_DIR = path.join(__dirname, '../data');
const CONFIG_PATH = path.join(DATA_DIR, 'antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(TEMP_MEDIA_DIR)) fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });

const toBold = (text) => {
    const boldChars = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

const cleanTempFolder = () => {
    try {
        const files = fs.readdirSync(TEMP_MEDIA_DIR);
        for (const file of files) {
            const filePath = path.join(TEMP_MEDIA_DIR, file);
            const stats = fs.statSync(filePath);
            // Delete files older than 1 hour
            if (Date.now() - stats.mtimeMs > 3600000) {
                fs.unlinkSync(filePath);
            }
        }
    } catch (err) {}
};

setInterval(cleanTempFolder, 10 * 60 * 1000); // Every 10 minutes

function loadAntideleteConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return { enabled: false };
        return JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch {
        return { enabled: false };
    }
}

function saveAntideleteConfig(config) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (err) {}
}

async function handleAntideleteCommand(sock, chatId, message, isOwner, botData, saveBotData, userId, args) {
    // OWNER ONLY CHECK
    if (!isOwner) {
        return sock.sendMessage(chatId, { text: '❌ *Access Denied!* This command is restricted to the bot owner only.' }, { quoted: message });
    }

    const config = loadAntideleteConfig();
    const match = args[0]?.toLowerCase();

    if (!match) {
        return sock.sendMessage(chatId, {
            text: `╭━━━〔 ${toBold("ANTI-DELETE SETUP")} 〕━━━┈⊷\n` +
                   `┃ ⋄ ${toBold("Status:")} ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                   `┃\n` +
                   `┃ ⋄ ${toBold(".antidelete on")} - Enable\n` +
                   `┃ ⋄ ${toBold(".antidelete off")} - Disable\n` +
                   `╰━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: message });
    }

    if (match === 'on') {
        config.enabled = true;
        saveAntideleteConfig(config);
        return sock.sendMessage(chatId, { text: '✅ *Antidelete system has been enabled.*' }, { quoted: message });
    } else if (match === 'off') {
        config.enabled = false;
        saveAntideleteConfig(config);
        return sock.sendMessage(chatId, { text: '❌ *Antidelete system has been disabled.*' }, { quoted: message });
    } else {
        return sock.sendMessage(chatId, { text: '❓ *Invalid option.* Use `.antidelete on` or `.antidelete off`.' }, { quoted: message });
    }
}

async function storeMessage(message) {
    try {
        const config = loadAntideleteConfig();
        if (!config.enabled || !message.key?.id) return;

        const messageId = message.key.id;
        let content = '';
        let mediaType = '';
        let mediaPath = '';
        const sender = message.key.participant || message.key.remoteJid;

        const msg = message.message?.ephemeralMessage?.message || 
                    message.message?.viewOnceMessage?.message || 
                    message.message?.viewOnceMessageV2?.message || 
                    message.message;

        if (!msg) return;

        if (msg.conversation) {
            content = msg.conversation;
        } else if (msg.extendedTextMessage?.text) {
            content = msg.extendedTextMessage.text;
        } else if (msg.imageMessage) {
            mediaType = 'image';
            content = msg.imageMessage.caption || '';
            const buffer = await downloadContentFromMessage(msg.imageMessage, 'image');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
            await writeFile(mediaPath, buffer);
        } else if (msg.stickerMessage) {
            mediaType = 'sticker';
            const buffer = await downloadContentFromMessage(msg.stickerMessage, 'sticker');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
            await writeFile(mediaPath, buffer);
        } else if (msg.videoMessage) {
            mediaType = 'video';
            content = msg.videoMessage.caption || '';
            const buffer = await downloadContentFromMessage(msg.videoMessage, 'video');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
            await writeFile(mediaPath, buffer);
        } else if (msg.audioMessage) {
            mediaType = 'audio';
            const buffer = await downloadContentFromMessage(msg.audioMessage, 'audio');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp3`);
            await writeFile(mediaPath, buffer);
        } else if (msg.documentMessage) {
            mediaType = 'document';
            content = msg.documentMessage.fileName || 'Document';
            const buffer = await downloadContentFromMessage(msg.documentMessage, 'document');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}_${msg.documentMessage.fileName}`);
            await writeFile(mediaPath, buffer);
        }

        messageStore.set(messageId, {
            content,
            mediaType,
            mediaPath,
            sender,
            group: message.key.remoteJid.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: Date.now()
        });

        // Limit store size to 500 messages
        if (messageStore.size > 500) {
            const firstKey = messageStore.keys().next().value;
            const firstMsg = messageStore.get(firstKey);
            if (firstMsg.mediaPath && fs.existsSync(firstMsg.mediaPath)) {
                try { fs.unlinkSync(firstMsg.mediaPath); } catch (e) {}
            }
            messageStore.delete(firstKey);
        }
    } catch (err) {}
}

async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadAntideleteConfig();
        if (!config.enabled) return;

        const protocolMsg = revocationMessage.message?.protocolMessage;
        if (!protocolMsg || protocolMsg.type !== 0) return;

        const messageId = protocolMsg.key.id;
        const deletedBy = revocationMessage.participant || revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const botNumber = jidNormalizedUser(sock.user.id);

        // Don't report if the bot itself or the owner deleted the message
        const settings = require('../settings');
        const ownerNumber = settings.ownerNumber + '@s.whatsapp.net';
        if (deletedBy === botNumber || deletedBy === ownerNumber) return;

        const original = messageStore.get(messageId);
        if (!original) return;

        const sender = original.sender;
        const senderName = sender.split('@')[0];
        
        let report = `╭━━━〔 ${toBold("ANTI-DELETE REPORT")} 〕━━━┈⊷\n` +
                     `┃ 👤 ${toBold("Sender:")} @${senderName}\n` +
                     `┃ 🗑️ ${toBold("Deleted By:")} @${deletedBy.split('@')[0]}\n` +
                     `┃ 🕒 ${toBold("Time:")} ${new Date().toLocaleTimeString()}\n` +
                     `┃ 📂 ${toBold("Type:")} ${original.mediaType || 'Text'}\n` +
                     `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        if (original.content) {
            report += `📝 ${toBold("Message Content:")}\n${original.content}`;
        }

        // Send report to the owner/bot number
        await sock.sendMessage(botNumber, { text: report, mentions: [deletedBy, sender] });

        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaOptions = { caption: `*Deleted ${original.mediaType}* from @${senderName}`, mentions: [sender] };
            if (original.mediaType === 'image') await sock.sendMessage(botNumber, { image: { url: original.mediaPath }, ...mediaOptions });
            else if (original.mediaType === 'sticker') await sock.sendMessage(botNumber, { sticker: { url: original.mediaPath }, ...mediaOptions });
            else if (original.mediaType === 'video') await sock.sendMessage(botNumber, { video: { url: original.mediaPath }, ...mediaOptions });
            else if (original.mediaType === 'audio') await sock.sendMessage(botNumber, { audio: { url: original.mediaPath }, mimetype: 'audio/mp4', ...mediaOptions });
            else if (original.mediaType === 'document') await sock.sendMessage(botNumber, { document: { url: original.mediaPath }, fileName: original.content, ...mediaOptions });
            
            // File will be cleaned by the interval cleaner
        }
        messageStore.delete(messageId);
    } catch (err) {
        console.error('Antidelete Error:', err);
    }
}

// Store for snipe functionality
const snipedMessages = new Map();

function handleSnipe(message) {
    try {
        const from = message.key.remoteJid;
        const messageContent = message.message?.ephemeralMessage?.message || message.message?.viewOnceMessage?.message || message.message?.viewOnceMessageV2?.message || message.message;
        const text = messageContent?.conversation || messageContent?.extendedTextMessage?.text || '[Media/Message]';
        const sender = message.key.participant || message.key.remoteJid;
        
        if (!snipedMessages.has(from)) snipedMessages.set(from, []);
        snipedMessages.get(from).unshift({ text, sender, time: Date.now() });
        if (snipedMessages.get(from).length > 10) snipedMessages.get(from).pop();
    } catch (e) {}
}

module.exports = handleAntideleteCommand;
module.exports.storeMessage = storeMessage;
module.exports.handleMessageRevocation = handleMessageRevocation;
module.exports.handleSnipe = handleSnipe;
