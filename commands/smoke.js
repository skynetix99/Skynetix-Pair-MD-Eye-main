async function smokeCommand(sock, from, msg) {
    const { key } = await sock.sendMessage(from, { text: '🚬' }, { quoted: msg });
    const frames = [
        '☁️🚬',
        '☁️☁️🚬',
        '☁️☁️☁️🚬',
        '☁️☁️☁️☁️🚬',
        '☁️☁️☁️🚬',
        '☁️☁️🚬',
        '☁️🚬',
        '🚬',
        '💨'
    ];

    for (const frame of frames) {
        await new Promise(resolve => setTimeout(resolve, 800));
        await sock.sendMessage(from, { text: frame, edit: key });
    }
}

module.exports = smokeCommand;
