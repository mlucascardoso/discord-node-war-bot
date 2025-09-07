import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export const NODE_WAR_CONFIG = {
    totalVagas: 40,
    tier: 2,
    guildName: '👻 BANSHEE',
    motto: 'Onde as almas perdidas encontram seu destino',
    roles: {
        BOMBER: { emoji: '💀', max: 4, members: [], waitlist: [] },
        RANGED: { emoji: '🏹', max: 4, members: [], waitlist: [] },
        PA: { emoji: '🔮', max: 3, members: [], waitlist: [] },
        DEFESA: { emoji: '🛡️', max: 3, members: [], waitlist: [] },
        FRONTLINE: { emoji: '⚔️', max: 6, members: [], waitlist: [] },
        'DO-SA': { emoji: '🌙', max: 4, members: [], waitlist: [] },
        BLOCO: { emoji: '🧱', max: 3, members: [], waitlist: [] },
        ELEFANTE: { emoji: '🐘', max: 1, members: [], waitlist: [] },
        STRIKER: { emoji: '👻', max: 4, members: [], waitlist: [] },
        SHAI: { emoji: '🥁', max: 4, members: [], waitlist: [] },
        CALLER: { emoji: '📢', max: 3, members: [], waitlist: [] },
        BANDEIRA: { emoji: '🏴‍☠️', max: 1, members: [], waitlist: [] }
    }
};

const getNextNodeWarDate = () => {
    const now = new Date();
    let nextDate = new Date(now);
    nextDate.setDate(now.getDate() + 1);
    nextDate.setHours(21, 0, 0, 0);

    // Se for sábado (6), pular para domingo
    if (nextDate.getDay() === 6) {
        nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate;
};

const formatDateToPT = (date) => {
    const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
};

export const generateNodeWarMessage = () => {
    const nextDate = getNextNodeWarDate();
    const formattedDate = formatDateToPT(nextDate);

    // Criar embed principal com tema Banshee
    const embed = new EmbedBuilder()
        .setTitle(`${NODE_WAR_CONFIG.guildName} - BATALHA MÍSTICA`)
        .setDescription(
            `🌟 *"${NODE_WAR_CONFIG.motto}"*\n\n` +
                `🏰 **NODE TIER ${NODE_WAR_CONFIG.tier} — ${NODE_WAR_CONFIG.totalVagas} ESPÍRITOS GUERREIROS**\n\n` +
                '👻 **CONFIRME SUA PRESENÇA NO REINO DAS SOMBRAS**\n' +
                '(Mediah 1 / Valencia 1)\n\n' +
                '🌙 **Invocação:** O campo de batalha será revelado às 20:45\n' +
                '⚡ Todos os guerreiros místicos devem estar conectados no Discord\n' +
                '🔮 **Atenção:** A partir das 20:00 inicia a competição por vagas\n\n' +
                '**Ritual de Guerra**\n' +
                `🕘 **Horário da Batalha:** ${formattedDate} 21:00 - 22:00\n` +
                '💀 **Prepare suas almas para a guerra!**'
        )
        .setColor('#8B5CF6')
        .setThumbnail('https://i.imgur.com/your-banshee-logo.png'); // Você pode adicionar uma imagem da guilda aqui

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

                let fieldValue = `🔮 ${role.emoji} ${roleName}\n`;

                if (role.members.length > 0) {
                    role.members.forEach((member) => {
                        fieldValue += `👻 ${member}\n`;
                    });
                } else {
                    fieldValue += '🌫️ *Aguardando espíritos...*\n';
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
            waitlistText += `🌙 ${member}\n`;
        });

        embed.addFields({
            name: '🌟 **Espíritos em Espera**',
            value: waitlistText,
            inline: false
        });
    }

    return { embeds: [embed] };
};

export const createNodeWarButtons = () => {
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
};
