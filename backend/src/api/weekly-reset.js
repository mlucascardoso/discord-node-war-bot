import { sql } from '../database/connection.js';

export const getResetPreview = async () => {
    try {
        const result = await sql`SELECT * FROM get_reset_preview()`;
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao obter preview do reset:', error);
        throw new Error(`Falha ao obter preview: ${error.message}`);
    }
};

export const executeWeeklyReset = async () => {
    try {
        const result = await sql`SELECT * FROM execute_weekly_reset()`;
        const resetData = result.rows[0];

        console.log(`✅ Reset semanal executado: ${resetData.members_reset} membros resetados em ${resetData.reset_timestamp}`);

        return {
            success: true,
            members_reset: parseInt(resetData.members_reset),
            reset_timestamp: resetData.reset_timestamp,
            message: `Reset executado com sucesso! ${resetData.members_reset} membros tiveram suas participações zeradas.`
        };
    } catch (error) {
        console.error('❌ Erro ao executar reset semanal:', error);
        throw new Error(`Falha no reset semanal: ${error.message}`);
    }
};

export const getResetHistory = async (limit = 10) => {
    try {
        const result = await sql`SELECT * FROM get_reset_history(${limit})`;
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar histórico de reset:', error);
        throw new Error(`Falha ao buscar histórico: ${error.message}`);
    }
};

export const getLastReset = async () => {
    try {
        const result = await sql`SELECT * FROM get_reset_history(1)`;
        return result.rows[0] || null;
    } catch (error) {
        console.error('Erro ao buscar último reset:', error);
        throw new Error(`Falha ao buscar último reset: ${error.message}`);
    }
};

export const getMemberPerformance = async () => {
    try {
        const result = await sql`SELECT * FROM get_member_performance()`;
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar desempenho dos membros:', error);
        throw new Error(`Falha ao buscar desempenho: ${error.message}`);
    }
};
