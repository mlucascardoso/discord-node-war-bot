/**
 * Class Profiles API - Frontend client for class profiles operations
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
 * Get all class profiles from backend
 * @returns {Promise<Array>} Array of class profile objects
 */
export async function getAllClassProfiles() {
    try {
        const response = await fetch(`${API_BASE}/class-profiles`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching class profiles:', error);
        throw error;
    }
}

/**
 * Get class profile by ID
 * @param {number} id - Class Profile ID
 * @returns {Promise<Object>} Class Profile object
 */
export async function getClassProfileById(id) {
    try {
        const response = await fetch(`${API_BASE}/class-profiles/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching class profile ${id}:`, error);
        throw error;
    }
}
