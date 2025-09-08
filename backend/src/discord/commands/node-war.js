import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export const NODE_WAR_CONFIG = {
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

/**
 * Cria um embed para a node war
 * @returns {EmbedBuilder} Embed para a node war
 */
const createNodeWarEmbed = () => {
    const nextDate = getNextNodeWarDate();
    const formattedDate = formatDateToPT(nextDate);

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

    return embed;
};

// eslint-disable-next-line max-lines-per-function
export const generateNodeWarMessage = () => {
    const embed = createNodeWarEmbed();
    const roleKeys = Object.keys(NODE_WAR_CONFIG.roles);
    const columns = [[], [], []];

    roleKeys.forEach((role, index) => columns[index % 3].push(role));

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
                embed.addFields({
                    name: '\u200b',
                    value: '\u200b',
                    inline: true
                });
            }
        }
    }

    const waitlistMembers = [];
    Object.keys(NODE_WAR_CONFIG.roles).forEach((roleName) => {
        const role = NODE_WAR_CONFIG.roles[roleName];
        role.waitlist.forEach((member) => waitlistMembers.push(`${role.emoji} ${member}`));
    });

    if (waitlistMembers.length > 0) {
        let waitlistText = '';
        waitlistMembers.forEach((member) => (waitlistText += `⏳ ${member}\n`));
        embed.addFields({ name: '**Waitlist**', value: waitlistText, inline: false });
    }

    return { embeds: [embed] };
};

export const createNodeWarButtons = () => {
    const rows = [];
    const roleKeys = Object.keys(NODE_WAR_CONFIG.roles);

    for (let i = 0; i < roleKeys.length; i += 5) {
        const row = new ActionRowBuilder();
        const slice = roleKeys.slice(i, i + 5);

        slice.forEach((roleName) => {
            const role = NODE_WAR_CONFIG.roles[roleName];
            const button = new ButtonBuilder().setCustomId(`nodewar_${roleName.toLowerCase()}`).setLabel(`${role.emoji} ${roleName}`).setStyle(ButtonStyle.Secondary);
            row.addComponents(button);
        });

        rows.push(row);
    }

    return rows;
};
