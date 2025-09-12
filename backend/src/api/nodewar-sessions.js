import {
    addMemberToSession as dbAddMemberToSession,
    closeNodewarSession as dbCloseNodewarSession,
    createNodewarSession as dbCreateNodewarSession,
    getActiveNodewarSession as dbGetActiveNodewarSession,
    getActiveNodewarSessionWithParticipants as dbGetActiveNodewarSessionWithParticipants,
    getAllNodewarSessions as dbGetAllNodewarSessions,
    getNodeWarMembersBySessionId as dbGetNodeWarMembersBySessionId,
    removeMemberFromSession as dbRemoveMemberFromSession
} from '../database/entities/nodewar-sessions.js';

export const getAllNodewarSessions = async () => {
    return dbGetAllNodewarSessions();
};

export const getActiveNodewarSession = async () => {
    return dbGetActiveNodewarSessionWithParticipants();
};

export const getNodeWarMembersBySessionId = async (sessionId) => {
    return dbGetNodeWarMembersBySessionId(sessionId);
};

export const createNodewarSession = async (session) => {
    const validation = validateNodewarSessionBasicData(session);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }
    const hasActiveSession = await hasActiveNodewarSession();
    if (hasActiveSession) {
        return { success: false, error: 'Já existe uma sessão ativa', details: 'Já existe uma sessão ativa' };
    }
    return createSession(session);
};

const createSession = async (session) => {
    const nodewarSession = {
        nodewar_config_id: session.templateId,
        schedule: session.schedule,
        is_active: true
    };
    return dbCreateNodewarSession(nodewarSession);
};

export const closeNodewarSession = async () => {
    return dbCloseNodewarSession();
};

const validateNodewarSessionBasicData = (session) => {
    const errors = [];
    if (!session.templateId) {
        errors.push('Template de Nodewar é obrigatório');
    }
    if (!session.schedule) {
        errors.push('Schedule é obrigatório');
    }
    return { isValid: errors.length === 0, errors };
};

const hasActiveNodewarSession = async () => {
    const session = await dbGetActiveNodewarSession();
    return !!session;
};

// ==================== DISCORD INTEGRATION API ====================

/**
 * Adiciona membro à sessão ativa com determinação automática de role
 * @param {string} familyName - Nome da família do membro
 * @returns {Promise<Object>} Resultado da operação
 */
export const addMemberToActiveSession = async (familyName) => {
    // Busca sessão ativa
    const activeSession = await dbGetActiveNodewarSession();
    if (!activeSession) {
        return { success: false, error: 'Não há sessão ativa no momento' };
    }

    // Adiciona membro à sessão
    return await dbAddMemberToSession(activeSession.id, familyName);
};

/**
 * Remove membro da sessão ativa
 * @param {string} familyName - Nome da família do membro
 * @returns {Promise<Object>} Resultado da operação
 */
export const removeMemberFromActiveSession = async (familyName) => {
    // Busca sessão ativa
    const activeSession = await dbGetActiveNodewarSession();
    if (!activeSession) {
        return { success: false, error: 'Não há sessão ativa no momento' };
    }

    // Remove membro da sessão
    return await dbRemoveMemberFromSession(activeSession.id, familyName);
};
