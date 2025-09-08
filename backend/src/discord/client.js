import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

import { assignUserToNodeWar, createNodeWarButtons, generateNodeWarMessage } from './commands/node-war.js';

dotenv.config();

const client = new Client({
    intents: Object.values(GatewayIntentBits)
});

client.once('clientReady', async () => {
    await client.application.commands.create({ name: 'nodewar', description: '🔮 Invoca a agenda da Batalha Mística da Banshee' });
    console.log('⚔️ Comandos registrados com sucesso!');
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
});

async function handleSlashCommand(interaction) {
    if (interaction.commandName === 'nodewar') {
        const messageData = generateNodeWarMessage();
        const buttons = createNodeWarButtons();
        await interaction.reply({ ...messageData, components: buttons });
    }
}

const handleNodeWarParticipate = async (interaction) => {
    try {
        const userName = interaction.member.displayName || interaction.user.username;
        const userDiscordRoles = interaction.member.roles.cache.map((role) => ({ name: role.name }));

        assignUserToNodeWar(userName, userDiscordRoles);

        await interaction.deferUpdate();

        const updatedMessageData = generateNodeWarMessage();
        const updatedButtons = createNodeWarButtons();
        await interaction.editReply({ ...updatedMessageData, components: updatedButtons });
    } catch (error) {
        console.error('Erro em handleNodeWarParticipate:', error.code || error.message);
    }
};

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            await handleSlashCommand(interaction);
        } else if (interaction.isButton() && interaction.customId === 'nodewar_participate') {
            handleNodeWarParticipate(interaction).catch((err) => {
                console.error('Erro silencioso em nodewar:', err.code || err.message);
            });
        }
    } catch (error) {
        console.error('Erro no handler principal:', error.code || error.message);
    }
});

export async function initializeBot() {
    await client.login(process.env.DISCORD_TOKEN);
    return client;
}

export { client };
