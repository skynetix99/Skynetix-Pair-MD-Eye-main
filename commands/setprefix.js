module.exports = async function(sock, chatId, msg, q, { isOwner, botData, saveBotData }) {
    try {
        if (!isOwner) {
            return await sock.sendMessage(chatId, { text: '❌ This command is only for the bot owner!' }, { quoted: msg });
        }

        if (!q) {
            return await sock.sendMessage(chatId, { 
                text: `⚠️ Please provide a new prefix!\n\n*Current Prefix:* ${botData.prefix || '.'}\n*Usage:* .setprefix #` 
            }, { quoted: msg });
        }

        const newPrefix = q.trim().split(' ')[0];
        
        if (newPrefix.length > 3) {
            return await sock.sendMessage(chatId, { text: '❌ Prefix is too long! Maximum 3 characters.' }, { quoted: msg });
        }

        botData.prefix = newPrefix;
        saveBotData();

        await sock.sendMessage(chatId, { 
            text: `✅ *PREFIX UPDATED*\n\nNew Prefix: *${newPrefix}*\n\n_You can now use commands with the new prefix._` 
        }, { quoted: msg });

    } catch (err) {
        await sock.sendMessage(chatId, { text: '❌ Error: ' + err.message }, { quoted: msg });
    }
};
