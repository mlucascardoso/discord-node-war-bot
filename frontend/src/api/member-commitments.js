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

export async function getAllCommitments() {
    try {
        const response = await fetch(`${API_BASE}/member-commitments`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching commitments:', error);
        throw error;
    }
}

export async function getCommitmentsWithProgress() {
    try {
        const response = await fetch(`${API_BASE}/member-commitments/progress`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching commitments with progress:', error);
        throw error;
    }
}

export async function getCommitmentStats() {
    try {
        const response = await fetch(`${API_BASE}/member-commitments/stats`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error fetching commitment stats:', error);
        throw error;
    }
}

export async function getCommitmentById(id) {
    try {
        const response = await fetch(`${API_BASE}/member-commitments/${id}`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching commitment ${id}:`, error);
        throw error;
    }
}

export async function getCommitmentsByMember(memberId) {
    try {
        const response = await fetch(`${API_BASE}/member-commitments/member/${memberId}`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching commitments for member ${memberId}:`, error);
        throw error;
    }
}

export async function getCurrentCommitmentByMember(memberId) {
    try {
        const response = await fetch(`${API_BASE}/member-commitments/member/${memberId}/current`);
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error fetching current commitment for member ${memberId}:`, error);
        throw error;
    }
}

export async function createCommitment(commitmentData) {
    try {
        const response = await fetch(`${API_BASE}/member-commitments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commitmentData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error creating commitment:', error);
        throw error;
    }
}

export async function createBulkCommitments(commitmentsData) {
    try {
        const response = await fetch(`${API_BASE}/member-commitments/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commitmentsData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error('Error creating bulk commitments:', error);
        throw error;
    }
}

export async function updateCommitment(id, commitmentData) {
    try {
        const response = await fetch(`${API_BASE}/member-commitments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commitmentData)
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error updating commitment ${id}:`, error);
        throw error;
    }
}

export async function deleteCommitment(id) {
    try {
        const response = await fetch(`${API_BASE}/member-commitments/${id}`, {
            method: 'DELETE'
        });
        const result = await handleResponse(response);
        return result.data || result;
    } catch (error) {
        console.error(`Error deleting commitment ${id}:`, error);
        throw error;
    }
}

export function validateCommitmentData(commitmentData) {
    const errors = [];

    if (!commitmentData.memberIds || commitmentData.memberIds.length === 0) {
        errors.push('Pelo menos um membro deve ser selecionado');
    }

    if (commitmentData.committedParticipations === undefined || commitmentData.committedParticipations === null) {
        errors.push('Participações comprometidas é obrigatório');
    } else if (commitmentData.committedParticipations < 0 || commitmentData.committedParticipations > 7) {
        errors.push('Participações comprometidas deve estar entre 0 e 7');
    }

    if (commitmentData.notes && commitmentData.notes.length > 1000) {
        errors.push('Observações não pode exceder 1000 caracteres');
    }

    return { isValid: errors.length === 0, errors };
}
