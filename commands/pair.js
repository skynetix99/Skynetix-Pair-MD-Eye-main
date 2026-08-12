const PAIRING_URL = 'https://skynetix-pair-md-eye-production.up.railway.app';
const TELEGRAM_URL = 'https://t.me/+ajTTpmRlM7w0NzA0';

function normalizePhoneNumber(value) {
    return String(value || '').replace(/[^0-9]/g, '');
}

function isValidPhoneNumber(number) {
    return /^\d{8,15}$/.test(number);
}

async function pairCommand(sock, from, msg, query = '') {
    const requestedNumber = normalizePhoneNumber(query);
    const numberLine = requestedNumber
        ? isValidPhoneNumber(requestedNumber)
            ? `\n\n📱 *Number received:* \`${requestedNumber}\`\nUse this number on the pairing page below.`
            : '\n\n⚠️ *Invalid number:* use 8–15 digits with the country code, without `+`, spaces, or dashes.'
        : '';

    const response =
        `╭━━━〔 🔐 *SKYNETIX PAIRING* 〕━━━╮\n` +
        `┃\n` +
        `┃ 1️⃣ Open the official pairing page.\n` +
        `┃ 2️⃣ Enter your WhatsApp number with country code.\n` +
        `┃ 3️⃣ Request the pairing code.\n` +
        `┃ 4️⃣ In WhatsApp, open *Linked devices* → *Link a device*.\n` +
        `┃ 5️⃣ Enter the displayed code and wait for the session to connect.\n` +
        `┃\n` +
        `┃ 🌐 *Pairing page:* ${PAIRING_URL}\n` +
        `┃ 💬 *Support:* ${TELEGRAM_URL}\n` +
        `┃\n` +
        `┃ ⚠️ Never share your pairing code or session files.\n` +
        `┃ ⚠️ Use only a WhatsApp account you control.\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯` +
        numberLine;

    await sock.sendMessage(from, { text: response }, { quoted: msg });
}

pairCommand.normalizePhoneNumber = normalizePhoneNumber;
pairCommand.isValidPhoneNumber = isValidPhoneNumber;
pairCommand.PAIRING_URL = PAIRING_URL;

module.exports = pairCommand;
