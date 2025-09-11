/**
 * NodeWar Sessions API - Frontend client for nodewar session operations
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
 * Get active nodewar session
 * @returns {Promise<Object|null>} Active session object or null
 */
export async function getActiveNodewarSession() {
    try {
        const response = await fetch(`${API_BASE}/nodewar-sessions/active`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching active nodewar session:', error);
        throw error;
    }
}

/**
 * Get all nodewar sessions
 * @returns {Promise<Array>} Array of session objects
 */
export async function getAllNodewarSessions() {
    try {
        const response = await fetch(`${API_BASE}/nodewar-sessions`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching nodewar sessions:', error);
        throw error;
    }
}

/**
 * Get members of a nodewar session
 * @param {number} sessionId - Session ID
 * @returns {Promise<Array>} Array of member objects
 */
export async function getNodewarSessionMembers(sessionId) {
    try {
        const response = await fetch(`${API_BASE}/nodewar-sessions/${sessionId}/members`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching session ${sessionId} members:`, error);
        throw error;
    }
}

/**
 * Create new nodewar session
 * @param {Object} sessionData - Session data including template ID
 * @returns {Promise<Object>} Created session object
 */
export async function createNodewarSession(sessionData) {
    try {
        const response = await fetch(`${API_BASE}/nodewar-sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error creating nodewar session:', error);
        throw error;
    }
}

/**
 * Update existing nodewar session
 * @param {number} sessionId - Session ID
 * @param {Object} sessionData - Updated session data
 * @returns {Promise<Object>} Updated session object
 */
export async function updateNodewarSession(sessionId, sessionData) {
    try {
        const response = await fetch(`${API_BASE}/nodewar-sessions/${sessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error updating nodewar session ${sessionId}:`, error);
        throw error;
    }
}

/**
 * Close active nodewar session
 * @returns {Promise<Object>} Result of close operation
 */
export async function closeActiveNodewarSession() {
    try {
        const response = await fetch(`${API_BASE}/nodewar-sessions/close`, {
            method: 'POST'
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error closing active nodewar session:', error);
        throw error;
    }
}

/**
 * Format session data for display
 * @param {Object} session - Session object
 * @returns {Object} Formatted session data
 */
export function formatNodewarSession(session) {
    if (!session) return null;

    return {
        id: session.id,
        templateId: session.nodewar_config_id || session.templateId,
        templateName: session.template_name || session.templateName || 'Template não identificado',
        tier: session.tier || 1,
        totalSlots: session.total_slots || session.totalSlots || 0,
        schedule: session.schedule || 'Não agendado',
        isActive: session.is_active || session.isActive || false,
        createdAt: session.created_at ? new Date(session.created_at).toLocaleString() : 'N/A',
        informativeText: session.informative_text || session.informativeText || ''
    };
}

/**
 * Format member data for display
 * @param {Object} member - Member object
 * @returns {Object} Formatted member data
 */
export function formatSessionMember(member) {
    if (!member) return null;

    return {
        id: member.id,
        sessionId: member.nodewar_session_id || member.sessionId,
        memberId: member.member_id || member.memberId,
        memberName: member.member_name || member.memberName || member.family_name || 'Membro desconhecido',
        roleId: member.role_id || member.roleId,
        roleName: member.role_name || member.roleName || 'Sem role',
        joinedAt: member.created_at ? new Date(member.created_at).toLocaleString() : 'N/A'
    };
}

/**
 * Group session members by role
 * @param {Array} members - Array of member objects
 * @returns {Object} Members grouped by role
 */
export function groupSessionMembersByRole(members) {
    if (!Array.isArray(members)) return {};

    return members.reduce((groups, member) => {
        const formatted = formatSessionMember(member);
        const roleName = formatted.roleName || 'Sem role';

        if (!groups[roleName]) {
            groups[roleName] = [];
        }

        groups[roleName].push(formatted);
        return groups;
    }, {});
}

/**
 * Get session statistics
 * @param {Object} session - Session object
 * @param {Array} members - Array of member objects
 * @returns {Object} Session statistics
 */
export function getSessionStats(session, members) {
    const formattedSession = formatNodewarSession(session);
    const memberCount = Array.isArray(members) ? members.length : 0;
    const totalSlots = formattedSession?.totalSlots || 0;

    return {
        totalMembers: memberCount,
        totalSlots: totalSlots,
        availableSlots: Math.max(0, totalSlots - memberCount),
        occupancyRate: totalSlots > 0 ? Math.round((memberCount / totalSlots) * 100) : 0
    };
}
