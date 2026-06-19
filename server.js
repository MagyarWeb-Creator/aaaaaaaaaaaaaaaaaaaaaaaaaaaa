const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// ENGEDÉLYEZD MINDEN FORRÁST ÉS MINDEN METÓDUST
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

// Kezeld le az OPTIONS kéréseket, amiket a böngésző a POST előtt küld
app.options('*', cors());

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
