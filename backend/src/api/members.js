/**
 * Members API - CRUD operations for guild members
 * Handles all member-related operations with PostgreSQL database
 */

import {
    createMember as dbCreateMember,
    deleteMember as dbDeleteMember,
    getAllMembers as dbGetAllMembers,
    getMemberById as dbGetMemberById,
    getMembersStats as dbGetMembersStats,
    updateMember as dbUpdateMember,
    familyNameExists
} from '../database/entities/members.js';

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
 * @returns {Promise<number>} Calculated gearscore
 */
export function calculateGearscore(ap, awakenedAp, dp) {
    return (Number(ap) + Number(awakenedAp)) / 2 + Number(dp);
}

/**
 * Format number for display
 * @param {number|string} num - Number to format
 * @returns {Promise<string>} Formatted number
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
 * @returns {Promise<string>} Color name
 */
export function getProfileColor(profile) {
    return profile === 'Despertar' ? 'primary' : 'secondary';
}

/**
 * Sanitize member data
 * @param {object} memberData - Raw member data
 * @returns {Promise<object>} Sanitized member data
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
 * @returns {Promise<object>} Validation result
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
 * @returns {Promise<array>} Members list ordered by family name
 */
export async function getAllMembers() {
    return await dbGetAllMembers();
}

/**
 * Get member by ID
 * @param {string|number} id - Member ID
 * @returns {Promise<object|null>} Member object or null if not found
 */
export async function getMemberById(id) {
    return await dbGetMemberById(Number(id));
}

/**
 * Create new member
 * @param {object} memberData - Member data
 * @returns {Promise<object>} Result with success flag and data/error
 */
export async function createMember(memberData) {
    const validation = validateMember(memberData);

    if (!validation.isValid) {
        return {
            success: false,
            error: 'Erro de validação',
            details: validation.errors
        };
    }

    const exists = await familyNameExists(memberData.familyName);
    if (exists) {
        return {
            success: false,
            error: 'Nome da família já existe'
        };
    }

    try {
        const sanitizedData = sanitizeMemberData(memberData);
        const newMember = await dbCreateMember(sanitizedData);

        return {
            success: true,
            data: newMember
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Update existing member
 * @param {string|number} id - Member ID
 * @param {object} memberData - Updated member data
 * @returns {Promise<object>} Result with success flag and data/error
 */
export async function updateMember(id, memberData) {
    const validation = validateMember(memberData);

    if (!validation.isValid) {
        return {
            success: false,
            error: 'Erro de validação',
            details: validation.errors
        };
    }

    const exists = await familyNameExists(memberData.familyName, Number(id));
    if (exists) {
        return { success: false, error: 'Nome da família já existe' };
    }

    try {
        const sanitizedData = sanitizeMemberData(memberData);
        const updatedMember = await dbUpdateMember(Number(id), sanitizedData);
        return { success: true, data: updatedMember };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Delete member
 * @param {string|number} id - Member ID
 * @returns {Promise<object>} Result with success flag and data/error
 */
export async function deleteMember(id) {
    try {
        const deletedMember = await dbDeleteMember(Number(id));

        return {
            success: true,
            data: deletedMember
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get members statistics
 * @returns {Promise<object>} Statistics object
 */
export async function getMembersStats() {
    return await dbGetMembersStats();
}

/**
 * Validate member data for frontend
 * @param {object} memberData - Member data to validate
 * @returns {Promise<object>} Validation result
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
