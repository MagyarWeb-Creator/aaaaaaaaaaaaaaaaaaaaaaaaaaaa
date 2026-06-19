const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// CORS engedélyezése, hogy a Netlify oldalad küldhessen adatot
app.use(cors());
app.use(express.json());

// A Webhookot a Railway "Variables" menüjében állítsd be DISCORD_WEBHOOK_URL néven!
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

app.post('/hitelesit', async (req, res) => {
    try {
        // IP cím kinyerése a proxy mögül
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const { ua, res: screen } = req.body;

        await axios.post(WEBHOOK, {
            embeds: [{
                title: "✅ Új Belépési Kísérlet",
                color: 0x00FF41,
                fields: [
                    { name: "IP Cím", value: ip },
                    { name: "Eszköz", value: ua },
                    { name: "Képernyő", value: screen }
                ]
            }]
        });
        res.sendStatus(200);
    } catch (e) {
        console.error("Hiba a Discord küldésnél:", e);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Szerver fut a ${PORT}-os porton`));
