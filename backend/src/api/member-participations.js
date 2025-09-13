import { getMemberById } from '../database/entities/members.js';
import {
    createBulkParticipations as dbCreateBulkParticipations,
    createParticipation as dbCreateParticipation,
    deleteParticipation as dbDeleteParticipation,
    getAllParticipations as dbGetAllParticipations,
    getMemberParticipationStats as dbGetMemberParticipationStats,
    getParticipationById as dbGetParticipationById,
    getParticipationStats as dbGetParticipationStats,
    getParticipationsByMember as dbGetParticipationsByMember,
    getParticipationsBySession as dbGetParticipationsBySession,
    updateParticipation as dbUpdateParticipation
} from '../database/entities/member-participations.js';

export const getAllParticipations = async () => {
    return dbGetAllParticipations();
};

export const getParticipationStats = async () => {
    return dbGetParticipationStats();
};

export const getParticipationById = async (id) => {
    const participation = await dbGetParticipationById(id);
    if (!participation) {
        return { success: false, error: 'Participação não encontrada' };
    }
    return { success: true, data: participation };
};

export const getParticipationsByMember = async (memberId) => {
    const memberExists = await getMemberById(memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }
    const participations = await dbGetParticipationsByMember(memberId);
    return { success: true, data: participations };
};

export const getParticipationsBySession = async (sessionId) => {
    const participations = await dbGetParticipationsBySession(sessionId);
    return { success: true, data: participations };
};

export const getMemberParticipationStats = async (memberId) => {
    const memberExists = await getMemberById(memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }
    const stats = await dbGetMemberParticipationStats(memberId);
    return { success: true, data: stats };
};

export const createParticipation = async (participationData) => {
    const validation = validateParticipationData(participationData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const memberExists = await getMemberById(participationData.memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }

    const recordedByExists = await getMemberById(participationData.recordedById);
    if (!recordedByExists) {
        return { success: false, error: 'Membro que registrou não encontrado' };
    }

    return dbCreateParticipation(participationData);
};

export const createBulkParticipations = async (participationsData) => {
    const validation = validateBulkParticipationsData(participationsData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const memberValidation = await validateMembersExist(participationsData.memberIds);
    if (!memberValidation.isValid) {
        return { success: false, error: 'Membros não encontrados', details: memberValidation.errors };
    }

    const recordedByExists = await getMemberById(participationsData.recordedById);
    if (!recordedByExists) {
        return { success: false, error: 'Membro que registrou não encontrado' };
    }

    const participations = participationsData.memberIds.map((memberId) => ({
        memberId,
        sessionId: participationsData.sessionId,
        participationStatus: participationsData.participationStatus,
        absenceReason: participationsData.absenceReason,
        recordedById: participationsData.recordedById
    }));

    return dbCreateBulkParticipations(participations);
};

export const updateParticipation = async (id, participationData) => {
    const validation = validateParticipationUpdateData(participationData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const existingParticipation = await dbGetParticipationById(id);
    if (!existingParticipation) {
        return { success: false, error: 'Participação não encontrada' };
    }

    const participation = await dbUpdateParticipation(id, participationData);
    return { success: true, data: participation };
};

export const deleteParticipation = async (id) => {
    const existingParticipation = await dbGetParticipationById(id);
    if (!existingParticipation) {
        return { success: false, error: 'Participação não encontrada' };
    }

    const participation = await dbDeleteParticipation(id);
    return { success: true, data: participation };
};

const validateParticipationData = (participationData) => {
    const errors = [];

    if (!participationData.memberId) {
        errors.push('ID do membro é obrigatório');
    }

    if (!participationData.sessionId) {
        errors.push('ID da sessão é obrigatório');
    }

    if (!participationData.participationStatus) {
        errors.push('Status de participação é obrigatório');
    } else if (!['present', 'late', 'absent'].includes(participationData.participationStatus)) {
        errors.push('Status de participação deve ser: present, late ou absent');
    }

    if (!participationData.recordedById) {
        errors.push('ID de quem registrou é obrigatório');
    }

    if (participationData.participationStatus === 'absent' && !participationData.absenceReason?.trim()) {
        errors.push('Motivo da ausência é obrigatório quando status é absent');
    }

    if (participationData.absenceReason && participationData.absenceReason.length > 500) {
        errors.push('Motivo da ausência não pode exceder 500 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateParticipationUpdateData = (participationData) => {
    const errors = [];

    if (participationData.participationStatus && !['present', 'late', 'absent'].includes(participationData.participationStatus)) {
        errors.push('Status de participação deve ser: present, late ou absent');
    }

    if (participationData.participationStatus === 'absent' && !participationData.absenceReason?.trim()) {
        errors.push('Motivo da ausência é obrigatório quando status é absent');
    }

    if (participationData.absenceReason && participationData.absenceReason.length > 500) {
        errors.push('Motivo da ausência não pode exceder 500 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateBulkParticipationsData = (participationsData) => {
    const errors = [];

    if (!participationsData.memberIds || !Array.isArray(participationsData.memberIds) || participationsData.memberIds.length === 0) {
        errors.push('Lista de membros é obrigatória e deve conter pelo menos um membro');
    }

    if (!participationsData.sessionId) {
        errors.push('ID da sessão é obrigatório');
    }

    if (!participationsData.participationStatus) {
        errors.push('Status de participação é obrigatório');
    } else if (!['present', 'late', 'absent'].includes(participationsData.participationStatus)) {
        errors.push('Status de participação deve ser: present, late ou absent');
    }

    if (!participationsData.recordedById) {
        errors.push('ID de quem registrou é obrigatório');
    }

    if (participationsData.participationStatus === 'absent' && !participationsData.absenceReason?.trim()) {
        errors.push('Motivo da ausência é obrigatório quando status é absent');
    }

    if (participationsData.absenceReason && participationsData.absenceReason.length > 500) {
        errors.push('Motivo da ausência não pode exceder 500 caracteres');
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
