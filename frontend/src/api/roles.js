/**
 * Roles API - Frontend client for roles and member-roles operations
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
 * Get all roles
 * @returns {Promise<Array>} Array of role objects
 */
export async function getAllRoles() {
    try {
        const response = await fetch(`${API_BASE}/roles`);
        const result = await handleResponse(response);
        return result.roles || result.data || result;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
}

/**
 * Get role by ID
 * @param {number} id - Role ID
 * @returns {Promise<Object>} Role object
 */
export async function getRoleById(id) {
    try {
        const response = await fetch(`${API_BASE}/roles/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching role ${id}:`, error);
        throw error;
    }
}

/**
 * Get member roles
 * @param {number} memberId - Member ID
 * @returns {Promise<Array>} Array of member role objects
 */
export async function getMemberRoles(memberId) {
    try {
        const response = await fetch(`${API_BASE}/roles/member/${memberId}`);
        const result = await handleResponse(response);
        return result.roles || result.data || result;
    } catch (error) {
        console.error(`Error fetching member ${memberId} roles:`, error);
        throw error;
    }
}

/**
 * Update member roles
 * @param {number} memberId - Member ID
 * @param {Array<number>} roleIds - Array of role IDs
 * @returns {Promise<Object>} Update result
 */
export async function updateMemberRoles(memberId, roleIds) {
    try {
        const response = await fetch(`${API_BASE}/roles/member/${memberId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roleIds })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error updating member ${memberId} roles:`, error);
        throw error;
    }
}

/**
 * Add role to member
 * @param {number} memberId - Member ID
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Add result
 */
export async function addMemberRole(memberId, roleId) {
    try {
        const response = await fetch(`${API_BASE}/roles/member/${memberId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roleId })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error adding role ${roleId} to member ${memberId}:`, error);
        throw error;
    }
}

/**
 * Remove role from member
 * @param {number} memberId - Member ID
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Remove result
 */
export async function removeMemberRole(memberId, roleId) {
    try {
        const response = await fetch(`${API_BASE}/roles/member/${memberId}/${roleId}`, {
            method: 'DELETE'
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error removing role ${roleId} from member ${memberId}:`, error);
        throw error;
    }
}
