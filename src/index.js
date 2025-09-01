import dotenv from 'dotenv';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';

dotenv.config();

const client = new Client({
    intents: Object.values(GatewayIntentBits)
});

// Configurações do Node War
const NODE_WAR_CONFIG = {
    totalVagas: 40,
    tier: 2,
    roles: {
        BOMBER: { emoji: '💥', max: 4, members: [], waitlist: [] },
        RANGED: { emoji: '🏹', max: 4, members: [], waitlist: [] },
        PA: { emoji: '🧙‍♂️', max: 3, members: [], waitlist: [] },
        DEFESA: { emoji: '🔥', max: 3, members: [], waitlist: [] },
        FRONTLINE: { emoji: '⚔️', max: 6, members: [], waitlist: [] },
        'DO-SA': { emoji: '🚬', max: 4, members: [], waitlist: [] },
        BLOCO: { emoji: '🧱', max: 3, members: [], waitlist: [] },
        ELEFANTE: { emoji: '🐘', max: 1, members: [], waitlist: [] },
        STRIKER: { emoji: '🥊', max: 4, members: [], waitlist: [] },
        SHAI: { emoji: '🥁', max: 4, members: [], waitlist: [] },
        CALLER: { emoji: '🎙️', max: 3, members: [], waitlist: [] },
        BANDEIRA: { emoji: '🚩', max: 1, members: [], waitlist: [] }
    }
};

// Função para calcular a próxima data da Node War (pular sábados)
function getNextNodeWarDate() {
    const now = new Date();
    let nextDate = new Date(now);
    nextDate.setDate(now.getDate() + 1);
    nextDate.setHours(21, 0, 0, 0);

    // Se for sábado (6), pular para domingo
    if (nextDate.getDay() === 6) {
        nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate;
}

// Função para formatar a data em português
function formatDateToPT(date) {
    const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
}

// Função para gerar a mensagem da Node War usando Embed
function generateNodeWarMessage() {
    const nextDate = getNextNodeWarDate();
    const formattedDate = formatDateToPT(nextDate);

    // Criar embed principal
    const embed = new EmbedBuilder()
        .setTitle('NODE WAR')
        .setDescription(
            `🏰 **NODE TIER ${NODE_WAR_CONFIG.tier} — ${NODE_WAR_CONFIG.totalVagas} VAGAS**\n\n` +
                '✅ **CANAIS PARA CONFIRMAR SUA PARTICIPAÇÃO**\n' +
                '(Mediah 1 / Valencia 1)\n\n' +
                '⏰ O servidor onde acontecerá a guerra será anunciado às 20:45\n' +
                '➡️ Todos os membros devem estar presentes no Discord até esse horário.\n' +
                '🔁 Atenção: A partir das 20:00 está liberado o roubo de vaga.\n\n' +
                '**Time**\n' +
                `⏰ **Data/hora da node war:** ${formattedDate} 21:00 - 22:00\n`
        )
        .setColor('#ff6b35');

    // Organizar funções em 3 colunas usando campos inline
    const roleKeys = Object.keys(NODE_WAR_CONFIG.roles);
    const columns = [[], [], []];

    roleKeys.forEach((role, index) => {
        columns[index % 3].push(role);
    });

    // Adicionar campos para cada função (3 por linha com inline)
    const maxRows = Math.max(...columns.map((col) => col.length));

    for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < 3; col++) {
            if (columns[col][row]) {
                const roleName = columns[col][row];
                const role = NODE_WAR_CONFIG.roles[roleName];
                const currentCount = role.members.length;
                const maxCount = role.max;

                let fieldValue = `🔒@${role.emoji} ${roleName}\n`;

                if (role.members.length > 0) {
                    role.members.forEach((member) => {
                        fieldValue += `👻 ${member}\n`;
                    });
                } else {
                    fieldValue += '-\n';
                }

                embed.addFields({
                    name: `${role.emoji} ${roleName} (${currentCount}/${maxCount})`,
                    value: fieldValue,
                    inline: true
                });
            } else {
                // Campo vazio para manter alinhamento
                embed.addFields({
                    name: '\u200b',
                    value: '\u200b',
                    inline: true
                });
            }
        }
    }

    // Adicionar waitlist se houver pessoas esperando
    const waitlistMembers = [];
    Object.keys(NODE_WAR_CONFIG.roles).forEach((roleName) => {
        const role = NODE_WAR_CONFIG.roles[roleName];
        role.waitlist.forEach((member) => {
            waitlistMembers.push(`${role.emoji} ${member}`);
        });
    });

    if (waitlistMembers.length > 0) {
        let waitlistText = '';
        waitlistMembers.forEach((member) => {
            waitlistText += `⏳ ${member}\n`;
        });

        embed.addFields({
            name: '**Waitlist**',
            value: waitlistText,
            inline: false
        });
    }

    return { embeds: [embed] };
}

// Função para criar botões de inscrição
function createNodeWarButtons() {
    const rows = [];
    const roleKeys = Object.keys(NODE_WAR_CONFIG.roles);

    // Criar botões em grupos de 5 (máximo por linha)
    for (let i = 0; i < roleKeys.length; i += 5) {
        const row = new ActionRowBuilder();
        const slice = roleKeys.slice(i, i + 5);

        slice.forEach((roleName) => {
            const role = NODE_WAR_CONFIG.roles[roleName];
            row.addComponents(new ButtonBuilder().setCustomId(`nodewar_${roleName.toLowerCase()}`).setLabel(`${role.emoji} ${roleName}`).setStyle(ButtonStyle.Secondary));
        });

        rows.push(row);
    }

    return rows;
}

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

    await client.application.commands.create({
        name: 'nodewar',
        description: 'Posta a agenda da Node War'
    });

    console.log('Comandos /ping, /saudacao, /soma e /nodewar registrados!');

    // Para testes: postar agenda automaticamente quando o bot iniciar
    // Remova este código quando não precisar mais dos testes
    setTimeout(async () => {
        const channels = client.channels.cache.filter(
            (channel) =>
                channel.type === 0 && // TEXT channel
                channel.permissionsFor(client.user).has('SendMessages')
        );

        if (channels.size > 0) {
            const channel = channels.first();
            const messageData = generateNodeWarMessage();
            const buttons = createNodeWarButtons();

            try {
                await channel.send({
                    ...messageData,
                    components: buttons
                });
                console.log(`📅 Agenda Node War postada automaticamente no canal: ${channel.name}`);
            } catch (error) {
                console.log('❌ Erro ao postar agenda automaticamente:', error.message);
            }
        }
    }, 3000); // Aguarda 3 segundos após o bot estar pronto
});

// Evento para responder a mensagens
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().includes('olá') || message.content.toLowerCase().includes('ola')) {
        message.reply('Olá mundo! 🌍');
    }
});

// Handler para interações (comandos e botões)
client.on('interactionCreate', async (interaction) => {
    // Handler para comandos slash
    if (interaction.isChatInputCommand()) {
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

        if (interaction.commandName === 'nodewar') {
            const messageData = generateNodeWarMessage();
            const buttons = createNodeWarButtons();

            await interaction.reply({
                ...messageData,
                components: buttons
            });
        }
    }

    // Handler para botões da Node War
    if (interaction.isButton() && interaction.customId.startsWith('nodewar_')) {
        const roleName = interaction.customId.replace('nodewar_', '').toUpperCase();
        const userName = interaction.user.displayName || interaction.user.username;
        const role = NODE_WAR_CONFIG.roles[roleName];

        if (!role) {
            await interaction.reply({
                content: '❌ Função não encontrada!',
                ephemeral: true
            });
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

            await interaction.reply({
                content: `❌ Você foi removido da função **${roleName}**!`,
                ephemeral: true
            });
        } else {
            // Remover de função anterior se existir
            if (userCurrentRole) {
                NODE_WAR_CONFIG.roles[userCurrentRole].members = NODE_WAR_CONFIG.roles[userCurrentRole].members.filter((member) => member !== userName);
            }

            // Verificar se há vaga na função
            if (role.members.length < role.max) {
                role.members.push(userName);

                await interaction.reply({
                    content: `✅ Você foi inscrito na função **${role.emoji} ${roleName}**!`,
                    ephemeral: true
                });
            } else {
                // Adicionar à waitlist
                if (!role.waitlist.includes(userName)) {
                    role.waitlist.push(userName);
                }

                await interaction.reply({
                    content: `⏳ Função **${roleName}** lotada! Você foi adicionado à waitlist.`,
                    ephemeral: true
                });
            }
        }

        // Atualizar a mensagem original
        const updatedMessageData = generateNodeWarMessage();
        const updatedButtons = createNodeWarButtons();

        await interaction.message.edit({
            ...updatedMessageData,
            components: updatedButtons
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
