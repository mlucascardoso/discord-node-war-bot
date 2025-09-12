import { useCallback, useEffect, useState } from 'react';
import { getBotStatus, getDiscordChannels, executeNodeWar, startBot, stopBot, restartBot } from '../api/discord';
import { getAllRoles, getMemberRoles, updateMemberRoles } from '../api/roles';

/**
 * Custom hook for Discord bot operations and state management
 */
export const useDiscordBot = () => {
    const [botStatus, setBotStatus] = useState(null);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);

    // Bot status operations
    const fetchBotStatus = useCallback(async () => {
        try {
            const data = await getBotStatus();
            setBotStatus(data);
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar status:', error);
            return { success: false, error: 'Erro ao conectar com o espírito' };
        }
    }, []);

    // Channel operations
    const fetchChannels = useCallback(async () => {
        try {
            const data = await getDiscordChannels();
            setChannels(data.channels || []);
            return { success: true, data: data.channels || [] };
        } catch (error) {
            console.error('Erro ao buscar canais:', error);
            return { success: false, error: 'Erro ao buscar canais místicos' };
        }
    }, []);

    // NodeWar operations
    const executeNodeWarCommand = useCallback(async (channelId) => {
        if (!channelId) {
            return { success: false, error: 'Selecione um canal de batalha primeiro' };
        }

        setLoading(true);
        try {
            const data = await executeNodeWar(channelId);
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
    }, []);

    // Bot control operations
    const startBotCommand = useCallback(async () => {
        setLoading(true);
        try {
            const data = await startBot();
            if (data.success) {
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
    }, [fetchBotStatus]);

    const stopBotCommand = useCallback(async () => {
        setLoading(true);
        try {
            const data = await stopBot();
            if (data.success) {
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
    }, [fetchBotStatus]);

    const restartBotCommand = useCallback(async () => {
        setLoading(true);
        try {
            const data = await restartBot();
            if (data.success) {
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
    }, [fetchBotStatus]);

    // Roles operations
    const fetchRoles = useCallback(async () => {
        try {
            const data = await getAllRoles();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar roles:', error);
            return { success: false, error: 'Erro ao buscar roles místicas' };
        }
    }, []);

    const fetchMemberRoles = useCallback(async (memberId) => {
        try {
            const data = await getMemberRoles(memberId);
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar roles do membro:', error);
            return { success: false, error: 'Erro ao buscar roles do membro' };
        }
    }, []);

    const updateMemberRolesCommand = useCallback(async (memberId, roleIds) => {
        try {
            const data = await updateMemberRoles(memberId, roleIds);
            if (data.success) {
                return { success: true, message: data.message || 'Roles atualizadas com sucesso! ⚔️' };
            } else {
                return { success: false, error: data.error || 'Erro ao atualizar roles' };
            }
        } catch (error) {
            console.error('Erro ao atualizar roles do membro:', error);
            return { success: false, error: 'Erro ao atualizar roles místicas' };
        }
    }, []);

    // Initialize bot status on mount
    useEffect(() => {
        fetchBotStatus();
    }, [fetchBotStatus]);

    return {
        // State
        botStatus,
        channels,
        loading,
        
        // Bot operations
        fetchBotStatus,
        fetchChannels,
        executeNodeWar: executeNodeWarCommand,
        startBot: startBotCommand,
        stopBot: stopBotCommand,
        restartBot: restartBotCommand,
        
        // Roles operations
        fetchRoles,
        fetchMemberRoles,
        updateMemberRoles: updateMemberRolesCommand
    };
};
