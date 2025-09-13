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
        if (filters.severity) queryParams.append('severity', filters.severity);
        if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
        if (filters.sessionId) queryParams.append('sessionId', filters.sessionId);

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

export async function getActiveWarningsByMember(memberId) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/member/${memberId}/active`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching active warnings for member ${memberId}:`, error);
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

export async function resolveWarning(id, resolutionData) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/${id}/resolve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resolutionData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error resolving warning ${id}:`, error);
        throw error;
    }
}

export async function reactivateWarning(id) {
    try {
        const response = await fetch(`${API_BASE}/member-warnings/${id}/reactivate`, {
            method: 'PUT'
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error reactivating warning ${id}:`, error);
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
    } else if (!['absence', 'behavior', 'performance', 'other'].includes(warningData.warningType)) {
        errors.push('Tipo de advertência deve ser: absence, behavior, performance ou other');
    }

    if (!warningData.severity) {
        errors.push('Severidade é obrigatória');
    } else if (!['low', 'medium', 'high'].includes(warningData.severity)) {
        errors.push('Severidade deve ser: low, medium ou high');
    }

    if (!warningData.description?.trim()) {
        errors.push('Descrição é obrigatória');
    } else if (warningData.description.length > 1000) {
        errors.push('Descrição não pode exceder 1000 caracteres');
    }

    if (!warningData.issuedById) {
        errors.push('Responsável pela emissão é obrigatório');
    }

    if (warningData.resolutionNotes && warningData.resolutionNotes.length > 1000) {
        errors.push('Notas de resolução não pode exceder 1000 caracteres');
    }

    return { isValid: errors.length === 0, errors };
}

export const WARNING_TYPE_OPTIONS = [
    { value: 'absence', label: 'Ausência', color: 'warning' },
    { value: 'behavior', label: 'Comportamento', color: 'error' },
    { value: 'performance', label: 'Performance', color: 'info' },
    { value: 'other', label: 'Outros', color: 'default' }
];

export const WARNING_SEVERITY_OPTIONS = [
    { value: 'low', label: 'Baixa', color: 'success' },
    { value: 'medium', label: 'Média', color: 'warning' },
    { value: 'high', label: 'Alta', color: 'error' }
];

export function getWarningTypeLabel(type) {
    const option = WARNING_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option ? option.label : 'Desconhecido';
}

export function getWarningTypeColor(type) {
    const option = WARNING_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option ? option.color : 'default';
}

export function getSeverityLabel(severity) {
    const option = WARNING_SEVERITY_OPTIONS.find((opt) => opt.value === severity);
    return option ? option.label : 'Desconhecido';
}

export function getSeverityColor(severity) {
    const option = WARNING_SEVERITY_OPTIONS.find((opt) => opt.value === severity);
    return option ? option.color : 'default';
}
