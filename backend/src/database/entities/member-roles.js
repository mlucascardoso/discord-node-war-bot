import { sql } from '../connection.js';

/**
 * Busca todas as roles de um membro
 * @param {number} memberId - ID do membro
 * @returns {Array} Lista de roles do membro
 */
export const getMemberRoles = async (memberId) => {
    const result = await sql`
        SELECT r.id, r.name, r.emoji
        FROM member_roles mr
        INNER JOIN roles r ON mr.role_id = r.id
        WHERE mr.member_id = ${memberId}
        ORDER BY r.name
    `;
    return result.rows;
};

/**
 * Adiciona uma role a um membro
 * @param {number} memberId - ID do membro
 * @param {number} roleId - ID da role
 * @returns {Object} Resultado da operação
 */
export const addMemberRole = async (memberId, roleId) => {
    try {
        // Verifica se a associação já existe
        const existing = await sql`
            SELECT id FROM member_roles 
            WHERE member_id = ${memberId} AND role_id = ${roleId}
        `;

        if (existing.rows.length > 0) {
            return { success: false, error: 'Membro já possui esta role' };
        }

        await sql`
            INSERT INTO member_roles (member_id, role_id)
            VALUES (${memberId}, ${roleId})
        `;

        return { success: true, message: 'Role adicionada com sucesso' };
    } catch (error) {
        console.error('Erro ao adicionar role ao membro:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Remove uma role de um membro
 * @param {number} memberId - ID do membro
 * @param {number} roleId - ID da role
 * @returns {Object} Resultado da operação
 */
export const removeMemberRole = async (memberId, roleId) => {
    try {
        const result = await sql`
            DELETE FROM member_roles 
            WHERE member_id = ${memberId} AND role_id = ${roleId}
        `;

        if (result.rowCount === 0) {
            return { success: false, error: 'Associação não encontrada' };
        }

        return { success: true, message: 'Role removida com sucesso' };
    } catch (error) {
        console.error('Erro ao remover role do membro:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Atualiza todas as roles de um membro (substitui as existentes)
 * @param {number} memberId - ID do membro
 * @param {Array} roleIds - Array com IDs das roles
 * @returns {Object} Resultado da operação
 */
export const updateMemberRoles = async (memberId, roleIds) => {
    try {
        // Remove todas as roles existentes
        await sql`DELETE FROM member_roles WHERE member_id = ${memberId}`;

        // Adiciona as novas roles
        if (roleIds && roleIds.length > 0) {
            for (const roleId of roleIds) {
                await sql`INSERT INTO member_roles (member_id, role_id) VALUES (${memberId}, ${roleId})`;
            }
        }

        return { success: true, message: 'Roles atualizadas com sucesso' };
    } catch (error) {
        console.error('Erro ao atualizar roles do membro:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Verifica se um membro tem uma role específica
 * @param {number} memberId - ID do membro
 * @param {number} roleId - ID da role
 * @returns {boolean} True se o membro tem a role
 */
export const memberHasRole = async (memberId, roleId) => {
    const result = await sql`
        SELECT id FROM member_roles 
        WHERE member_id = ${memberId} AND role_id = ${roleId}
    `;
    return result.rows.length > 0;
};
