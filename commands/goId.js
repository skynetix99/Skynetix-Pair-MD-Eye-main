async function goIdCommand(sock, from, msg) {
    let target = from;
    let type = from.endsWith('@g.us') ? "Group" : "User";

    // If there's a mention or reply, get that ID
    if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) {
        const context = msg.message.extendedTextMessage.contextInfo;
        if (context.participant) {
            target = context.participant;
            type = "Participant";
        } else if (context.mentionedJid && context.mentionedJid.length > 0) {
            target = context.mentionedJid[0];
            type = "Mentioned User";
        }
    }

    const text = `🆔 *${type} ID Info*\n\n` +
                 `*JID:* \`${target}\`\n` +
                 `*Chat:* \`${from}\``;

    await sock.sendMessage(from, { text }, { quoted: msg });
}

module.exports = goIdCommand;
