import { getMemberById } from '../database/entities/members.js';
import {
    createBulkWarnings as dbCreateBulkWarnings,
    createWarning as dbCreateWarning,
    deleteWarning as dbDeleteWarning,
    getAllWarnings as dbGetAllWarnings,
    getMemberWarningStats as dbGetMemberWarningStats,
    getWarningById as dbGetWarningById,
    getWarningStats as dbGetWarningStats,
    getWarningsByFilters as dbGetWarningsByFilters,
    getWarningsByMember as dbGetWarningsByMember,
    updateWarning as dbUpdateWarning
} from '../database/entities/member-warnings.js';

export const getAllWarnings = async () => {
    return dbGetAllWarnings();
};

export const getWarningStats = async () => {
    return dbGetWarningStats();
};

export const getWarningsByFilters = async (filters) => {
    return dbGetWarningsByFilters(filters);
};

export const getWarningById = async (id) => {
    const warning = await dbGetWarningById(id);
    if (!warning) {
        return { success: false, error: 'Advertência não encontrada' };
    }
    return { success: true, data: warning };
};

export const getWarningsByMember = async (memberId) => {
    const memberExists = await getMemberById(memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }
    const warnings = await dbGetWarningsByMember(memberId);
    return { success: true, data: warnings };
};

export const getMemberWarningStats = async (memberId) => {
    const memberExists = await getMemberById(memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }
    const stats = await dbGetMemberWarningStats(memberId);
    return { success: true, data: stats };
};

export const createWarning = async (warningData) => {
    const validation = validateWarningData(warningData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const memberExists = await getMemberById(warningData.memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }

    const warning = await dbCreateWarning(warningData);
    return { success: true, data: warning };
};

export const createBulkWarnings = async (warningsData) => {
    const validation = validateBulkWarningsData(warningsData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const memberValidation = await validateMembersExist(warningsData.memberIds);
    if (!memberValidation.isValid) {
        return { success: false, error: 'Membros não encontrados', details: memberValidation.errors };
    }

    const warnings = warningsData.memberIds.map((memberId) => ({
        memberId,
        warningType: warningsData.warningType,
        description: warningsData.description
    }));

    const results = await dbCreateBulkWarnings(warnings);
    return { success: true, data: results };
};

export const updateWarning = async (id, warningData) => {
    const validation = validateWarningUpdateData(warningData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const existingWarning = await dbGetWarningById(id);
    if (!existingWarning) {
        return { success: false, error: 'Advertência não encontrada' };
    }

    const warning = await dbUpdateWarning(id, warningData);
    return { success: true, data: warning };
};

export const deleteWarning = async (id) => {
    const existingWarning = await dbGetWarningById(id);
    if (!existingWarning) {
        return { success: false, error: 'Advertência não encontrada' };
    }

    const warning = await dbDeleteWarning(id);
    return { success: true, data: warning };
};

const validateWarningData = (warningData) => {
    const errors = [];

    if (!warningData.memberId) {
        errors.push('ID do membro é obrigatório');
    }

    if (!warningData.warningType) {
        errors.push('Tipo de advertência é obrigatório');
    } else if (!['falta', 'bot', 'classe', 'atraso', 'comportamento'].includes(warningData.warningType)) {
        errors.push('Tipo de advertência deve ser: falta, bot, classe, atraso ou comportamento');
    }

    if (!warningData.description?.trim()) {
        errors.push('Descrição é obrigatória');
    } else if (warningData.description.length > 1000) {
        errors.push('Descrição não pode exceder 1000 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateWarningUpdateData = (warningData) => {
    const errors = [];

    if (warningData.warningType && !['falta', 'bot', 'classe', 'atraso', 'comportamento'].includes(warningData.warningType)) {
        errors.push('Tipo de advertência deve ser: falta, bot, classe, atraso ou comportamento');
    }

    if (warningData.description !== undefined) {
        if (!warningData.description?.trim()) {
            errors.push('Descrição é obrigatória');
        } else if (warningData.description.length > 1000) {
            errors.push('Descrição não pode exceder 1000 caracteres');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateBulkWarningsData = (warningsData) => {
    const errors = [];

    if (!warningsData.memberIds || !Array.isArray(warningsData.memberIds) || warningsData.memberIds.length === 0) {
        errors.push('Lista de membros é obrigatória e deve conter pelo menos um membro');
    }

    if (!warningsData.warningType) {
        errors.push('Tipo de advertência é obrigatório');
    } else if (!['falta', 'bot', 'classe', 'atraso', 'comportamento'].includes(warningsData.warningType)) {
        errors.push('Tipo de advertência deve ser: falta, bot, classe, atraso ou comportamento');
    }

    if (!warningsData.description?.trim()) {
        errors.push('Descrição é obrigatória');
    } else if (warningsData.description.length > 1000) {
        errors.push('Descrição não pode exceder 1000 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateMembersExist = async (memberIds) => {
    const errors = [];
    const notFoundMembers = [];

    for (const memberId of memberIds) {
        const member = await getMemberById(memberId);
        if (!member) {
            notFoundMembers.push(memberId);
        }
    }

    if (notFoundMembers.length > 0) {
        errors.push(`Membros não encontrados: ${notFoundMembers.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
