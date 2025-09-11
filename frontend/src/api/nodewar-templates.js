/**
 * NodeWar Templates API - Frontend client for nodewar template operations
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
 * Get all nodewar types/templates
 * @returns {Promise<Array>} Array of nodewar template objects
 */
export async function getAllNodewarTemplates() {
    try {
        const response = await fetch(`${API_BASE}/nodewar-templates`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching nodewar templates:', error);
        throw error;
    }
}

/**
 * Get nodewar template by ID
 * @param {number} id - Template ID
 * @returns {Promise<Object>} Template object
 */
export async function getNodewarTemplateById(id) {
    try {
        const response = await fetch(`${API_BASE}/nodewar-templates/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching nodewar template ${id}:`, error);
        throw error;
    }
}

/**
 * Create new nodewar template
 * @param {Object} templateData - Template data
 * @returns {Promise<Object>} Created template object
 */
export async function createNodewarTemplate(templateData) {
    try {
        const response = await fetch(`${API_BASE}/nodewar-templates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(templateData)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error creating nodewar template:', error);
        throw error;
    }
}

/**
 * Update existing nodewar template
 * @param {number} id - Template ID
 * @param {Object} templateData - Updated template data
 * @returns {Promise<Object>} Updated template object
 */
export async function updateNodewarTemplate(id, templateData) {
    try {
        const response = await fetch(`${API_BASE}/nodewar-templates/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(templateData)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error updating nodewar template ${id}:`, error);
        throw error;
    }
}

/**
 * Calculate total slots from individual slot counts
 * @param {Object} slots - Object with slot counts
 * @returns {number} Total slots
 */
export function calculateTotalSlots(slots) {
    const {
        bomber_slots = 0,
        frontline_slots = 0,
        ranged_slots = 0,
        shai_slots = 0,
        pa_slots = 0,
        flag_slots = 0,
        defense_slots = 0,
        caller_slots = 0,
        elephant_slots = 0
    } = slots;

    return bomber_slots + frontline_slots + ranged_slots + shai_slots + pa_slots + flag_slots + defense_slots + caller_slots + elephant_slots;
}

/**
 * Validate nodewar template data
 * @param {Object} templateData - Template data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateNodewarTemplate(templateData) {
    const errors = [];

    // Required fields validation
    if (!templateData.name?.trim()) errors.push('Nome é obrigatório');
    if (!templateData.tier || templateData.tier < 1 || templateData.tier > 5) {
        errors.push('Tier deve estar entre 1 e 5');
    }

    // Slot validations
    const slots = ['bomber_slots', 'frontline_slots', 'ranged_slots', 'shai_slots', 'pa_slots', 'flag_slots', 'defense_slots', 'caller_slots', 'elephant_slots', 'waitlist'];

    slots.forEach((slot) => {
        const value = Number(templateData[slot]);
        if (isNaN(value) || value < 0 || value > 100) {
            errors.push(`${slot.replace('_', ' ')} deve estar entre 0 e 100`);
        }
    });

    // Total slots validation
    const totalSlots = calculateTotalSlots(templateData);
    if (totalSlots === 0) {
        errors.push('Deve ter pelo menos 1 slot configurado');
    }
    if (totalSlots > 200) {
        errors.push('Total de slots não pode exceder 200');
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Format template data for display
 * @param {Object} template - Template object
 * @returns {Object} Formatted template data
 */
export function formatNodewarTemplate(template) {
    return {
        id: template.id,
        name: template.name || 'Sem nome',
        tier: template.tier || 1,
        informative_text: template.informative_text || '',
        totalSlots: calculateTotalSlots(template),
        slots: {
            bomber: template.bomber_slots || 0,
            frontline: template.frontline_slots || 0,
            ranged: template.ranged_slots || 0,
            shai: template.shai_slots || 0,
            pa: template.pa_slots || 0,
            flag: template.flag_slots || 0,
            defense: template.defense_slots || 0,
            caller: template.caller_slots || 0,
            elephant: template.elephant_slots || 0,
            waitlist: template.waitlist || 0
        },
        createdAt: template.created_at ? new Date(template.created_at).toLocaleString() : 'N/A'
    };
}

/**
 * Get default template data for new template creation
 * @returns {Object} Default template data
 */
export function getDefaultTemplateData() {
    return {
        name: '',
        informative_text: '',
        tier: 2,
        bomber_slots: 0,
        frontline_slots: 22,
        ranged_slots: 4,
        shai_slots: 4,
        pa_slots: 0,
        flag_slots: 1,
        defense_slots: 0,
        caller_slots: 1,
        elephant_slots: 1,
        waitlist: 10
    };
}
