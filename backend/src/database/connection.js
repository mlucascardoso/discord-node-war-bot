import pg from 'pg';

const { Pool } = pg;

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

/**
 * Executa uma query SQL
 * @param {string} text - Query SQL
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<Object>} Resultado da query
 */
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

/**
 * Obtém um cliente do pool para transações
 * @returns {Promise<Object>} Cliente PostgreSQL
 */
export const getClient = async () => {
    return await pool.connect();
};

/**
 * Encerra o pool de conexões
 */
export const end = async () => {
    await pool.end();
};

// Template literal SQL helper (compatível com @vercel/postgres)
export const sql = (strings, ...values) => {
    let query = '';
    let paramIndex = 1;
    const params = [];

    for (let i = 0; i < strings.length; i++) {
        query += strings[i];
        if (i < values.length) {
            query += `$${paramIndex}`;
            params.push(values[i]);
            paramIndex++;
        }
    }

    return {
        text: query,
        values: params,
        async then(resolve, reject) {
            try {
                const result = await pool.query(query, params);
                resolve({ rows: result.rows, rowCount: result.rowCount });
            } catch (error) {
                reject(error);
            }
        }
    };
};

export default pool;
