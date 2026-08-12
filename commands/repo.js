const settings = require('../settings');

/**
 * Send repository information for the configured GitHub project.
 * The command is deliberately resilient: GitHub failures show the repository
 * link and local bot information instead of preventing a response entirely.
 * This command is intentionally public; authorization is not checked here.
 */
async function repoCommand(sock, chatId, msg = {}, args = []) {
    const toBold = (text) => {
        const boldChars = {
            a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶', j: '𝗷',
            k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁',
            u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇',
            A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜', J: '𝗝',
            K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧',
            U: '𝗨', V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭',
            0: '𝟬', 1: '𝟭', 2: '𝟮', 3: '𝟯', 4: '𝟰', 5: '𝟱', 6: '𝟲', 7: '𝟳', 8: '𝟴', 9: '𝟵'
        };
        return String(text).split('').map((char) => boldChars[char] || char).join('');
    };

    const repoOwner = 'skynetix99';
    const repoName = 'Skynetix-Pair-MD-Eye-main';
    const githubUrl = `https://github.com/${repoOwner}/${repoName}`;
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;
    const imageUrl = settings.startimage || 'https://files.catbox.moe/zm6agf.png';

    const newsletterContextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363350619358109@newsletter',
            newsletterName: '𝐒𝐊𝐘𝐍𝐄𝐓𝐈𝐗 𝐓𝐄𝐂𝐇',
            serverMessageId: -1
        }
    };

    const sendText = async (text, options = {}) => {
        return sock.sendMessage(chatId, { text }, { quoted: msg, ...options });
    };

    let repoData = null;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'Skynetix-Bot'
                },
                signal: controller.signal
            });
            if (response.ok) repoData = await response.json();
        } finally {
            clearTimeout(timeout);
        }
    } catch (error) {
        console.error('[repo] GitHub request failed:', error.message);
    }

    const updatedAt = repoData?.updated_at ? new Date(repoData.updated_at) : null;
    const updated = updatedAt && !Number.isNaN(updatedAt.getTime())
        ? updatedAt.toLocaleDateString()
        : 'Unavailable';
    const stats = {
        stars: repoData?.stargazers_count ?? '0',
        forks: repoData?.forks_count ?? '0',
        watchers: repoData?.subscribers_count ?? repoData?.watchers_count ?? '0',
        issues: repoData?.open_issues_count ?? '0'
    };

    const repoText = `╭━━━〔 ${toBold('REPOSITORY INFO')} 〕━━━┈⊷
┃
┃ ⋄ ${toBold('Bot Name:')} ${settings.botName || 'SKYNETIX MINI BOT'}
┃ ⋄ ${toBold('Owner:')} ${settings.ownerName || 'SKY'}
┃ ⋄ ${toBold('Version:')} ${settings.version || '3.0.0'}
┃ ⋄ ${toBold('Status:')} 🟢 Operational
┃
┣━━━〔 ${toBold('GITHUB STATS')} 〕━━━┈⊷
┃
┃ ⋄ ${toBold('Stars:')} ⭐ ${stats.stars}
┃ ⋄ ${toBold('Forks:')} 🍴 ${stats.forks}
┃ ⋄ ${toBold('Watchers:')} 👀 ${stats.watchers}
┃ ⋄ ${toBold('Issues:')} ❗ ${stats.issues}
┃ ⋄ ${toBold('Last Update:')} 📅 ${updated}
┃
┣━━━〔 ${toBold('LINKS')} 〕━━━┈⊷
┃
┃ ⋄ ${toBold('Repo:')} ${githubUrl}
┃ ⋄ ${toBold('Channel:')} ${settings.whatsappChannel || 'N/A'}
┃ ⋄ ${toBold('Web:')} https://skynetix-pair-md-eye-production.up.railway.app
┃
╰━━━━━━━━━━━━━━━━━━┈⊷
> © POWERED BY SKYNETIX MD TEAM`;

    if (msg?.key) {
        try {
            await sock.sendMessage(chatId, { react: { text: '📂', key: msg.key } });
        } catch (error) {
            console.error('[repo] reaction failed:', error.message);
        }
    }

    const richPayload = {
        text: repoText,
        contextInfo: {
            ...newsletterContextInfo,
            externalAdReply: {
                title: settings.botName || 'SKYNETIX MINI BOT',
                body: 'Official GitHub Repository',
                thumbnailUrl: imageUrl,
                sourceUrl: githubUrl,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    };

    try {
        await sock.sendMessage(chatId, richPayload, { quoted: msg });
    } catch (error) {
        console.error('[repo] rich response failed; sending plain text:', error.message);
        try {
            await sendText(repoText);
        } catch (fallbackError) {
            console.error('[repo] plain-text response failed:', fallbackError.message);
        }
    }
};


// Metadata used by the dispatcher and tests to keep this read-only command public.
repoCommand.command = 'repo';
repoCommand.isPublic = true;
repoCommand.matches = (text, prefix = '.') => {
    const token = String(text || '').trim().toLowerCase().split(/\s+/)[0];
    return token === `${String(prefix || '.').toLowerCase()}repo`;
};

module.exports = repoCommand;
