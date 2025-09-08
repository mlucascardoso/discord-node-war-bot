import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

import { NODE_WAR_CONFIG, assignUserToNodeWar, createNodeWarButtons, generateNodeWarMessage } from './commands/node-war.js';

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
    if (interaction.replied || interaction.deferred) {
        console.warn('Interação já foi respondida ou deferida');
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const userName = interaction.member.displayName || interaction.user.username;
    const userDiscordRoles = interaction.member.roles.cache.map((role) => ({ name: role.name }));

    const result = assignUserToNodeWar(userName, userDiscordRoles);

    let responseMessage;
    if (result.waitlisted) {
        responseMessage = '⏳ Você foi adicionado à lista de espera!';
    } else {
        const roleEmoji = NODE_WAR_CONFIG.roles[result.role].emoji;
        responseMessage = `${roleEmoji} Você foi atribuído à função: **${result.role}**!`;
    }

    await interaction.editReply({ content: responseMessage });

    try {
        const updatedMessageData = generateNodeWarMessage();
        const updatedButtons = createNodeWarButtons();
        await interaction.message.edit({ ...updatedMessageData, components: updatedButtons });
    } catch (editError) {
        console.error('Erro ao atualizar mensagem:', editError);
    }
};

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            await handleSlashCommand(interaction);
        } else if (interaction.isButton() && interaction.customId === 'nodewar_participate') {
            await handleNodeWarParticipate(interaction);
        }
    } catch (error) {
        console.error('Erro no handler de interação:', error);

        try {
            if (interaction.deferred) {
                await interaction.editReply({ content: '💀 Ocorreu um erro! Tente novamente em alguns instantes.' });
            } else if (!interaction.replied) {
                await interaction.reply({
                    content: '💀 Ocorreu um erro! Tente novamente em alguns instantes.',
                    ephemeral: true
                });
            }
        } catch (replyError) {
            console.error('Erro ao responder com mensagem de erro:', replyError);
        }
    }
});

export async function initializeBot() {
    await client.login(process.env.DISCORD_TOKEN);
    return client;
}

export { client };
