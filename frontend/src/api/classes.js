/**
 * Classes API - Frontend client for classes operations
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
 * Get all classes from backend
 * @returns {Promise<Array>} Array of class objects
 */
export async function getAllClasses() {
    try {
        const response = await fetch(`${API_BASE}/classes`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching classes:', error);
        throw error;
    }
}

/**
 * Get class by ID
 * @param {number} id - Class ID
 * @returns {Promise<Object>} Class object
 */
export async function getClassById(id) {
    try {
        const response = await fetch(`${API_BASE}/classes/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching class ${id}:`, error);
        throw error;
    }
}
