import { getMemberById } from '../database/entities/members.js';
import {
    createBulkWarnings as dbCreateBulkWarnings,
    createWarning as dbCreateWarning,
    deleteWarning as dbDeleteWarning,
    getActiveWarningsByMember as dbGetActiveWarningsByMember,
    getAllWarnings as dbGetAllWarnings,
    getMemberWarningStats as dbGetMemberWarningStats,
    getWarningById as dbGetWarningById,
    getWarningStats as dbGetWarningStats,
    getWarningsByFilters as dbGetWarningsByFilters,
    getWarningsByMember as dbGetWarningsByMember,
    reactivateWarning as dbReactivateWarning,
    resolveWarning as dbResolveWarning,
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

export const getActiveWarningsByMember = async (memberId) => {
    const memberExists = await getMemberById(memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }
    const warnings = await dbGetActiveWarningsByMember(memberId);
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

    const issuedByExists = await getMemberById(warningData.issuedById);
    if (!issuedByExists) {
        return { success: false, error: 'Membro que emitiu não encontrado' };
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

    const issuedByExists = await getMemberById(warningsData.issuedById);
    if (!issuedByExists) {
        return { success: false, error: 'Membro que emitiu não encontrado' };
    }

    const warnings = warningsData.memberIds.map((memberId) => ({
        memberId,
        warningType: warningsData.warningType,
        severity: warningsData.severity,
        description: warningsData.description,
        sessionId: warningsData.sessionId,
        issuedById: warningsData.issuedById
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

    if (!existingWarning.is_active) {
        return { success: false, error: 'Não é possível editar advertência resolvida' };
    }

    const warning = await dbUpdateWarning(id, warningData);
    return { success: true, data: warning };
};

export const resolveWarning = async (id, resolvedById, resolutionNotes) => {
    const validation = validateResolutionData(resolvedById, resolutionNotes);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const existingWarning = await dbGetWarningById(id);
    if (!existingWarning) {
        return { success: false, error: 'Advertência não encontrada' };
    }

    if (!existingWarning.is_active) {
        return { success: false, error: 'Advertência já está resolvida' };
    }

    const resolvedByExists = await getMemberById(resolvedById);
    if (!resolvedByExists) {
        return { success: false, error: 'Membro que resolveu não encontrado' };
    }

    const warning = await dbResolveWarning(id, resolvedById, resolutionNotes);
    return { success: true, data: warning };
};

export const reactivateWarning = async (id) => {
    const existingWarning = await dbGetWarningById(id);
    if (!existingWarning) {
        return { success: false, error: 'Advertência não encontrada' };
    }

    if (existingWarning.is_active) {
        return { success: false, error: 'Advertência já está ativa' };
    }

    const warning = await dbReactivateWarning(id);
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
    } else if (!['absence', 'behavior', 'performance', 'other'].includes(warningData.warningType)) {
        errors.push('Tipo de advertência deve ser: absence, behavior, performance ou other');
    }

    if (!warningData.severity) {
        errors.push('Severidade é obrigatória');
    } else if (!['low', 'medium', 'high'].includes(warningData.severity)) {
        errors.push('Severidade deve ser: low, medium ou high');
    }

    if (!warningData.description?.trim()) {
        errors.push('Descrição é obrigatória');
    } else if (warningData.description.length > 1000) {
        errors.push('Descrição não pode exceder 1000 caracteres');
    }

    if (!warningData.issuedById) {
        errors.push('ID de quem emitiu é obrigatório');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateWarningUpdateData = (warningData) => {
    const errors = [];

    if (warningData.warningType && !['absence', 'behavior', 'performance', 'other'].includes(warningData.warningType)) {
        errors.push('Tipo de advertência deve ser: absence, behavior, performance ou other');
    }

    if (warningData.severity && !['low', 'medium', 'high'].includes(warningData.severity)) {
        errors.push('Severidade deve ser: low, medium ou high');
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
    } else if (!['absence', 'behavior', 'performance', 'other'].includes(warningsData.warningType)) {
        errors.push('Tipo de advertência deve ser: absence, behavior, performance ou other');
    }

    if (!warningsData.severity) {
        errors.push('Severidade é obrigatória');
    } else if (!['low', 'medium', 'high'].includes(warningsData.severity)) {
        errors.push('Severidade deve ser: low, medium ou high');
    }

    if (!warningsData.description?.trim()) {
        errors.push('Descrição é obrigatória');
    } else if (warningsData.description.length > 1000) {
        errors.push('Descrição não pode exceder 1000 caracteres');
    }

    if (!warningsData.issuedById) {
        errors.push('ID de quem emitiu é obrigatório');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateResolutionData = (resolvedById, resolutionNotes) => {
    const errors = [];

    if (!resolvedById) {
        errors.push('ID de quem resolveu é obrigatório');
    }

    if (resolutionNotes && resolutionNotes.length > 1000) {
        errors.push('Notas de resolução não pode exceder 1000 caracteres');
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
