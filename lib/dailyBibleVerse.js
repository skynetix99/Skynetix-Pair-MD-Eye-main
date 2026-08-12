const NEWSLETTER_JID = '120363350619358109@newsletter';
const DEFAULT_SEND_TIME = '08:00';
const CHECK_INTERVAL_MS = 30 * 1000;

const VERSES = [
    { reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
    { reference: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' },
    { reference: 'Philippians 4:13', text: 'I can do all this through him who gives me strength.' },
    { reference: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.' },
    { reference: 'Proverbs 3:5–6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
    { reference: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
    { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him.' },
    { reference: 'Psalm 46:1', text: 'God is our refuge and strength, an ever-present help in trouble.' },
    { reference: 'Joshua 1:9', text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
    { reference: '1 Corinthians 16:14', text: 'Do everything in love.' }
];

let scheduler = null;
let sending = false;

function getConfiguredTime() {
    const configured = process.env.BIBLE_VERSE_BROADCAST_TIME || DEFAULT_SEND_TIME;
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(configured) ? configured : DEFAULT_SEND_TIME;
}

function getDateTimeParts(date = new Date(), timeZone = process.env.BIBLE_VERSE_TIMEZONE || 'UTC') {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date).reduce((result, part) => {
        if (part.type !== 'literal') result[part.type] = part.value;
        return result;
    }, {});

    return {
        dateKey: `${parts.year}-${parts.month}-${parts.day}`,
        timeKey: `${parts.hour}:${parts.minute}`
    };
}

function buildVerseMessage(dateKey, verse) {
    return `✝️ *DAILY BIBLE VERSE*\n\n` +
        `“${verse.text}”\n\n` +
        `— *${verse.reference}*\n\n` +
        `_May God bless your day. (${dateKey})_`;
}

async function broadcastDailyBibleVerse({ getActiveSockets, botData, saveBotData, now = new Date(), force = false }) {
    if (sending) return { sent: 0, skipped: true, reason: 'broadcast-in-progress' };

    const { dateKey, timeKey } = getDateTimeParts(now);
    const configuredTime = getConfiguredTime();
    const state = botData.dailyBibleVerse || (botData.dailyBibleVerse = {});

    if (!force && (timeKey < configuredTime || state.lastSentDate === dateKey)) {
        return { sent: 0, skipped: true, reason: state.lastSentDate === dateKey ? 'already-sent' : 'not-scheduled-time' };
    }

    const activeSockets = (getActiveSockets() || []).filter((entry) => entry && entry.sock && entry.sock.user);
    if (!activeSockets.length) return { sent: 0, skipped: true, reason: 'no-connected-bots' };

    sending = true;
    const verse = VERSES[Math.floor(Math.random() * VERSES.length)];
    const message = { text: buildVerseMessage(dateKey, verse) };
    let sent = 0;
    const errors = [];

    try {
        for (const { sock } of activeSockets) {
            try {
                await sock.sendMessage(NEWSLETTER_JID, message);
                sent = 1;
                break;
            } catch (error) {
                errors.push(error.message);
            }
        }

        if (sent > 0) {
            state.lastSentDate = dateKey;
            state.lastVerseReference = verse.reference;
            state.lastSentAt = new Date().toISOString();
            if (typeof saveBotData === 'function') saveBotData();
        }
    } finally {
        sending = false;
    }

    return { sent, errors, dateKey, reference: verse.reference };
}

function startDailyBibleVerseScheduler(options) {
    if (scheduler) return scheduler;

    const tick = () => broadcastDailyBibleVerse(options).catch((error) => {
        console.error('[Bible Verse] Broadcast error:', error.message);
    });

    scheduler = setInterval(tick, CHECK_INTERVAL_MS);
    scheduler.unref?.();
    return scheduler;
}

function stopDailyBibleVerseScheduler() {
    if (scheduler) clearInterval(scheduler);
    scheduler = null;
}

module.exports = {
    NEWSLETTER_JID,
    VERSES,
    buildVerseMessage,
    getDateTimeParts,
    broadcastDailyBibleVerse,
    startDailyBibleVerseScheduler,
    stopDailyBibleVerseScheduler
};
