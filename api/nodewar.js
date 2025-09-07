import { client, initializeBot } from '../backend/src/discord/client.js';
import { createNodeWarButtons, generateNodeWarMessage } from '../backend/src/discord/commands/node-war.js';

let botInitialized = false;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
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
        res.json({ success: true, message: 'Comando nodewar executado com sucesso', messageId: message.id, channelId: channel.id });
    } catch (error) {
        console.error('Erro ao executar comando nodewar:', error);
        res.status(500).json({ error: 'Erro ao executar comando' });
    }
}
