const CHRISTIAN_MENU = `✝️ *CHRISTIAN MENU*

` +
`📖 *Bible & Devotion*
` +
`• .christianmenu — Show this menu
` +
`• .bible — Show a Bible passage
` +
`• .verse — Show an encouraging Bible verse
` +
`• .psalm — Show a Psalm
` +
`• .cprayer — Show a short prayer
` +
`• .gospel — Show the Gospel message

` +
`🙏 Use these messages respectfully and do not use them to harass or pressure anyone.`;

const RESPONSES = {
    bible: '📖 *Bible Passage*\n\n"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."\n\n— Jeremiah 29:11',
    verse: '🌿 *Verse of Encouragement*\n\n"The Lord is my strength and my shield; my heart trusts in him, and he helps me."\n\n— Psalm 28:7',
    psalm: '🎵 *Psalm*\n\n"The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters."\n\n— Psalm 23:1–2',
    cprayer: '🙏 *Short Prayer*\n\nLord, guide our words, strengthen our faith, and help us show patience, kindness, and love to others. Amen.',
    gospel: '✝️ *The Gospel*\n\nThe Gospel is the good news of God’s love and salvation through Jesus Christ. Receive it with faith, live with compassion, and treat every person with dignity.'
};

async function christianMenu(sock, chatId, msg, args = [], commandName = 'christianmenu') {
    const action = String(commandName || args[0] || 'christianmenu').toLowerCase();
    const text = action === 'christianmenu' || action === 'cmenu'
        ? CHRISTIAN_MENU
        : RESPONSES[action] || CHRISTIAN_MENU;

    return sock.sendMessage(chatId, { text }, { quoted: msg });
}

module.exports = christianMenu;
module.exports.CHRISTIAN_MENU = CHRISTIAN_MENU;
module.exports.RESPONSES = RESPONSES;
