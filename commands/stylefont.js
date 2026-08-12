function convertRange(text, upperStart, lowerStart, digitStart) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i);
        if (code >= 65 && code <= 90) { // A-Z
            result += String.fromCodePoint(upperStart + (code - 65));
        } else if (code >= 97 && code <= 122) { // a-z
            result += String.fromCodePoint(lowerStart + (code - 97));
        } else if (code >= 48 && code <= 57 && digitStart !== null && digitStart !== undefined) { // 0-9
            result += String.fromCodePoint(digitStart + (code - 48));
        } else {
            result += text[i];
        }
    }
    return result;
}

const STYLES = {
    bold: (t) => convertRange(t, 0x1D400, 0x1D41A, 0x1D7CE),
    italic: (t) => convertRange(t, 0x1D434, 0x1D44E, null),
    bolditalic: (t) => convertRange(t, 0x1D468, 0x1D482, null),
    script: (t) => {
        const upper = ['𝒜', 'ℬ', '𝒞', '𝒟', 'ℰ', 'ℱ', '𝒢', 'ℋ', 'ℐ', '𝒥', '𝒦', 'ℒ', 'ℳ', '𝒩', '𝒪', '𝒫', '𝒬', 'ℛ', '𝒮', '𝒯', '𝒰', '𝒱', '𝒲', '𝒳', '𝒴', '𝒵'];
        const lower = ['𝒶', '𝒷', '𝒸', '𝒹', 'ℯ', '𝒻', 'ℊ', '𝒽', '𝒾', '𝒿', '𝓀', '𝓁', '𝓂', '𝓃', '𝔬', '𝓅', '𝓆', '𝓇', '𝓈', '𝓉', '𝓊', '𝓿', '𝓌', '𝓍', '𝓎', '𝓏'];
        let res = '';
        for (let i = 0; i < t.length; i++) {
            let c = t.charCodeAt(i);
            if (c >= 65 && c <= 90) res += upper[c - 65];
            else if (c >= 97 && c <= 122) res += lower[c - 97];
            else res += t[i];
        }
        return res;
    },
    gothic: (t) => {
        const upper = ['𝔄', '𝔅', 'ℭ', '𝔇', '𝔈', '𝔉', '𝔊', 'ℌ', 'ℑ', '𝔍', '𝔎', '𝔏', '𝔐', '𝔑', '𝔒', '𝔓', '𝔔', 'ℜ', '𝔖', '𝔗', '𝔘', '𝔙', '𝔚', '𝔛', '𝔜', 'ℨ'];
        const lower = ['𝔞', '𝔟', '𝔠', '𝔡', '𝔢', '𝔣', '𝔤', '𝔥', '𝔦', '𝔧', '𝔨', '𝔩', '𝔪', '𝓃', '𝔬', '𝔭', '𝔮', '𝔯', '𝔰', '𝔱', '𝔲', '𝔳', '𝔴', '𝔵', '𝔶', '𝔷'];
        let res = '';
        for (let i = 0; i < t.length; i++) {
            let c = t.charCodeAt(i);
            if (c >= 65 && c <= 90) res += upper[c - 65];
            else if (c >= 97 && c <= 122) res += lower[c - 97];
            else res += t[i];
        }
        return res;
    },
    doublestruck: (t) => convertRange(t, 0x1D538, 0x1D552, 0x1D7D8),
    sans: (t) => convertRange(t, 0x1D5A0, 0x1D5BA, 0x1D7E2),
    sansbold: (t) => convertRange(t, 0x1D5D4, 0x1D5EE, 0x1D7EC),
    sansitalic: (t) => convertRange(t, 0x1D608, 0x1D622, null),
    mono: (t) => convertRange(t, 0x1D670, 0x1D68A, 0x1D7F6),
    smallcaps: (t) => {
        const map = {
            a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
            j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ϙ', r: 'ʀ',
            s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
        };
        return t.toLowerCase().split('').map(ch => map[ch] || ch).join('');
    },
    bubble: (t) => {
        let res = '';
        for (let i = 0; i < t.length; i++) {
            let c = t[i];
            let code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) res += String.fromCodePoint(0x24B6 + (code - 65));
            else if (code >= 97 && code <= 122) res += String.fromCodePoint(0x24D0 + (code - 97));
            else if (code >= 48 && code <= 57) {
                if (code === 48) res += '⓪';
                else res += String.fromCodePoint(0x2460 + (code - 49));
            } else res += c;
        }
        return res;
    },
    square: (t) => {
        let res = '';
        for (let i = 0; i < t.length; i++) {
            let c = t.toUpperCase()[i];
            let code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) res += String.fromCodePoint(0x1F130 + (code - 65));
            else res += t[i];
        }
        return res;
    },
    strike: (t) => t.split('').map(c => c + '\u0336').join(''),
    underline: (t) => t.split('').map(c => c + '\u0332').join(''),
    flip: (t) => {
        const flipMap = {
            a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ',
            j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ',
            s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
            A: '∀', B: '𐔫', C: 'Ɔ', D: '◖', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I',
            J: 'ſ', K: '⋊', L: '⅂', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ò', R: 'ᴚ',
            S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
            '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '?': '¿', '!': '¡'
        };
        return t.split('').reverse().map(c => flipMap[c] || c).join('');
    }
};

module.exports = async function(sock, chatId, msg, q) {
    if (!q || !q.trim()) {
        return await sock.sendMessage(chatId, {
            text: `╭━━〔 *✨ STYLEFONTS* 〕━━┈⊷\n` +
                  `┃ ⚠️ Please provide text to style!\n` +
                  `┃\n` +
                  `┃ *Example:* \n` +
                  `┃ \`.stylefonts Skynetix Bot\`\n` +
                  `┃ \`.stylefont bold Hello World\`\n` +
                  `╰━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    const parts = q.trim().split(' ');
    const potentialStyle = parts[0].toLowerCase();

    if (STYLES[potentialStyle] && parts.length > 1) {
        const textToStyle = parts.slice(1).join(' ');
        const styled = STYLES[potentialStyle](textToStyle);
        return await sock.sendMessage(chatId, {
            text: `╭━━〔 *✨ STYLEFONT (${potentialStyle.toUpperCase()})* 〕━━┈⊷\n` +
                  `┃ ${styled}\n` +
                  `╰━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    const textToStyle = q.trim();
    const results = [];
    results.push(`*✨ Text:* ${textToStyle}\n`);
    results.push(`1. *Bold:* ${STYLES.bold(textToStyle)}`);
    results.push(`2. *Italic:* ${STYLES.italic(textToStyle)}`);
    results.push(`3. *Bold Italic:* ${STYLES.bolditalic(textToStyle)}`);
    results.push(`4. *Script:* ${STYLES.script(textToStyle)}`);
    results.push(`5. *Gothic:* ${STYLES.gothic(textToStyle)}`);
    results.push(`6. *Double-Struck:* ${STYLES.doublestruck(textToStyle)}`);
    results.push(`7. *Sans-Serif:* ${STYLES.sans(textToStyle)}`);
    results.push(`8. *Sans Bold:* ${STYLES.sansbold(textToStyle)}`);
    results.push(`9. *Monospace:* ${STYLES.mono(textToStyle)}`);
    results.push(`10. *Small Caps:* ${STYLES.smallcaps(textToStyle)}`);
    results.push(`11. *Bubble:* ${STYLES.bubble(textToStyle)}`);
    results.push(`12. *Square:* ${STYLES.square(textToStyle)}`);
    results.push(`13. *Strikethrough:* ${STYLES.strike(textToStyle)}`);
    results.push(`14. *Underline:* ${STYLES.underline(textToStyle)}`);
    results.push(`15. *Upside Down:* ${STYLES.flip(textToStyle)}`);

    results.push(`\n> *Tip:* Use \`.stylefont <style> <text>\` for a specific style (e.g. \`.stylefont gothic Skynetix\`).`);

    await sock.sendMessage(chatId, {
        text: results.join('\n')
    }, { quoted: msg });
};
