/* eslint-disable max-lines-per-function */
import { useCallback, useEffect, useState } from 'react';

export const useApi = () => {
    const [botStatus, setBotStatus] = useState(null);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    const fetchBotStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/status`);
            const data = await response.json();
            setBotStatus(data);
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar status:', error);
            return { success: false, error: 'Erro ao conectar com o espírito' };
        }
    }, [API_BASE]);

    const fetchChannels = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/channels`);
            const data = await response.json();
            setChannels(data.channels || []);
            return { success: true, data: data.channels || [] };
        } catch (error) {
            console.error('Erro ao buscar canais:', error);
            return { success: false, error: 'Erro ao buscar canais místicos' };
        }
    }, [API_BASE]);

    const executeNodeWar = useCallback(
        async (channelId) => {
            if (!channelId) {
                return { success: false, error: 'Selecione um canal de batalha primeiro' };
            }

            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/api/nodewar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ channelId })
                });

                const data = await response.json();

                if (data.success) {
                    return { success: true, message: 'Batalha invocada com sucesso! 🔮' };
                } else {
                    return { success: false, error: data.error || 'Erro ao invocar batalha' };
                }
            } catch (error) {
                console.error('Erro ao executar NodeWar:', error);
                return { success: false, error: 'Erro ao invocar batalha mística' };
            } finally {
                setLoading(false);
            }
        },
        [API_BASE]
    );

    // Fetch data on mount only
    useEffect(() => {
        fetchBotStatus();
        fetchChannels();
    }, [fetchBotStatus, fetchChannels]);

    return {
        botStatus,
        channels,
        loading,
        fetchBotStatus,
        fetchChannels,
        executeNodeWar
    };
};
