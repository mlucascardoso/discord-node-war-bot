import { sql } from '@vercel/postgres';

export const getAllNodewarSessions = async () => {
    const result = await sql`
        SELECT *
        FROM nodewar_sessions
    `;
    return result.rows;
};

export const getActiveNodewarSession = async () => {
    const result = await sql`
        SELECT *
        FROM nodewar_sessions
        WHERE is_active = true
    `;
    return result.rows[0];
};

export const getActiveNodewarSessionWithParticipants = async () => {
    const result = await sql`
        SELECT
            t1.id as id,
            t1.nodewar_config_id as nodewar_config_id,
            t1.schedule as schedule,
            t1.is_active as is_active,
            t1.created_at as created_at,
            t3.name as template_name,
            t3.informative_text as informative_text,
            t2.nodewar_type_id,
            t2.bomber_slots,
            t2.frontline_slots,
            t2.ranged_slots,
            t2.shai_slots,
            t2.pa_slots,
            t2.flag_slots,
            t2.defense_slots,
            t2.caller_slots,
            t2.elephant_slots,
            t2.waitlist,
            t2.total_slots
        FROM nodewar_sessions t1
        INNER JOIN nodewar_configs t2 ON t1.nodewar_config_id = t2.id
        INNER JOIN nodewar_types t3 ON t2.nodewar_type_id = t3.id
        WHERE t1.is_active = true
    `;
    return result.rows[0];
};

export const getNodeWarMembersBySessionId = async (sessionId) => {
    const result = await sql`
        SELECT
            t1.nodewar_session_id as session_id,
            t2.family_name as member_family_name,
            t2.gearscore as member_gearscore,
            t4.name as class_name,
            t5.profile as class_profile_name,
            t3.name as role_name
        FROM nodewar_session_member_role t1
        INNER JOIN members t2 ON t1.member_id = t2.id
        INNER JOIN roles t3 ON t1.role_id = t3.id
        INNER JOIN classes t4 ON t2.class_id = t4.id
        INNER JOIN class_profiles t5 ON t2.class_profile_id = t5.id
        WHERE t1.nodewar_session_id = ${sessionId}
    `;
    return result.rows;
};

export const createNodewarSession = async (session) => {
    const result = await sql`
        INSERT INTO nodewar_sessions (nodewar_config_id, schedule, is_active)
        VALUES (${session.nodewar_config_id}, ${session.schedule}, ${session.is_active})
        RETURNING *
    `;
    return result.rows[0];
};

export const closeNodewarSession = async () => {
    const result = await sql`
        UPDATE nodewar_sessions
        SET is_active = false
        WHERE is_active = true
        RETURNING *
    `;
    return result.rows[0];
};

// ==================== DISCORD INTEGRATION FUNCTIONS ====================

/**
 * 1. Busca member e suas roles por family_name
 * @param {string} familyName - Nome da família do membro
 * @returns {Object} Member com suas roles
 */
export const getMemberRolesByFamilyName = async (familyName) => {
    const result = await sql`
        SELECT 
            m.id as member_id,
            m.family_name,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', r.id,
                        'name', r.name,
                        'emoji', r.emoji
                    )
                ) FILTER (WHERE r.id IS NOT NULL),
                '[]'::json
            ) as roles
        FROM members m
        LEFT JOIN member_roles mr ON m.id = mr.member_id
        LEFT JOIN roles r ON mr.role_id = r.id
        WHERE m.family_name = ${familyName} AND m.is_active = true
        GROUP BY m.id, m.family_name
    `;

    const member = result.rows[0];
    if (!member) {
        throw new Error(`❌ Membro "${familyName}" não encontrado no sistema`);
    }

    // Se não tem roles, adiciona FRONTLINE por padrão
    if (!member.roles || member.roles.length === 0) {
        const frontlineRole = await sql`SELECT id, name, emoji FROM roles WHERE name = 'FRONTLINE'`;
        member.roles = frontlineRole.rows;
    }

    return member;
};

/**
 * 2a. Busca configuração da sessão
 */
const getSessionConfig = async (sessionId) => {
    const result = await sql`
        SELECT 
            nc.bomber_slots, nc.frontline_slots, nc.ranged_slots, nc.shai_slots,
            nc.pa_slots, nc.flag_slots, nc.defense_slots, nc.caller_slots,
            nc.elephant_slots, nc.total_slots
        FROM nodewar_sessions ns
        INNER JOIN nodewar_configs nc ON ns.nodewar_config_id = nc.id
        WHERE ns.id = ${sessionId}
    `;

    if (!result.rows[0]) {
        throw new Error(`❌ Sessão ${sessionId} não encontrada`);
    }

    return result.rows[0];
};

/**
 * 2b. Conta participantes atuais por role
 */
const getCurrentParticipantCounts = async (sessionId) => {
    const result = await sql`
        SELECT r.name as role_name, COUNT(*) as current_count
        FROM nodewar_session_member_role nsmr
        INNER JOIN roles r ON nsmr.role_id = r.id
        WHERE nsmr.nodewar_session_id = ${sessionId}
        GROUP BY r.name
    `;

    const counts = {};
    result.rows.forEach((row) => {
        counts[row.role_name] = parseInt(row.current_count);
    });

    return counts;
};

/**
 * 2. Busca slots disponíveis por role na sessão ativa
 * @param {number} sessionId - ID da sessão
 * @returns {Object} Slots disponíveis por role
 */
export const getAvailableSlotsBySession = async (sessionId) => {
    const config = await getSessionConfig(sessionId);
    const participantCounts = await getCurrentParticipantCounts(sessionId);

    return {
        BOMBER: Math.max(0, config.bomber_slots - (participantCounts.BOMBER || 0)),
        FRONTLINE: Math.max(0, config.frontline_slots - (participantCounts.FRONTLINE || 0)),
        RANGED: Math.max(0, config.ranged_slots - (participantCounts.RANGED || 0)),
        SHAI: Math.max(0, config.shai_slots - (participantCounts.SHAI || 0)),
        PA: Math.max(0, config.pa_slots - (participantCounts.PA || 0)),
        BANDEIRA: Math.max(0, config.flag_slots - (participantCounts.BANDEIRA || 0)),
        DEFENSE: Math.max(0, config.defense_slots - (participantCounts.DEFENSE || 0)),
        CALLER: Math.max(0, config.caller_slots - (participantCounts.CALLER || 0)),
        ELEFANTE: Math.max(0, config.elephant_slots - (participantCounts.ELEFANTE || 0)),
        HWACHA: Math.max(0, config.ranged_slots - (participantCounts.HWACHA || 0)),
        FLAME: Math.max(0, config.bomber_slots - (participantCounts.FLAME || 0)),
        waitlist: 9999
    };
};

/**
 * 3a. Mapeamento de prioridade das roles
 */
const ROLE_PRIORITY_MAPPING = [
    { nodeWarRole: 'CALLER', condition: (roles) => roles.some((r) => r.name === 'CALLER') },
    { nodeWarRole: 'FLAME', condition: (roles) => roles.some((r) => r.name === 'FLAME') },
    { nodeWarRole: 'HWACHA', condition: (roles) => roles.some((r) => r.name === 'HWACHA') },
    { nodeWarRole: 'ELEFANTE', condition: (roles) => roles.some((r) => r.name === 'ELEFANTE') },
    { nodeWarRole: 'BANDEIRA', condition: (roles) => roles.some((r) => r.name === 'BANDEIRA') },
    { nodeWarRole: 'BOMBER', condition: (roles) => roles.some((r) => r.name === 'BOMBER') },
    { nodeWarRole: 'SHAI', condition: (roles) => roles.some((r) => r.name === 'SHAI') },
    { nodeWarRole: 'RANGED', condition: (roles) => roles.some((r) => r.name === 'RANGED') },
    { nodeWarRole: 'FRONTLINE', condition: () => true }
];

/**
 * 3b. Busca dados da role no banco
 */
const getRoleData = async (roleName) => {
    const result = await sql`SELECT id, name, emoji FROM roles WHERE name = ${roleName}`;
    return result.rows[0];
};

/**
 * 3. Determina qual role o membro deve receber baseado na prioridade
 * @param {Array} memberRoles - Roles do membro
 * @param {Object} availableSlots - Slots disponíveis
 * @returns {Object|null} Role escolhida ou null
 */
export const determineNodeWarRole = async (memberRoles, availableSlots) => {
    // Encontra primeira role disponível com slots
    for (const mapping of ROLE_PRIORITY_MAPPING) {
        if (mapping.condition(memberRoles) && availableSlots[mapping.nodeWarRole] > 0) {
            return await getRoleData(mapping.nodeWarRole);
        }
    }

    // Se não encontrou nenhuma, vai para waitlist
    return await getRoleData('waitlist');
};

/**
 * 4. Adiciona membro à sessão com determinação automática de role
 * @param {number} sessionId - ID da sessão
 * @param {string} familyName - Nome da família do membro
 * @returns {Object} Resultado da operação
 */
export const addMemberToSession = async (sessionId, familyName) => {
    try {
        // 1. Remove participação anterior se existir
        await sql`
            DELETE FROM nodewar_session_member_role 
            WHERE nodewar_session_id = ${sessionId} 
            AND member_id = (SELECT id FROM members WHERE family_name = ${familyName})
        `;

        // 2. Busca member e suas roles
        const member = await getMemberRolesByFamilyName(familyName);

        // 3. Busca slots disponíveis
        const availableSlots = await getAvailableSlotsBySession(sessionId);

        // 4. Determina role
        const assignedRole = await determineNodeWarRole(member.roles, availableSlots);

        // 5. Insere participação
        await sql`
            INSERT INTO nodewar_session_member_role (nodewar_session_id, member_id, role_id)
            VALUES (${sessionId}, ${member.member_id}, ${assignedRole.id})
        `;

        return {
            success: true,
            memberName: familyName,
            roleName: assignedRole.name,
            roleEmoji: assignedRole.emoji,
            isWaitlist: assignedRole.name === 'waitlist'
        };
    } catch (error) {
        console.error(`❌ Erro ao adicionar ${familyName}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * 5. Remove membro da sessão
 * @param {number} sessionId - ID da sessão
 * @param {string} familyName - Nome da família do membro
 * @returns {Object} Resultado da operação
 */
export const removeMemberFromSession = async (sessionId, familyName) => {
    try {
        const result = await sql`
            DELETE FROM nodewar_session_member_role 
            WHERE nodewar_session_id = ${sessionId} 
            AND member_id = (SELECT id FROM members WHERE family_name = ${familyName})
            RETURNING *
        `;

        if (result.rows.length === 0) {
            return {
                success: false,
                error: `❌ ${familyName} não estava participando desta sessão`
            };
        }

        return {
            success: true,
            memberName: familyName,
            message: `✅ ${familyName} foi removido da NodeWar`
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};
