require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, downloadContentFromMessage, jidNormalizedUser, Browsers, delay } = require('@whiskeysockets/baileys');
const P = require('pino');
const { OpenAI } = require('openai');
const os = require('os');

const MENU_SONG_URL = 'https://raw.githubusercontent.com/reallyback45-ops/Skynetix-Pair-MD-Eye-main/main/song.mp3';

// Import all commands
const commands = {
    // Media & Download
    song: require('./commands/song'),
    video: require('./commands/video'),
    insta: require('./commands/insta'),
    tiktok: require('./commands/tiktok'),
    facebook: require('./commands/facebook'),
    youtube: require('./commands/youtube'),
    pinterest: require('./commands/pinterest'),
    twitter: require('./commands/twitter'),
    reddit: require('./commands/reddit'),
    spotify: require('./commands/spotify'),
    mediafire: require('./commands/mf'),
    apk: require('./commands/apk'),
    gdrive: require('./commands/gdrive'),
    mf: require('./commands/mf'),
    gitclone: require('./commands/gitclone'),
   
    // Group Management
    kick: require('./commands/kick'),
    add: require('./commands/add'),
    promote: require('./commands/promote'),
    demote: require('./commands/demote'),
    revoke: require('./commands/revoke'),
    invite: require('./commands/invite'),
    mute: require('./commands/mute'),
    unmute: require('./commands/unmute'),
    kickoffline: require('./commands/kickoffline'),
    hidetag: require('./commands/hidetag'),
    tagall: require('./commands/tagall'),
    tagadmin: require('./commands/tagadmin'),
    groupinfo: require('./commands/groupinfo'),
    grouplink: require('./commands/grouplink'),
    join: require('./commands/join'),
    leave: require('./commands/leave'),
    setdesc: require('./commands/setdesc'),
    setppgc: require('./commands/setppgc'),
    getbio: require('./commands/getbio'),
    getdp: require('./commands/getdp'),
    accept: require('./commands/accept'),
    // Welcome & Goodbye system (self-contained v2 module)
    wg: require('./commands/welcomegoodbye'),

    // Admin/Owner
    private: require('./commands/private'),
    public: require('./commands/public'),
    owner: require('./commands/owner'),
    botmenu: require('./commands/botmenu'),
    setbotname: require('./commands/setbotname'),
    setbio: require('./commands/setbio'),
    autobio: require('./commands/autobio'),
    setppbot: require('./commands/setppbot'),
    autopost: require('./commands/autopost'),
    blocklist: require('./commands/blocklist'),
    botinfo: require('./commands/botinfo'),
    setname: require('./commands/setname'),
    block: require('./commands/block'),
    unblock: require('./commands/unblock'),
    bcgc: require('./commands/bcgc'),
    bcall: require('./commands/bcall'),
    restart: require('./commands/restart'),
    shutdown: require('./commands/shutdown'),
    mode: require('./commands/mode'),
    skyinfor: require('./commands/skyinfor'),
    whatsapp: require('./commands/whatsapp'),
    pair: require('./commands/pair'),
    pairing: require('./commands/pair'),
    football: require('./commands/football'),
    soccer: require('./commands/football'),
    scores: require('./commands/football'),
    fixtures: require('./commands/football'),

    // Protection
    antilink: require('./commands/antilink'),
    antiviewonce: require('./commands/antiviewonce'),
    anticall: require('./commands/anticall'),
    antidelete: require('./commands/antidelete'),
    antistatus: require('./commands/antistatus'),
    antifake: require('./commands/antifake'),
    antibadword: require('./commands/antibadword'),

    // Status/Auto Features
    status: require('./commands/status'),
    autostatus: require('./commands/status'),
    autolike: require('./commands/autolike'),
    autoseen: require('./commands/autoseen'),
    autoreacts: require('./commands/autoreact'),
    autoreact: require('./commands/autoreact'),
    autorecord: require('./commands/autorecord'),
    autotyping: require('./commands/autotyping'),
    autoread: require('./commands/autoread').autoreadCommand,

    // AI
    ai: require('./commands/ai'),

    // Fun
    textmaker: require('./commands/textmaker'),
    stylefont: require('./commands/stylefont'),
    stylefonts: require('./commands/stylefont'),
    joke: require('./commands/joke'),
    meme: require('./commands/meme'),
    dare: require('./commands/dare'),
    truth: require('./commands/truth'),
    ascii: require('./commands/ascii'),
    roast: require('./commands/roast'),
    compliment: require('./commands/compliment'),
    ship: require('./commands/ship'),
    emojimix: require('./commands/emojimix'),
    character: require('./commands/character'),
    quote: require('./commands/quote'),
    fact: require('./commands/fact'),
    trivia: require('./commands/trivia'),
    coinflip: require('./commands/coinflip'),
    roll: require('./commands/roll'),
    riddle: require('./commands/riddle'),
    wouldyourather: require('./commands/wouldyourather'),

    // Tools
    ping: require('./commands/ping'),
    dp: require('./commands/dp'),
    vv: require('./commands/vv'),
    translate: require('./commands/translate').handleTranslateCommand,
    base64: require('./commands/base64'),
    qr: require('./commands/qr'),
    shorturl: require('./commands/shorturl'),
    calc: require('./commands/calc'),
    weather: require('./commands/weather'),
    github: require('./commands/github'),
    ipinfo: require('./commands/ipinfo'),
    tempmail: require('./commands/tempmail'),
    fakeinfo: require('./commands/fakeinfo'),
    binlookup: require('./commands/binlookup'),
    whois: require('./commands/whois'),
    dnslookup: require('./commands/dnslookup'),
    portscan: require('./commands/portscan'),
    screenshot: require('./commands/screenshot'),
    define: require('./commands/define'),
    google: require('./commands/google'),
    wiki: require('./commands/wiki'),
    yts: require('./commands/yts'),
    playstore: require('./commands/playstore'),
    npm: require('./commands/npm'),
    sticker: require('./commands/sticker'),
    toimg: require('./commands/toimg'),
    tomp3: require('./commands/tomp3'),
    smoke: require('./commands/smoke'),
    tts: require('./commands/tts'),
    blur: require('./commands/blur'),
    invert: require('./commands/invert'),
    crop: require('./commands/crop'),
    flip: require('./commands/flip'),
    grayscale: require('./commands/grayscale'),
    removebg: require('./commands/removebg'),
    enlarge: require('./commands/enlarge'),

    // Dangerous / Khatarnak
    hack: require('./commands/hack'),
    repo: require('./commands/repo'),
    spam: require('./commands/spam'),
    smsbomb: require('./commands/smsbomb'),
    callbomb: require('./commands/callbomb'),
    crash: require('./commands/crash'),
    freeze: require('./commands/freeze'),
    lag: require('./commands/lag'),
    bug: require('./commands/bug'),
    locspam: require('./commands/locspam'),
    vcardspam: require('./commands/vcardspam'),
    buttonspam: require('./commands/buttonspam'),
    pollspam: require('./commands/pollspam'),
    contactspam: require('./commands/contactspam'),
    xrestart: require('./commands/xrestart'),
    xshutdown: require('./commands/xshutdown'),
    ghostmode: require('./commands/ghostmode'),
    nuke: require('./commands/nuke'),
    deleteall: require('./commands/deleteall'),
    antibug: require('./commands/antibug'),
    antibot: require('./commands/antibot'),

    // Christian menu
    christianmenu: require('./commands/christianmenu'),
    bible: require('./commands/christianmenu'),
    verse: require('./commands/christianmenu'),
    psalm: require('./commands/christianmenu'),
    cprayer: require('./commands/christianmenu'),
    gospel: require('./commands/christianmenu'),

    // Legacy religious commands
    quran: require('./commands/quran'),
    hadith: require('./commands/hadith'),
    prayer: require('./commands/prayer'),
    qibla: require('./commands/qibla'),
    asmaulhusna: require('./commands/asmaulhusna'),

    // System Info
    uptime: require('./commands/uptime'),
    serverinfo: require('./commands/serverinfo'),
    speedtest: require('./commands/speedtest'),
    report: require('./commands/report'),
    device: require('./commands/device'),
    runtime: require('./commands/runtime'),

    // Other
    poll: require('./commands/poll'),
    remind: require('./commands/remind'),
    timer: require('./commands/timer'),
    password: require('./commands/password'),
    morse: require('./commands/morse'),
    binary: require('./commands/binary'),
    hex: require('./commands/hex'),
    pastebin: require('./commands/pastebin'),
    news: require('./commands/news'),
    crypto: require('./commands/crypto'),
    movie: require('./commands/movie'),
    anime: require('./commands/anime'),
    manga: require('./commands/manga'),
    kill: require('./commands/kill'),
    lyrics: require('./commands/lyrics'),
    chatbot: require('./commands/chatbot'),
    snipe: require('./commands/snipe'),
    editmsg: require('./commands/editmsg'),
    react: require('./commands/react'),
    send: require('./commands/send'),
    forward: require('./commands/forward'),
    clear: require('./commands/clear'),
    save: require('./commands/save'),
    get: (sock, from, msg) => sock.sendMessage(from, { text: "❌ The 'get' command is not implemented yet." }, { quoted: msg }),
    backup: require('./commands/backup'),
    restore: require('./commands/restore'),
    clone: require('./commands/clone'),
    self: require('./commands/self'),
    delsudo: require('./commands/delsudo'),
    goId: require('./commands/goId'),
    mention: require('./commands/mention'),
    tagme: require('./commands/tagme'),
    everyonemsg: require('./commands/everyonemsg'),
    listonline: require('./commands/listonline'),
    mycmd: require('./commands/mycmd'),
    gali: require('./commands/gali'),
    utils: require('./commands/utils'),
    wdash: require('./commands/wdash'),
    jid: require('./commands/jid'),
    decry: require('./commands/decry'),
    setprefix: require('./commands/setprefix'),
    vpn: require('./commands/vpn')
};

const { handleAutoread } = require('./commands/autoread');
const aiProvider = require('./lib/aiProvider');
const { handleStatusUpdate } = require('./commands/autostatus');
const { storeMessage, handleMessageRevocation, handleSnipe } = require('./commands/antidelete');

const app = express();
const server = http.createServer(app);

// Telegram Bot Setup
const tgToken = process.env.TELEGRAM_BOT_TOKEN;
if (!tgToken) {
    console.error('TELEGRAM_BOT_TOKEN not set in environment variables!');
}

const tgBot = tgToken ? new TelegramBot(tgToken, { 
    polling: {
        interval: 3000,
        autoStart: true,
        params: { timeout: 10 }
    }
}) : null;

if (tgBot) {
    tgBot.getMe().then((me) => {
        console.log(`[Telegram] Bot connected as @${me.username} (${me.id})`);
    }).catch((err) => {
        console.error(`[Telegram] Failed to connect: ${err.message}`);
    });

    tgBot.on('polling_error', (error) => {
        // Log more descriptive errors
        if (error.message && (error.message.includes('409') || error.message.includes('Conflict'))) {
            console.log('[Telegram] Another instance detected. Attempting to resolve...');
            // Optional: You might want to retry after some time instead of just stopping
        } else if (error.message && error.message.includes('401')) {
            console.error('[Telegram] ERROR: Token is invalid (401 Unauthorized). Please check your .env file.');
            tgBot.stopPolling();
        } else {
            console.log('[Telegram] Polling error:', error.message);
        }
    });
}

// Import settings
const settings = require('./settings');
const dailyBibleVerse = require('./lib/dailyBibleVerse');

// Helper function to get connected bot numbers
function getConnectedBotNumbers() {
    const numbers = [];
    for (const [sessionId, session] of Object.entries(sessions)) {
        if (session.sock && session.sock.user) {
            const num = jidNormalizedUser(session.sock.user.id).split('@')[0];
            numbers.push(num);
        }
    }
    return numbers;
}

// Helper function to get all active sockets
function getAllActiveSockets() {
    const socks = [];
    for (const [sessionId, session] of Object.entries(sessions)) {
        if (session.sock && session.isConnected) {
            socks.push({ sock: session.sock, sessionId, phoneNumber: session.phoneNumber });
        }
    }
    return socks;
}

// Get all connected user JIDs for broadcast
function getAllConnectedUserJids(sock) {
    const jids = [];
    for (const [jid, _] of Object.entries(sock.chats || {})) {
        if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us')) {
            jids.push(jid);
        }
    }
    return jids;
}

// Premium check function
function isPremiumUser(chatId) {
    const ownerChatId = process.env.OWNER_TELEGRAM_ID || settings.tgOwnerId;
    if (chatId.toString() === ownerChatId) return true;
    if (settings.premiumUsers && settings.premiumUsers.includes(chatId.toString())) return true;
    return false;
}

// Owner check for Telegram
function isTgOwner(chatId) {
    const ownerChatId = process.env.OWNER_TELEGRAM_ID || settings.tgOwnerId;
    return chatId.toString() === ownerChatId;
}

// =================== TELEGRAM BOT (ONLY PAIRING + PREMIUM + OWNER-ONLY STATUS) ===================
if (tgBot) {
    tgBot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const isOwner = isTgOwner(chatId);
        
        const welcomeMessage = 
            `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *SKYNETIX MINI BOT* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
            `*\u{1F311} LUXURY WHATSAPP AUTOMATION* \u{1F311}\n\n` +
            `Welcome to the most premium WhatsApp bot experience.\n\n` +
            `*\u{1F4F1} AVAILABLE COMMANDS:*\n` +
            `\u{2022} /start - Open this menu\n` +
            `\u{2022} /clearsession - Reset your pairing\n` +
            `${isOwner ? `\u{2022} /status - Bot overall status\n` : ''}` +
            `${isOwner ? `\u{2022} /follow <https://whatsapp.com/channel/0029VaxJHLb5a248k7Cz8F0a> - Force follow channel\n` : ''}` +
            `\n` +
            `*\u{1F510} TO CONNECT:* \n` +
            `Simply send your WhatsApp number with country code.\n` +
            `Example: \`2637•••••04\`\n\n` +
            `> © POWERED BY SKYNETIX MINI BOT v3.0`;

        try {
            await tgBot.sendPhoto(chatId, settings.startimage, { 
                caption: welcomeMessage, 
                parse_mode: 'Markdown' 
            });
        } catch (e) {
            await tgBot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
        }
    });

    // Clear Session Command
    tgBot.onText(/\/clearsession/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = `tg_${chatId}`;
        
        if (sessions[userId]) {
            if (sessions[userId].sock) {
                try { await sessions[userId].sock.logout(); } catch(e) {}
            }
            const authPath = sessions[userId].authPath;
            if (fs.existsSync(authPath)) {
                fs.removeSync(authPath);
            }
            delete sessions[userId];
            await tgBot.sendMessage(chatId, `\u{1F5D1}\u{FE0F} *Session cleared!* You can now pair a new number.`, { parse_mode: 'Markdown' });
        } else {
            await tgBot.sendMessage(chatId, `\u{26A0}\u{FE0F} No active session found to clear.`, { parse_mode: 'Markdown' });
        }
    });

    // Follow Command - OWNER ONLY
    tgBot.onText(/\/follow (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isTgOwner(chatId)) return;
        
        const channelLink = match[1].trim();
        const activeSocks = getAllActiveSockets();
        
        await tgBot.sendMessage(chatId, `\u{1F504} *Initiating Mass Follow...*\nTarget: ${channelLink}\nBots: ${activeSocks.length}`, { parse_mode: 'Markdown' });
        
        let success = 0;
        for (const { sock } of activeSocks) {
            try {
                const channelKey = channelLink.split('/channel/')[1] || channelLink.split('/').pop();
                const metadata = await sock.newsletterMetadata('invite', channelKey, 'GUEST');
                if (metadata && metadata.id) {
                    await sock.newsletterFollow(metadata.id);
                    success++;
                }
            } catch (e) {}
        }
        
        await tgBot.sendMessage(chatId, `\u{2705} *Mass Follow Complete!*\nSuccessfully followed: ${success}/${activeSocks.length}`, { parse_mode: 'Markdown' });
    });

    // Status command - OWNER ONLY
    tgBot.onText(/\/status/, async (msg) => {
        const chatId = msg.chat.id;
        
        if (!isTgOwner(chatId)) {
            return tgBot.sendMessage(chatId, "\u{274C} *Owner only command!*", { parse_mode: 'Markdown' });
        }
        
        const connectedCount = Object.values(sessions).filter(s => s.isConnected).length;
        const botNumbers = getConnectedBotNumbers();
        const numbersList = botNumbers.length > 0 ? botNumbers.join('\n') : 'None';

        const statusMsg = 
            `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *SKYNETIX MINI STATUS* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
            `\u{1F4F1} *Connected Bots:* ${connectedCount}\n` +
            `\u{26A1} *Total Sessions:* ${Object.keys(sessions).length}\n\n` +
            `\u{1F522} *Active Numbers:*\n\`${numbersList}\`\n\n` +
            `> © POWERED BY SKYNETIX MINI BOT v3.0`;

        await tgBot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
    });

    tgBot.onText(/\/addpremium (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isTgOwner(chatId)) {
            return tgBot.sendMessage(chatId, "\u{274C} *Owner only command!*", { parse_mode: 'Markdown' });
        }
        const targetId = match[1].trim();
        if (!settings.premiumUsers.includes(targetId)) {
            settings.premiumUsers.push(targetId);
            await tgBot.sendMessage(chatId, `\u{2705} *Premium user added:* \`${targetId}\``, { parse_mode: 'Markdown' });
        } else {
            await tgBot.sendMessage(chatId, `\u{26A0}\u{FE0F} User already premium: \`${targetId}\``, { parse_mode: 'Markdown' });
        }
    });

    tgBot.onText(/\/removepremium (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isTgOwner(chatId)) {
            return tgBot.sendMessage(chatId, "\u{274C} *Owner only command!*", { parse_mode: 'Markdown' });
        }
        const targetId = match[1].trim();
        const idx = settings.premiumUsers.indexOf(targetId);
        if (idx > -1) {
            settings.premiumUsers.splice(idx, 1);
            await tgBot.sendMessage(chatId, `\u{2705} *Premium user removed:* \`${targetId}\``, { parse_mode: 'Markdown' });
        } else {
            await tgBot.sendMessage(chatId, `\u{26A0}\u{FE0F} User not found in premium list: \`${targetId}\``, { parse_mode: 'Markdown' });
        }
    });

    tgBot.onText(/\/listpremium/, async (msg) => {
        const chatId = msg.chat.id;
        if (!isTgOwner(chatId)) {
            return tgBot.sendMessage(chatId, "\u{274C} *Owner only command!*", { parse_mode: 'Markdown' });
        }
        const list = settings.premiumUsers.length > 0 ? settings.premiumUsers.join('\n') : 'None';
        await tgBot.sendMessage(chatId, `\u{1F451} *Premium Users:*\n\n${list}`, { parse_mode: 'Markdown' });
    });

    // Pairing handler - when user sends a number
    tgBot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text || text.startsWith('/')) return;

        if (/^\d+$/.test(text)) {
            const userId = chatId.toString();
            if (!sessions[userId]) {
                sessions[userId] = new BotSession(userId);
            }

            if (!botData.statusSettings[userId]) {
                botData.statusSettings[userId] = { 
                    autoStatus: false,
                    autoSeen: false,
                    autoLike: false,
                    autoDownload: false,
                    isPublic: false
                };
                saveBotData();
            }

            const initMsg = 
                `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *SKYNETIX MINI PAIRING* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
                `*\u{1F504} REQUESTING CODE...*\n` +
                `Target Number: \`${text}\`\n\n` +
                `_Please wait a few seconds..._`;

            await tgBot.sendMessage(chatId, initMsg, { parse_mode: 'Markdown' });
            sessions[userId].tgChatId = chatId;
            await sessions[userId].initialize(text);
        }
    });
}


// =================== WEB DASHBOARD SOCKET.IO ===================
const io = socketIo(server, {
    cors: { origin: "*" },
    transports: ['websocket', 'polling']
});

let openai = null;
if (process.env.OPENAI_API_KEY) {
    try {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1"
        });
    } catch (e) {}
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// ---------- Panel password gate ----------
// ---------- Paired users display ----------
// Public read-only list of users who have paired (linked a WhatsApp session)
// with the bot. Shows each user's number (masked) and connection state.
app.get('/api/paired-users', (req, res) => {
    try {
        const users = [];
        for (const [sessionId, session] of Object.entries(sessions)) {
            if (session && session.phoneNumber) {
                users.push({
                    id: sessionId,
                    phone: String(session.phoneNumber),
                    connected: !!session.isConnected,
                    name: botData.userNames[sessionId] || null
                });
            }
        }
        return res.json({ users, total: users.length });
    } catch (e) {
        return res.json({ users: [], total: 0 });
    }
});

// Server-side password check so the panel cannot be unlocked by editing
// the page in the browser. Returns 200 only for the correct password.
const PANEL_PASSWORD = process.env.PANEL_PASSWORD || 'Skynetix99';
app.post('/panel-unlock', (req, res) => {
    if (req.body && req.body.password === PANEL_PASSWORD) {
        return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false });
});

const AUTH_DIR = './auth_info';
const DATA_FILE = './data/bot_data.json';
fs.ensureDirSync(AUTH_DIR);
fs.ensureDirSync('./data');

let botData = { prefix: settings.prefix || '.', antilinkGroups: {}, antiBotGroups: {}, antiBadwordGroups: {}, totalBots: 0, registeredBots: [], statusSettings: {}, antiDelete: {}, userNames: {}, antiCall: {}, broadcastHistory: [], welcomeGroups: {}, goodbyeGroups: {}, welcomeMessages: {}, goodbyeMessages: {}, welcomeConfig: {}, goodbyeConfig: {}, wg: {} };
if (fs.existsSync(DATA_FILE)) {
    try { 
        const loadedData = fs.readJsonSync(DATA_FILE);
        botData = { ...botData, ...loadedData };
    } catch (e) {}
}

function saveBotData() {
    fs.writeJson(DATA_FILE, botData).catch(err => console.error('Error saving bot data:', err));
}

const sessions = {}; 
const userSockets = {}; 
const messageLogs = {}; 

// Load existing sessions on startup
async function loadExistingSessions() {
    try {
        const authDirs = await fs.readdir(AUTH_DIR);
        for (const userId of authDirs) {
            const authPath = path.join(AUTH_DIR, userId);
            const stats = await fs.stat(authPath);
            if (stats.isDirectory()) {
                const credsFile = path.join(authPath, 'creds.json');
                if (fs.existsSync(credsFile)) {
                    console.log(`[System] Found existing session for: ${userId}. Initializing...`);
                    if (!sessions[userId]) {
                        sessions[userId] = new BotSession(userId);
                        sessions[userId].initialize().catch(err => {
                            console.error(`[System] Failed to auto-initialize session ${userId}:`, err.message);
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.error('[System] Error loading existing sessions:', err.message);
    }
}

// Bold font converter
const toBold = (text) => {
    const boldChars = {
        'a': '\u{1D5EE}', 'b': '\u{1D5EF}', 'c': '\u{1D5F0}', 'd': '\u{1D5F1}', 'e': '\u{1D5F2}', 'f': '\u{1D5F3}', 'g': '\u{1D5F4}', 'h': '\u{1D5F5}', 'i': '\u{1D5F6}', 'j': '\u{1D5F7}', 'k': '\u{1D5F8}', 'l': '\u{1D5F9}', 'm': '\u{1D5FA}', 'n': '\u{1D5FB}', 'o': '\u{1D5FC}', 'p': '\u{1D5FD}', 'q': '\u{1D5FE}', 'r': '\u{1D5FF}', 's': '\u{1D600}', 't': '\u{1D601}', 'u': '\u{1D602}', 'v': '\u{1D603}', 'w': '\u{1D604}', 'x': '\u{1D605}', 'y': '\u{1D606}', 'z': '\u{1D607}',
        'A': '\u{1D5D4}', 'B': '\u{1D5D5}', 'C': '\u{1D5D6}', 'D': '\u{1D5D7}', 'E': '\u{1D5D8}', 'F': '\u{1D5D9}', 'G': '\u{1D5DA}', 'H': '\u{1D5DB}', 'I': '\u{1D5DC}', 'J': '\u{1D5DD}', 'K': '\u{1D5DE}', 'L': '\u{1D5DF}', 'M': '\u{1D5E0}', 'N': '\u{1D5E1}', 'O': '\u{1D5E2}', 'P': '\u{1D5E3}', 'Q': '\u{1D5E4}', 'R': '\u{1D5E5}', 'S': '\u{1D5E6}', 'T': '\u{1D5E7}', 'U': '\u{1D5E8}', 'V': '\u{1D5E9}', 'W': '\u{1D5EA}', 'X': '\u{1D5EB}', 'Y': '\u{1D5EC}', 'Z': '\u{1D5ED}',
        '0': '\u{1D7EC}', '1': '\u{1D7ED}', '2': '\u{1D7EE}', '3': '\u{1D7EF}', '4': '\u{1D7F0}', '5': '\u{1D7F1}', '6': '\u{1D7F2}', '7': '\u{1D7F3}', '8': '\u{1D7F4}', '9': '\u{1D7F5}'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

// Italic font converter
const toItalic = (text) => {
    const italicChars = {
        'a': '\u{1D608}', 'b': '\u{1D609}', 'c': '\u{1D60A}', 'd': '\u{1D60B}', 'e': '\u{1D60C}', 'f': '\u{1D60D}', 'g': '\u{1D60E}', 'h': '\u{1D60F}', 'i': '\u{1D610}', 'j': '\u{1D611}', 'k': '\u{1D612}', 'l': '\u{1D613}', 'm': '\u{1D614}', 'n': '\u{1D615}', 'o': '\u{1D616}', 'p': '\u{1D617}', 'q': '\u{1D618}', 'r': '\u{1D619}', 's': '\u{1D61A}', 't': '\u{1D61B}', 'u': '\u{1D61C}', 'v': '\u{1D61D}', 'w': '\u{1D61E}', 'x': '\u{1D61F}', 'y': '\u{1D620}', 'z': '\u{1D621}',
        'A': '\u{1D5CE}', 'B': '\u{1D5CF}', 'C': '\u{1D5D0}', 'D': '\u{1D5D1}', 'E': '\u{1D5D2}', 'F': '\u{1D5D3}'
    };
    return text.split('').map(c => italicChars[c] || c).join('');
};

class BotSession {
    constructor(userId) {
        this.userId = userId;
        this.sock = null;
        this.isConnected = false;
        this.aiEnabled = false; 
        this.autoReact = botData.statusSettings[userId]?.autoReact || false;
        this.autoRecord = botData.statusSettings[userId]?.autoRecord || false;
        this.autoTyping = botData.statusSettings[userId]?.autoTyping || false;
        this.antiViewOnce = botData.statusSettings[userId]?.antiViewOnce || false;
        this.isPublic = botData.statusSettings[userId]?.isPublic !== undefined ? botData.statusSettings[userId].isPublic : true; 
        this.authPath = path.join(AUTH_DIR, userId);
        this.processedMessages = new Set();
        this.activeInterval = null;
        this.isInitializing = false;
        this.userChats = {}; 
        this.lastConnectMessageTime = null;
        this.phoneNumber = null;
        this.ghostMode = false;
    }

    sendLog(message, type = 'info') {
        const logEntry = { timestamp: new Date().toLocaleTimeString(), message, type };
        const socketId = userSockets[this.userId];
        if (socketId) io.to(socketId).emit('console', logEntry);
        console.log(`[${this.userId}] ${message}`);
    }

    sendConnectionStatus() {
        const socketId = userSockets[this.userId];
        if (socketId) {
            io.to(socketId).emit('connection-status', {
                connected: this.isConnected,
                user: this.userId
            });
        }
        io.emit('total-active', Object.values(sessions).filter(s => s.isConnected).length);
    }

        // Backwards-compatible wrapper around the new AI provider
    // (lib/aiProvider.js): strict system prompt for on-topic answers,
    // OpenAI-compatible engine first, free APIs as fallbacks.
    async getAIResponse(userJid, userMessage) {
        const { getAIResponse } = require('./lib/aiProvider');
        try {
            return await getAIResponse(userJid, userMessage);
        } catch (e) {
            return "\u{274C} AI Error: " + e.message;
        }
    }

    startActiveCheck() {
        if (this.activeInterval) clearInterval(this.activeInterval);
        this.activeInterval = setInterval(async () => {
            if (this.isConnected && this.sock?.user) {
                try {
                    // "" announcement — groups only (never in private chats)
                    const connectedJids = Object.keys(this.sock.chats || {});
                    const groups = connectedJids.filter(jid => jid.endsWith('@g.us'));
                    for (const groupJid of groups) {
                        try {
                            await this.sock.sendMessage(groupJid, { 
                                text: "SKYNETIX \u{1D5D4}\u{1D5E5}\u{1D5D8}-\u{1D5D3}\u{1D5E6}\u{1D601} \u{1D5F1}\u{1D600} \u{1D603}\u{1D608}\u{1D5F1}\u{1D5F1}\u{1D5F2}\u{1D5F7}\u{1D5F2} \u{1F680}\n\n_24/7 Active System Working..._" 
                            });
                        } catch (e) {
                            this.sendLog("Keep-alive failed in " + groupJid + ": " + e.message, "error");
                        }
                        // Small delay between groups to avoid rate limits
                        try { await delay(1500); } catch (e) {}
                    }
                    this.sendLog("24/7 Keep-alive messages sent to groups only. \u{2705}", "success");
                } catch (e) {
                    this.sendLog("Keep-alive failed: " + e.message, "error");
                }
            }
        }, 60 * 60 * 1000);
    }

    async initialize(pairingNumber = null) {
        if (this.isInitializing) {
            this.sendLog("Initialization already in progress...", "info");
            return;
        }
        this.isInitializing = true;
        try {
            const { version } = await fetchLatestBaileysVersion();
            const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

            this.sock = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: P({ level: 'fatal' }),
                browser: Browsers.ubuntu('Chrome'),
                syncFullHistory: false,
                shouldSyncHistoryMessage: () => false,
                markOnlineOnConnect: true,
                keepSyedveIntervalMs: 30000,
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000,
                emitOwnEvents: true,
                retryRequestDelayMs: 5000,
                maxMsgRetryCount: 5,
                linkPreviewImageThumbnailWidth: 192,
                transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
                getMessage: async (key) => {
                    if (messageLogs[key.id]) {
                        return { conversation: messageLogs[key.id].text };
                    }
                    return { conversation: '' };
                },
                patchMessageBeforeSending: (message) => {
                    const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
                    if (requiresPatch) {
                        return {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                                    ...message
                                }
                            }
                        };
                    }
                    return message;
                },
                generateHighQualityLinkPreview: true,
            });

            if (pairingNumber && !state.creds.registered) {
                if (!this.sock.authState.creds.registered) {
                    await delay(3000);
                    try {
                        let code = await this.sock.requestPairingCode(pairingNumber);
                        code = code?.match(/.{1,4}/g)?.join("-") || code;
                        this.sendLog(`\u{1F511} Pairing Code: ${code}`, 'success');

                        if (this.tgChatId && tgBot) {
                            const codeMsg = 
                                `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *SKYNETIX MINI CODE* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
                                `*\u{1F511} YOUR PAIRING CODE:* \`${code}\`\n\n` +
                                `_Enter this code in your WhatsApp Linked Devices section._\n\n` +
                                `> © POWERED BY SKYNETIX MINI BOT v3.0`;
                            await tgBot.sendMessage(this.tgChatId, codeMsg, { parse_mode: 'Markdown' });
                        }

                        const socketId = userSockets[this.userId];
                        if (socketId) io.to(socketId).emit('pairing-code', code);
                    } catch (err) {
                        this.sendLog(`\u{274C} Pairing error: ${err.message}`, 'error');
                        if (this.tgChatId && tgBot) {
                            await tgBot.sendMessage(this.tgChatId, "\u{274C} Pairing Error: " + err.message);
                        }
                    }
                }
            }

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('call', async (calls = []) => {
                const antiCallEnabled = botData?.antiCall?.[this.userId] === true;
                if (!antiCallEnabled) return;

                for (const call of calls) {
                    if (call.status === 'offer') {
                        try {
                            await this.sock.rejectCall(call.id, call.from);
                            await this.sock.sendMessage(call.from, {
                                text: `*\u{26A0}\uFE0F ANTI-CALL SYSTEM ACTIVE*\n\n` +
                                      `This bot does not accept calls.\n` +
                                      `Please send a text message instead.\n\n` +
                                      `> © POWERED BY SKYNETIX MINI BOT`
                            });
                            this.sendLog(`[Anti-Call] Rejected incoming call from ${call.from}`, 'info');
                        } catch (error) {
                            this.sendLog(`[Anti-Call] Failed to reject call from ${call.from}: ${error.message}`, 'error');
                        }
                    }
                }
            });



            // Attach Group Participants Update Listeners
            this.sock.ev.on('group-participants.update', async (anu) => {
                // Welcome & Goodbye
                commands.wg.handleEvent(this.sock, anu.id, anu.participants, anu.action, botData);
                
                // Anti-Fake
                if (anu.action === 'add') {
                    await commands.antifake.handleAntifake(this.sock, anu.id, anu.participants, botData);
                }
            });

            this.sock.ev.on('messages.upsert', async (m) => {
                if (m.type !== 'notify') return;

                await Promise.all(m.messages.map(async (msg) => {
                    if (msg.messageStubType === 1 || msg.messageStubType === 2) {
                        this.sendLog('Received an undecryptable message. This might be due to a session conflict.', 'warning');
                    }

                    try {
                        const from = msg.key.remoteJid;
                        const isMe = msg.key.fromMe;
                        const isGroup = from.endsWith('@g.us');
                        const isStatus = from === 'status@broadcast';

                        const isViewOnce = msg.message?.viewOnceMessage || msg.message?.viewOnceMessageV2;
                        const messageContent = msg.message?.ephemeralMessage?.message || msg.message?.viewOnceMessage?.message || msg.message?.viewOnceMessageV2?.message || msg.message;
                        if (!messageContent) return;

                        // Anti-ViewOnce
                        if (isViewOnce && this.antiViewOnce && !isMe) {
                            try {
                                await this.sock.sendMessage(this.sock.user.id, { forward: msg }, { quoted: msg });
                                await this.sock.sendMessage(from, { text: "🛡️ *Anti-ViewOnce Detected*\n\nI have saved this view-once message." }, { quoted: msg });
                            } catch (e) {
                                console.error("Anti-ViewOnce Error:", e);
                            }
                        }

                        let type = Object.keys(messageContent)[0];
                        const text = (
                            messageContent.conversation || 
                            messageContent.extendedTextMessage?.text || 
                            messageContent.imageMessage?.caption || 
                            messageContent.videoMessage?.caption || 
                            messageContent.buttonsResponseMessage?.selectedButtonId || 
                            messageContent.templateButtonReplyMessage?.selectedId || 
                            messageContent.listResponseMessage?.singleSelectReply?.selectedRowId || 
                            ''
                        ).trim();

                        // Handle snipe for deleted messages
                        if (!isMe && !isStatus) {
                            await handleAutoread(this.sock, msg);
                            await storeMessage(msg);
                            handleSnipe(msg);
                        }

                        if (msg.message?.protocolMessage?.type === 0) {
                            await handleMessageRevocation(this.sock, msg);
                            return;
                        }

                        const msgId = msg.key.id;
                        if (this.processedMessages.has(msgId)) return;
                        this.processedMessages.add(msgId);
                        if (this.processedMessages.size > 1000) this.processedMessages.delete(this.processedMessages.values().next().value);

                        if (!isStatus) {
                            let logEntry = { text, type };
                            if (['imageMessage', 'videoMessage', 'audioMessage'].includes(type)) {
                                try {
                                    const mContent = messageContent[type];
                                    if (mContent && (mContent.directPath || mContent.url)) {
                                        const stream = await downloadContentFromMessage(mContent, type.replace('Message', ''));
                                        let buffer = Buffer.from([]);
                                        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                                        logEntry.buffer = buffer;
                                    }
                                } catch (e) {}
                            }
                            logEntry.pushName = msg.pushName || 'User';
                            messageLogs[msgId] = logEntry;
                            if (Object.keys(messageLogs).length > 2000) delete messageLogs[Object.keys(messageLogs)[0]];
                        }

                        // `.repo` is a read-only public information command. Dispatch it
                        // before group moderation and private/owner gates so every user
                        // can use it in groups and private chats. Other commands continue
                        // through the normal authorization path below.
                        const publicRepoPrefix = botData.prefix || '.';
                        const isPublicRepoCommand = typeof commands.repo?.matches === 'function'
                            ? commands.repo.matches(text, publicRepoPrefix)
                            : text.toLowerCase().split(/\s+/)[0] === `${publicRepoPrefix}repo`;
                        if (!isStatus && commands.repo?.isPublic === true && isPublicRepoCommand) {
                            try {
                                await commands.repo(this.sock, from, msg, text.split(/\s+/).slice(1).join(' '));
                            } catch (repoError) {
                                console.error('[repo] public dispatch failed:', repoError.message);
                                try {
                                    await this.sock.sendMessage(from, {
                                        text: '❌ The repository information command could not be completed. Please try `.repo` again.'
                                    }, { quoted: msg });
                                } catch (sendError) {
                                    console.error('[repo] public error response failed:', sendError.message);
                                }
                            }
                            return;
                        }

                        // Auto-react
                        if (this.autoReact && !isMe && !isStatus) {
                            const emojis = ['❤️', '👍', '🔥', '👏', '😮', '😂', '🙌', '✨', '⭐', '✅', '🤖', '⚡', '🌟', '💯', '🌈', '💎', '👑', '🎉', '🧿', '🍀'];
                            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                            try { await this.sock.sendMessage(from, { react: { text: randomEmoji, key: msg.key } }); } catch (e) {}
                        }

                        // Auto-record — groups only (does not appear in private chats)
                        if (this.autoRecord && !isMe && !isStatus && isGroup) {
                            try { await this.sock.sendPresenceUpdate('recording', from); } catch (e) {}
                        }

                        // Auto-typing — groups only (does not appear in private chats)
                        if (this.autoTyping && !isMe && !isStatus && isGroup) {
                            try { await this.sock.sendPresenceUpdate('composing', from); } catch (e) {}
                        }

                        // AI auto-reply
                        const currentPrefix = botData.prefix || '.';
                        if (this.aiEnabled && !isMe && !isGroup && text && !text.startsWith(currentPrefix)) {
                            try {
                                const aiResponse = await this.getAIResponse(from, text);
                                await this.sock.sendMessage(from, { text: aiResponse }, { quoted: msg });
                            } catch (e) {
                                console.error("AI Auto-Reply Error:", e);
                            }
                        }

                        // Status handling
                        if (isStatus && !isMe) {
                            await handleStatusUpdate(this.sock, m, botData, this.userId);
                            return;
                        }

                        // =================== AUTHORIZATION FIX ===================
                        // THE FIX: Bot now works in ALL chats - personal, group, self
                        
                        const botNumber = jidNormalizedUser(this.sock.user.id);
                        const botNumberClean = botNumber.split('@')[0];

                        const sender = msg.key.participant || from;
                        const senderClean = sender.split('@')[0];

                        const ownerNumbers = String(settings.ownerNumber).split(',').map(n => n.replace(/\D/g, ''));
                        const isOwner = isMe || ownerNumbers.some(on => senderClean === on) || senderClean === botNumberClean;

                        const isSessionUser = senderClean === this.phoneNumber || senderClean === this.userId || senderClean === botNumberClean;

                        // PRIORITY FIX: Bot must work in DM/Private Chats
                        // isAuthorized determines if the bot should respond to commands
                        const isAuthorized = this.isPublic || isOwner || isSessionUser || isMe;

                        let isAdmin = isOwner;
                        if (!isAdmin && isGroup) {
                            try {
                                const groupMetadata = await this.sock.groupMetadata(from);
                                const participant = groupMetadata.participants.find(p => p.id === sender);
                                isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
                            } catch (e) {
                                isAdmin = false;
                            }
                        }

                        // Anti-status in groups
                        if (isGroup && botData.antiStatusGroups && botData.antiStatusGroups[from] && !isAdmin) {
                            const isStatusMsg = msg.message?.protocolMessage?.type === 0 || 
                                           msg.message?.viewOnceMessage || 
                                           msg.message?.viewOnceMessageV2 ||
                                           msg.message?.viewOnceMessageV2Extension ||
                                           (text && (text.includes('whatsapp.com/channel/') || text.includes('status@broadcast')));

                            if (msg.message?.forwardingScore > 0 || isStatusMsg) {
                                try {
                                    await this.sock.sendMessage(from, { delete: msg.key });
                                    return;
                                } catch (e) {}
                            }
                        }

                        // Antilink
                        if (isGroup && botData.antilinkGroups[from] && !isAdmin) {
                            const linkPatterns = [/chat.whatsapp.com\//i, /http:\/\//i, /https:\/\//i, /www\./i, /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i];
                            if (linkPatterns.some(pattern => pattern.test(text))) {
                                try {
                                    const mode = botData.antilinkGroups[from];
                                    await this.sock.sendMessage(from, { delete: msg.key });
                                    if (mode === 'kick') await this.sock.groupParticipantsUpdate(from, [sender], "remove");
                                } catch (e) {}
                                return;
                            }
                        }

                        // Anti-bot protection: only act on explicitly tracked bot JIDs.
                        // WhatsApp does not provide a reliable universal bot flag, so this
                        // avoids false positives and lets admins control the list per group.
                        if (isGroup && !isMe && commands.antibot.isTrackedBot(botData, from, sender)) {
                            const antiBotConfig = botData.antiBotGroups[from];
                            try {
                                await this.sock.sendMessage(from, { delete: msg.key });
                                if (antiBotConfig.mode === 'kick') {
                                    await this.sock.groupParticipantsUpdate(from, [sender], 'remove');
                                }
                            } catch (e) {
                                console.error('[AntiBot] Failed to enforce protection:', e.message);
                            }
                            return;
                        }

                        // Anti-Badword
                        if (isGroup && !isAdmin && commands.antibadword && typeof commands.antibadword.checkBadword === 'function') {
                            if (commands.antibadword.checkBadword(text, botData, from)) {
                                try {
                                    const config = botData.antiBadwordGroups[from];
                                    await this.sock.sendMessage(from, { delete: msg.key });
                                    if (config.mode === 'kick') {
                                        await this.sock.groupParticipantsUpdate(from, [sender], 'remove');
                                        await this.sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} has been kicked for using bad words!`, mentions: [sender] });
                                    } else {
                                        await this.sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, bad words are not allowed in this group!`, mentions: [sender] });
                                    }
                                } catch (e) {
                                    console.error('[AntiBadword] Failed to enforce protection:', e.message);
                                }
                                return;
                            }
                        }

                        // `.repo` is a public information command. It must remain
                        // available in groups, private chats, and while the bot is in
                        // private/ghost mode; other commands keep their normal gates.
                        const prefix = botData.prefix || '.';

                        // Ghost mode - only restrict non-owner users for other commands.
                        if (this.ghostMode && !isOwner && !isSessionUser && !isPublicRepoCommand) {
                            return;
                        }

                        // PRIORITY FIX: Ensure bot responds in DM to EVERYONE if in Public Mode
                        // If in Private Mode, only respond to Owner/Session User
                        if (!this.isPublic && !isAuthorized) {
                            // If it's a command and not authorized, don't return here yet, let it pass through
                            // but mark it so we can skip command execution later if needed
                        }

                        // Process commands
                        if (text.toLowerCase().startsWith(prefix)) {
                            const cmd = text.toLowerCase();
                            const args = text.split(' ').slice(1);
                            const q = args.join(' ');
                            const commandName = cmd.slice(prefix.length).split(' ')[0];
                            const isRepoCommand = commandName === 'repo';

                            // Private mode still protects every other command. `.repo`
                            // is intentionally public for groups and private chats.
                            if (!this.isPublic && !isAuthorized && !isRepoCommand) return;
                            (async () => {
                                try {
                                    // =================== 120+ COMMAND SWITCH ===================
                                    switch (commandName) {
                                        // ===== MENU =====
                                        case 'menu': {
                                            const customName = botData.userNames[this.userId] || msg.pushName || 'User';
                                            const menuText = generateMenuText(customName, this);
                                            try {
                                                // The MENU image (per owner's request); settings.startimage also
                                                // points to this URL and is used as the fallback below.
                                                await this.sock.sendMessage(from, { image: { url: 'https://files.catbox.moe/zm6agf.png' }, caption: menuText }, { quoted: msg });
                                                // Send the menu song automatically, preferring the local asset and
                                                // falling back to the public repository URL when necessary.
                                                const songPath = path.join(__dirname, 'song.mp3');
                                                const localSongAvailable = fs.existsSync(songPath);
                                                const audioMessage = localSongAvailable
                                                    ? { audio: fs.readFileSync(songPath), mimetype: 'audio/mpeg', fileName: 'song.mp3', ptt: false }
                                                    : { audio: { url: MENU_SONG_URL }, mimetype: 'audio/mpeg', fileName: 'song.mp3', ptt: false };

                                                try {
                                                    await this.sock.sendMessage(from, audioMessage, { quoted: msg });
                                                } catch (audioError) {
                                                    console.error('[Menu] Local song delivery failed; trying public URL:', audioError.message);
                                                    try {
                                                        await this.sock.sendMessage(from, {
                                                            audio: { url: MENU_SONG_URL },
                                                            mimetype: 'audio/mpeg',
                                                            fileName: 'song.mp3',
                                                            ptt: false
                                                        }, { quoted: msg });
                                                    } catch (remoteAudioError) {
                                                        console.error('[Menu] Public song delivery failed:', remoteAudioError.message);
                                                        await this.sock.sendMessage(from, {
                                                            text: `🎵 Menu song: ${MENU_SONG_URL}`
                                                        }, { quoted: msg });
                                                    }
                                                }
                                            } catch (e) { 
                                                await this.sock.sendMessage(from, { text: menuText }, { quoted: msg }); 
                                            }
                                            break;
                                        }
                                        case 'allmenu': 
                                            const allMenuCmd = require('./commands/allmenu');
                                            await allMenuCmd(this.sock, from, msg, this, commands); 
                                            break;
                                        case 'ownermenu': {
                                            const text = `*👑 OWNER MENU*\n\n▢ .public\n▢ .private\n▢ .block\n▢ .unblock\n▢ .restart\n▢ .shutdown\n▢ .bcall\n▢ .bcgc\n▢ .skyinfor\n▢ .decry\n▢ .setprefix\n▢ .vpn\n▢ .botmenu\n▢ .stylefont`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'groupmenu': {
                                            const text = `*👥 GROUP MENU*\n\n▢ .wdash\n▢ .kick\n▢ .add\n▢ .promote\n▢ .demote\n▢ .mute\n▢ .unmute\n▢ .tagall\n▢ .hidetag\n▢ .grouplink\n▢ .groupinfo\n▢ .welcome\n▢ .goodbye\n▢ .setwelcome\n▢ .setgoodbye\n▢ .antilink\n▢ .antibadword\n▢ .antibot\n▢ .jid`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'downloadmenu': {
                                            const text = `*\u{1F4E5} DOWNLOAD MENU*\n\n\u{25FB} .song\n\u{25FB} .video\n\u{25FB} .insta\n\u{25FB} .tiktok\n\u{25FB} .facebook\n\u{25FB} .youtube\n\u{25FB} .spotify\n\u{25FB} .apk`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'aimenu': {
                                            const text = `*\u{1F916} AI MENU*\n\n\u{25FB} .ai\n\u{25FB} .chatbot\n\u{25FB} .gali`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'bugmenu': {
                                            const text = `*🐞 BUG MENU*\n\n▢ .crash\n▢ .freeze\n▢ .bug`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'toolsmenu': {
                                            const text = `*🛠️ TOOLS MENU*\n\n▢ .ping\n▢ .dp\n▢ .vv\n▢ .translate\n▢ .base64\n▢ .qr\n▢ .shorturl\n▢ .calc\n▢ .weather\n▢ .github\n▢ .ipinfo\n▢ .tempmail\n▢ .fakeinfo\n▢ .binlookup\n▢ .whois\n▢ .dnslookup\n▢ .portscan\n▢ .screenshot\n▢ .define\n▢ .google\n▢ .wiki\n▢ .yts\n▢ .playstore\n▢ .npm\n▢ .runtime\n▢ .uptime\n▢ .serverinfo\n▢ .speedtest\n▢ .device`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'funmenu': {
                                            const text = `*🎉 FUN MENU*\n\n▢ .joke\n▢ .meme\n▢ .dare\n▢ .truth\n▢ .ascii\n▢ .roast\n▢ .compliment\n▢ .ship\n▢ .emojimix\n▢ .character\n▢ .quote\n▢ .fact\n▢ .trivia\n▢ .coinflip\n▢ .roll\n▢ .riddle\n▢ .wouldyourather\n▢ .hack\n▢ .repo\n▢ .report\n▢ .spam\n▢ .smsbomb\n▢ .callbomb`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'gamemenu': {
                                            const text = `*🎮 GAME MENU*\n\n▢ .tictactoe\n▢ .chess\n▢ .hangman\n▢ .8ball`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'animemenu': {
                                            const text = `*🎌 ANIME MENU*\n\n▢ .anime\n▢ .manga\n▢ .waifu\n▢ .neko\n▢ .shinobu\n▢ .megumin\n▢ .bully\n▢ .cuddle\n▢ .cry\n▢ .hug\n▢ .awoo\n▢ .kiss\n▢ .lick\n▢ .pat\n▢ .smug\n▢ .bonk\n▢ .yeet\n▢ .blush\n▢ .smile\n▢ .wave\n▢ .highfive\n▢ .handhold\n▢ .nom\n▢ .bite\n▢ .slap\n▢ .kill\n▢ .happy\n▢ .wink\n▢ .poke\n▢ .dance\n▢ .cringe`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'stickermenu': {
                                            const text = `*🏷️ STICKER MENU*\n\n▢ .sticker\n▢ .toimg\n▢ .tomp3\n▢ .tts`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'imagemenu': {
                                            const text = `*🖼️ IMAGE MENU*\n\n▢ .blur\n▢ .invert\n▢ .crop\n▢ .flip\n▢ .grayscale\n▢ .removebg\n▢ .enlarge\n▢ .remini\n▢ .enhance\n▢ .upscale`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'smoke': await commands.smoke(this.sock, from, msg); break;
                                        case 'sky': case 'cup': case 'coffee': case 'cloud':
                                        case 'flower': case 'leaf': case 'wood': case 'stone': case 'blood':
                                        case 'horror': case 'scary': case 'spooky': case 'christmas':
                                        case 'birthday': case 'love': case 'heart': case 'gold':
                                            await commands.textmaker(this.sock, from, msg, q, commandName);
                                            break;
                                        case 'textmakermenu': {
                                            const text = `*✏️ TEXT MAKER MENU*\n\n▢ .sky\n▢ .cup\n▢ .coffee\n▢ .cloud\n▢ .smoke\n▢ .flower\n▢ .leaf\n▢ .wood\n▢ .stone\n▢ .blood\n▢ .horror\n▢ .scary\n▢ .spooky\n▢ .christmas\n▢ .birthday\n▢ .love\n▢ .heart`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'logomenu': {
                                            const text = `*🏢 LOGO MENU*\n\n▢ .neon\n▢ .glitch\n▢ .gold\n▢ .3dtext\n▢ .fire\n▢ .water\n▢ .galaxy\n▢ .marvel\n▢ .avengers\n▢ .transformer\n▢ .blackpink\n▢ .gradient\n▢ .luxury\n▢ .royal\n▢ .metal\n▢ .steel\n▢ .chrome\n▢ .glossy`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'miscmenu': {
                                            const text = `*🎯 MISC MENU*\n\n▢ .runtime\n▢ .uptime\n▢ .serverinfo\n▢ .speedtest\n▢ .device\n▢ .report\n▢ .timer\n▢ .remind\n▢ .password\n▢ .morse\n▢ .binary\n▢ .hex\n▢ .pastebin\n▢ .news\n▢ .crypto\n▢ .movie\n▢ .lyrics\n▢ .chatbot\n▢ .snipe\n▢ .editmsg\n▢ .react\n▢ .send\n▢ .forward\n▢ .clear\n▢ .save\n▢ .backup\n▢ .restore`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }

                                        // ===== MEDIA & DOWNLOAD =====
                                        case 'song': await commands.song(this.sock, from, msg); break;
                                        case 'video': await commands.video(this.sock, from, msg); break;
                                        case 'insta': case 'ig': await commands.insta(this.sock, from, msg, q); break;
                                        case 'tiktok': case 'tt': await commands.tiktok(this.sock, from, msg, q); break;
                                        case 'facebook': case 'fb': await commands.facebook(this.sock, from, msg); break;
                                        case 'youtube': case 'yt': await commands.youtube(this.sock, from, msg, q); break;
                                        case 'pinterest': case 'pin': await commands.pinterest(this.sock, from, msg, q); break;
                                        case 'twitter': case 'x': case 'twit': await commands.twitter(this.sock, from, msg, q); break;
                                        case 'reddit': await commands.reddit(this.sock, from, msg, q); break;
                                        case 'spotify': case 'spot': await commands.spotify(this.sock, from, msg, q); break;
                                        case 'mediafire': case 'mf': await commands.mf(this.sock, from, msg, q); break;
                                        case 'gdrive': await commands.gdrive(this.sock, from, msg, q); break;
                                        case 'apk': await commands.apk(this.sock, from, msg); break;
                                        case 'gitclone': await commands.gitclone(this.sock, from, msg, q); break;

                                        // ===== GROUP MANAGEMENT =====
                                        case 'kick': await commands.kick(this.sock, from, msg, isAdmin); break;
                                        case 'add': await commands.add(this.sock, from, msg, isAdmin, q); break;
                                        case 'promote': await commands.promote(this.sock, from, msg, isAdmin); break;
                                        case 'demote': await commands.demote(this.sock, from, msg, isAdmin); break;
                                        case 'revoke': await commands.revoke(this.sock, from, msg, isAdmin); break;
                                        case 'invite': await commands.invite(this.sock, from, msg, isAdmin); break;
                                        case 'grouplink': case 'gclink': await commands.grouplink(this.sock, from, msg, isAdmin); break;
                                        case 'mute': await commands.mute(this.sock, from, msg, isAdmin); break;
                                        case 'unmute': await commands.unmute(this.sock, from, msg, isAdmin); break;
                                        case 'join': await commands.join(this.sock, from, msg, q); break;
                                        case 'leave': await commands.leave(this.sock, from, msg, isAdmin); break;
                                        case 'setdesc': await commands.setdesc(this.sock, from, msg, isAdmin, q); break;
                                        case 'setppgc': await commands.setppgc(this.sock, from, msg, isAdmin); break;
                                        case 'getbio': await commands.getbio(this.sock, from, msg, q); break;
                                        case 'getdp': await commands.getdp(this.sock, from, msg, q); break;
                                        case 'tagadmin': await commands.tagadmin(this.sock, from, msg, isAdmin); break;
                                        case 'kickoffline': await commands.kickoffline(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'hidetag': await commands.hidetag(this.sock, from, msg, isAdmin, q); break;
                                        case 'tagall': await commands.tagall(this.sock, from, msg, isAdmin, q); break;
                                        case 'groupinfo': case 'ginfo': await commands.groupinfo(this.sock, from, msg); break;
                                        case 'accept': await commands.accept(this.sock, from, msg, isAdmin); break;
                                        case 'welcome':
                                        case 'goodbye':
                                        case 'setwelcome':
                                        case 'setgoodbye':
                                            await commands.wg.router(this.sock, from, msg, isAdmin, botData, saveBotData, args, commandName);
                                            break;
                                        case 'poll': await commands.poll(this.sock, from, msg, q); break;
                                        case 'everyonemsg': await commands.everyonemsg(this.sock, from, msg, isAdmin, q); break;
                                        case 'listonline': await commands.listonline(this.sock, from, msg); break;
                                        case 'wdash': await commands.wdash(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'jid': await commands.jid(this.sock, from, msg); break;

                                        // ===== ADMIN / OWNER =====
                                        case 'private': 
                                            await commands.private(this.sock, from, msg, isAdmin, this); 
                                            if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                            botData.statusSettings[this.userId].isPublic = false;
                                            saveBotData();
                                            break;
                                        case 'public': 
                                            await commands.public(this.sock, from, msg, isAdmin, this); 
                                            if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                            botData.statusSettings[this.userId].isPublic = true;
                                            saveBotData();
                                            break;
                                        case 'owner': await commands.owner(this.sock, from, msg); break;
                                        case 'skyinfor': await commands.skyinfor(this.sock, from, msg, isOwner); break;
                                        case 'whatsapp':
                                        case 'support':
                                        case 'whelp':
                                            await commands.whatsapp(this.sock, from, msg);
                                            break;
                                        case 'pair':
                                        case 'pairing':
                                            await commands.pair(this.sock, from, msg, q);
                                            break;
                                        case 'football':
                                        case 'soccer':
                                        case 'scores':
                                        case 'fixtures':
                                            await commands.football(this.sock, from, msg, q);
                                            break;
                                        case 'setname': await commands.setname(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, q); break;
                                        case 'botmenu': await commands.botmenu(this.sock, from, msg, isOwner); break;
                                        case 'stylefont':
                                        case 'stylefonts':
                                        case 'stylefront':
                                            await commands.stylefont(this.sock, from, msg, q); break;
                                        case 'setbotname': await commands.setbotname(this.sock, from, msg, isOwner, q); break;
                                        case 'setbio': await commands.setbio(this.sock, from, msg, isOwner, q); break;
                                        case 'autobio': await commands.autobio(this.sock, from, msg, isOwner, args); break;
                                        case 'setppbot': await commands.setppbot(this.sock, from, msg, isOwner); break;
                                        case 'autopost': await commands.autopost(this.sock, from, msg, isOwner, args, q); break;
                                        case 'blocklist': await commands.blocklist(this.sock, from, msg, isOwner, args); break;
                                        case 'botinfo': await commands.botinfo(this.sock, from, msg); break;
                                        case 'block': await commands.block(this.sock, from, msg, isOwner, q); break;
                                        case 'unblock': await commands.unblock(this.sock, from, msg, isOwner, q); break;
                                        case 'bcgc': await commands.bcgc(this.sock, from, msg, isOwner, q); break;
                                        case 'bcall': await commands.bcall(this.sock, from, msg, isOwner, q); break;
                                        case 'restart': await commands.restart(this.sock, from, msg, isOwner); break;
                                        case 'shutdown': await commands.shutdown(this.sock, from, msg, isOwner); break;
                                        case 'mode': await commands.mode(this.sock, from, msg, isOwner, this); break;
                                        case 'deleteall': await commands.deleteall(this.sock, from, msg, isOwner, q); break;
                                        case 'clone': await commands.clone(this.sock, from, msg, isOwner, q); break;
                                        case 'self': await commands.self(this.sock, from, msg, isOwner, this, botData, saveBotData); break;
                                        case 'delsudo': await commands.delsudo(this.sock, from, msg, isOwner, q); break;
                                        case 'goid': await commands.goId(this.sock, from, msg); break;
                                        case 'decry': await commands.decry(this.sock, from, msg, q); break;

                                        // ===== PROTECTION =====
                                        case 'antilink': await commands.antilink(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antiviewonce': await commands.antiviewonce(this.sock, from, msg, isAdmin, botData, saveBotData, this, args); break;
                                        case 'anticall': await commands.anticall(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'antidelete': await commands.antidelete(this.sock, from, msg, isOwner, botData, saveBotData, this.userId, args); break;
                                        case 'antistatus': await commands.antistatus(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antifake': await commands.antifake(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antibug': await commands.antibug(this.sock, from, msg, isOwner, botData, saveBotData, args); break;
                                        case 'antibot': await commands.antibot(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antibadword': case 'antibad': await commands.antibadword(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;

                                        // ===== STATUS / AUTO =====
                                        case 'status': 
                                        case 'autostatus': await commands.autostatus(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'autolike': await commands.autolike(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'autoseen': await commands.autoseen(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'autoreacts': 
                                        case 'autoreact': await commands.autoreact(this.sock, from, msg, isAdmin, botData, saveBotData, this, args); break;
                                        case 'autorecord': await commands.autorecord(this.sock, from, msg, isAdmin, botData, saveBotData, this, args); break;
                                        case 'autotyping': await commands.autotyping(this.sock, from, msg, isAdmin, botData, saveBotData, this, args); break;
                                        case 'autoread': await commands.autoread(this.sock, from, msg); break;

                                        // ===== AI =====
                                        case 'ai': await commands.ai(this.sock, from, msg, isAdmin, this, args); break;
                                        case 'chatbot': await commands.chatbot(this.sock, from, msg, this, args); break;
                                        case 'gali': await commands.gali(this.sock, from, msg, this, args); break;

                                        // ===== FUN =====
                                        case 'joke': await commands.joke(this.sock, from, msg); break;
                                        case 'meme': await commands.meme(this.sock, from, msg); break;
                                        case 'dare': await commands.dare(this.sock, from, msg); break;
                                        case 'truth': await commands.truth(this.sock, from, msg); break;
                                        case 'ascii': await commands.ascii(this.sock, from, msg, q); break;
                                        case 'roast': await commands.roast(this.sock, from, msg); break;
                                        case 'compliment': await commands.compliment(this.sock, from, msg); break;
                                        case 'ship': await commands.ship(this.sock, from, msg); break;
                                        case 'emojimix': await commands.emojimix(this.sock, from, msg); break;
                                        case 'character': await commands.character(this.sock, from, msg); break;
                                        case 'quote': await commands.quote(this.sock, from, msg); break;
                                        case 'fact': await commands.fact(this.sock, from, msg); break;
                                        case 'trivia': await commands.trivia(this.sock, from, msg); break;
                                        case 'coinflip': case 'cf': await commands.coinflip(this.sock, from, msg); break;
                                        case 'roll': await commands.roll(this.sock, from, msg, q); break;
                                        case 'riddle': await commands.riddle(this.sock, from, msg); break;
                                        case 'wyr': case 'wouldyourather': await commands.wouldyourather(this.sock, from, msg); break;

                                        // ===== TOOLS =====
                                        case 'dp': await commands.dp(this.sock, from, msg); break;
                                        case 'vv': await commands.vv(this.sock, from, msg); break;
                                        case 'translate': case 'trt': await commands.translate(this.sock, from, msg, q); break;
                                        case 'base64': await commands.base64(this.sock, from, msg, q); break;
                                        case 'qr': await commands.qr(this.sock, from, msg, q); break;
                                        case 'shorturl': case 'tinyurl': await commands.utils.short(this.sock, from, msg, q); break;
                                        case 'calc': case 'math': await commands.utils.calc(this.sock, from, msg, q); break;
                                        case 'weather': await commands.utils.weather(this.sock, from, msg, q); break;
                                        case 'github': case 'gh': await commands.utils.github(this.sock, from, msg, q); break;
                                        case 'ipinfo': await commands.utils.ip(this.sock, from, msg, q); break;
                                        case 'tempmail': await commands.tempmail(this.sock, from, msg); break;
                                        case 'fakeinfo': await commands.fakeinfo(this.sock, from, msg); break;
                                        case 'binlookup': await commands.binlookup(this.sock, from, msg, q); break;
                                        case 'whois': await commands.whois(this.sock, from, msg, q); break;
                                        case 'dnslookup': case 'dns': await commands.dnslookup(this.sock, from, msg, q); break;
                                        case 'portscan': case 'scan': await commands.portscan(this.sock, from, msg, q); break;
                                        case 'screenshot': case 'ss': await commands.screenshot(this.sock, from, msg, q); break;
                                        case 'define': case 'dictionary': await commands.utils.dict(this.sock, from, msg, q); break;
                                        case 'google': case 'gsearch': await commands.google(this.sock, from, msg, q); break;
                                        case 'wiki': case 'wikipedia': await commands.utils.wiki(this.sock, from, msg, q); break;
                                        case 'yts': case 'ytsearch': await commands.yts(this.sock, from, msg, q); break;
                                        case 'playstore': case 'ps': await commands.playstore(this.sock, from, msg, q); break;
                                        case 'npm': await commands.npm(this.sock, from, msg, q); break;
                                        case 'sticker': case 's': await commands.sticker(this.sock, from, msg); break;
                                        case 'toimg': case 'img': await commands.toimg(this.sock, from, msg); break;
                                        case 'tomp3': case 'mp3': await commands.tomp3(this.sock, from, msg); break;
                                        case 'tts': await commands.tts(this.sock, from, msg, q); break;
                                        case 'blur': await commands.blur(this.sock, from, msg); break;
                                        case 'invert': await commands.invert(this.sock, from, msg); break;
                                        case 'crop': await commands.crop(this.sock, from, msg); break;
                                        case 'flip': await commands.flip(this.sock, from, msg); break;
                                        case 'grayscale': case 'grey': await commands.grayscale(this.sock, from, msg); break;
                                        case 'removebg': case 'nobg': await commands.removebg(this.sock, from, msg); break;
                                        case 'enlarge': case 'upscale': await commands.enlarge(this.sock, from, msg); break;

                                        case 'repo': await commands.repo(this.sock, from, msg, q); break;
                                        // ===== DANGEROUS / KHATARNAK (LIMITED TO 3 SPAM) =====
                                        case 'hack': await commands.hack(this.sock, from, msg, q); break;
                                        case 'report': await commands.report(this.sock, from, msg, isOwner, q); break;
                                        case 'spam': await commands.spam(this.sock, from, msg, q); break;
                                        case 'smsbomb': case 'sms': await commands.smsbomb(this.sock, from, msg, q); break;
                                        case 'callbomb': case 'cbomb': await commands.callbomb(this.sock, from, msg, q); break;
                                        case 'crash': await commands.crash(this.sock, from, msg, isOwner, q); break;
                                        case 'freeze': await commands.freeze(this.sock, from, msg, isOwner, q); break;
                                        case 'bug': case 'bugs': await commands.bug(this.sock, from, msg, isOwner, q); break;
                                        case 'xrestart': await commands.xrestart(this.sock, from, msg, isOwner); break;
                                        case 'xshutdown': await commands.xshutdown(this.sock, from, msg, isOwner); break;
                                        case 'ghostmode': case 'ghost': await commands.ghostmode(this.sock, from, msg, isOwner, this, args); break;
                                        case 'nuke': await commands.nuke(this.sock, from, msg, isOwner); break;

                                        // ===== CHRISTIAN MENU =====
                                        case 'christianmenu':
                                        case 'cmenu':
                                        case 'bible':
                                        case 'verse':
                                        case 'psalm':
                                        case 'cprayer':
                                        case 'gospel':
                                            await commands.christianmenu(this.sock, from, msg, args, commandName);
                                            break;

                                        // ===== ISLAMIC =====
                                        case 'quran': await commands.quran(this.sock, from, msg, q); break;
                                        case 'hadith': await commands.hadith(this.sock, from, msg, q); break;
                                        case 'prayer': case 'salah': await commands.prayer(this.sock, from, msg, q); break;
                                        case 'qibla': await commands.qibla(this.sock, from, msg, q); break;
                                        case 'asmaulhusna': case 'asma': await commands.asmaulhusna(this.sock, from, msg, q); break;

                                        // ===== SYSTEM INFO =====
                                        case 'uptime': await commands.uptime(this.sock, from, msg); break;
                                        case 'serverinfo': case 'si': await commands.serverinfo(this.sock, from, msg); break;
                                        case 'speedtest': case 'speed': await commands.speedtest(this.sock, from, msg); break;
                                        case 'device': case 'dev': await commands.device(this.sock, from, msg); break;
                                        case 'runtime': case 'rt': await commands.runtime(this.sock, from, msg); break;
                                        case 'ping': await commands.ping(this.sock, from, msg); break;

                                        // ===== UTILITIES =====
                                        case 'timer': await commands.timer(this.sock, from, msg, q); break;
                                        case 'password': case 'pass': await commands.password(this.sock, from, msg, q); break;
                                        case 'morse': await commands.morse(this.sock, from, msg, q); break;
                                        case 'binary': case 'bin': await commands.binary(this.sock, from, msg, q); break;
                                        case 'hex': await commands.hex(this.sock, from, msg, q); break;
                                        case 'pastebin': case 'paste': await commands.pastebin(this.sock, from, msg, q); break;
                                        case 'news': await commands.news(this.sock, from, msg, q); break;
                                        case 'crypto': case 'coin': await commands.crypto(this.sock, from, msg, q); break;
                                        case 'movie': case 'imdb': await commands.movie(this.sock, from, msg, q); break;
                                        case 'anime': await commands.anime(this.sock, from, msg, q); break;
                                        case 'manga': await commands.manga(this.sock, from, msg, q); break;
                                        case 'kill': await commands.kill(this.sock, from, msg); break;
                                        case 'lyrics': await commands.lyrics(this.sock, from, msg, q); break;
                                        case 'remind': case 'reminder': await commands.remind(this.sock, from, msg, q); break;
                                        case 'tagme': await commands.tagme(this.sock, from, msg); break;
                                        case 'mention': await commands.mention(this.sock, from, msg, q); break;
                                        case 'snipe': await commands.snipe(this.sock, from, msg); break;
                                        case 'editmsg': await commands.editmsg(this.sock, from, msg, q); break;
                                        case 'react': await commands.react(this.sock, from, msg, q); break;
                                        case 'send': await commands.send(this.sock, from, msg, isOwner, q); break;
                                        case 'forward': case 'fwd': await commands.forward(this.sock, from, msg, isOwner, q); break;
                                        case 'clear': await commands.clear(this.sock, from, msg); break;
                                        case 'save': await commands.save(this.sock, from, msg); break;
                                        case 'backup': await commands.backup(this.sock, from, msg, isOwner); break;
                                        case 'restore': await commands.restore(this.sock, from, msg, isOwner); break;
                                        case 'mycmd': case 'mycommands': await commands.mycmd(this.sock, from, msg); break;
                                        default:
                                            // Dynamic command handling for any command in the commands object
                                            if (commands[commandName]) {
                                                if (typeof commands[commandName] === 'function') {
                                                    await commands[commandName](this.sock, from, msg, q, { isAdmin, isOwner, args, session: this, botData, saveBotData });
                                                } else if (commands[commandName].router) {
                                                    await commands[commandName].router(this.sock, from, msg, isAdmin, botData, saveBotData, args, commandName);
                                                }
                                            }
                                            break;
                                    }
                                } catch (e) {
                                    this.sendLog(`Command error (${commandName}): ` + e.message, 'error');
                                    await this.sock.sendMessage(from, { text: `❌ Error in .${commandName}: ${e.message}` }, { quoted: msg });
                                }
                            })();
                        }
                    } catch (e) {
                        console.error('Message Processing Error:', e);
                    }
                }));
            });

            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    const socketId = userSockets[this.userId];
                    if (socketId) io.to(socketId).emit('qr', qr);
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                    this.isConnected = false;
                    this.isInitializing = false;
                    this.sendLog(`Connection closed. Reconnecting: ${shouldReconnect}`, 'warning');
                    this.sendConnectionStatus();
                    const statusCode = (lastDisconnect.error)?.output?.statusCode;

                    if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                        this.sendLog('Session expired or logged out. Clearing auth data...', 'error');
                        try {
                            if (fs.existsSync(this.authPath)) {
                                const backupPath = `${this.authPath}_backup_${Date.now()}`;
                                fs.moveSync(this.authPath, backupPath);
                                this.sendLog(`Corrupted session backed up to ${backupPath}`, 'info');
                            }
                        } catch (e) {
                            if (fs.existsSync(this.authPath)) fs.removeSync(this.authPath);
                        }
                        delete sessions[this.userId];
                        this.sendConnectionStatus();
                    } else if (statusCode === DisconnectReason.restartRequired || statusCode === DisconnectReason.connectionLost || statusCode === 428) {
                        this.sendLog(`Connection issue (${statusCode}). Restarting in 3s...`, 'warning');
                        setTimeout(() => this.initialize(), 3000);
                    } else if (statusCode === 515) {
                        this.sendLog('Stream error. Reconnecting immediately...', 'warning');
                        this.initialize();
                    } else {
                        this.sendLog(`Connection closed (${statusCode}). Reconnecting in 5s...`, 'info');
                        setTimeout(() => this.initialize(), 5000);
                    }
                } else if (connection === 'open') {
                    this.isConnected = true;
                    this.isInitializing = false;
                    this.sendLog('Connected successfully! \u{2705}', 'success');
                    this.sendConnectionStatus();
                    this.startActiveCheck();

                    const botNumber = jidNormalizedUser(this.sock.user.id);
                    const botNumberClean = botNumber.split('@')[0];
                    this.phoneNumber = botNumberClean;

                    if (!settings.connectedBots.includes(botNumberClean)) {
                        settings.connectedBots.push(botNumberClean);
                    }

                    const botName = botData.userNames[this.userId] || (this.sock.user && this.sock.user.name) || this.userId;

                    if (this.tgChatId && tgBot) {
                        const successMsg = 
                            `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *SKYNETIX MINI* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
                            `*\u{2705} CONNECTION SUCCESSFUL!* \n\n` +
                            `Your WhatsApp number has been successfully linked.\n` +
                            `You can now use all commands in your WhatsApp.\n\n` +
                            `> © POWERED BY SKYNETIX MINI BOT v3.0`;
                        await tgBot.sendMessage(this.tgChatId, successMsg, { parse_mode: 'Markdown' });
                    }

                    this.sendLog(`Bot ${botName} is online.`, 'success');

                    setTimeout(async () => {
                        try {
                            await this.sock.query({
                                tag: 'iq',
                                attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' },
                                content: [{ tag: 'status', attrs: {}, content: Buffer.from("SKYNETIX MINI BOT v3.0 - 120+ Commands | Powered by SKYNETIX", 'utf-8') }]
                            });
                            this.sendLog("Bio updated successfully! \u{2705}", "success");
                        } catch (e) {
                            this.sendLog("Bio update failed: " + e.message, "error");
                        }
                    }, 5000);

                    if (!this.lastConnectMessageTime || (Date.now() - this.lastConnectMessageTime > 60 * 60 * 1000)) {
                        const welcomeText = `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *SKYNETIX MINI BOT* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
                            `*\u{1F311} CONNECTED SUCCESSFULLY* \u{2705}\n\n` +
                            `Your WhatsApp has been linked to the most powerful automation system.\n\n` +
                            `*\u{1F4F1} BOT INFORMATION:*\n` +
                            `\u{2022} *User:* ${botName}\n` +
                            `\u{2022} *Status:* 24/7 Active\n` +
                            `\u{2022} *Commands:* 150+ Advanced Tools\n\n` +
                            `*\u{1F3B5} CURRENT SONG:*\n` +
                            `> [SONG_PLACEHOLDER]\n\n` +
                            `Type *.menu* to explore all features.\n\n` +
                            `> © POWERED BY SKYNETIX MINI BOT v3.0`;

                        await this.sock.sendMessage(botNumber, { 
                            image: { url: settings.startimage },
                            caption: welcomeText 
                        });

                        // Start the auto-bio timer if autobio was left enabled
                        try {
                            commands.autobio.start(this.sock);
                        } catch {}
                        try {
                            const channelLink = settings.whatsappChannel;
                            if (channelLink) {
                                const channelKey = channelLink.split('/channel/')[1];
                                if (channelKey) {
                                    const metadata = await this.sock.newsletterMetadata('invite', channelKey, 'GUEST');
                                    if (metadata && metadata.id) {
                                        await this.sock.newsletterFollow(metadata.id);
                                        console.log(`\u{2705} Auto-followed channel: ${metadata.id}`);
                                    }
                                }
                            }
                        } catch (channelErr) {
                            console.log('Channel follow error:', channelErr.message);
                        }
                        this.lastConnectMessageTime = Date.now();
                    }
                }
            });

        } catch (err) {
            this.isInitializing = false;
            this.sendLog(`Initialization failed: ${err.message}. Retrying in 10s...`, 'error');
            setTimeout(() => this.initialize(), 10000);
        }
    }
}


// =================== MENU GENERATOR ===================
function generateMenuText(userName, session) {
    const s = botData.statusSettings[session.userId] || {};
    const mode = session.isPublic ? 'Public' : 'Private';
    
    return `┏━━━━━━━━━━━━━━━━━
┃ 💀  𝙎𝙆𝙔𝙉𝙀𝙏𝙄𝙓 𝙈𝙄𝙉𝙄 𝘽𝙊𝙏  💀     
┣━━━━━━━━━━━━━━━━━
┃  🤖 𝘽𝙊𝙏 𝙉𝘼𝙈𝙀  : 𝙎𝙆𝙔𝙉𝙀𝙏𝙄𝙓 𝙈𝙄𝙉𝙄   
┃  👤 𝙊𝙒𝙉𝙀𝙍     : ${settings.ownerName || '𝙎𝙆𝙔𝙉𝙀𝙏𝙄𝙓'}
┃  📦 𝙑𝙀𝙍𝙎𝙄𝙊𝙉   : ${settings.version}
┃  ⚙️ 𝙈𝙊𝘿𝙀      : ${mode}
┃  🔑 𝙋𝙍𝙀𝙁𝙄𝙓    : ${botData.prefix || settings.prefix}
┃  👥 𝙐𝙎𝙀𝙍      : ${userName}
┣━━━━━━━━━━━━━━━━━
┃ 📋 𝘾𝘼𝙏𝙀𝙂𝙊𝙍𝙄𝙀𝙎  
┃ 💱 *(300+ 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨)*     
┣━━━━━━━━━━━━━━━━━
┃🧾】.𝙖𝙡𝙡𝙢𝙚𝙣𝙪     
┃👑】.𝙤𝙬𝙣𝙚𝙧𝙢𝙚𝙣𝙪              
┃👥】.𝙜𝙧𝙤𝙪𝙥𝙢𝙚𝙣𝙪            
┃🤖】.𝙖𝙞𝙢𝙚𝙣𝙪                   
┃⬇️】.𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙢𝙚𝙣𝙪     
┃🛠️】.𝙩𝙤𝙤𝙡𝙨𝙢𝙚𝙣𝙪          
┃🎉】.𝙛𝙪𝙣𝙢𝙚𝙣𝙪         
┃🎮】.𝙜𝙖𝙢𝙚𝙢𝙚𝙣𝙪          
┃🎌】.𝙖𝙣𝙞𝙢𝙚𝙢𝙚𝙣𝙪                 
┃🏷️】.𝙨𝙩𝙞𝙘𝙠𝙚𝙧𝙢𝙚𝙣𝙪            
┃🖼️】.𝙞𝙢𝙖𝙜𝙚𝙢𝙚𝙣𝙪               
┃✏️】.𝙩𝙚𝙭𝙩𝙢𝙖𝙠𝙚𝙧𝙢𝙚𝙣𝙪      
┃🏢】.𝙡𝙤𝙜𝙤𝙢𝙚𝙣𝙪        
┃🕌】.𝙞𝙨𝙡𝙖𝙢𝙞𝙘𝙢𝙚𝙣𝙪         
┃🎯】.𝙢𝙞𝙨𝙘𝙢𝙚𝙣𝙪     
┗━━━━━━━━━━━━━━━━┛
☠️  𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 : 𝙎𝙆𝙔𝙉𝙀𝙏𝙄𝙓  ☠️`;
}


// =================== SOCKET.IO ===================
io.on('connection', (socket) => {
    // Admin auth
    socket.on('admin-auth', (password) => {
        const adminPass = process.env.ADMIN_PASSWORD || 'skynetix_techteaM';
        if (password === adminPass) {
            socket.authenticated = true;
            socket.emit('admin-auth-success');
        } else {
            socket.emit('admin-auth-fail');
        }
    });

    socket.on('set-user', (userId) => {
        userSockets[userId] = socket.id;
        if (!sessions[userId]) sessions[userId] = new BotSession(userId);
        sessions[userId].sendConnectionStatus();
    });

    // Pair request - still available via web for web users
    socket.on('pair-request', async ({ userId, number }) => {
        if (sessions[userId]) {
            if (!botData.statusSettings[userId]) {
                botData.statusSettings[userId] = { 
                    autoStatus: false,
                    autoSeen: false,
                    autoLike: false,
                    autoDownload: false,
                    isPublic: true
                };
                saveBotData();
            }
            sessions[userId].tgChatId = null;
            await sessions[userId].initialize(number);
        } else {
            sessions[userId] = new BotSession(userId);
            if (!botData.statusSettings[userId]) {
                botData.statusSettings[userId] = { 
                    autoStatus: false,
                    autoSeen: false,
                    autoLike: false,
                    autoDownload: false,
                    isPublic: true
                };
                saveBotData();
            }
            sessions[userId].tgChatId = null;
            await sessions[userId].initialize(number);
        }
    });

    // BROADCAST MESSAGE - Send to all connected users
    socket.on('broadcast', async ({ message }) => {
        if (!socket.authenticated) return;
        
        const activeBots = getAllActiveSockets();
        let totalSent = 0;
        let totalChats = 0;

        for (const bot of activeBots) {
            try {
                // Get all chats for this bot
                const allChats = Object.keys(bot.sock.chats || {});
                const personalChats = allChats.filter(jid => jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us'));
                
                for (const jid of personalChats) {
                    try {
                        await bot.sock.sendMessage(jid, { 
                            text: `\u{1F4E2} *BROADCAST MESSAGE* \u{1F4E2}\n\n${message}\n\n_From: SKYNETIX MINI BOT Admin_` 
                        });
                        totalSent++;
                    } catch (e) {}
                }
                totalChats += personalChats.length;
            } catch (e) {
                console.error('Broadcast error:', e.message);
            }
        }

        // Save to history
        botData.broadcastHistory.unshift({
            message,
            timestamp: new Date().toISOString(),
            totalSent,
            totalBots: activeBots.length
        });
        if (botData.broadcastHistory.length > 50) botData.broadcastHistory.pop();
        saveBotData();

        socket.emit('broadcast-result', { totalSent, totalBots: activeBots.length, totalChats });
    });

    // STOP BOT - Disconnect a specific bot
    socket.on('stop-bot', async ({ sessionId }) => {
        if (!socket.authenticated) return;
        
        if (sessions[sessionId] && sessions[sessionId].sock) {
            try {
                await sessions[sessionId].sock.logout();
                sessions[sessionId].isConnected = false;
                delete sessions[sessionId];
                socket.emit('bot-stopped', { sessionId, success: true });
            } catch (e) {
                socket.emit('bot-stopped', { sessionId, success: false, error: e.message });
            }
        }
    });

    // STOP ALL BOTS
    socket.on('stop-all-bots', async () => {
        if (!socket.authenticated) return;
        
        let stopped = 0;
        for (const [sessionId, session] of Object.entries(sessions)) {
            try {
                if (session.sock) {
                    await session.sock.logout();
                    session.isConnected = false;
                    stopped++;
                }
            } catch (e) {}
        }
        socket.emit('all-bots-stopped', { stopped });
    });

    // GET CONNECTED BOTS LIST
    socket.on('get-bots-list', () => {
        if (!socket.authenticated) return;
        
        const bots = [];
        for (const [sessionId, session] of Object.entries(sessions)) {
            if (session.sock && session.sock.user) {
                bots.push({
                    sessionId,
                    phoneNumber: session.phoneNumber,
                    isConnected: session.isConnected,
                    userName: botData.userNames[sessionId] || 'Unknown'
                });
            }
        }
        socket.emit('bots-list', bots);
    });

    // GET BROADCAST HISTORY
    socket.on('get-broadcast-history', () => {
        if (!socket.authenticated) return;
        socket.emit('broadcast-history', botData.broadcastHistory || []);
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of Object.entries(userSockets)) {
            if (socketId === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`\u{1F311} SKYNETIX MINI BOT v${settings.version} Server running on port ${PORT}`);
    console.log(`\u{1F4E1} Total commands loaded: 120+`);
    console.log(`\u{1F310} Web Dashboard: http://localhost:${PORT}`);
    await loadExistingSessions();
    dailyBibleVerse.startDailyBibleVerseScheduler({
        getActiveSockets: getAllActiveSockets,
        botData,
        saveBotData
    });
    console.log(`[Bible Verse] Daily newsletter broadcast scheduled for ${process.env.BIBLE_VERSE_BROADCAST_TIME || '08:00'} (${process.env.BIBLE_VERSE_TIMEZONE || 'UTC'})`);
});
