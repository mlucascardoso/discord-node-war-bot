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

    await client.application.commands.create({
        name: 'soma',
        description: 'Soma dois números inteiros',
        options: [
            {
                name: 'numero1',
                description: 'Primeiro número',
                type: 4, // INTEGER
                required: true
            },
            {
                name: 'numero2',
                description: 'Segundo número',
                type: 4, // INTEGER
                required: true
            }
        ]
    });

    console.log('Comandos /ping, /saudacao e /soma registrados!');
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

    if (interaction.commandName === 'soma') {
        const numero1 = interaction.options.getInteger('numero1');
        const numero2 = interaction.options.getInteger('numero2');
        const resultado = numero1 + numero2;

        await interaction.reply({
            content: `🧮 A soma de ${numero1} + ${numero2} = **${resultado}**`,
            ephemeral: true // Resposta visível apenas para o usuário que executou o comando
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
