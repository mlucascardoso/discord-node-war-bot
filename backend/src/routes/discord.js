import express from 'express';
import { getActiveNodewarSession } from '../api/nodewar-sessions.js';
import { client, initializeBot } from '../discord/client.js';
import { createNodeWarButtons, generateNodeWarMessage } from '../discord/commands/node-war.js';

const router = express.Router();

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

// Rota de status do bot
router.get('/status', (req, res) => {
    try {
        const status = {
            botInitialized,
            clientReady: client.isReady(),
            uptime: client.uptime ? Math.floor(client.uptime / 1000) : 0,
            ping: client.ws.ping || 0,
            guilds: client.guilds.cache.size,
            channels: client.channels.cache.size,
            users: client.users.cache.size,
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        };

        // Se o bot estiver pronto, adiciona informações detalhadas
        if (client.isReady()) {
            status.botUser = {
                id: client.user.id,
                username: client.user.username,
                discriminator: client.user.discriminator,
                tag: client.user.tag
            };

            status.guildsInfo = client.guilds.cache.map((guild) => ({
                id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
                channels: guild.channels.cache.size
            }));
        }

        res.json({
            success: true,
            status,
            message: client.isReady() ? 'Bot está online e funcionando' : 'Bot não está conectado'
        });
    } catch (error) {
        console.error('Erro ao obter status do bot:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter status do bot',
            details: error.message
        });
    }
});

// Rota de status específica do NodeWar
router.get('/nodewar/status', async (req, res) => {
    try {
        const activeSession = await getActiveNodewarSession();

        const nodewarStatus = {
            hasActiveSession: !!activeSession,
            sessionInfo: activeSession || null,
            botReady: client.isReady(),
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            nodewarStatus,
            message: activeSession ? `NodeWar ativo: ${activeSession.template_name}` : 'Nenhuma sessão NodeWar ativa'
        });
    } catch (error) {
        console.error('Erro ao obter status do NodeWar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter status do NodeWar',
            details: error.message
        });
    }
});

// Rota para ligar o bot
router.post('/start', async (req, res) => {
    try {
        if (botInitialized && client.isReady()) {
            return res.json({
                success: true,
                message: 'Bot já está ligado e funcionando',
                status: {
                    botInitialized: true,
                    clientReady: true,
                    uptime: client.uptime ? Math.floor(client.uptime / 1000) : 0,
                    ping: client.ws.ping || 0
                }
            });
        }

        if (!botInitialized || !client.isReady()) {
            await initializeBot();
            botInitialized = true;
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        if (client.isReady()) {
            res.json({
                success: true,
                message: 'Bot ligado com sucesso',
                status: {
                    botInitialized: true,
                    clientReady: true,
                    uptime: client.uptime ? Math.floor(client.uptime / 1000) : 0,
                    ping: client.ws.ping || 0,
                    botUser: { id: client.user.id, username: client.user.username, tag: client.user.tag },
                    guilds: client.guilds.cache.size
                }
            });
        } else {
            throw new Error('Bot não conseguiu se conectar após inicialização');
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar bot:', error);
        res.status(500).json({
            success: false,
            error: 'Falha ao ligar o bot',
            details: error.message,
            status: { botInitialized, clientReady: client.isReady() }
        });
    }
});

// Rota para desligar o bot
router.post('/stop', async (req, res) => {
    try {
        if (!botInitialized || !client.isReady()) {
            return res.json({
                success: true,
                message: 'Bot já está desligado',
                status: {
                    botInitialized: false,
                    clientReady: false
                }
            });
        }

        console.log('🔄 Desligando o bot...');

        await client.destroy();
        botInitialized = false;

        console.log('✅ Bot desligado com sucesso!');

        res.json({
            success: true,
            message: 'Bot desligado com sucesso',
            status: {
                botInitialized: false,
                clientReady: false
            }
        });
    } catch (error) {
        console.error('❌ Erro ao desligar bot:', error);
        res.status(500).json({
            success: false,
            error: 'Falha ao desligar o bot',
            details: error.message
        });
    }
});

router.get('/channels', ensureBotInitialized, (req, res) => {
    const channels = client.channels.cache
        .filter((channel) => channel.type === 0)
        .map((channel) => ({
            id: channel.id,
            name: channel.name,
            guildName: channel.guild?.name || 'DM'
        }));

    res.json({ channels });
});

router.post('/nodewar', ensureBotInitialized, async (req, res) => {
    const { channelId } = req.body;

    if (!channelId) {
        return res.status(400).json({ error: 'channelId é obrigatório' });
    }

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Canal não encontrado' });
        }

        const messageData = await generateNodeWarMessage();
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

export default router;
