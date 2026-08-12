const axios = require('axios');

async function gitcloneCommand(sock, from, msg, q) {
    if (!q) {
        return await sock.sendMessage(from, { 
            text: "❌ *Please provide a GitHub repository URL.*\n\nExample: `.gitclone https://github.com/skynetix99/Skynetix-Pair-MD-Eye-main`" 
        }, { quoted: msg });
    }

    // Improved Regex to handle various GitHub URL formats
    const regex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s#?]+)/i;
    const match = q.match(regex);

    if (!match) {
        return await sock.sendMessage(from, { text: "❌ *Invalid GitHub URL.* Please provide a valid repository link." }, { quoted: msg });
    }

    const user = match[1];
    let repo = match[2].replace(/\.git$/, '').replace(/\/$/, ''); // Remove .git or trailing slash

    try {
        await sock.sendMessage(from, { text: `📥 *Cloning Repository...*\n\n👤 *User:* ${user}\n📦 *Repo:* ${repo}\n\n_Fetching repository data..._` }, { quoted: msg });

        // Fetch repository info from GitHub API to get the default branch
        const apiResponse = await axios.get(`https://api.github.com/repos/${user}/${repo}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Skynetix-Bot'
            }
        });

        const repoData = apiResponse.data;
        const defaultBranch = repoData.default_branch || 'main';
        const downloadUrl = `https://github.com/${user}/${repo}/archive/refs/heads/${defaultBranch}.zip`;

        await sock.sendMessage(from, { 
            document: { url: downloadUrl }, 
            fileName: `${repo}-${defaultBranch}.zip`, 
            mimetype: 'application/zip',
            caption: `✅ *Successfully Cloned!*\n\n📦 *Repository:* ${repo}\n🌿 *Branch:* ${defaultBranch}\n👤 *Owner:* ${user}\n\n> © POWERED BY SKYNETIX MINI BOT`
        }, { quoted: msg });

    } catch (e) {
        console.error('GitClone Error:', e.message);
        
        let errorMessage = "❌ *Error:* Repository not found or is private.";
        if (e.response && e.response.status === 404) {
            errorMessage = "❌ *Error:* Repository not found. Please check the URL.";
        } else if (e.response && e.response.status === 403) {
            errorMessage = "❌ *Error:* Rate limit exceeded or access denied.";
        }

        await sock.sendMessage(from, { 
            text: `${errorMessage}\n\n_Details: ${e.message}_` 
        }, { quoted: msg });
    }
}

module.exports = gitcloneCommand;
