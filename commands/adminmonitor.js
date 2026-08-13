// Group administrator change notifications.
// This module is event-driven and intentionally has no command or owner gate.

const recentEvents = new WeakMap();
const DEDUPE_WINDOW_MS = 20_000;
const MAX_REMEMBERED_EVENTS = 300;

function normalizeJid(value) {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/:\d+(?=@)/, '');
}

function mentionFor(jid) {
    const normalized = normalizeJid(jid);
    const number = normalized.split('@')[0];
    return number ? `@${number}` : 'unknown member';
}

function getEventKey(update) {
    const participants = (update.participants || []).map(normalizeJid).filter(Boolean).sort().join(',');
    const author = normalizeJid(update.author || update.actor || '');
    return `${update.id || ''}|${update.action || ''}|${participants}|${author}`;
}

function alreadyReported(sock, update) {
    let events = recentEvents.get(sock);
    if (!events) {
        events = new Map();
        recentEvents.set(sock, events);
    }
    const now = Date.now();
    for (const [key, timestamp] of events) {
        if (now - timestamp > DEDUPE_WINDOW_MS) events.delete(key);
    }
    const key = getEventKey(update);
    if (events.has(key)) return true;
    events.set(key, now);
    while (events.size > MAX_REMEMBERED_EVENTS) events.delete(events.keys().next().value);
    return false;
}

function actionLabel(action) {
    if (action === 'promote') return 'promoted to group admin';
    if (action === 'demote') return 'removed from the group admin role';
    if (action === 'remove') return 'removed from the group';
    return null;
}

function buildMessage(update) {
    const label = actionLabel(update.action);
    if (!label) return null;
    const participants = (update.participants || []).map(normalizeJid).filter(Boolean);
    if (!participants.length) return null;

    const affected = participants.map(mentionFor);
    const actor = normalizeJid(update.author || update.actor || '');
    const actorLine = actor ? `\n👤 Changed by: ${mentionFor(actor)}` : '\n👤 Changed by: Not available';
    const verb = participants.length === 1 ? 'was' : 'were';
    return {
        text: `🛡️ *GROUP ADMIN UPDATE*\n\n` +
            `👥 Member${participants.length === 1 ? '' : 's'}: ${affected.join(', ')}\n` +
            `🔔 Status: ${verb} ${label}${actorLine}`,
        mentions: [...new Set([...participants, ...(actor ? [actor] : [])])]
    };
}

async function handleEvent(sock, update = {}) {
    if (!sock || !update.id || !String(update.id).endsWith('@g.us')) return false;
    if (!['promote', 'demote', 'remove'].includes(update.action)) return false;
    if (!Array.isArray(update.participants) || !update.participants.length) return false;
    if (alreadyReported(sock, update)) return false;

    const message = buildMessage(update);
    if (!message) return false;
    try {
        await sock.sendMessage(update.id, message);
        return true;
    } catch (error) {
        // Do not permanently suppress an event if WhatsApp rejected the send.
        const events = recentEvents.get(sock);
        if (events) events.delete(getEventKey(update));
        console.error('[AdminMonitor] Failed to report group admin change:', error.message);
        return false;
    }
}

module.exports = { handleEvent, buildMessage, normalizeJid };
