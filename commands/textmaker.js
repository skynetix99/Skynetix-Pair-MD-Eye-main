const sharp = require('sharp');

const STYLES = {
    sky: { title: 'SKY', background: ['#071a3d', '#1e90ff'], accent: '#9be7ff', text: '#ffffff', font: 'Georgia' },
    cup: { title: 'CUP', background: ['#301b0f', '#b87333'], accent: '#ffd7a8', text: '#fff7ed', font: 'Georgia' },
    coffee: { title: 'COFFEE', background: ['#1e0f08', '#7b3f00'], accent: '#f2c078', text: '#fff8ef', font: 'Georgia' },
    cloud: { title: 'CLOUD', background: ['#9ed8ff', '#eef9ff'], accent: '#ffffff', text: '#12304a', font: 'Arial' },
    smoke: { title: 'SMOKE', background: ['#10131a', '#6b7280'], accent: '#d1d5db', text: '#ffffff', font: 'Arial' },
    flower: { title: 'FLOWER', background: ['#4a102e', '#e85d9e'], accent: '#ffd1e8', text: '#ffffff', font: 'Georgia' },
    leaf: { title: 'LEAF', background: ['#0b3d2e', '#49a078'], accent: '#c8f7dc', text: '#f0fff7', font: 'Georgia' },
    wood: { title: 'WOOD', background: ['#2f160b', '#9a5b2f'], accent: '#f4c095', text: '#fff4e8', font: 'Georgia' },
    stone: { title: 'STONE', background: ['#20252b', '#9ca3af'], accent: '#e5e7eb', text: '#ffffff', font: 'Arial' },
    blood: { title: 'BLOOD', background: ['#180306', '#a4161a'], accent: '#ffb3b3', text: '#fff5f5', font: 'Georgia' },
    horror: { title: 'HORROR', background: ['#050505', '#3b0710'], accent: '#ff304f', text: '#f8fafc', font: 'Georgia' },
    scary: { title: 'SCARY', background: ['#030712', '#581c87'], accent: '#e9d5ff', text: '#ffffff', font: 'Georgia' },
    spooky: { title: 'SPOOKY', background: ['#120b2e', '#7c3aed'], accent: '#f0abfc', text: '#ffffff', font: 'Georgia' },
    christmas: { title: 'CHRISTMAS', background: ['#075985', '#b91c1c'], accent: '#fef3c7', text: '#ffffff', font: 'Georgia' },
    birthday: { title: 'BIRTHDAY', background: ['#7c2d12', '#ec4899'], accent: '#fde68a', text: '#ffffff', font: 'Arial' },
    love: { title: 'LOVE', background: ['#4c0519', '#e11d48'], accent: '#fecdd3', text: '#fff1f2', font: 'Georgia' },
    heart: { title: 'HEART', background: ['#450a0a', '#f43f5e'], accent: '#ffe4e6', text: '#ffffff', font: 'Georgia' },
    gold: { title: 'GOLD', background: ['#4b3500', '#d4af37'], accent: '#fcf29e', text: '#ffffff', font: 'Georgia' }
};

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function wrapText(text, maxChars = 24) {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';
    for (const word of words) {
        if ((current + ' ' + word).trim().length > maxChars && current) {
            lines.push(current);
            current = word;
        } else {
            current = (current + ' ' + word).trim();
        }
    }
    if (current) lines.push(current);
    return lines.slice(0, 5);
}

function buildSvg(text, style) {
    const lines = wrapText(text);
    const startY = 238 - ((lines.length - 1) * 34) / 2;
    const lineMarkup = lines.map((line, index) =>
        `<text x="500" y="${startY + index * 68}" text-anchor="middle" dominant-baseline="middle" fill="${style.text}" font-family="${style.font}, sans-serif" font-size="52" font-weight="700">${escapeXml(line)}</text>`
    ).join('');

    return `<svg width="1000" height="500" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${style.background[0]}"/>
          <stop offset="100%" stop-color="${style.background[1]}"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
      </defs>
      <rect width="1000" height="500" rx="36" fill="url(#bg)"/>
      <circle cx="120" cy="90" r="70" fill="${style.accent}" opacity="0.14"/>
      <circle cx="890" cy="410" r="130" fill="${style.accent}" opacity="0.12"/>
      <path d="M80 390 C260 310, 350 470, 520 380 S820 300, 940 390" fill="none" stroke="${style.accent}" stroke-width="5" opacity="0.45"/>
      <text x="500" y="82" text-anchor="middle" fill="${style.accent}" font-family="Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="8">${style.title}</text>
      <g filter="url(#shadow)">${lineMarkup}</g>
      <text x="500" y="438" text-anchor="middle" fill="${style.accent}" font-family="Arial, sans-serif" font-size="18" letter-spacing="3">SKYNETIX TEXT MAKER</text>
    </svg>`;
}

async function textMakerCommand(sock, from, msg, query = '', commandName = 'sky') {
    const styleName = String(commandName || 'sky').toLowerCase();
    const style = STYLES[styleName] || STYLES.sky;
    const text = String(query || '').trim();

    if (!text) {
        return sock.sendMessage(from, {
            text: `✏️ Usage: .${styleName} your text here\nExample: .${styleName} Skynetix Pair MD Eye`
        }, { quoted: msg });
    }

    if (text.length > 120) {
        return sock.sendMessage(from, { text: '❌ Please keep the text within 120 characters.' }, { quoted: msg });
    }

    try {
        const image = await sharp(Buffer.from(buildSvg(text, style))).png().toBuffer();
        return sock.sendMessage(from, {
            image,
            caption: `✅ ${style.title} text generated successfully.\nUse .textmakermenu to see all styles.`
        }, { quoted: msg });
    } catch (error) {
        console.error(`[Text Maker:${styleName}]`, error);
        return sock.sendMessage(from, { text: '❌ Text Maker could not generate the image. Please try again.' }, { quoted: msg });
    }
}

textMakerCommand.styles = Object.keys(STYLES);
textMakerCommand.buildSvg = buildSvg;
textMakerCommand.STYLES = STYLES;

module.exports = textMakerCommand;
