import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

import { NODE_WAR_CONFIG, createNodeWarButtons, generateNodeWarMessage } from './commands/node-war.js';

dotenv.config();

const client = new Client({
    intents: Object.values(GatewayIntentBits)
});

client.once('clientReady', async () => {
    console.log('Olá mundo! Bot está online!');
    console.log(`Logado como ${client.user.tag}!`);

    await client.application.commands.create({
        name: 'nodewar',
        description: 'Posta a agenda da Node War'
    });

    console.log('Comandos /nodewar registrados!');
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
    }

    // Handler para botões da Node War
    if (interaction.isButton() && interaction.customId.startsWith('nodewar_')) {
        const roleName = interaction.customId.replace('nodewar_', '').toUpperCase();
        const userName = interaction.user.displayName || interaction.user.username;
        const role = NODE_WAR_CONFIG.roles[roleName];

        if (!role) {
            await interaction.reply({ content: '❌ Função não encontrada!', ephemeral: true });
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

            await interaction.reply({ content: `❌ Você foi removido da função **${roleName}**!`, ephemeral: true });
        } else {
            // Remover de função anterior se existir
            if (userCurrentRole) {
                NODE_WAR_CONFIG.roles[userCurrentRole].members = NODE_WAR_CONFIG.roles[userCurrentRole].members.filter((member) => member !== userName);
            }

            // Verificar se há vaga na função
            if (role.members.length < role.max) {
                role.members.push(userName);

                await interaction.reply({ content: `✅ Você foi inscrito na função **${role.emoji} ${roleName}**!`, ephemeral: true });
            } else {
                // Adicionar à waitlist
                if (!role.waitlist.includes(userName)) {
                    role.waitlist.push(userName);
                }

                await interaction.reply({ content: `⏳ Função **${roleName}** lotada! Você foi adicionado à waitlist.`, ephemeral: true });
            }
        }

        const updatedMessageData = generateNodeWarMessage();
        const updatedButtons = createNodeWarButtons();
        await interaction.message.edit({ ...updatedMessageData, components: updatedButtons });
    }
});

let botStarted = false;

async function startBot() {
    if (!botStarted) {
        botStarted = true;
        await client.login(process.env.DISCORD_TOKEN);
    }
}

if (process.env.NODE_ENV !== 'production') {
    startBot();
}

export default async function handler(req, res) {
    await startBot();

    res.status(200).json({
        status: 'Bot is running',
        timestamp: new Date().toISOString(),
        botReady: client.isReady()
    });
}
