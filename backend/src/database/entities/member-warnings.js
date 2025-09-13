import { sql } from '../connection.js';

export const getAllWarnings = async () => {
    const result = await sql`
        SELECT 
            mw.*,
            m.family_name as member_name
        FROM member_warnings mw
        INNER JOIN members m ON mw.member_id = m.id
        ORDER BY mw.issued_at DESC
    `;
    return result.rows;
};

export const getWarningById = async (id) => {
    const result = await sql`
        SELECT 
            mw.*,
            m.family_name as member_name
        FROM member_warnings mw
        INNER JOIN members m ON mw.member_id = m.id
        WHERE mw.id = ${id}
    `;
    return result.rows[0];
};

export const getWarningsByMember = async (memberId) => {
    const result = await sql`
        SELECT 
            mw.*
        FROM member_warnings mw
        WHERE mw.member_id = ${memberId}
        ORDER BY mw.issued_at DESC
    `;
    return result.rows;
};

export const createWarning = async (warningData) => {
    const result = await sql`
        INSERT INTO member_warnings (
            member_id,
            warning_type,
            description
        ) VALUES (
            ${warningData.memberId},
            ${warningData.warningType},
            ${warningData.description}
        ) RETURNING *
    `;
    return result.rows[0];
};

export const createBulkWarnings = async (warnings) => {
    const results = [];

    for (const warning of warnings) {
        const result = await sql`
            INSERT INTO member_warnings (
                member_id,
                warning_type,
                description
            ) VALUES (
                ${warning.memberId},
                ${warning.warningType},
                ${warning.description}
            ) RETURNING *
        `;
        results.push(result.rows[0]);
    }

    return results;
};

export const updateWarning = async (id, warningData) => {
    const result = await sql`
        UPDATE member_warnings
        SET
            warning_type = ${warningData.warningType},
            description = ${warningData.description}
        WHERE id = ${id}
        RETURNING *
    `;
    return result.rows[0];
};

export const deleteWarning = async (id) => {
    const result = await sql`
        DELETE FROM member_warnings 
        WHERE id = ${id}
        RETURNING *
    `;
    return result.rows[0];
};

export const getWarningStats = async () => {
    const result = await sql`
        SELECT 
            COUNT(*) as total_warnings,
            COUNT(CASE WHEN warning_type = 'falta' THEN 1 END) as falta_warnings,
            COUNT(CASE WHEN warning_type = 'bot' THEN 1 END) as bot_warnings,
            COUNT(CASE WHEN warning_type = 'classe' THEN 1 END) as classe_warnings,
            COUNT(CASE WHEN warning_type = 'atraso' THEN 1 END) as atraso_warnings,
            COUNT(CASE WHEN warning_type = 'comportamento' THEN 1 END) as comportamento_warnings
        FROM member_warnings
    `;
    return result.rows[0];
};

export const getMemberWarningStats = async (memberId) => {
    const result = await sql`
        SELECT 
            COUNT(*) as total_warnings,
            COUNT(CASE WHEN warning_type = 'falta' THEN 1 END) as falta_warnings,
            COUNT(CASE WHEN warning_type = 'bot' THEN 1 END) as bot_warnings,
            COUNT(CASE WHEN warning_type = 'classe' THEN 1 END) as classe_warnings,
            COUNT(CASE WHEN warning_type = 'atraso' THEN 1 END) as atraso_warnings,
            COUNT(CASE WHEN warning_type = 'comportamento' THEN 1 END) as comportamento_warnings
        FROM member_warnings
        WHERE member_id = ${memberId}
    `;
    return result.rows[0];
};

export const getWarningsByFilters = async (filters = {}) => {
    let whereConditions = [];
    let params = [];

    if (filters.memberId) {
        whereConditions.push(`mw.member_id = $${params.length + 1}`);
        params.push(filters.memberId);
    }

    if (filters.warningType) {
        whereConditions.push(`mw.warning_type = $${params.length + 1}`);
        params.push(filters.warningType);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            mw.*,
            m.family_name as member_name
        FROM member_warnings mw
        INNER JOIN members m ON mw.member_id = m.id
        ${whereClause}
        ORDER BY mw.issued_at DESC
    `;

    const result = await sql.unsafe(query, params);
    return result.rows;
};
