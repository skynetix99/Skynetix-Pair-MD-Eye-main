// =====================================================================
//  SKYNETIX WELCOME & GOODBYE SYSTEM (v5 — FULLY FIXED)
//
//  Fixed Issues:
//  1. ✅ Proper initialization on bot startup
//  2. ✅ Correct event listener attachment with duplicate prevention
//  3. ✅ State persistence between restarts
//  4. ✅ Admin permission checks
//  5. ✅ Both welcome and goodbye work simultaneously
//  6. ✅ Proper group metadata caching
//  7. ✅ Non-blocking profile picture fetch
//  8. ✅ Automatic detection of joins/leaves
//  9. ✅ No duplicate messages
//  10. ✅ Proper error handling with fallbacks
// =====================================================================

const path = require('path');
const { jidNormalizedUser } = require('@whiskeysockets/baileys');

const DEFAULT_WELCOME = "👋 Welcome Thank you for joining our group! Please take a moment to read the group rules in the. *description*.  We also encourage you to share our group link with your friends. ⚠️*Important*: Do not buy anything from anyone who is not an admin, as you may be scammed  *Owner*: _𝘴𝘬𝘺𝘯𝘦𝘵𝘪𝘹!\nWe now have @count members. 🎉";
const DEFAULT_GOODBYE = "👋 Goodbye *You’ve left the group*. 😔Thank you for being part of the community.✨ We wish you all the best!🚀 Keep moving forward, stay safe, and take care. 🤖 Powered by:  SKYNETIX MINI BOT━━━━, we will miss you!\nGroup members: @count";

// Local default avatar
const DEFAULT_AVATAR = path.join(__dirname, '..', 'assets', 'default-avatar.png');

// ──────────────────────────── State ─────────────────────────────────
function ensureState(botData) {
    if (!botData.wg) botData.wg = {};
    if (!botData.wg.enabledWelcome) botData.wg.enabledWelcome = {};
    if (!botData.wg.enabledGoodbye) botData.wg.enabledGoodbye = {};
    if (!botData.wg.welcomeTemplate) botData.wg.welcomeTemplate = {};
    if (!botData.wg.goodbyeTemplate) botData.wg.goodbyeTemplate = {};
    if (!botData.wg.lastMessages) botData.wg.lastMessages = {}; // Track last sent messages to prevent duplicates
    return botData.wg;
}

// ──────────────────────── Template rendering ─────────────────────────
function renderTemplate(template, meta, num, count) {
    const tag = String(num).split('@')[0];
    return String(template || '')
        .replace(/@user/g, `@${tag}`)
        .replace(/@usertag/g, `@${tag}`)
        .replace(/@group/g, meta?.subject || 'the group')
        .replace(/@desc/g, meta?.desc || '')
        .replace(/@count/g, String(count != null ? count : ''))
        .replace(/@time/g, new Date().toLocaleTimeString())
        .replace(/@date/g, new Date().toLocaleDateString());
}

// ────────────────────── Helpers (socket-bound) ───────────────────────
function metaCache(sock) {
    if (!sock.__wgMetaCache) sock.__wgMetaCache = {};
    return sock.__wgMetaCache;
}

async function fetchMeta(sock, groupId, ttl = 15 * 60 * 1000) {
    const cache = metaCache(sock);
    const entry = cache[groupId];
    if (entry && Date.now() - entry.at < ttl) return entry;

    try {
        const metadata = await sock.groupMetadata(groupId);
        const fresh = {
            subject: metadata.subject || 'the group',
            desc: metadata.desc || '',
            count: Number(metadata.participants?.length) || 0,
            at: Date.now()
        };
        cache[groupId] = fresh;
        return fresh;
    } catch (e) {
        const fallback = entry || { subject: 'the group', desc: '', count: null, at: Date.now() };
        console.error(`[WelcomeGoodbye] metadata fetch failed for ${groupId}: ${e.message}`);
        return fallback;
    }
}

// Optimized Profile Picture Fetcher with Cache
async function fetchPP(sock, jid) {
    if (!sock.__wgPPCache) sock.__wgPPCache = {};
    const cache = sock.__wgPPCache;

    // Return from cache if less than 30 minutes old
    if (cache[jid] && Date.now() - cache[jid].at < 30 * 60 * 1000) return cache[jid].url;

    // Handle concurrent requests for same JID
    if (!sock.__wgPPPending) sock.__wgPPPending = {};
    if (sock.__wgPPPending[jid]) return sock.__wgPPPending[jid];

    const promise = (async () => {
        try {
            const url = await sock.profilePictureUrl(jid, 'image');
            cache[jid] = { url, at: Date.now() };
            return url;
        } catch {
            return DEFAULT_AVATAR;
        }
    })().finally(() => { delete sock.__wgPPPending[jid]; });

    sock.__wgPPPending[jid] = promise;
    return promise;
}

// Timeout helper
function withTimeout(promise, ms, fallback, safeFallback) {
    return Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve(safeFallback !== undefined ? safeFallback : fallback), ms))
    ]);
}

// Newsletter forwarding context
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

function withNewsletter(payload) {
    try {
        return { ...payload, contextInfo: newsletterContextInfo() };
    } catch {
        return payload;
    }
}

async function sendWithRetry(sock, groupId, payload, options, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            await sock.sendMessage(groupId, payload, options);
            return true;
        } catch (e) {
            const isRateLimit = /429|rate|busy/i.test(String(e.message)) || e?.statusCode === 429;
            if (!isRateLimit && attempt > 0) break;
            await new Promise(r => setTimeout(r, isRateLimit ? 1000 : 300));
        }
    }
    // Final fallback to plain text
    try {
        await sock.sendMessage(groupId, { text: payload.caption || payload.text || 'Welcome!' });
        return true;
    } catch { return false; }
}

function enqueue(sock, groupId, fn) {
    if (!sock.__wgQueues) sock.__wgQueues = {};
    sock.__wgQueues[groupId] = (sock.__wgQueues[groupId] || Promise.resolve())
        .then(() => fn())
        .catch(err => console.error(`[WelcomeGoodbye] queue error: ${err.message}`));
}

// ──────────────────── Core join/leave processing ─────────────────────
async function handleParticipant(sock, groupId, num, action, botData) {
    try {
        const state = ensureState(botData);
        if (!sock.user?.id) return;

        const botJid = jidNormalizedUser(sock.user.id);
        if (num === botJid) return;

        const isWelcome = action === 'add';
        const enabled = isWelcome ? state.enabledWelcome[groupId] : state.enabledGoodbye[groupId];
        if (!enabled) return;

        // Prevent duplicate messages for the same event
        const messageKey = `${groupId}_${num}_${action}`;
        if (state.lastMessages[messageKey]) {
            console.log(`[WelcomeGoodbye] Duplicate event detected, skipping: ${messageKey}`);
            return;
        }
        state.lastMessages[messageKey] = Date.now();
        
        // Clean old entries after 10 seconds
        setTimeout(() => {
            delete state.lastMessages[messageKey];
        }, 10000);

        const template = isWelcome
            ? (state.welcomeTemplate[groupId] || DEFAULT_WELCOME)
            : (state.goodbyeTemplate[groupId] || DEFAULT_GOODBYE);

        // ─── Fetch metadata and profile picture ───
        const [meta, ppUrl] = await Promise.all([
            withTimeout(
                fetchMeta(sock, groupId),
                2000,
                null,
                { subject: 'the group', desc: '', count: null }
            ),
            withTimeout(fetchPP(sock, num), 1000, DEFAULT_AVATAR)
        ]);

        const count = meta?.count != null ? Math.max(1, meta.count) : null;
        const text = renderTemplate(template, meta, num, count);

        // ─── Send message with image ───
        await sendWithRetry(
            sock,
            groupId,
            withNewsletter({ 
                image: { url: ppUrl }, 
                caption: text, 
                mentions: [num] 
            }),
            { quoted: null }
        );

        console.log(`[WelcomeGoodbye] ${action} message sent for ${num} in ${groupId}`);

    } catch (err) {
        console.error(`[WelcomeGoodbye] Error for ${num}: ${err.message}`);
        // Ultra-fast fallback
        try {
            const text = action === 'add' ? "Welcome!" : "Goodbye!";
            await sock.sendMessage(groupId, withNewsletter({ text, mentions: [num] }));
        } catch {}
    }
}

function handleEvent(sock, groupId, participants, action, botData) {
    if (!participants?.length || (action !== 'add' && action !== 'remove')) return;

    // Process each participant with queue
    for (const num of participants) {
        enqueue(sock, groupId, () => handleParticipant(sock, groupId, num, action, botData));
    }
}

// ───────────────────── Event Listener ──────────────────────────────
function attachListener(sock, botData) {
    // Ensure state is loaded
    ensureState(botData);
    
    // Store reference to prevent multiple attachments
    if (sock.__wgListenerAttached) {
        console.log('[WelcomeGoodbye] Listener already attached, skipping');
        return;
    }
    
    // Attach the event listener
    sock.ev.on('group-participants.update', (update) => {
        const { id, participants, action } = update;
        const state = ensureState(botData);
        
        // Check if welcome or goodbye is enabled for this group
        if (state.enabledWelcome[id] || state.enabledGoodbye[id]) {
            handleEvent(sock, id, participants, action, botData);
        }
    });
    
    sock.__wgListenerAttached = true;
    console.log('[WelcomeGoodbye] Event listener attached successfully');
}

// ───────────────────── Command handlers ──────────────────────────────
async function toggleCommand(sock, from, msg, isAdmin, botData, saveBotData, args, kind) {
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '❌ This command is only for groups!' });
    }
    if (!isAdmin) {
        return sock.sendMessage(from, { text: '❌ Only group admins can use this command!' });
    }

    const state = ensureState(botData);
    let action = (args[0] || 'status').toLowerCase();
    const enabledMap = kind === 'welcome' ? state.enabledWelcome : state.enabledGoodbye;

    if (action === 'on') {
        enabledMap[from] = true;
        await saveBotData();
        return sock.sendMessage(from, { text: `✅ ${kind} message enabled for this group!` });
    }
    if (action === 'off') {
        enabledMap[from] = false;
        await saveBotData();
        return sock.sendMessage(from, { text: `✅ ${kind} message disabled for this group.` });
    }

    const isEnabled = !!enabledMap[from];
    return sock.sendMessage(from, {
        text: `*📋 ${kind.toUpperCase()} STATUS*\n\nStatus: ${isEnabled ? '✅ ON' : '❌ OFF'}\n\nCommands:\n.${kind} on - Enable\n.${kind} off - Disable`
    });
}

async function setCommand(sock, from, msg, isAdmin, botData, saveBotData, text, kind) {
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '❌ This command is only for groups!' });
    }
    if (!isAdmin) {
        return sock.sendMessage(from, { text: '❌ Only group admins can use this command!' });
    }

    const state = ensureState(botData);
    const templates = kind === 'welcome' ? state.welcomeTemplate : state.goodbyeTemplate;

    if (!text?.trim()) {
        return sock.sendMessage(from, { 
            text: `❌ Please provide a message template!\n\nAvailable placeholders:\n@user - User tag\n@group - Group name\n@count - Member count\n@time - Current time\n@date - Current date\n@desc - Group description` 
        });
    }

    templates[from] = text.trim();
    await saveBotData();
    return sock.sendMessage(from, { text: `✅ ${kind} message updated successfully!\n\nNew template:\n${text.trim()}` });
}

async function showTemplate(sock, from, kind, botData) {
    const state = ensureState(botData);
    const templates = kind === 'welcome' ? state.welcomeTemplate : state.goodbyeTemplate;
    const template = templates[from] || (kind === 'welcome' ? DEFAULT_WELCOME : DEFAULT_GOODBYE);
    
    return sock.sendMessage(from, {
        text: `*📝 ${kind.toUpperCase()} TEMPLATE*\n\n${template}\n\nUse .set${kind} [new template] to change it`
    });
}

// ───────────────────── Router ──────────────────────────────────────
async function router(sock, from, msg, isAdmin, botData, saveBotData, args, cmd) {
    // Handle command routing
    if (cmd === 'welcome') {
        return toggleCommand(sock, from, msg, isAdmin, botData, saveBotData, args, 'welcome');
    }
    if (cmd === 'goodbye') {
        return toggleCommand(sock, from, msg, isAdmin, botData, saveBotData, args, 'goodbye');
    }
    if (cmd === 'setwelcome') {
        return setCommand(sock, from, msg, isAdmin, botData, saveBotData, args.join(' '), 'welcome');
    }
    if (cmd === 'setgoodbye') {
        return setCommand(sock, from, msg, isAdmin, botData, saveBotData, args.join(' '), 'goodbye');
    }
    if (cmd === 'welcomeview') {
        return showTemplate(sock, from, 'welcome', botData);
    }
    if (cmd === 'goodbyeview') {
        return showTemplate(sock, from, 'goodbye', botData);
    }
    
    return null;
}

// ───────────────────── Initialization ──────────────────────────────
function initPlugin(sock, botData) {
    ensureState(botData);
    attachListener(sock, botData);
    console.log('[WelcomeGoodbye] Plugin initialized successfully');
    return { attachListener, router };
}

module.exports = { 
    attachListener, 
    handleEvent, 
    router,
    ensureState,
    initPlugin
};