import express from 'express';
import { client, initializeBot } from '../src/discord.js';
import { createNodeWarButtons, generateNodeWarMessage } from '../src/commands/node-war.js';

const app = express();
app.use(express.json());

let botInitialized = false;

async function ensureBotInitialized(req, res, next) {
    if (!botInitialized) {
        try {
            await initializeBot();
            botInitialized = true;
            console.log('Bot inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar bot:', error);
            return res.status(500).json({ error: 'Falha ao inicializar bot' });
        }
    }
    next();
}

app.get('/api/status', ensureBotInitialized, (req, res) => {
    res.json({
        status: 'Bot is running',
        timestamp: new Date().toISOString(),
        botReady: client.isReady(),
        botUser: client.user ? client.user.tag : null
    });
});

app.get('/api/channels', ensureBotInitialized, (req, res) => {
    const channels = client.channels.cache
        .filter((channel) => channel.type === 0)
        .map((channel) => ({
            id: channel.id,
            name: channel.name,
            guildName: channel.guild?.name || 'DM'
        }));

    res.json({ channels });
});

app.post('/api/nodewar', ensureBotInitialized, async (req, res) => {
    const { channelId } = req.body;

    if (!channelId) {
        return res.status(400).json({ error: 'channelId é obrigatório' });
    }

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Canal não encontrado' });
        }

        const messageData = generateNodeWarMessage();
        const buttons = createNodeWarButtons();

        const message = await channel.send({ ...messageData, components: buttons });

        res.json({
            success: true,
            message: 'Comando nodewar executado com sucesso',
            messageId: message.id,
            channelId: channel.id
        });
    } catch (error) {
        console.error('Erro ao executar comando nodewar:', error);
        res.status(500).json({ error: 'Erro ao executar comando' });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Discord Node War Bot API' });
});

export default app;
