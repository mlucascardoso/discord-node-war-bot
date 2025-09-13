import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { addMemberToActiveSession, getActiveNodewarSession, getNodeWarMembersBySessionId, removeMemberFromActiveSession } from '../../api/nodewar-sessions.js';

// ==================== LEGACY CODE - REMOVIDO ====================
// As configurações agora vêm do banco de dados via sessões ativas

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

// ==================== LEGACY FUNCTIONS - REMOVIDAS ====================
// Funções antigas substituídas pelas funções do banco de dados

export const assignUserToNodeWar = async (userName) => {
    try {
        const result = await addMemberToActiveSession(userName);

        if (result.success) {
            return {
                success: true,
                role: result.roleName,
                roleEmoji: result.roleEmoji,
                waitlisted: result.isWaitlist,
                memberName: result.memberName
            };
        } else {
            return {
                success: false,
                error: result.error
            };
        }
    } catch (error) {
        console.error('Erro ao atribuir usuário à NodeWar:', error);
        return {
            success: false,
            error: 'Erro interno do sistema'
        };
    }
};

export const cancelUserFromNodeWar = async (userName) => {
    try {
        const result = await removeMemberFromActiveSession(userName);

        if (result.success) {
            return {
                success: true,
                memberName: result.memberName,
                message: result.message
            };
        } else {
            return {
                success: false,
                error: result.error
            };
        }
    } catch (error) {
        console.error('Erro ao cancelar participação na NodeWar:', error);
        return {
            success: false,
            error: 'Erro interno do sistema'
        };
    }
};

/**
 * Cria um embed para a node war usando dados do banco
 * @param {Object} sessionData - Dados da sessão ativa
 * @returns {EmbedBuilder} Embed para a node war
 */
const createNodeWarEmbed = (sessionData) => {
    // Se não há sessão ativa, usa dados padrão
    if (!sessionData) {
        const nextDate = getNextNodeWarDate();
        const formattedDate = formatDateToPT(nextDate);

        return new EmbedBuilder()
            .setTitle('👻 NODE WAR BANSHEE')
            .setDescription(
                `
                🏰 **Nenhuma sessão ativa no momento**
                
                ⚠️ **Para criar uma nova NodeWar:**
                1. Acesse o painel web
                2. Crie uma nova sessão
                3. Execute o comando novamente
                
                ⏰ **${formattedDate}** • 21:00 - 22:00
                `
            )
            .setColor('#FF6B6B');
    }

    // Formata data da sessão
    const sessionDate = new Date(sessionData.schedule);
    const formattedDate = formatDateToPT(sessionDate);

    const embed = new EmbedBuilder()
        .setTitle('👻 NODE WAR BANSHEE')
        .setDescription(
            `
                📋 **${sessionData.template_name}**
                ${sessionData.informative_text ? sessionData.informative_text.replace(/\\n/g, '\n') : ''}

                ⏰ **${formattedDate}** • 21:00 - 22:00
            `
        )
        .setColor('#8B5CF6');

    return embed;
};

/**
 * Organiza participantes por role
 */
const organizeParticipantsByRole = (participants) => {
    const roleParticipants = {};
    participants.forEach((participant) => {
        const roleName = participant.role_name;
        if (!roleParticipants[roleName]) {
            roleParticipants[roleName] = [];
        }
        roleParticipants[roleName].push(participant);
    });
    return roleParticipants;
};

/**
 * Cria mapeamento de slots e emojis
 */
const createRoleMappings = (sessionData) => {
    const roleSlots = {
        BOMBER: sessionData.bomber_slots,
        FRONTLINE: sessionData.frontline_slots,
        RANGED: sessionData.ranged_slots,
        SHAI: sessionData.shai_slots,
        PA: sessionData.pa_slots,
        BANDEIRA: sessionData.flag_slots,
        DEFENSE: sessionData.defense_slots,
        CALLER: sessionData.caller_slots,
        ELEFANTE: sessionData.elephant_slots,
        HWACHA: sessionData.ranged_slots,
        FLAME: sessionData.bomber_slots,
        STRIKER: sessionData.striker_slots,
        BLOCO: sessionData.bloco_slots,
        DOSA: sessionData.dosa_slots
    };

    const roleEmojis = {
        CALLER: '🎙️',
        FLAME: '🔥',
        HWACHA: '🏹',
        ELEFANTE: '🐘',
        BANDEIRA: '🚩',
        BOMBER: '💥',
        SHAI: '🥁',
        RANGED: '🏹',
        FRONTLINE: '⚔️',
        PA: '🗡️',
        DEFENSE: '🛡️',
        STRIKER: '🥊',
        BLOCO: '🧱',
        DOSA: '🚬',
        WAITLIST: '⏳'
    };

    return { roleSlots, roleEmojis };
};

/**
 * Adiciona fields das roles ao embed
 */
const addRoleFieldsToEmbed = (embed, roleSlots, roleEmojis, roleParticipants) => {
    const roleNames = Object.keys(roleSlots);
    const columns = [[], [], []];
    roleNames.forEach((role, index) => columns[index % 3].push(role));

    const maxRows = Math.max(...columns.map((col) => col.length));
    for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < 3; col++) {
            if (columns[col][row]) {
                const roleName = columns[col][row];
                const maxSlots = roleSlots[roleName];
                const currentParticipants = roleParticipants[roleName] || [];
                const emoji = roleEmojis[roleName] || '⚡';

                let fieldValue = '';
                if (currentParticipants.length > 0) {
                    currentParticipants.forEach((p) => {
                        fieldValue += `👻 ${p.member_family_name}\n`;
                    });
                }
                if (fieldValue === '') fieldValue = '\u200b';

                embed.addFields({
                    name: `${emoji} ${roleName} (${currentParticipants.length}/${maxSlots})`,
                    value: fieldValue,
                    inline: true
                });
            } else {
                embed.addFields({ name: '\u200b', value: '\u200b', inline: true });
            }
        }
    }
};

export const generateNodeWarMessage = async () => {
    try {
        const sessionData = await getActiveNodewarSession();
        const embed = createNodeWarEmbed(sessionData);

        if (!sessionData) {
            return { embeds: [embed] };
        }

        const participants = await getNodeWarMembersBySessionId(sessionData.id);
        const roleParticipants = organizeParticipantsByRole(participants);
        const { roleSlots, roleEmojis } = createRoleMappings(sessionData);

        addRoleFieldsToEmbed(embed, roleSlots, roleEmojis, roleParticipants);

        // Adiciona waitlist se houver
        const waitlistParticipants = roleParticipants.WAITLIST || [];
        if (waitlistParticipants.length > 0) {
            let waitlistText = '';
            waitlistParticipants.forEach((p) => {
                waitlistText += `⏳ ${p.member_family_name}\n`;
            });
            embed.addFields({ name: '🌙 **Lista de Espera**', value: waitlistText, inline: false });
        }

        return { embeds: [embed] };
    } catch (error) {
        console.error('❌ Erro ao gerar mensagem NodeWar:', error);
        const errorEmbed = new EmbedBuilder().setTitle('❌ Erro ao carregar NodeWar').setDescription('Erro ao buscar dados da sessão. Tente novamente.').setColor('#FF6B6B');
        return { embeds: [errorEmbed] };
    }
};

export const createNodeWarButtons = () => {
    const row = new ActionRowBuilder();
    const participateButton = new ButtonBuilder().setCustomId('nodewar_participate').setLabel('Participar').setStyle(ButtonStyle.Primary);
    const cancelButton = new ButtonBuilder().setCustomId('nodewar_cancel').setLabel('Cancelar Participação').setStyle(ButtonStyle.Danger);

    row.addComponents(participateButton, cancelButton);
    return [row];
};
