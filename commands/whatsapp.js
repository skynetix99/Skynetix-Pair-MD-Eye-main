const SUPPORT_TEXT = `🛡️ *WHATSAPP SUPPORT & ANTI-BAN GUIDE*

` +
`This guide helps reduce avoidable restrictions. No command can guarantee that an account or group will never be banned. Always follow WhatsApp's Terms of Service and use the official WhatsApp application where possible.

` +
`✅ *ACCOUNT SAFETY*
` +
`• Keep the WhatsApp app and device software updated.
` +
`• Use a strong two-step verification PIN and never share registration codes.
` +
`• Avoid unofficial, modified, or cloned WhatsApp clients.
` +
`• Do not use automation to imitate human activity or evade enforcement.

` +
`✅ *MESSAGING BEST PRACTICES*
` +
`• Message people who expect to hear from you and respect opt-out requests.
` +
`• Avoid bulk messaging, repeated forwards, unsolicited promotions, and link spam.
` +
`• Do not send scams, threats, harmful content, or misleading information.
` +
`• Keep command responses useful, short, and rate-limited; do not flood chats.

` +
`✅ *GROUP ADMIN BEST PRACTICES*
` +
`• Add members only with consent and keep group links private when appropriate.
` +
`• Use clear group rules, trusted admins, and least-privilege permissions.
` +
`• Remove spam, impersonation, phishing links, and abusive content promptly.
` +
`• Enable protection features such as antilink and antibot only with transparent rules.

` +
`✅ *BOT OPERATIONS*
` +
`• Keep the bot online from one stable session instead of repeatedly re-pairing it.
` +
`• Avoid mass mentions, mass calls, contact scraping, and unsolicited broadcasts.
` +
`• Add delays and sensible limits to legitimate automated actions.
` +
`• Log errors, stop failing jobs, and do not retry aggressively after rate limits.

` +
`⚠️ *IF AN ACCOUNT IS RESTRICTED*
` +
`Stop automated activity, review recent messages and group activity, secure the account, and use WhatsApp's official in-app appeal or support process. Do not attempt to bypass a restriction with spam, repeated registrations, or unofficial clients.

` +
`Use *.whatsapp* or *.support* any time to view this guide.`;

async function whatsappSupport(sock, chatId, msg) {
    return sock.sendMessage(chatId, { text: SUPPORT_TEXT }, { quoted: msg });
}

module.exports = whatsappSupport;
module.exports.SUPPORT_TEXT = SUPPORT_TEXT;
