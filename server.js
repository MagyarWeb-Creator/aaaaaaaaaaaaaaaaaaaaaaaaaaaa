const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// A lehető legkorábban inicializáljuk
app.use(cors());
app.options('*', cors()); 

app.use(express.json());

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

app.post('/hitelesit', async (req, res) => {
    if (!WEBHOOK) return res.status(500).send("Webhook nincs beállítva");
    
    try {
        await axios.post(WEBHOOK, {
            embeds: [{
                title: "✅ Új Belépési Kísérlet",
                color: 0x00FF41,
                fields: [
                    { name: "IP", value: req.headers['x-forwarded-for'] || req.socket.remoteAddress },
                    { name: "Eszköz", value: req.body.ua },
                    { name: "Képernyő", value: req.body.res }
                ]
            }]
        });
        res.status(200).json({ status: "OK" });
    } catch (e) {
        res.status(500).json({ error: "Hiba a Discord küldésnél" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Szerver fut a ${PORT}-os porton`));
