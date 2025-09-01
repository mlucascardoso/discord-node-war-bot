import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

dotenv.config();

const client = new Client({
    intents: Object.values(GatewayIntentBits)
});

// Evento quando o bot está pronto
client.once('ready', async () => {
    console.log('Olá mundo! Bot está online!');
    console.log(`Logado como ${client.user.tag}!`);

    // Registra os comandos slash globalmente
    await client.application.commands.create({
        name: 'ping',
        description: 'Responde com Pong!'
    });

    await client.application.commands.create({
        name: 'saudacao',
        description: 'Saúda o usuário'
    });

    console.log('Comandos /ping e /saudacao registrados!');
});

// Evento para responder a mensagens
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().includes('olá') || message.content.toLowerCase().includes('ola')) {
        message.reply('Olá mundo! 🌍');
    }
});

// Handler para comandos slash
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        const ping = client.ws.ping;
        await interaction.reply(`🏓 Pong! Latência: ${ping}ms`);
    }

    if (interaction.commandName === 'saudacao') {
        await interaction.reply(`👋 Olá ${interaction.user}!`);
    }
});

client.login(process.env.DISCORD_TOKEN);
