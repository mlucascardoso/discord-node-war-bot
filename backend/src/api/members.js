import { createCommitment as dbCreateCommitment } from '../database/entities/member-commitments.js';
import { addMemberRole, getRoleByName } from './roles.js';
import {
    createMember as dbCreateMember,
    deleteMember as dbDeleteMember,
    getAllMembers as dbGetAllMembers,
    getMemberByFamilyName as dbGetMemberByFamilyName,
    getMemberById as dbGetMemberById,
    updateMember as dbUpdateMember
} from '../database/entities/members.js';

export const getAllMembers = async () => {
    const members = await dbGetAllMembers();
    return members;
};

export const getMemberById = async (id) => {
    const member = await dbGetMemberById(id);
    return member;
};

export const createMember = async (memberData) => {
    const validation = validateMemberBasicData(memberData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }
    const exists = await checkMemberAlreadyExists(memberData);
    if (!exists.isValid) {
        return { success: false, error: 'Nome da família já existe', details: exists.errors };
    }
    memberData.gearscore = calculateGearscore(memberData);
    const member = await dbCreateMember(memberData);

    try {
        // 1. Criar comprometimento padrão de 3 dias
        await dbCreateCommitment({
            memberId: member.id,
            committedParticipations: 3,
            notes: 'Comprometimento padrão criado automaticamente'
        });

        // 2. Buscar e atribuir roles padrão (waitlist e frontline)
        const waitlistRole = await getRoleByName('waitlist');
        const frontlineRole = await getRoleByName('frontline');

        if (waitlistRole) {
            await addMemberRole(member.id, waitlistRole.id);
        }

        if (frontlineRole) {
            await addMemberRole(member.id, frontlineRole.id);
        }
    } catch (error) {
        console.warn('Erro ao criar configurações padrão para o membro:', error);
        // Não falhamos a criação do membro se houver erro nas configurações padrão
    }

    return { success: true, data: member };
};

export const updateMember = async (id, memberData) => {
    const validation = validateMemberBasicData(memberData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }
    const existsById = await getMemberById(id);
    if (!existsById) {
        return { success: false, error: 'Membro não encontrado', details: 'Membro não encontrado' };
    }
    memberData.gearscore = calculateGearscore(memberData);
    const member = await dbUpdateMember(id, memberData);
    return { success: true, data: member };
};

export const deleteMember = async (id) => {
    const existsById = await getMemberById(id);
    if (!existsById) {
        return { success: false, error: 'Membro não encontrado' };
    }

    try {
        const deletedMember = await dbDeleteMember(id);
        return { success: true, data: deletedMember };
    } catch (error) {
        console.error('Erro ao deletar membro:', error);
        return { success: false, error: 'Erro interno do servidor', details: error.message };
    }
};

const validateMemberBasicData = (memberData) => {
    const errors = [];
    if (!memberData.familyName?.trim() || memberData.familyName?.length > 100) {
        errors.push('Nome da família é obrigatório');
    }
    if (!memberData.guildId) {
        errors.push('Guild é obrigatório');
    }
    if (!memberData.classId) {
        errors.push('Classe é obrigatória');
    }
    if (!memberData.classProfileId) {
        errors.push('Perfil da classe é obrigatório');
    }
    if (!memberData.level) {
        errors.push('Level é obrigatório');
    }
    if (!memberData.ap || memberData.ap < 0 || memberData.ap > 400 || !Number.isInteger(memberData.ap)) {
        errors.push('AP é obrigatório e deve estar entre 0 e 400');
    }
    if (!memberData.awakenedAp || memberData.awakenedAp < 0 || memberData.awakenedAp > 400 || !Number.isInteger(memberData.awakenedAp)) {
        errors.push('AP Despertar é obrigatório e deve estar entre 0 e 400');
    }
    if (!memberData.dp || memberData.dp < 0 || memberData.dp > 600 || !Number.isInteger(memberData.dp)) {
        errors.push('DP é obrigatório e deve estar entre 0 e 600');
    }

    return { isValid: errors.length === 0, errors };
};

const checkMemberAlreadyExists = async (memberData) => {
    const errors = [];
    const member = await dbGetMemberByFamilyName(memberData.familyName);
    if (member) {
        errors.push('Nome da família já existe');
    }
    return { isValid: errors.length === 0, errors };
};

const calculateGearscore = (memberData) => {
    return (memberData.ap + memberData.awakenedAp) / 2 + memberData.dp;
};
