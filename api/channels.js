import { client, initializeBot } from '../backend/src/discord.js';

let botInitialized = false;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
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

    const channels = client.channels.cache
        .filter((channel) => channel.type === 0)
        .map((channel) => ({
            id: channel.id,
            name: channel.name,
            guildName: channel.guild?.name || 'DM'
        }));

    res.json({ channels });
}
