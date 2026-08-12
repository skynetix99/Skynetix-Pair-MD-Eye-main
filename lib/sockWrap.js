// =====================================================================
//  SKYNETIX — GLOBAL NEWSLETTER FORWARDING WRAPPER
//
//  Wraps sock.sendMessage once, right after the WhatsApp socket is
//  created, so EVERY message the bot sends (all commands, menus,
//  event replies, etc.) is shown as "Forwarded from channel" with the
//  official channel link. No per-command changes needed.
//
//  - Only text/image/video/audio/document/sticker/link-preview/content
//    payloads get the tag (status broadcasts, polls, forwards, deletes,
//    reactions, presence, and Telegram messages are left untouched).
//  - Idempotent: safe to call more than once.
//  - Zero network cost: context is built locally.
// =====================================================================

const NEWSLETTER_JID = '120363350619358109@newsletter';
const NEWSLETTER_NAME = '𝐒𝐊𝐘𝐍𝐄𝐓𝐈𝐗 𝐓𝐄𝐂𝐇';

function newsletterContextInfo() {
    return {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWSLETTER_JID,
            newsletterName: NEWSLETTER_NAME,
            serverMessageId: -1
        }
    };
}

const TAGGED_TYPES = new Set([
    'text', 'image', 'video', 'audio', 'document',
    'sticker', 'viewOnce', 'ptv', 'interactive',
    'product', 'buttons', 'listMessage', 'livestreamLocation'
]);

function shouldTag(payload) {
    if (!payload || typeof payload !== 'object') return false;
    if (payload.contextInfo && payload.contextInfo.newsletterSkip) return false;
    return Object.keys(payload).some(k => TAGGED_TYPES.has(k));
}

function wrapSock(sock) {
    if (!sock || sock.__wgNewsletterWrapped) return sock;
    sock.__wgNewsletterWrapped = true;

    const original = sock.sendMessage.bind(sock);
    sock.sendMessage = async function sendMessage(jid, payload, options) {
        if (shouldTag(payload)) {
            try {
                payload = { ...payload, contextInfo: newsletterContextInfo() };
            } catch (e) {
                // Never let wrapping break a send
            }
        }
        return original(jid, payload, options);
    };
    return sock;
}

module.exports = { wrapSock, newsletterContextInfo, NEWSLETTER_JID };
