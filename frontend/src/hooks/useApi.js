/* eslint-disable max-lines-per-function */
import { useCallback, useEffect, useState } from 'react';

export const useApi = () => {
    const [botStatus, setBotStatus] = useState(null);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    const fetchBotStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/discord/status`);
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
            const response = await fetch(`${API_BASE}/api/discord/channels`);
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
                const response = await fetch(`${API_BASE}/api/discord/nodewar`, {
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

    const startBot = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/discord/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Atualiza o status após ligar o bot
                await fetchBotStatus();
                return { success: true, message: data.message || 'Bot ligado com sucesso! 🔮' };
            } else {
                return { success: false, error: data.error || 'Erro ao ligar o bot' };
            }
        } catch (error) {
            console.error('Erro ao ligar bot:', error);
            return { success: false, error: 'Erro ao despertar o espírito' };
        } finally {
            setLoading(false);
        }
    }, [API_BASE, fetchBotStatus]);

    const stopBot = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/discord/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Atualiza o status após desligar o bot
                await fetchBotStatus();
                return { success: true, message: data.message || 'Bot desligado com sucesso! 💤' };
            } else {
                return { success: false, error: data.error || 'Erro ao desligar o bot' };
            }
        } catch (error) {
            console.error('Erro ao desligar bot:', error);
            return { success: false, error: 'Erro ao adormecer o espírito' };
        } finally {
            setLoading(false);
        }
    }, [API_BASE, fetchBotStatus]);

    const restartBot = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/discord/restart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Atualiza o status após reiniciar o bot
                await fetchBotStatus();
                return { success: true, message: data.message || 'Bot reiniciado com sucesso! ⚡' };
            } else {
                return { success: false, error: data.error || 'Erro ao reiniciar o bot' };
            }
        } catch (error) {
            console.error('Erro ao reiniciar bot:', error);
            return { success: false, error: 'Erro ao reencarnação do espírito' };
        } finally {
            setLoading(false);
        }
    }, [API_BASE, fetchBotStatus]);

    // Fetch data on mount only
    useEffect(() => {
        fetchBotStatus();
    }, [fetchBotStatus]);

    const fetchRoles = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/roles`);
            const data = await response.json();
            return { success: true, data: data.roles || [] };
        } catch (error) {
            console.error('Erro ao buscar roles:', error);
            return { success: false, error: 'Erro ao buscar roles místicas' };
        }
    }, [API_BASE]);

    const fetchMemberRoles = useCallback(
        async (memberId) => {
            try {
                const response = await fetch(`${API_BASE}/api/roles/member/${memberId}`);
                const data = await response.json();
                return { success: true, data: data.roles || [] };
            } catch (error) {
                console.error('Erro ao buscar roles do membro:', error);
                return { success: false, error: 'Erro ao buscar roles do membro' };
            }
        },
        [API_BASE]
    );

    const updateMemberRoles = useCallback(
        async (memberId, roleIds) => {
            try {
                const response = await fetch(`${API_BASE}/api/roles/member/${memberId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ roleIds })
                });

                const data = await response.json();

                if (data.success) {
                    return { success: true, message: data.message || 'Roles atualizadas com sucesso! ⚔️' };
                } else {
                    return { success: false, error: data.error || 'Erro ao atualizar roles' };
                }
            } catch (error) {
                console.error('Erro ao atualizar roles do membro:', error);
                return { success: false, error: 'Erro ao atualizar roles místicas' };
            }
        },
        [API_BASE]
    );

    return {
        botStatus,
        channels,
        loading,
        fetchBotStatus,
        fetchChannels,
        executeNodeWar,
        startBot,
        stopBot,
        restartBot,
        fetchRoles,
        fetchMemberRoles,
        updateMemberRoles
    };
};
