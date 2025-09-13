const API_BASE = '/api';

export async function getResetPreview() {
    const response = await fetch(`${API_BASE}/weekly-reset/preview`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.details || data.error || 'Erro ao obter preview do reset');
    }

    return data.data;
}

export async function executeWeeklyReset() {
    const response = await fetch(`${API_BASE}/weekly-reset/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.details || data.error || 'Erro ao executar reset semanal');
    }

    return data.data;
}

export async function getResetHistory(limit = 10) {
    const response = await fetch(`${API_BASE}/weekly-reset/history?limit=${limit}`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.details || data.error || 'Erro ao buscar histórico de reset');
    }

    return data.data;
}

export async function getLastReset() {
    const response = await fetch(`${API_BASE}/weekly-reset/last`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.details || data.error || 'Erro ao buscar último reset');
    }

    return data.data;
}

export async function getMemberPerformance() {
    const response = await fetch(`${API_BASE}/weekly-reset/member-performance`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.details || data.error || 'Erro ao buscar desempenho dos membros');
    }

    return data.data;
}
