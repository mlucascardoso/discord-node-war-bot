const API_BASE = '/api';

async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro de rede' }));
        const error = new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);

        if (errorData.details) {
            error.details = errorData.details;
        }

        throw error;
    }
    return response.json();
}

export async function getAllWarnings() {
    try {
        const response = await fetch(`${API_BASE}/member-warnings`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching warnings:', error);
        throw error;
    }
}

export async function getWarningStats() {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/stats`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching warning stats:', error);
        throw error;
    }
}

export async function getWarningsByFilters(filters) {
    try {
        const queryParams = new URLSearchParams();

        if (filters.memberId) queryParams.append('memberId', filters.memberId);
        if (filters.warningType) queryParams.append('warningType', filters.warningType);

        const response = await fetch(`${API_BASE}/member-warnings/search?${queryParams}`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching warnings by filters:', error);
        throw error;
    }
}

export async function getWarningById(id) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/${id}`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching warning ${id}:`, error);
        throw error;
    }
}

export async function getWarningsByMember(memberId) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/member/${memberId}`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching warnings for member ${memberId}:`, error);
        throw error;
    }
}

export async function getMemberWarningStats(memberId) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/member/${memberId}/stats`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching warning stats for member ${memberId}:`, error);
        throw error;
    }
}

export async function createWarning(warningData) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(warningData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error creating warning:', error);
        throw error;
    }
}

export async function createBulkWarnings(warningsData) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(warningsData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error creating bulk warnings:', error);
        throw error;
    }
}

export async function updateWarning(id, warningData) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(warningData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error updating warning ${id}:`, error);
        throw error;
    }
}

export async function deleteWarning(id) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/${id}`, {
            method: 'DELETE'
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error deleting warning ${id}:`, error);
        throw error;
    }
}

export function validateWarningData(warningData) {
    const errors = [];

    if (!warningData.memberIds || warningData.memberIds.length === 0) {
        errors.push('Pelo menos um membro deve ser selecionado');
    }

    if (!warningData.warningType) {
        errors.push('Tipo de advertência é obrigatório');
    } else if (!['falta', 'bot', 'classe', 'atraso', 'comportamento'].includes(warningData.warningType)) {
        errors.push('Tipo de advertência deve ser: falta, bot, classe, atraso ou comportamento');
    }

    if (!warningData.description?.trim()) {
        errors.push('Descrição é obrigatória');
    } else if (warningData.description.length > 1000) {
        errors.push('Descrição não pode exceder 1000 caracteres');
    }

    return { isValid: errors.length === 0, errors };
}

export const WARNING_TYPE_OPTIONS = [
    { value: 'falta', label: 'Falta', color: 'warning' },
    { value: 'bot', label: 'Bot', color: 'info' },
    { value: 'classe', label: 'Classe', color: 'primary' },
    { value: 'atraso', label: 'Atraso', color: 'secondary' },
    { value: 'comportamento', label: 'Comportamento', color: 'error' }
];

export function getWarningTypeLabel(type) {
    const option = WARNING_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option ? option.label : 'Desconhecido';
}

export function getWarningTypeColor(type) {
    const option = WARNING_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option ? option.color : 'default';
}
