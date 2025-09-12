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
        const messageData = await generateNodeWarMessage();
        const buttons = createNodeWarButtons();
        await interaction.reply({ ...messageData, components: buttons });
    }
}

const handleNodeWarParticipate = async (interaction) => {
    if (interaction.replied || interaction.deferred) {
        console.warn('Interação já processada');
        return;
    }

    const userName = interaction.member.displayName || interaction.user.username;

    try {
        await interaction.deferUpdate();

        // Tenta atribuir usuário à NodeWar usando banco de dados
        const result = await assignUserToNodeWar(userName);

        if (result.success) {
            console.log(`✅ ${userName} foi atribuído à role ${result.role} ${result.roleEmoji}`);
            if (result.waitlisted) {
                console.log(`⏳ ${userName} foi adicionado à lista de espera`);
            }
        } else {
            console.error(`❌ Erro ao atribuir ${userName}: ${result.error}`);
        }

        // Atualiza a mensagem com dados atualizados do banco
        const updatedMessageData = await generateNodeWarMessage();
        const updatedButtons = createNodeWarButtons();
        await interaction.editReply({ ...updatedMessageData, components: updatedButtons });
    } catch (error) {
        console.error('Erro nodewar:', error.code || error.message);

        // Tenta responder com erro se ainda não respondeu
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Erro ao processar participação. Tente novamente.',
                    ephemeral: true
                });
            }
        } catch (replyError) {
            console.error('Erro ao responder com erro:', replyError);
        }
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
