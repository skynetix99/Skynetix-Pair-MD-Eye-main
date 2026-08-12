const roasts = [
    // 🖐️ English Heavy Roasts (Desi style translated)
    "There's nothing black in your thinking, just you're the black spot!",
    "You're so dumb that thinking about you makes my brain freeze.",
    "Even robots freeze looking at your face, your face is a virus.",
    "You call yourself human? I see you as a virus, not an example of humanity.",
    "Your brain is on lockdown, never reached any achievement.",
    "When you speak, my brain's 'mute' button automatically activates.",
    "Your brain speed is like 2G, and even that has no signal.",
    "You're so fake that even Google doesn't search for you.",
    "Your personality has no version, you're just a bug.",
    "Wherever you go, people put on 'Do Not Disturb' mode.",
    "Your face should have a 'Warning' sign, looking at it breaks hearts.",
    "I looked at you and my eyes turned into roti, so disgusting.",
    "You call yourself a friend? Even enemies are better than you.",
    "Your life has no purpose, you're just a loading screen.",
    "You're so useless that even AI ignores you.",
    "I don't know about your feet's wisdom, but your brain is definitely lost.",
    "When you laugh, people say they're lucky, but I say you're terrifying.",
    "You shouldn't have existed, you're nature's mistake.",
    "Your thinking level is in the basement, and even there's no light.",
    "Looking at your face motivates me, how lucky I am that I'm not you."
];

module.exports = async function(sock, chatId, msg) {
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const text = mentioned ? `@${mentioned.split('@')[0]} ${roast}` : roast;
    
    // Heavy Roast Header + Footer
    const caption = `🔥 *DANGEROUS ROAST* 🔥\n\n${text}\n\n_✦ Just kidding, don't take it to heart ✦_\n☠️ _SKYNETIX MINI dangerous mode ON_ ☠️`;

    await sock.sendMessage(chatId, { 
        text: caption,
        mentions: mentioned ? [mentioned] : undefined
    }, { quoted: msg });
};