const settings = require('../settings');

async function allMenu(sock, from, msg, session, commands) {
    // ===== HEAVY BOX HEADER =====
    let allMenuText = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
    allMenuText += `┃  💀  *SKYNETIX MINI ALL MENU*  💀               ┃\n`;
    allMenuText += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n`;
    allMenuText += `┃  📋 TOTAL COMMANDS: 300+                   ┃\n`;
    allMenuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`;

    // ===== CATEGORIES (آپ کی اوریجنل کیٹیگریز) =====
    const categories = {
        '👑 OWNER': ['public', 'private', 'mode', 'owner', 'skyinfor', 'setname', 'block', 'unblock', 'bcgc', 'bcall', 'restart', 'shutdown', 'xrestart', 'xshutdown', 'nuke', 'clear', 'backup', 'restore', 'clone', 'decry', 'setprefix', 'vpn', 'addsudo', 'delsudo', 'listsudo', 'broadcast', 'self', 'autostatus', 'autoseen', 'autolike', 'autobio', 'botmenu', 'stylefont'],
        '👥 GROUP': ['kick', 'add', 'promote', 'demote', 'mute', 'unmute', 'tagall', 'hidetag', 'grouplink', 'groupinfo', 'join', 'leave', 'setdesc', 'setppgc', 'getbio', 'getdp', 'accept', 'poll', 'everyonemsg', 'listonline', 'tagme', 'mention', 'kickoffline', 'snipe', 'editmsg', 'react', 'send', 'forward', 'save', 'welcome', 'goodbye', 'setwelcome', 'setgoodbye', 'antilink', 'antibadword', 'antidelete', 'antiviewonce', 'antifake', 'antispam', 'antibug', 'antibot', 'anticall', 'antistatus'],
        '🤖 AI': ['ai', 'chatbot', 'gali', 'chatgpt', 'gemini', 'llama', 'deepseek', 'flux', 'pixart', 'dalle', 'bingai', 'blackbox', 'imagine', 'midjourney', 'simi', 'brainly', 'math'],
        '⬇️ DOWNLOAD': ['song', 'video', 'insta', 'tiktok', 'facebook', 'youtube', 'pinterest', 'twitter', 'reddit', 'spotify', 'mf', 'apk', 'gdrive', 'ytdl', 'ytmp3', 'ytmp4', 'gitclone', 'threads', 'snapchat', 'capcut', 'terabox'],
        '🛠️ TOOLS': ['ping', 'dp', 'vv', 'translate', 'base64', 'qr', 'shorturl', 'calc', 'weather', 'github', 'ipinfo', 'tempmail', 'fakeinfo', 'binlookup', 'whois', 'dnslookup', 'portscan', 'screenshot', 'define', 'google', 'wiki', 'yts', 'playstore', 'npm', 'sticker', 'toimg', 'tomp3', 'tts', 'blur', 'invert', 'crop', 'flip', 'grayscale', 'removebg', 'enlarge', 'runtime', 'uptime', 'serverinfo', 'speedtest', 'device', 'pdf', 'ocr', 'remini', 'enhance', 'upscale', 'find', 'location', 'time', 'search', 'whatsapp', 'support', 'whelp', 'pair', 'pairing', 'football', 'soccer', 'scores', 'fixtures'],
        '🎉 FUN': ['joke', 'meme', 'dare', 'truth', 'ascii', 'roast', 'compliment', 'ship', 'emojimix', 'character', 'quote', 'fact', 'trivia', 'coinflip', 'roll', 'riddle', 'wouldyourather', 'hack', 'repo', 'report', 'spam', 'smsbomb', 'callbomb', 'crash', 'freeze', 'lag', 'bug', 'locspam', 'vcardspam', 'buttonspam', 'pollspam', 'contactspam', 'flirt', 'insult', 'pickup', 'dare', 'truth', 'tictactoe', '8ball', 'chess', 'hangman'],
        '✝️ CHRISTIAN': ['christianmenu', 'bible', 'verse', 'psalm', 'cprayer', 'gospel'],
        '🎌 ANIME': ['anime', 'manga', 'waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe'],
        '🏢 LOGO': ['neon', 'glitch', 'gold', '3dtext', 'fire', 'water', 'galaxy', 'marvel', 'avengers', 'transformer', 'blackpink', 'gradient', 'luxury', 'royal', 'metal', 'steel', 'chrome', 'glossy'],
        '✏️ TEXT MAKER': ['sky', 'stylefont', 'cup', 'coffee', 'cloud', 'smoke', 'flower', 'leaf', 'wood', 'stone', 'blood', 'horror', 'scary', 'spooky', 'christmas', 'birthday', 'love', 'heart']
    };

    // ===== BUILD LIST (Compact per category) =====
    for (const [category, cmds] of Object.entries(categories)) {
        // Category Header with Heavy Box
        allMenuText += `┏━━━━━━ ❲ *${category}* ❳ ━━━━━━┓\n`;
        
        let line = `┃  ➤ `;
        cmds.forEach((cmd, index) => {
            line += `.${cmd}`;
            if (index < cmds.length - 1) line += `, `;
            
            // اگر لائن بہت لمبی ہو جائے تو توڑ دو (WhatsApp کیپشن سیف رکھنے کے لیے)
            if (line.length > 90) {
                allMenuText += `${line}\n`;
                line = `┃  ➤ `;
            }
        });
        // باقی بچی ہوئی لائن
        if (line !== `┃  ➤ `) allMenuText += `${line}\n`;
        
        allMenuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
    }

    // ===== FOOTER =====
    allMenuText += `☠️*POWERED BY : SKYNETIX * ☠️`;

    // ===== SEND =====
    // The dedicated ALLMENU image (per owner's request); falls back to the
    // default startimage if it is unreachable, and to plain text as a last resort.
    // Every message carries the newsletter forwarding context so it is shown as
    // "Forwarded from channel" with the channel link.
    const allmenuImage = 'https://files.catbox.moe/337crw.jpg';

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

    try {
        await sock.sendMessage(from, withNewsletter({ image: { url: allmenuImage }, caption: allMenuText }), { quoted: msg });
    } catch (e) {
        try {
            await sock.sendMessage(from, withNewsletter({ image: { url: settings.startimage }, caption: allMenuText }), { quoted: msg });
        } catch (e2) {
            // Final fallback: text only
            await sock.sendMessage(from, withNewsletter({ text: allMenuText }), { quoted: msg });
        }
    }
}

module.exports = allMenu;
