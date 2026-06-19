const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// 1. A legfontosabb: Globális CORS beállítás minden kérésre
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    // Kezeljük a preflight (OPTIONS) kéréseket
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

app.post('/hitelesit', async (req, res) => {
    try {
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Szerver fut a ${PORT}-os porton`));
