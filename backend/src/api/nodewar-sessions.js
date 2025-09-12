import {
    closeNodewarSession as dbCloseNodewarSession,
    createNodewarSession as dbCreateNodewarSession,
    getActiveNodewarSession as dbGetActiveNodewarSession,
    getAllNodewarSessions as dbGetAllNodewarSessions,
    getNodeWarMembersBySessionId as dbGetNodeWarMembersBySessionId
} from '../database/entities/nodewar-sessions.js';

export const getAllNodewarSessions = async () => {
    return dbGetAllNodewarSessions();
};

export const getActiveNodewarSession = async () => {
    return dbGetActiveNodewarSession();
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
