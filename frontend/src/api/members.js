/**
 * Members API - Frontend client for members CRUD operations
 * Communicates with backend API using fetch
 */

// Base URL for API calls - uses relative paths for both development and production
const API_BASE = '/api';

/**
 * Handle API errors consistently
 * @param {Response} response - Fetch response object
 * @returns {Promise} Parsed JSON or throws error
 */
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro de rede' }));
        const error = new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);

        // Anexar detalhes do erro se disponíveis
        if (errorData.details) {
            error.details = errorData.details;
        }

        throw error;
    }
    return response.json();
}

/**
 * Get all members from backend
 * @returns {Promise<Array>} Array of member objects
 */
export async function getAllMembers() {
    try {
        const response = await fetch(`${API_BASE}/members`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
    }
}

/**
 * Get member by ID
 * @param {number} id - Member ID
 * @returns {Promise<Object>} Member object
 */
export async function getMemberById(id) {
    try {
        const response = await fetch(`${API_BASE}/members/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching member ${id}:`, error);
        throw error;
    }
}

/**
 * Create new member
 * @param {Object} memberData - Member data
 * @returns {Promise<Object>} Created member object
 */
export async function createMember(memberData) {
    try {
        const response = await fetch(`${API_BASE}/members/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error creating member:', error);
        throw error;
    }
}

/**
 * Update existing member
 * @param {number} id - Member ID
 * @param {Object} memberData - Updated member data
 * @returns {Promise<Object>} Updated member object
 */
export async function updateMember(id, memberData) {
    try {
        const response = await fetch(`${API_BASE}/members/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error updating member ${id}:`, error);
        throw error;
    }
}

/**
 * Delete member
 * @param {number} id - Member ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteMember(id) {
    try {
        const response = await fetch(`${API_BASE}/members/${id}`, {
            method: 'DELETE'
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error deleting member ${id}:`, error);
        throw error;
    }
}

/**
 * Get members statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getMembersStats() {
    try {
        const response = await fetch(`${API_BASE}/members/stats`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching members stats:', error);
        throw error;
    }
}

/**
 * Calculate gearscore (frontend utility function)
 * @param {number} ap - Attack Power
 * @param {number} awakenedAp - Awakened Attack Power
 * @param {number} dp - Defense Power
 * @returns {number} Calculated gearscore
 */
export function calculateGearscore(ap, awakenedAp, dp) {
    const numAp = Number(ap) || 0;
    const numAwakenedAp = Number(awakenedAp) || 0;
    const numDp = Number(dp) || 0;

    return Math.round((numAp + numAwakenedAp) / 2 + numDp);
}

/**
 * Format numbers with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    if (num === undefined || num === null || num === '') return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Get profile color for Material-UI chips
 * @param {string} profile - Profile type ('Sucessão' or 'Despertar')
 * @returns {string} Material-UI color name
 */
export function getProfileColor(profile) {
    return profile === 'Sucessão' ? 'primary' : 'secondary';
}

/**
 * Validate member data before sending to backend
 * @param {Object} memberData - Member data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateMemberData(memberData) {
    const errors = [];

    // Required fields validation
    if (!memberData.familyName?.trim()) errors.push('Nome da família é obrigatório');
    if (!memberData.characterName?.trim()) errors.push('Nome do personagem é obrigatório');
    if (!memberData.class?.trim()) errors.push('Classe é obrigatória');
    if (!memberData.profile?.trim()) errors.push('Perfil é obrigatório');

    // Numeric validations
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

/**
 * Available classes for member creation
 */
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

/**
 * Available profiles for member creation
 */
export const AVAILABLE_PROFILES = ['Sucessão', 'Despertar'];
