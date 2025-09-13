import { sql } from '../connection.js';

export const getAllWarnings = async () => {
    const result = await sql`
        SELECT 
            mw.*,
            m.family_name as member_name,
            ib.family_name as issued_by_name,
            rb.family_name as resolved_by_name,
            ns.schedule as session_date,
            CONCAT('Node War #', ns.id, ' - ', TO_CHAR(ns.schedule, 'DD/MM/YYYY')) as session_name
        FROM member_warnings mw
        INNER JOIN members m ON mw.member_id = m.id
        INNER JOIN members ib ON mw.issued_by_id = ib.id
        LEFT JOIN members rb ON mw.resolved_by_id = rb.id
        LEFT JOIN nodewar_sessions ns ON mw.session_id = ns.id
        ORDER BY mw.issued_at DESC
    `;
    return result.rows;
};

export const getWarningById = async (id) => {
    const result = await sql`
        SELECT 
            mw.*,
            m.family_name as member_name,
            ib.family_name as issued_by_name,
            rb.family_name as resolved_by_name,
            ns.schedule as session_date,
            CONCAT('Node War #', ns.id, ' - ', TO_CHAR(ns.schedule, 'DD/MM/YYYY')) as session_name
        FROM member_warnings mw
        INNER JOIN members m ON mw.member_id = m.id
        INNER JOIN members ib ON mw.issued_by_id = ib.id
        LEFT JOIN members rb ON mw.resolved_by_id = rb.id
        LEFT JOIN nodewar_sessions ns ON mw.session_id = ns.id
        WHERE mw.id = ${id}
    `;
    return result.rows[0];
};

export const getWarningsByMember = async (memberId) => {
    const result = await sql`
        SELECT 
            mw.*,
            ib.family_name as issued_by_name,
            rb.family_name as resolved_by_name,
            ns.schedule as session_date,
            CONCAT('Node War #', ns.id, ' - ', TO_CHAR(ns.schedule, 'DD/MM/YYYY')) as session_name
        FROM member_warnings mw
        INNER JOIN members ib ON mw.issued_by_id = ib.id
        LEFT JOIN members rb ON mw.resolved_by_id = rb.id
        LEFT JOIN nodewar_sessions ns ON mw.session_id = ns.id
        WHERE mw.member_id = ${memberId}
        ORDER BY mw.issued_at DESC
    `;
    return result.rows;
};

export const getActiveWarningsByMember = async (memberId) => {
    const result = await sql`
        SELECT 
            mw.*,
            ib.family_name as issued_by_name,
            ns.schedule as session_date,
            CONCAT('Node War #', ns.id, ' - ', TO_CHAR(ns.schedule, 'DD/MM/YYYY')) as session_name
        FROM member_warnings mw
        INNER JOIN members ib ON mw.issued_by_id = ib.id
        LEFT JOIN nodewar_sessions ns ON mw.session_id = ns.id
        WHERE mw.member_id = ${memberId} AND mw.is_active = true
        ORDER BY mw.issued_at DESC
    `;
    return result.rows;
};

export const createWarning = async (warningData) => {
    const result = await sql`
        INSERT INTO member_warnings (
            member_id,
            warning_type,
            severity,
            description,
            session_id,
            issued_by_id
        ) VALUES (
            ${warningData.memberId},
            ${warningData.warningType},
            ${warningData.severity},
            ${warningData.description},
            ${warningData.sessionId},
            ${warningData.issuedById}
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
                severity,
                description,
                session_id,
                issued_by_id
            ) VALUES (
                ${warning.memberId},
                ${warning.warningType},
                ${warning.severity},
                ${warning.description},
                ${warning.sessionId},
                ${warning.issuedById}
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
            severity = ${warningData.severity},
            description = ${warningData.description},
            session_id = ${warningData.sessionId}
        WHERE id = ${id}
        RETURNING *
    `;
    return result.rows[0];
};

export const resolveWarning = async (id, resolvedById, resolutionNotes) => {
    const result = await sql`
        UPDATE member_warnings
        SET
            is_active = false,
            resolved_at = CURRENT_TIMESTAMP,
            resolved_by_id = ${resolvedById},
            resolution_notes = ${resolutionNotes}
        WHERE id = ${id} AND is_active = true
        RETURNING *
    `;
    return result.rows[0];
};

export const reactivateWarning = async (id) => {
    const result = await sql`
        UPDATE member_warnings
        SET
            is_active = true,
            resolved_at = NULL,
            resolved_by_id = NULL,
            resolution_notes = NULL
        WHERE id = ${id} AND is_active = false
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
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_warnings,
            COUNT(CASE WHEN is_active = false THEN 1 END) as resolved_warnings,
            COUNT(CASE WHEN severity = 'high' AND is_active = true THEN 1 END) as high_severity_active,
            COUNT(CASE WHEN warning_type = 'absence' THEN 1 END) as absence_warnings,
            COUNT(CASE WHEN warning_type = 'behavior' THEN 1 END) as behavior_warnings,
            COUNT(CASE WHEN warning_type = 'performance' THEN 1 END) as performance_warnings,
            COUNT(CASE WHEN warning_type = 'other' THEN 1 END) as other_warnings
        FROM member_warnings
    `;
    return result.rows[0];
};

export const getMemberWarningStats = async (memberId) => {
    const result = await sql`
        SELECT 
            COUNT(*) as total_warnings,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_warnings,
            COUNT(CASE WHEN is_active = false THEN 1 END) as resolved_warnings,
            COUNT(CASE WHEN severity = 'high' AND is_active = true THEN 1 END) as high_severity_active,
            COUNT(CASE WHEN warning_type = 'absence' THEN 1 END) as absence_warnings,
            COUNT(CASE WHEN warning_type = 'behavior' THEN 1 END) as behavior_warnings,
            COUNT(CASE WHEN warning_type = 'performance' THEN 1 END) as performance_warnings,
            COUNT(CASE WHEN warning_type = 'other' THEN 1 END) as other_warnings
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

    if (filters.severity) {
        whereConditions.push(`mw.severity = $${params.length + 1}`);
        params.push(filters.severity);
    }

    if (filters.isActive !== undefined) {
        whereConditions.push(`mw.is_active = $${params.length + 1}`);
        params.push(filters.isActive);
    }

    if (filters.sessionId) {
        whereConditions.push(`mw.session_id = $${params.length + 1}`);
        params.push(filters.sessionId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            mw.*,
            m.family_name as member_name,
            ib.family_name as issued_by_name,
            rb.family_name as resolved_by_name,
            ns.schedule as session_date,
            CONCAT('Node War #', ns.id, ' - ', TO_CHAR(ns.schedule, 'DD/MM/YYYY')) as session_name
        FROM member_warnings mw
        INNER JOIN members m ON mw.member_id = m.id
        INNER JOIN members ib ON mw.issued_by_id = ib.id
        LEFT JOIN members rb ON mw.resolved_by_id = rb.id
        LEFT JOIN nodewar_sessions ns ON mw.session_id = ns.id
        ${whereClause}
        ORDER BY mw.issued_at DESC
    `;

    const result = await sql.unsafe(query, params);
    return result.rows;
};
