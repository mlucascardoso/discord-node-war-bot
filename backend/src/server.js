import cors from 'cors';
import express from 'express';
import { client, initializeBot } from './discord/client.js';
import { createMember, deleteMember, getAllMembers, getMemberById, getMembersStats, updateMember } from './api/members.js';
import { createNodeWarButtons, generateNodeWarMessage } from './discord/commands/node-war.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
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

// Members API Routes
app.get('/api/members', (req, res) => {
    try {
        const members = getAllMembers();
        res.json(members);
    } catch (error) {
        console.error('Error getting members:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/members/stats', (req, res) => {
    try {
        const stats = getMembersStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting members stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/members/:id', (req, res) => {
    try {
        const { id } = req.params;
        const member = getMemberById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json(member);
    } catch (error) {
        console.error('Error getting member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/members/create', (req, res) => {
    try {
        const result = createMember(req.body);

        if (result.success) {
            res.status(201).json(result.data);
        } else {
            res.status(400).json({
                error: result.error,
                details: result.details
            });
        }
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/members/:id', (req, res) => {
    try {
        const { id } = req.params;
        const result = updateMember(id, req.body);

        if (result.success) {
            res.json(result.data);
        } else {
            const statusCode = result.error === 'Member not found' ? 404 : 400;
            res.status(statusCode).json({
                error: result.error,
                details: result.details
            });
        }
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/members/:id', (req, res) => {
    try {
        const { id } = req.params;
        const result = deleteMember(id);

        if (result.success) {
            res.json({ message: 'Member deleted successfully', data: result.data });
        } else {
            res.status(404).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
    res.json({ message: 'Discord Node War Bot API - Local Development' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    console.log(`📋 Canais: http://localhost:${PORT}/api/channels`);
    console.log(`🎮 NodeWar: POST http://localhost:${PORT}/api/nodewar`);
});
