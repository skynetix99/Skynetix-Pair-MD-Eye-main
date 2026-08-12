const crypto = require('crypto');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

module.exports = async function(sock, chatId, msg, q) {
    try {
        // Basic check for arguments
        if (!q) {
            return await sock.sendMessage(chatId, { 
                text: '🔓 *SKYNETIX FILE DECRYPTER* 🔓\n\n' +
                      'Usage:\n' +
                      '1. Text: `.decry [key] [iv:encrypted_hex]`\n' +
                      '2. File: Reply to a file with `.decry [key]`\n\n' +
                      '📝 *Note:* This command uses AES-256-CBC decryption. For files, the encrypted content should be in `iv:data` format (hex).' 
            }, { quoted: msg });
        }

        const parts = q.trim().split(' ');
        const key = parts[0];
        let encryptedInput = parts.slice(1).join(' ');

        // Check if replying to a message with a file
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let isFile = false;
        let fileName = 'decrypted_file';

        if (quotedMsg) {
            const mimeType = Object.keys(quotedMsg)[0];
            if (mimeType.includes('Message')) {
                const message = quotedMsg[mimeType];
                const type = mimeType.replace('Message', '').toLowerCase();
                
                await sock.sendMessage(chatId, { text: '⏳ *Downloading and decrypting file...*' }, { quoted: msg });
                
                const stream = await downloadContentFromMessage(message, type);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                encryptedInput = buffer.toString('utf8').trim();
                isFile = true;
                if (message.fileName) fileName = 'decrypted_' + message.fileName;
            }
        }

        if (!encryptedInput) {
            return await sock.sendMessage(chatId, { text: '❌ Please provide encrypted data or reply to an encrypted file!' }, { quoted: msg });
        }

        // Decryption logic
        try {
            // Expected format: "iv_hex:encrypted_data_hex"
            const [ivHex, dataHex] = encryptedInput.split(':');
            
            if (!ivHex || !dataHex) {
                throw new Error("Invalid format! Expected 'iv:data' in hex.");
            }

            const iv = Buffer.from(ivHex, 'hex');
            const encrypted = Buffer.from(dataHex, 'hex');
            
            // Create 32-byte key from user input using SHA-256
            const hashedKey = crypto.createHash('sha256').update(key).digest();
            
            const decipher = crypto.createDecipheriv('aes-256-cbc', hashedKey, iv);
            
            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            
            // Attempt to detect if it's text or binary
            const decryptedText = decrypted.toString('utf8');
            const isProbablyText = /^[\x20-\x7E\x0A\x0D]*$/.test(decryptedText.slice(0, 100));

            if (isProbablyText && !isFile) {
                await sock.sendMessage(chatId, { 
                    text: `✅ *DECRYPTION SUCCESS*\n\n*Content:*\n${decryptedText}\n\n_Powered by SKYNETIX MINI_` 
                }, { quoted: msg });
            } else {
                // Send as a file if it was a file or looks like binary
                await sock.sendMessage(chatId, { 
                    document: decrypted,
                    mimetype: 'application/octet-stream',
                    fileName: fileName,
                    caption: '✅ *File Decrypted Successfully!*'
                }, { quoted: msg });
            }

        } catch (e) {
            await sock.sendMessage(chatId, { 
                text: `❌ *Decryption Failed!*\n\n*Error:* ${e.message}\n\n_Make sure the key is correct and the data is in "iv:data" hex format._` 
            }, { quoted: msg });
        }
    } catch (err) {
        await sock.sendMessage(chatId, { text: '❌ *System Error:* ' + err.message }, { quoted: msg });
    }
};
