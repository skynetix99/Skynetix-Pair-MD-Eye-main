
// commands/hack.js
const settings = require('../settings');

function onlyDigits(s = '') {
  return String(s).replace(/\D/g, '');
}

function getOwnersNormalized() {
  const raw = settings.ownerNumber;
  const owners = Array.isArray(raw) ? raw : String(raw).split ? String(raw).split(',') : [raw];
  return owners.map(o => onlyDigits(o));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function hackCommand(sock, chatId, message /* original message object */, q) {
  try {
    // Determine sender (works for private & group)
    const rawSender = message.key?.participant || message.key?.remoteJid || '';
    const senderDigits = onlyDigits(rawSender);

    // Owner(s)
    const owners = getOwnersNormalized();

    // Allow owner or fromMe messages
    if (!owners.includes(senderDigits) && !message.key?.fromMe) {
      return await safeSend(sock, chatId, { text: '❌ Only the bot owner can use this command.' }, { quoted: message });
    }

    const steps = [
      '💻 *HACK STARTING...* 💻',
      '*Initializing hacking tools...* 🛠️',
      '*Connecting to remote servers...* 🌐',
      '```[█▒▒▒▒] 10%``` ⏳',
      '```[██▒▒▒▒] 30%``` ⏳',
      '```[████▒▒▒] 50%``` ⏳',
      '```[██████▒] 70%``` ⏳',
      '```[████████] 90%``` ⏳',
      '```[████████] 100%``` ✅',
      '🔒 *System Breach: Successful!* 🔓',
      '🚀 *Executing final commands...* 🎯',
      '*📡 Transmitting data...* 📤',
      '_🕵️‍♂️ Covering tracks..._ 🤫',
      '*🔧 Finalizing operations...* 🏁',
      '⚠️ *Note:* This is a joke command for fun.',
      '> *HACK COMPLETE ☣*'
    ];

    for (const line of steps) {
      await safeSend(sock, chatId, { text: line }, { quoted: message });
      // Random delay between 500ms and 2000ms for realism
      const delay = Math.floor(Math.random() * 1500) + 500;
      await sleep(delay);
    }
  } catch (err) {
    console.error('hackCommand error:', err);
    try {
      await safeSend(sock, chatId, { text: `❌ Error: ${err.message || String(err)}` }, { quoted: message });
    } catch { /* give up silently */ }
  }
}

// Send a message with retries and a bare-text fallback so the bot always
// responds, even if the first send attempt fails (e.g. rate limits).
async function safeSend(sock, chatId, payload, options, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await sock.sendMessage(chatId, payload, options);
    } catch (e) {
      if (attempt === retries) break;
      await sleep(400 * (attempt + 1));
    }
  }
  // Last resort: drop quoted/options and send plain text.
  try {
    return await sock.sendMessage(chatId, { text: payload.text || '' });
  } catch { /* give up silently */ }
}

module.exports = hackCommand;
