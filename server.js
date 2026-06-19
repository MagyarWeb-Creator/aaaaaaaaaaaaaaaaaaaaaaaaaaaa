const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware-k a lehető legkorábban
app.use(cors());
app.use(express.json({ limit: '10kb' })); // biztonsági limit

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK) {
    console.warn('⚠️  FIGYELMEZTETÉS: DISCORD_WEBHOOK_URL nincs beállítva!');
}

// IP cím biztonságos kinyerése
const getClientIP = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.ip || 'Ismeretlen';
};

app.post('/hitelesit', async (req, res) => {
    try {
        const { ua, res: resolution } = req.body;

        // Discord üzenet
        await axios.post(WEBHOOK, {
            embeds: [{
                title: "✅ Új Belépési Kísérlet",
                color: 0x00FF41,
                timestamp: new Date().toISOString(),
                fields: [
                    { 
                        name: "IP", 
                        value: getClientIP(req),
                        inline: true 
                    },
                    { 
                        name: "Eszköz / User Agent", 
                        value: ua || "Nincs adat",
                        inline: false 
                    },
                    { 
                        name: "Képernyőfelbontás", 
                        value: resolution || "Nincs adat",
                        inline: true 
                    }
                ]
            }]
        });

        res.status(200).json({ status: "OK" });

    } catch (error) {
        console.error('Discord webhook hiba:', error.message);
        
        if (error.response) {
            console.error('Discord válasz:', error.response.data);
        }

        res.status(500).json({ 
            error: "Hiba a Discord webhook küldése közben" 
        });
    }
});

// Egyszerű health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Szerver fut: http://0.0.0.0:${PORT}`);
    if (!WEBHOOK) {
        console.error('❌ DISCORD_WEBHOOK_URL környezeti változó nincs beállítva!');
    }
});
