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

// Handler para interações (comandos e botões)
client.on('interactionCreate', async (interaction) => {
    // Handler para comandos slash
    if (interaction.isChatInputCommand()) {
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

    // Handler para botões da Node War
    if (interaction.isButton() && interaction.customId.startsWith('nodewar_')) {
        const roleName = interaction.customId.replace('nodewar_', '').toUpperCase();
        const userName = interaction.user.displayName || interaction.user.username;
        const role = NODE_WAR_CONFIG.roles[roleName];

        if (!role) {
            await interaction.reply({ content: '💀 Função mística não encontrada!', ephemeral: true });
            return;
        }

        // Verificar se o usuário já está inscrito em alguma função
        let userCurrentRole = null;
        Object.keys(NODE_WAR_CONFIG.roles).forEach((roleKey) => {
            const roleData = NODE_WAR_CONFIG.roles[roleKey];
            if (roleData.members.includes(userName)) {
                userCurrentRole = roleKey;
            }
        });

        // Se o usuário já está na mesma função, remover
        if (userCurrentRole === roleName) {
            role.members = role.members.filter((member) => member !== userName);

            await interaction.reply({ content: `👻 Espírito removido da função **${roleName}**! Até a próxima batalha.`, ephemeral: true });
        } else {
            // Remover de função anterior se existir
            if (userCurrentRole) {
                NODE_WAR_CONFIG.roles[userCurrentRole].members = NODE_WAR_CONFIG.roles[userCurrentRole].members.filter((member) => member !== userName);
            }

            // Verificar se há vaga na função
            if (role.members.length < role.max) {
                role.members.push(userName);

                await interaction.reply({ content: `🔮 Espírito invocado com sucesso! Você foi aceito na função **${role.emoji} ${roleName}**!`, ephemeral: true });
            } else {
                // Adicionar à waitlist
                if (!role.waitlist.includes(userName)) {
                    role.waitlist.push(userName);
                }

                await interaction.reply({ content: `🌙 Função **${roleName}** lotada! Seu espírito foi adicionado à lista de espera.`, ephemeral: true });
            }
        }

        const updatedMessageData = generateNodeWarMessage();
        const updatedButtons = createNodeWarButtons();
        await interaction.message.edit({ ...updatedMessageData, components: updatedButtons });
    }
});

export async function initializeBot() {
    await client.login(process.env.DISCORD_TOKEN);
    return client;
}

export { client };
