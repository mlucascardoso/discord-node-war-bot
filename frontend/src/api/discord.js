/**
 * Discord API - Frontend client for Discord bot operations
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
 * Get Discord bot status
 * @returns {Promise<Object>} Bot status object
 */
export async function getBotStatus() {
    try {
        const response = await fetch(`${API_BASE}/discord/status`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching bot status:', error);
        throw error;
    }
}

/**
 * Get Discord channels
 * @returns {Promise<Array>} Array of channel objects
 */
export async function getDiscordChannels() {
    try {
        const response = await fetch(`${API_BASE}/discord/channels`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching Discord channels:', error);
        throw error;
    }
}

/**
 * Execute NodeWar command
 * @param {string} channelId - Discord channel ID
 * @returns {Promise<Object>} Execution result
 */
export async function executeNodeWar(channelId) {
    try {
        const response = await fetch(`${API_BASE}/discord/nodewar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ channelId })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error executing NodeWar:', error);
        throw error;
    }
}

/**
 * Start Discord bot
 * @returns {Promise<Object>} Start result
 */
export async function startBot() {
    try {
        const response = await fetch(`${API_BASE}/discord/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error starting bot:', error);
        throw error;
    }
}

/**
 * Stop Discord bot
 * @returns {Promise<Object>} Stop result
 */
export async function stopBot() {
    try {
        const response = await fetch(`${API_BASE}/discord/stop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error stopping bot:', error);
        throw error;
    }
}

/**
 * Restart Discord bot
 * @returns {Promise<Object>} Restart result
 */
export async function restartBot() {
    try {
        const response = await fetch(`${API_BASE}/discord/restart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error restarting bot:', error);
        throw error;
    }
}
