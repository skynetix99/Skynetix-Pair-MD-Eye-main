module.exports = async function(sock, chatId, msg, q, { isOwner }) {
    try {
        // This command is available to everyone but marked as Owner Menu in the menu structure
        // If you want to restrict it to owner only, uncomment the next line:
        // if (!isOwner) return await sock.sendMessage(chatId, { text: '❌ This command is for the bot owner only!' }, { quoted: msg });

        const vpnText = `🌍 *BEST VPNs FOR ZIMBABWE (2026 Update)* 🌍\n\n` +
            `🛡️ *PREMIUM & MOST RELIABLE:* \n` +
            `1. *NordVPN* - Best overall, very stable in Zim.\n` +
            `2. *ExpressVPN* - Fastest speeds for streaming/gaming.\n` +
            `3. *Surfshark* - Best budget option, unlimited devices.\n` +
            `4. *Proton VPN* - Highest privacy & security standards.\n\n` +
            `🆓 *BEST FREE OPTIONS:* \n` +
            `1. *Proton VPN (Free)* - No data limits, very secure.\n` +
            `2. *Windscribe* - 10GB/month free, great for bypassing blocks.\n` +
            `3. *Urban VPN* - Completely free, many server locations.\n` +
            `4. *Turbo VPN* - Popular and easy to use on mobile.\n\n` +
            `🇿🇼 *ZIMBABWE ISP SPECIALS (Econet/Netone):* \n` +
            `1. *Droid VPN* - Most popular for free internet tricks in Zim.\n` +
            `2. *MAYA Tun PRO* - Stable connection for Econet users.\n` +
            `3. *Tunnel VPN* - Good for Netone social bundles bypass.\n` +
            `4. *Lets VPN* - Highly recommended for bypassing ISP throttles.\n\n` +
            `💡 *TIPS FOR ZIMBABWE:* \n` +
            `• Use *UDP* protocol for Droid VPN settings.\n` +
            `• Always use a *No-Logs* VPN for better privacy.\n` +
            `• For gaming, connect to *South African* servers for lowest ping.\n\n` +
            `> © POWERED BY SKYNETIX MINI BOT`;

        await sock.sendMessage(chatId, { text: vpnText }, { quoted: msg });

    } catch (err) {
        await sock.sendMessage(chatId, { text: '❌ Error: ' + err.message }, { quoted: msg });
    }
};
