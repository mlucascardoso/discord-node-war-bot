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

export async function getAllParticipations() {
    try {
        const response = await fetch(`${API_BASE}/member-participations`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching participations:', error);
        throw error;
    }
}

export async function getParticipationStats() {
    try {
        const response = await fetch(`${API_BASE}/member-participations/stats`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching participation stats:', error);
        throw error;
    }
}

export async function getParticipationById(id) {
    try {
        const response = await fetch(`${API_BASE}/member-participations/${id}`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching participation ${id}:`, error);
        throw error;
    }
}

export async function getParticipationsByMember(memberId) {
    try {
        const response = await fetch(`${API_BASE}/member-participations/member/${memberId}`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching participations for member ${memberId}:`, error);
        throw error;
    }
}

export async function getParticipationsBySession(sessionId) {
    try {
        const response = await fetch(`${API_BASE}/member-participations/session/${sessionId}`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching participations for session ${sessionId}:`, error);
        throw error;
    }
}

export async function getMemberParticipationStats(memberId) {
    try {
        const response = await fetch(`${API_BASE}/member-participations/member/${memberId}/stats`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching participation stats for member ${memberId}:`, error);
        throw error;
    }
}

export async function createParticipation(participationData) {
    try {
        const response = await fetch(`${API_BASE}/member-participations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(participationData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error creating participation:', error);
        throw error;
    }
}

export async function createBulkParticipations(participationsData) {
    try {
        const response = await fetch(`${API_BASE}/member-participations/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(participationsData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error creating bulk participations:', error);
        throw error;
    }
}

export async function updateParticipation(id, participationData) {
    try {
        const response = await fetch(`${API_BASE}/member-participations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(participationData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error updating participation ${id}:`, error);
        throw error;
    }
}

export async function deleteParticipation(id) {
    try {
        const response = await fetch(`${API_BASE}/member-participations/${id}`, {
            method: 'DELETE'
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error deleting participation ${id}:`, error);
        throw error;
    }
}

export function validateParticipationData(participationData) {
    const errors = [];

    if (!participationData.memberIds || participationData.memberIds.length === 0) {
        errors.push('Pelo menos um membro deve ser selecionado');
    }

    if (!participationData.sessionId) {
        errors.push('Sessão é obrigatória');
    }

    if (!participationData.participationStatus) {
        errors.push('Status de participação é obrigatório');
    } else if (!['present', 'late', 'absent'].includes(participationData.participationStatus)) {
        errors.push('Status de participação deve ser: present, late ou absent');
    }

    if (!participationData.recordedById) {
        errors.push('Responsável pelo registro é obrigatório');
    }

    if (participationData.participationStatus === 'absent' && !participationData.absenceReason?.trim()) {
        errors.push('Motivo da ausência é obrigatório quando status é "absent"');
    }

    if (participationData.absenceReason && participationData.absenceReason.length > 500) {
        errors.push('Motivo da ausência não pode exceder 500 caracteres');
    }

    return { isValid: errors.length === 0, errors };
}

export const PARTICIPATION_STATUS_OPTIONS = [
    { value: 'present', label: 'Presente', color: 'success' },
    { value: 'late', label: 'Atrasado', color: 'warning' },
    { value: 'absent', label: 'Ausente', color: 'error' }
];

export function getStatusLabel(status) {
    const option = PARTICIPATION_STATUS_OPTIONS.find((opt) => opt.value === status);
    return option ? option.label : 'Desconhecido';
}

export function getStatusColor(status) {
    const option = PARTICIPATION_STATUS_OPTIONS.find((opt) => opt.value === status);
    return option ? option.color : 'default';
}
