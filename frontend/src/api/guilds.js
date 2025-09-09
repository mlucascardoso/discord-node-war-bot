/**
 * Guilds API - Frontend client for guilds operations
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
 * Get all guilds from backend
 * @returns {Promise<Array>} Array of guild objects
 */
export async function getAllGuilds() {
    try {
        const response = await fetch(`${API_BASE}/guilds`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching guilds:', error);
        throw error;
    }
}

/**
 * Get guild by ID
 * @param {number} id - Guild ID
 * @returns {Promise<Object>} Guild object
 */
export async function getGuildById(id) {
    try {
        const response = await fetch(`${API_BASE}/guilds/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching guild ${id}:`, error);
        throw error;
    }
}
