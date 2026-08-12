const SCOREBOARD_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const REQUEST_TIMEOUT_MS = 8000;
const DISPLAY_TIME_ZONE = process.env.FOOTBALL_TIMEZONE || 'Africa/Harare';

const COMPETITIONS = {
    zimbabwe: { label: 'Zimbabwe Premier Soccer League', slug: 'zim.1', aliases: ['zim', 'zimbabwe', 'zpsl'] },
    england: { label: 'English Premier League', slug: 'eng.1', aliases: ['england', 'epl', 'premierleague', 'premier'] },
    spain: { label: 'LaLiga', slug: 'esp.1', aliases: ['spain', 'laliga', 'la-liga'] },
    germany: { label: 'Bundesliga', slug: 'ger.1', aliases: ['germany', 'bundesliga'] },
    italy: { label: 'Serie A', slug: 'ita.1', aliases: ['italy', 'seriea', 'serie-a'] },
    france: { label: 'Ligue 1', slug: 'fra.1', aliases: ['france', 'ligue1', 'ligue-1'] },
    usa: { label: 'MLS', slug: 'usa.1', aliases: ['usa', 'america', 'mls'] },
    mexico: { label: 'Liga MX', slug: 'mex.1', aliases: ['mexico', 'ligamx', 'liga-mx'] },
    brazil: { label: 'Brasileirão Série A', slug: 'bra.1', aliases: ['brazil', 'brasileirao', 'brasileirão'] }
};

const ALL_ALIAS = new Map();
for (const [key, competition] of Object.entries(COMPETITIONS)) {
    ALL_ALIAS.set(key, key);
    for (const alias of competition.aliases) ALL_ALIAS.set(alias, key);
}

function getCompetitionKeys(query = '') {
    const normalized = String(query).trim().toLowerCase();
    if (!normalized || ['all', 'world', 'international', 'global'].includes(normalized)) {
        return ['zimbabwe', 'england', 'spain', 'germany', 'italy', 'france'];
    }
    if (['help', '-h', '--help'].includes(normalized)) return [];
    return normalized
        .split(/[\s,|]+/)
        .map((part) => ALL_ALIAS.get(part))
        .filter((key, index, keys) => key && keys.indexOf(key) === index)
        .slice(0, 6);
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Time unavailable';
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: DISPLAY_TIME_ZONE,
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

function formatEvent(event) {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors || [];
    const home = competitors.find((team) => team.homeAway === 'home') || competitors[0];
    const away = competitors.find((team) => team.homeAway === 'away') || competitors[1];
    const status = event.status?.type?.shortDetail || event.status?.type?.description || 'Status unavailable';
    const homeScore = home?.score ?? '-';
    const awayScore = away?.score ?? '-';
    return `• ${home?.team?.shortDisplayName || home?.team?.displayName || 'Home'} ${homeScore}–${awayScore} ${away?.team?.shortDisplayName || away?.team?.displayName || 'Away'}\n  ${status} · ${formatDate(event.date)}`;
}

async function fetchCompetition(key) {
    const competition = COMPETITIONS[key];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(`${SCOREBOARD_BASE}/${competition.slug}/scoreboard`, {
            headers: { 'accept': 'application/json', 'user-agent': 'Skynetix-Pair-MD-Eye-Football/1.0' },
            signal: controller.signal
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return {
            key,
            label: competition.label,
            events: Array.isArray(data.events) ? data.events.slice(0, 8) : [],
            error: null
        };
    } catch (error) {
        return { key, label: competition.label, events: [], error: error.name === 'AbortError' ? 'request timed out' : error.message };
    } finally {
        clearTimeout(timer);
    }
}

function helpText() {
    return `⚽ *FOOTBALL STATUS*\n\n` +
        `Get current fixtures, results, and match status for Zimbabwe and major leagues.\n\n` +
        `*Usage*\n` +
        `• .football — Zimbabwe plus major international leagues\n` +
        `• .football zimbabwe — Zimbabwe Premier Soccer League\n` +
        `• .football england spain — selected competitions\n` +
        `• .soccer zim — Zimbabwe shortcut\n\n` +
        `Available: zimbabwe, england, spain, germany, italy, france, usa, mexico, brazil.`;
}

async function footballCommand(sock, from, msg, query = '') {
    const normalizedQuery = String(query).trim().toLowerCase();
    if (['help', '-h', '--help'].includes(normalizedQuery)) {
        await sock.sendMessage(from, { text: helpText() }, { quoted: msg });
        return;
    }

    const keys = getCompetitionKeys(query);
    if (!keys.length) {
        await sock.sendMessage(from, { text: `${helpText()}\n\n⚠️ I could not identify that competition.` }, { quoted: msg });
        return;
    }

    const results = await Promise.all(keys.map(fetchCompetition));
    let response = `⚽ *FOOTBALL STATUS*\n🕒 Updated: ${formatDate(new Date())}\n\n`;
    for (const result of results) {
        response += `*${result.label}*\n`;
        if (result.error) response += `⚠️ Data unavailable: ${result.error}\n\n`;
        else if (!result.events.length) response += 'No fixtures or results are listed at the moment.\n\n';
        else response += `${result.events.map(formatEvent).join('\n')}\n\n`;
    }
    response += `Data source: ESPN public soccer scoreboard\nTimezone: ${DISPLAY_TIME_ZONE}`;
    await sock.sendMessage(from, { text: response }, { quoted: msg });
}

footballCommand.getCompetitionKeys = getCompetitionKeys;
footballCommand.formatEvent = formatEvent;
footballCommand.fetchCompetition = fetchCompetition;
footballCommand.COMPETITIONS = COMPETITIONS;

module.exports = footballCommand;
