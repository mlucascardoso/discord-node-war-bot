/**
 * Members API - CRUD operations for guild members
 * Handles all member-related operations with file-based persistence
 */

import { getNextId, loadMembers, saveMembers } from '../utils/dataStore.js';

export const AVAILABLE_CLASSES = [
    'Warrior',
    'Ranger',
    'Sorceress',
    'Berserker',
    'Tamer',
    'Musa',
    'Maehwa',
    'Valkyrie',
    'Kunoichi',
    'Ninja',
    'Wizard',
    'Witch',
    'Dark Knight',
    'Striker',
    'Mystic',
    'Lahn',
    'Archer',
    'Shai',
    'Guardian',
    'Hashashin',
    'Nova',
    'Sage',
    'Corsair',
    'Drakania',
    'Woosa',
    'Maegu',
    'Scholar'
];

export const AVAILABLE_PROFILES = ['Despertar', 'Sucessão'];

/**
 * Calculate gearscore: ((ap + awakenedAp) / 2) + dp
 * @param {number} ap - Attack Power
 * @param {number} awakenedAp - Awakened Attack Power
 * @param {number} dp - Defense Power
 * @returns {number} Calculated gearscore
 */
export function calculateGearscore(ap, awakenedAp, dp) {
    return (Number(ap) + Number(awakenedAp)) / 2 + Number(dp);
}

/**
 * Format number for display
 * @param {number|string} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    if (num === undefined || num === null || num === '') {
        return '0';
    }
    return Number(num).toLocaleString();
}

/**
 * Get profile color for UI
 * @param {string} profile - Profile name
 * @returns {string} Color name
 */
export function getProfileColor(profile) {
    return profile === 'Despertar' ? 'primary' : 'secondary';
}

/**
 * Sanitize member data
 * @param {object} memberData - Raw member data
 * @returns {object} Sanitized member data
 */
function sanitizeMemberData(memberData) {
    return {
        familyName: String(memberData.familyName).trim(),
        characterName: String(memberData.characterName).trim(),
        class: String(memberData.class).trim(),
        level: Number(memberData.level),
        ap: Number(memberData.ap),
        awakenedAp: Number(memberData.awakenedAp),
        dp: Number(memberData.dp),
        profile: String(memberData.profile).trim()
    };
}

/**
 * Validate member data
 * @param {object} memberData - Member data to validate
 * @returns {object} Validation result
 */
function validateMember(memberData) {
    const errors = [];

    if (!memberData.familyName?.trim()) errors.push('Nome da família é obrigatório');
    if (!memberData.characterName?.trim()) errors.push('Nome do personagem é obrigatório');
    if (!memberData.class?.trim()) errors.push('Classe é obrigatória');
    if (!memberData.profile?.trim()) errors.push('Perfil é obrigatório');

    if (!AVAILABLE_CLASSES.includes(memberData.class)) {
        errors.push('Classe deve ser uma das opções disponíveis');
    }

    if (!AVAILABLE_PROFILES.includes(memberData.profile)) {
        errors.push('Perfil deve ser uma das opções disponíveis');
    }

    const level = Number(memberData.level);
    if (!level || level < 1 || level > 70) {
        errors.push('Level deve estar entre 1 e 70');
    }
    const ap = Number(memberData.ap);
    if (ap < 0 || ap > 400) {
        errors.push('AP deve estar entre 0 e 400');
    }
    const awakenedAp = Number(memberData.awakenedAp);
    if (awakenedAp < 0 || awakenedAp > 400) {
        errors.push('AP Despertar deve estar entre 0 e 400');
    }
    const dp = Number(memberData.dp);
    if (dp < 0 || dp > 600) {
        errors.push('DP deve estar entre 0 e 600');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get all members
 * @returns {array} Members list ordered by family name
 */
export function getAllMembers() {
    const members = loadMembers();
    return [...members].sort((a, b) => a.familyName.localeCompare(b.familyName));
}

/**
 * Get member by ID
 * @param {string|number} id - Member ID
 * @returns {object|null} Member object or null if not found
 */
export function getMemberById(id) {
    const members = loadMembers();
    return members.find((member) => member.id === Number(id)) || null;
}

/**
 * Create new member
 * @param {object} memberData - Member data
 * @returns {object} Result with success flag and data/error
 */
export function createMember(memberData) {
    const validation = validateMember(memberData);

    if (!validation.isValid) {
        return {
            success: false,
            error: 'Erro de validação',
            details: validation.errors
        };
    }

    const members = loadMembers();
    const existingMember = members.find((m) => m.familyName.toLowerCase() === memberData.familyName.toLowerCase());
    if (existingMember) {
        return {
            success: false,
            error: 'Nome da família já existe'
        };
    }

    const sanitizedData = sanitizeMemberData(memberData);
    const gearscore = calculateGearscore(sanitizedData.ap, sanitizedData.awakenedAp, sanitizedData.dp);
    const newMember = {
        id: getNextId(members),
        ...sanitizedData,
        gearscore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    members.push(newMember);
    saveMembers(members);

    return {
        success: true,
        data: newMember
    };
}

/**
 * Validate update operation
 * @param {Array} members - Members array
 * @param {string|number} id - Member ID
 * @param {object} memberData - Member data
 * @returns {object} Validation result
 */
function validateUpdate(members, id, memberData) {
    const memberIndex = members.findIndex((member) => member.id === Number(id));
    if (memberIndex === -1) {
        return { success: false, error: 'Membro não encontrado' };
    }

    const validation = validateMember(memberData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const existingMember = members.find((m) => m.id !== Number(id) && m.familyName.toLowerCase() === memberData.familyName.toLowerCase());
    if (existingMember) {
        return { success: false, error: 'Nome da família já existe' };
    }

    return { success: true, memberIndex };
}

/**
 * Update existing member
 * @param {string|number} id - Member ID
 * @param {object} memberData - Updated member data
 * @returns {object} Result with success flag and data/error
 */
export function updateMember(id, memberData) {
    const members = loadMembers();
    const validation = validateUpdate(members, id, memberData);

    if (!validation.success) {
        return validation;
    }

    const sanitizedData = sanitizeMemberData(memberData);
    const gearscore = calculateGearscore(sanitizedData.ap, sanitizedData.awakenedAp, sanitizedData.dp);

    members[validation.memberIndex] = {
        ...members[validation.memberIndex],
        ...sanitizedData,
        gearscore,
        updatedAt: new Date().toISOString()
    };

    saveMembers(members);

    return {
        success: true,
        data: members[validation.memberIndex]
    };
}

/**
 * Delete member
 * @param {string|number} id - Member ID
 * @returns {object} Result with success flag and data/error
 */
export function deleteMember(id) {
    const members = loadMembers();
    const memberIndex = members.findIndex((member) => member.id === Number(id));

    if (memberIndex === -1) {
        return {
            success: false,
            error: 'Membro não encontrado'
        };
    }

    const deletedMember = members.splice(memberIndex, 1)[0];
    saveMembers(members);

    return {
        success: true,
        data: deletedMember
    };
}

/**
 * Get members statistics
 * @returns {object} Statistics object
 */
export function getMembersStats() {
    const members = loadMembers();

    if (members.length === 0) {
        return {
            totalMembers: 0,
            averageLevel: 0,
            averageGearscore: 0,
            classDistribution: {},
            profileDistribution: {}
        };
    }

    const totalLevel = members.reduce((sum, member) => sum + member.level, 0);
    const totalGearscore = members.reduce((sum, member) => sum + member.gearscore, 0);

    const classDistribution = members.reduce((acc, member) => {
        acc[member.class] = (acc[member.class] || 0) + 1;
        return acc;
    }, {});

    const profileDistribution = members.reduce((acc, member) => {
        acc[member.profile] = (acc[member.profile] || 0) + 1;
        return acc;
    }, {});

    return {
        totalMembers: members.length,
        averageLevel: Math.round(totalLevel / members.length),
        averageGearscore: Math.round(totalGearscore / members.length),
        classDistribution,
        profileDistribution
    };
}

/**
 * Validate member data for frontend
 * @param {object} memberData - Member data to validate
 * @returns {object} Validation result
 */
export function validateMemberData(memberData) {
    const errors = [];

    if (!memberData.familyName?.trim()) errors.push('Nome da família é obrigatório');
    if (!memberData.characterName?.trim()) errors.push('Nome do personagem é obrigatório');
    if (!memberData.class?.trim()) errors.push('Classe é obrigatória');
    if (!memberData.profile?.trim()) errors.push('Perfil é obrigatório');

    if (!AVAILABLE_CLASSES.includes(memberData.class)) {
        errors.push('Classe deve ser uma das opções disponíveis');
    }

    if (!AVAILABLE_PROFILES.includes(memberData.profile)) {
        errors.push('Perfil deve ser uma das opções disponíveis');
    }

    const level = Number(memberData.level);
    if (!level || level < 1 || level > 70) errors.push('Level deve estar entre 1 e 70');

    const ap = Number(memberData.ap);
    if (ap < 0 || ap > 400) errors.push('AP deve estar entre 0 e 400');

    const awakenedAp = Number(memberData.awakenedAp);
    if (awakenedAp < 0 || awakenedAp > 400) errors.push('AP Despertar deve estar entre 0 e 400');

    const dp = Number(memberData.dp);
    if (dp < 0 || dp > 600) errors.push('DP deve estar entre 0 e 600');

    return { isValid: errors.length === 0, errors };
}
