import { getMemberById } from '../database/entities/members.js';
import {
    createBulkCommitments as dbCreateBulkCommitments,
    createCommitment as dbCreateCommitment,
    deleteCommitment as dbDeleteCommitment,
    getAllCommitments as dbGetAllCommitments,
    getCommitmentById as dbGetCommitmentById,
    getCommitmentStats as dbGetCommitmentStats,
    getCommitmentsByMember as dbGetCommitmentsByMember,
    getCommitmentsWithProgress as dbGetCommitmentsWithProgress,
    getCurrentCommitmentByMember as dbGetCurrentCommitmentByMember,
    updateCommitment as dbUpdateCommitment
} from '../database/entities/member-commitments.js';

export const getAllCommitments = async () => {
    return dbGetAllCommitments();
};

export const getCommitmentsWithProgress = async () => {
    return dbGetCommitmentsWithProgress();
};

export const getCommitmentStats = async () => {
    return dbGetCommitmentStats();
};

export const getCommitmentById = async (id) => {
    const commitment = await dbGetCommitmentById(id);
    if (!commitment) {
        return { success: false, error: 'Comprometimento não encontrado' };
    }
    return { success: true, data: commitment };
};

export const getCommitmentsByMember = async (memberId) => {
    const memberExists = await getMemberById(memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }
    const commitments = await dbGetCommitmentsByMember(memberId);
    return { success: true, data: commitments };
};

export const getCurrentCommitmentByMember = async (memberId) => {
    const memberExists = await getMemberById(memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }
    const commitment = await dbGetCurrentCommitmentByMember(memberId);
    return { success: true, data: commitment };
};

export const createCommitment = async (commitmentData) => {
    const validation = validateCommitmentData(commitmentData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const memberExists = await getMemberById(commitmentData.memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }

    const commitment = await dbCreateCommitment(commitmentData);
    return { success: true, data: commitment };
};

export const createBulkCommitments = async (commitmentsData) => {
    const validation = validateBulkCommitmentsData(commitmentsData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const memberValidation = await validateMembersExist(commitmentsData.memberIds);
    if (!memberValidation.isValid) {
        return { success: false, error: 'Membros não encontrados', details: memberValidation.errors };
    }

    const commitments = commitmentsData.memberIds.map((memberId) => ({
        memberId,
        committedParticipations: commitmentsData.committedParticipations,
        notes: commitmentsData.notes
    }));

    const results = await dbCreateBulkCommitments(commitments);
    return { success: true, data: results };
};

export const updateCommitment = async (id, commitmentData) => {
    const validation = validateCommitmentUpdateData(commitmentData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const existingCommitment = await dbGetCommitmentById(id);
    if (!existingCommitment) {
        return { success: false, error: 'Comprometimento não encontrado' };
    }

    const commitment = await dbUpdateCommitment(id, commitmentData);
    return { success: true, data: commitment };
};

export const deleteCommitment = async (id) => {
    const existingCommitment = await dbGetCommitmentById(id);
    if (!existingCommitment) {
        return { success: false, error: 'Comprometimento não encontrado' };
    }

    const commitment = await dbDeleteCommitment(id);
    return { success: true, data: commitment };
};

const validateCommitmentData = (commitmentData) => {
    const errors = [];

    if (!commitmentData.memberId) {
        errors.push('ID do membro é obrigatório');
    }

    if (commitmentData.committedParticipations === undefined || commitmentData.committedParticipations === null) {
        errors.push('Participações comprometidas é obrigatório');
    } else if (commitmentData.committedParticipations < 0 || commitmentData.committedParticipations > 7) {
        errors.push('Participações comprometidas deve estar entre 0 e 7');
    }

    if (commitmentData.notes && commitmentData.notes.length > 1000) {
        errors.push('Observações não pode exceder 1000 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateCommitmentUpdateData = (commitmentData) => {
    const errors = [];

    if (commitmentData.committedParticipations !== undefined) {
        if (commitmentData.committedParticipations < 0 || commitmentData.committedParticipations > 7) {
            errors.push('Participações comprometidas deve estar entre 0 e 7');
        }
    }

    if (commitmentData.notes && commitmentData.notes.length > 1000) {
        errors.push('Observações não pode exceder 1000 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateBulkCommitmentsData = (commitmentsData) => {
    const errors = [];

    if (!commitmentsData.memberIds || !Array.isArray(commitmentsData.memberIds) || commitmentsData.memberIds.length === 0) {
        errors.push('Lista de membros é obrigatória e deve conter pelo menos um membro');
    }

    if (commitmentsData.committedParticipations === undefined || commitmentsData.committedParticipations === null) {
        errors.push('Participações comprometidas é obrigatório');
    } else if (commitmentsData.committedParticipations < 0 || commitmentsData.committedParticipations > 7) {
        errors.push('Participações comprometidas deve estar entre 0 e 7');
    }

    if (commitmentsData.notes && commitmentsData.notes.length > 1000) {
        errors.push('Observações não pode exceder 1000 caracteres');
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
