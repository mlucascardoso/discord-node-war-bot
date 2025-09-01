import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

dotenv.config();

const client = new Client({
    intents: Object.values(GatewayIntentBits)
});

client.once('ready', () => {
    console.log('Olá mundo! Bot está online!');
    console.log(`Logado como ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().includes('olá') || message.content.toLowerCase().includes('ola')) {
        message.reply('Olá mundo! 🌍');
    }
});

client.login(process.env.DISCORD_TOKEN);
