// =====================================================================
//  SKYNETIX BOTMENU — bot management command list
// =====================================================================

module.exports = async function botmenuCommand(sock, chatId, msg, isOwner) {
    const menuText =
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚙️  *SKYNETIX BOT MANAGEMENT*  ⚙️   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  👑 *PROFILE*                          ┃
┃  ➤ .setbotname <name> — change name    ┃
┃  ➤ .setbio <text> — set bio            ┃
┃  ➤ .setppbot (reply img) — change PP   ┃
┃  ➤ .autobio on/off — rotating bio      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🔧 *CONFIGURATION*                  ┃
┃  ➤ .setprefix <symbol> — set prefix  ┃
┃  ➤ .mode — check bot mode            ┃
┃  ➤ .public — public mode             ┃
┃  ➤ .private — private mode           ┃
┃  ➤ .self — self mode toggle          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🤖 *AUTOMATION*                     ┃
┃  ➤ .autoread on/off — auto read      ┃
┃  ➤ .autostatus — view status views   ┃
┃  ➤ .autolike on/off — like statuses  ┃
┃  ➤ .autoseen on/off — seen statuses  ┃
┃  ➤ .autotyping on/off — type effect  ┃
┃  ➤ .autorecord on/off — record effect┃
┃  ➤ .ghostmode on/off — hide seen     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🛡️ *CONTROL*                        ┃
┃  ➤ .restart — restart the bot        ┃
┃  ➤ .shutdown — power off the bot     ┃
┃  ➤ .runtime — bot uptime             ┃
┃  ➤ .blocklist — manage blocks        ┃
┃  ➤ .autopost <text> — post status    ┃
┃  ➤ .botinfo — bot details            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ☠️  POWERED BY : SKYNETIX MD        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

    try {
        await sock.sendMessage(chatId, { text: menuText }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(chatId, { text: menuText.replace(/\*/g, '') });
    }
};
