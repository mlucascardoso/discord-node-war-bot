import { sql } from '@vercel/postgres';

export const getAllNodewarSessions = async () => {
    const result = await sql`
        SELECT *
        FROM nodewar_sessions
    `;
    return result.rows;
};

export const getActiveNodewarSession = async () => {
    const result = await sql`
        SELECT *
        FROM nodewar_sessions t1
        INNER JOIN nodewar_configs t2 ON t1.nodewar_config_id = t2.id
        INNER JOIN nodewar_types t3 ON t2.nodewar_type_id = t3.id
        WHERE is_active = true
    `;
    return result.rows[0];
};

export const getNodeWarMembersBySessionId = async (sessionId) => {
    const result = await sql`
        SELECT
            t1.nodewar_session_id as session_id,
            t2.family_name as member_family_name,
            t2.gearscore as member_gearscore,
            t4.name as class_name,
            t5.profile as class_profile_name,
            t3.name as role_name
        FROM nodewar_session_member_role t1
        INNER JOIN members t2 ON t1.member_id = t2.id
        INNER JOIN roles t3 ON t1.role_id = t3.id
        INNER JOIN classes t4 ON t2.class_id = t4.id
        INNER JOIN class_profiles t5 ON t2.class_profile_id = t5.id
        WHERE t1.nodewar_session_id = ${sessionId}
    `;
    return result.rows;
};

export const createNodewarSession = async (session) => {
    const result = await sql`
        INSERT INTO nodewar_sessions (nodewar_config_id, schedule, is_active)
        VALUES (${session.nodewar_config_id}, ${session.schedule}, ${session.is_active})
        RETURNING *
    `;
    return result.rows[0];
};

export const closeNodewarSession = async () => {
    const result = await sql`
        UPDATE nodewar_sessions
        SET is_active = false
        WHERE is_active = true
        RETURNING *
    `;
    return result.rows[0];
};
