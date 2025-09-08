import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export const NODE_WAR_CONFIG = {
    totalVagas: 40,
    tier: 2,
    roles: {
        CALLER: { emoji: '🎙️', max: 1, members: [], waitlist: [] },
        FLAME: { emoji: '🔥', max: 3, members: [], waitlist: [] },
        HWACHA: { emoji: '🏹', max: 4, members: [], waitlist: [] },
        ELEFANTE: { emoji: '🐘', max: 1, members: [], waitlist: [] },
        BANDEIRA: { emoji: '🚩', max: 1, members: [], waitlist: [] },
        BOMBER: { emoji: '💥', max: 0, members: [], waitlist: [] },
        SHAI: { emoji: '🥁', max: 4, members: [], waitlist: [] },
        RANGED: { emoji: '🏹', max: 4, members: [], waitlist: [] },
        FRONTLINE: { emoji: '⚔️', max: 22, members: [], waitlist: [] }
    }
};

const ROLE_PRIORITY_MAPPING = [
    {
        nodeWarRole: 'CALLER',
        discordRoles: ['CALLER'],
        condition: (userRoles) => userRoles.some((role) => role === 'CALLER')
    },
    {
        nodeWarRole: 'FLAME',
        discordRoles: ['FLAME'],
        condition: (userRoles) => userRoles.some((role) => role === 'FLAME')
    },
    {
        nodeWarRole: 'HWACHA',
        discordRoles: ['HWACHA'],
        condition: (userRoles) => userRoles.some((role) => role === 'HWACHA')
    },
    {
        nodeWarRole: 'ELEFANTE',
        discordRoles: ['ELEFANTE'],
        condition: (userRoles) => userRoles.some((role) => role === 'ELEFANTE')
    },
    {
        nodeWarRole: 'BANDEIRA',
        discordRoles: ['BANDEIRA'],
        condition: (userRoles) => userRoles.some((role) => role === 'BANDEIRA')
    },
    {
        nodeWarRole: 'BOMBER',
        discordRoles: ['BOMBER'],
        condition: (userRoles) => userRoles.some((role) => role === 'BOMBER')
    },
    {
        nodeWarRole: 'SHAI',
        discordRoles: ['SHAI'],
        condition: (userRoles) => userRoles.some((role) => role === 'SHAI')
    },
    {
        nodeWarRole: 'RANGED',
        discordRoles: ['RANGED', 'ARQUEIRO', 'CAÇADORA'],
        condition: (userRoles) => userRoles.includes('RANGED') && (userRoles.includes('ARQUEIRO') || userRoles.includes('CAÇADORA'))
    },
    {
        nodeWarRole: 'FRONTLINE',
        discordRoles: ['FRONTLINE'],
        condition: () => true
    }
];

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

const hasRoleSpace = (roleName) => {
    const role = NODE_WAR_CONFIG.roles[roleName];
    return role && role.members.length < role.max;
};

const determineUserRole = (userDiscordRoles) => {
    const userRoleNames = userDiscordRoles.map((role) => role.name.toUpperCase());

    const eligibleRole = ROLE_PRIORITY_MAPPING.find((mapping) => mapping.condition(userRoleNames) && hasRoleSpace(mapping.nodeWarRole));

    return eligibleRole ? eligibleRole.nodeWarRole : null;
};

const addUserToRole = (userName, roleName) => {
    if (!roleName || !NODE_WAR_CONFIG.roles[roleName]) {
        return false;
    }

    const role = NODE_WAR_CONFIG.roles[roleName];

    if (!role.members.includes(userName)) {
        role.members.push(userName);
        return true;
    }

    return false;
};

const addUserToWaitlist = (userName) => {
    const waitlistRole = NODE_WAR_CONFIG.roles.FRONTLINE;
    if (!waitlistRole.waitlist.includes(userName)) {
        waitlistRole.waitlist.push(userName);
        return true;
    }
    return false;
};

const removeUserFromAllRoles = (userName) => {
    Object.values(NODE_WAR_CONFIG.roles).forEach((role) => {
        role.members = role.members.filter((member) => member !== userName);
        role.waitlist = role.waitlist.filter((member) => member !== userName);
    });
};

export const assignUserToNodeWar = (userName, userDiscordRoles) => {
    removeUserFromAllRoles(userName);

    const assignedRole = determineUserRole(userDiscordRoles);

    if (assignedRole) {
        addUserToRole(userName, assignedRole);
        return { success: true, role: assignedRole, waitlisted: false };
    }

    addUserToWaitlist(userName);
    return { success: true, role: null, waitlisted: true };
};

/**
 * Cria um embed para a node war
 * @returns {EmbedBuilder} Embed para a node war
 */
const createNodeWarEmbed = () => {
    const nextDate = getNextNodeWarDate();
    const formattedDate = formatDateToPT(nextDate);

    const embed = new EmbedBuilder()
        .setTitle('👻 NODE WAR BANSHEE')
        .setDescription(
            `
                🏰 **NODE TIER ${NODE_WAR_CONFIG.tier} — ${NODE_WAR_CONFIG.totalVagas} VAGAS**

                🔮 **CANAIS PARA CONFIRMAR SUA PARTICIPAÇÃO**
                *(Mediah 1 / Valencia 1)*

                ⏰ **Servidor anunciado às 20:45**

                👻 Todos os membros devem estar presentes no Discord
                ⚡ **Atenção:** A partir das 20:00 está liberado o roubo de vaga
                ⏰ **${formattedDate}** • 21:00 - 22:00
            `
        )
        .setColor('#8B5CF6');

    return embed;
};

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

                let fieldValue = '';
                if (role.members.length > 0) {
                    role.members.forEach((member) => (fieldValue += `👻 ${member}\n`));
                }
                embed.addFields({ name: `${role.emoji} ${roleName} (${currentCount}/${maxCount})`, value: fieldValue, inline: true });
            } else {
                embed.addFields({ name: '\u200b', value: '\u200b', inline: true });
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
        embed.addFields({ name: '🌙 **Lista de Espera**', value: waitlistText, inline: false });
    }

    return { embeds: [embed] };
};

export const createNodeWarButtons = () => {
    const row = new ActionRowBuilder();
    const participateButton = new ButtonBuilder().setCustomId('nodewar_participate').setLabel('Participar').setStyle(ButtonStyle.Primary);

    row.addComponents(participateButton);
    return [row];
};
