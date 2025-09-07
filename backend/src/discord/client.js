import dotenv from 'dotenv';
import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';

import { NODE_WAR_CONFIG, createNodeWarButtons, generateNodeWarMessage } from './commands/node-war.js';

dotenv.config();

const client = new Client({
    intents: Object.values(GatewayIntentBits)
});

client.once('clientReady', async () => {
    console.log('👻 Espírito Banshee despertou! Bot está online!');
    console.log(`🌙 Conectado como ${client.user.tag} - Guardião da Guilda Banshee`);

    await client.application.commands.create({
        name: 'nodewar',
        description: '🔮 Invoca a agenda da Batalha Mística da Banshee'
    });

    await client.application.commands.create({
        name: 'banshee',
        description: '👻 Informações sobre a Guilda Banshee'
    });

    console.log('⚔️ Comandos místicos registrados com sucesso!');
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
});

// Handler para comandos slash
async function handleSlashCommand(interaction) {
    if (interaction.commandName === 'nodewar') {
        const messageData = generateNodeWarMessage();
        const buttons = createNodeWarButtons();
        await interaction.reply({ ...messageData, components: buttons });
    }

    if (interaction.commandName === 'banshee') {
        const embed = new EmbedBuilder()
            .setTitle('👻 GUILDA BANSHEE')
            .setDescription(
                '🌟 *"Onde as almas perdidas encontram seu destino"*\n\n' +
                    '**Sobre a Banshee:**\n' +
                    '🔮 Somos uma guilda mística dedicada às batalhas épicas\n' +
                    '⚔️ Focamos em estratégias devastadoras e união inquebrantável\n' +
                    '👻 Cada membro é um espírito guerreiro valioso\n\n' +
                    '**Nossos Valores:**\n' +
                    '💀 **Força Mística** - Poder através da união\n' +
                    '🌙 **Estratégia** - Planejamento e execução perfeita\n' +
                    '⚡ **Lealdade** - Nunca abandonamos um companheiro\n\n' +
                    '**Comandos Disponíveis:**\n' +
                    '`/nodewar` - Invocar agenda de batalha\n' +
                    '`/banshee` - Informações da guilda'
            )
            .setColor('#8B5CF6')
            .setFooter({ text: 'Bot Banshee v1.0 - Guardião Místico' });

        await interaction.reply({ embeds: [embed] });
    }
}

// Função auxiliar para encontrar role atual do usuário
function findUserCurrentRole(userName) {
    return Object.keys(NODE_WAR_CONFIG.roles).find((roleKey) => {
        return NODE_WAR_CONFIG.roles[roleKey].members.includes(userName);
    });
}

// Função auxiliar para processar inscrição/remoção de role
async function processRoleAction(interaction, role, roleName, userName, userCurrentRole) {
    if (userCurrentRole === roleName) {
        role.members = role.members.filter((member) => member !== userName);
        await interaction.editReply({ content: `👻 Espírito removido da função **${roleName}**! Até a próxima batalha.` });
    } else {
        if (userCurrentRole) {
            NODE_WAR_CONFIG.roles[userCurrentRole].members = NODE_WAR_CONFIG.roles[userCurrentRole].members.filter((member) => member !== userName);
        }

        if (role.members.length < role.max) {
            role.members.push(userName);
            await interaction.editReply({ content: `🔮 Espírito invocado com sucesso! Você foi aceito na função **${role.emoji} ${roleName}**!` });
        } else {
            if (!role.waitlist.includes(userName)) {
                role.waitlist.push(userName);
            }
            await interaction.editReply({ content: `🌙 Função **${roleName}** lotada! Seu espírito foi adicionado à lista de espera.` });
        }
    }
}

// Handler para botões da Node War
async function handleNodeWarButton(interaction) {
    if (interaction.replied || interaction.deferred) {
        console.warn('Interação já foi respondida ou deferida');
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const roleName = interaction.customId.replace('nodewar_', '').toUpperCase();
    console.log(`Botão clicado: ${interaction.customId}, Role processado: ${roleName}`);
    const userName = interaction.user.displayName || interaction.user.username;
    const role = NODE_WAR_CONFIG.roles[roleName];

    if (!role) {
        console.error(`Role não encontrado: ${roleName}. Roles disponíveis:`, Object.keys(NODE_WAR_CONFIG.roles));
        await interaction.editReply({ content: '💀 Função mística não encontrada!' });
        return;
    }

    const userCurrentRole = findUserCurrentRole(userName);
    await processRoleAction(interaction, role, roleName, userName, userCurrentRole);

    try {
        const updatedMessageData = generateNodeWarMessage();
        const updatedButtons = createNodeWarButtons();
        await interaction.message.edit({ ...updatedMessageData, components: updatedButtons });
    } catch (editError) {
        console.error('Erro ao atualizar mensagem:', editError);
    }
}

// Handler para interações (comandos e botões)
client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            await handleSlashCommand(interaction);
        } else if (interaction.isButton() && interaction.customId.startsWith('nodewar_')) {
            await handleNodeWarButton(interaction);
        }
    } catch (error) {
        console.error('Erro no handler de interação:', error);

        // Tentar responder com uma mensagem de erro
        try {
            if (interaction.deferred) {
                await interaction.editReply({ content: '💀 Ocorreu um erro místico! Tente novamente em alguns instantes.' });
            } else if (!interaction.replied) {
                await interaction.reply({
                    content: '💀 Ocorreu um erro místico! Tente novamente em alguns instantes.',
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
