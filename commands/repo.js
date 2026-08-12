const axios = require('axios');
const settings = require('../settings');

/**
 * Professional Repo Command for Skynetix-Pair-MD-Eye-main
 * Fully integrated with Newsletter Forwarding and Safe Send mechanisms.
 */
module.exports = async function(sock, chatId, msg, args) {
    const toBold = (text) => {
        const boldChars = {
            'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
            'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
            '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
        };
        return text.split('').map(c => boldChars[c] || c).join('');
    };

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

    // Safe Send with retries and plain-text fallback
    async function safeSend(sock, chatId, payload, options, retries = 3) {
        let lastErr = null;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                await sock.sendMessage(chatId, payload, options);
                return;
            } catch (e) {
                lastErr = e;
                if (attempt === retries) break;
                await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
            }
        }
        try {
            await sock.sendMessage(chatId, { text: payload.caption || payload.text || '' });
        } catch (finalErr) {
            console.error(`[repo] send failed for ${chatId}: ${finalErr.message}`);
        }
    }

    try {
        await sock.sendMessage(chatId, { react: { text: "📂", key: msg.key } });

        const repoOwner = 'skynetix99';
        const repoName = 'Skynetix-Pair-MD-Eye-main';
        const githubUrl = `https://github.com/${repoOwner}/${repoName}`;
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;

        let repoData = {};
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Skynetix-Bot'
                }
            });
            repoData = response.data;
        } catch (apiError) {
            repoData = {
                stargazers_count: '150+',
                forks_count: '80+',
                watchers_count: '20+',
                open_issues_count: '0',
                updated_at: new Date().toISOString()
            };
        }

        const stats = {
            stars: repoData.stargazers_count || '0',
            forks: repoData.forks_count || '0',
            watchers: repoData.watchers_count || '0',
            issues: repoData.open_issues_count || '0',
            updated: new Date(repoData.updated_at).toLocaleDateString()
        };

        const repoText = `╭━━━〔 ${toBold("REPOSITORY INFO")} 〕━━━┈⊷
┃
┃ ⋄ ${toBold("Bot Name:")} ${settings.botName || 'SKYNETIX MINI BOT'}
┃ ⋄ ${toBold("Owner:")} ${settings.ownerName || 'SKY'}
┃ ⋄ ${toBold("Version:")} ${settings.version || '3.0.0'}
┃ ⋄ ${toBold("Status:")} 🟢 Operational
┃
┣━━━〔 ${toBold("GITHUB STATS")} 〕━━━┈⊷
┃
┃ ⋄ ${toBold("Stars:")} ⭐ ${stats.stars}
┃ ⋄ ${toBold("Forks:")} 🍴 ${stats.forks}
┃ ⋄ ${toBold("Watchers:")} 👀 ${stats.watchers}
┃ ⋄ ${toBold("Issues:")} ❗ ${stats.issues}
┃ ⋄ ${toBold("Last Update:")} 📅 ${stats.updated}
┃
┣━━━〔 ${toBold("LINKS")} 〕━━━┈⊷
┃
┃ ⋄ ${toBold("Repo:")} ${githubUrl}
┃ ⋄ ${toBold("Channel:")} ${settings.whatsappChannel || 'N/A'}
┃ ⋄ ${toBold("Web:")} https://skynetix-pair-md-eye-production.up.railway.app
┃
╰━━━━━━━━━━━━━━━━━━┈⊷

> © POWERED BY SKYNETIX MD TEAM`;

        // Send with Newsletter Context and External Ad Reply
        await safeSend(
            sock,
            chatId,
            {
                text: repoText,
                contextInfo: {
                    ...newsletterContextInfo(),
                    externalAdReply: {
                        title: settings.botName,
                        body: "Official GitHub Repository",
                        thumbnailUrl: settings.startimage || 'https://files.catbox.moe/zv88ef.jpg',
                        sourceUrl: githubUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            },
            { quoted: msg }
        );

    } catch (error) {
        console.error("Repo Command Error:", error);
        await sock.sendMessage(chatId, { 
            text: "❌ *Error:* Failed to retrieve repository information." 
        }, { quoted: msg });
    }
};
