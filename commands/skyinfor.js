const { channelInfo } = require('../lib/messageConfig');

// SKYINFOR — Owner info command
// Trigger: .skyinfor
// Owner-only command under the Owner Menu.

async function skyinfor(sock, chatId, msg, isOwner) {
    // Owner-only: only the configured owner number can use this command.
    if (!isOwner) {
        return safeSend(sock, chatId, { text: "❌ Owner only!" }, { quoted: msg });
    }

    const skyinforText =
        "🙏 Thank you all for supporting my group! ❤️\n\n" +
        "👋 First of all, my name is Skynetix, and I’m based in Westgate, Harare. 🇿🇼\n\n" +
        "💻 I have a strong interest in technology. I develop and modify premium APKs, and I also provide virtual phone numbers, including +1, +44, and many others. 📱\n\n" +
        "📩 For virtual numbers, inbox: +263715397741\n\n" +
        "🚀 I’ll also be dropping VPN files soon, including:\n\n" +
        "🔹 HC\n" +
        "🔹 HA\n" +
        "🔹 SIP\n" +
        "🔹 OMA\n" +
        "🔹 EHI\n" +
        "🔹 AND MORE... 🔥\n\n" +
        "❤️ Thank you once again for your support!";

    // The dedicated SKYINFOR image (per owner's request); falls back to plain
    // text if the image cannot be fetched. Every message carries the newsletter
    // forwarding context so it is shown as "Forwarded from channel" with the
    // channel link.
    const skyinforImage = 'https://files.catbox.moe/lsj0bi.png';

    // safeSend carries automatic retries plus a bare-text last resort, so the
    // bot always replies even if the image is unreachable or the network fails.
    await safeSend(
        sock,
        chatId,
        { image: { url: skyinforImage }, caption: skyinforText, contextInfo: newsletterContextInfo() },
        { quoted: msg }
    );
}

// Build the newsletter forwarding context so .skyinfo messages are shown as
// "Forwarded from channel" with the official channel link.
function newsletterContextInfo() {
    return {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363350619358109@newsletter',
            newsletterName: '𝐒𝐊𝐘𝐍𝐄𝐓𝐈𝐗 𝐓𝐄𝐂𝐇',
            serverMessageId: -1
        }
    };
}

// Send with automatic retries and a plain-text fallback so the bot always
// responds, even if the first send attempt fails (e.g. temporary network
// hiccup or a rate limit from WhatsApp).
async function safeSend(sock, chatId, payload, options, retries = 3) {
    let lastErr = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            await sock.sendMessage(chatId, payload, options);
            return; // sent immediately — no waiting
        } catch (e) {
            lastErr = e;
            if (attempt === retries) break;
            await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
        }
    }
    // Last resort: drop quoted/options and try again with bare text.
    try {
        await sock.sendMessage(chatId, { text: payload.caption || payload.text || '' });
    } catch (finalErr) {
        console.error(`[skyinfor] send failed for ${chatId}: ${finalErr.message || finalErr}`);
    }
}

module.exports = skyinfor;
