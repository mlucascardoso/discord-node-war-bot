import { sql } from '../connection.js';

export const getAllParticipations = async () => {
    const result = await sql`
        SELECT 
            mp.*,
            m.family_name as member_name,
            DATE(mp.recorded_at AT TIME ZONE 'America/Sao_Paulo') as participation_date
        FROM member_participations mp
        INNER JOIN members m ON mp.member_id = m.id
        ORDER BY mp.recorded_at DESC
    `;
    return result.rows;
};

export const getParticipationById = async (id) => {
    const result = await sql`
        SELECT 
            mp.*,
            m.family_name as member_name,
            ns.schedule as session_date,
            CONCAT('Node War #', ns.id, ' - ', TO_CHAR(ns.schedule, 'DD/MM/YYYY')) as session_name,
            rb.family_name as recorded_by_name
        FROM member_participations mp
        INNER JOIN members m ON mp.member_id = m.id
        INNER JOIN nodewar_sessions ns ON mp.session_id = ns.id
        INNER JOIN members rb ON mp.recorded_by_id = rb.id
        WHERE mp.id = ${id}
    `;
    return result.rows[0];
};

export const getParticipationsByMember = async (memberId) => {
    const result = await sql`
        SELECT 
            mp.*,
            ns.schedule as session_date,
            CONCAT('Node War #', ns.id, ' - ', TO_CHAR(ns.schedule, 'DD/MM/YYYY')) as session_name,
            rb.family_name as recorded_by_name
        FROM member_participations mp
        INNER JOIN nodewar_sessions ns ON mp.session_id = ns.id
        INNER JOIN members rb ON mp.recorded_by_id = rb.id
        WHERE mp.member_id = ${memberId}
        ORDER BY mp.recorded_at DESC
    `;
    return result.rows;
};

export const getParticipationsBySession = async (sessionId) => {
    const result = await sql`
        SELECT 
            mp.*,
            m.family_name as member_name,
            rb.family_name as recorded_by_name
        FROM member_participations mp
        INNER JOIN members m ON mp.member_id = m.id
        INNER JOIN members rb ON mp.recorded_by_id = rb.id
        WHERE mp.session_id = ${sessionId}
        ORDER BY mp.recorded_at DESC
    `;
    return result.rows;
};

export const createParticipation = async (participationData) => {
    try {
        const participationDate = participationData.recordedAt ? new Date(participationData.recordedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const existing = await sql`
            SELECT id FROM member_participations 
            WHERE member_id = ${participationData.memberId} 
            AND DATE(recorded_at AT TIME ZONE 'America/Sao_Paulo') = ${participationDate}
        `;

        if (existing.rows.length > 0) {
            return { success: false, error: 'Participação já registrada para este membro nesta data' };
        }

        const result = await sql`
            INSERT INTO member_participations (
                member_id,
                recorded_at
            ) VALUES (
                ${participationData.memberId},
                ${participationData.recordedAt || sql`CURRENT_TIMESTAMP`}
            ) RETURNING *
        `;

        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const createBulkParticipations = async (participations) => {
    const results = [];
    const errors = [];

    for (const participation of participations) {
        try {
            const participationDate = new Date(participation.recordedAt).toISOString().split('T')[0];
            const existing = await sql`
                SELECT id FROM member_participations 
                WHERE member_id = ${participation.memberId} 
                AND DATE(recorded_at AT TIME ZONE 'America/Sao_Paulo') = ${participationDate}
            `;

            if (existing.rows.length > 0) {
                errors.push({
                    memberId: participation.memberId,
                    error: 'já tem participação registrada nesta data'
                });
                continue;
            }

            const result = await sql`
                INSERT INTO member_participations (
                    member_id,
                    recorded_at
                ) VALUES (
                    ${participation.memberId},
                    ${participation.recordedAt || sql`CURRENT_TIMESTAMP`}
                ) RETURNING *
            `;

            results.push(result.rows[0]);
        } catch (error) {
            errors.push({
                memberId: participation.memberId,
                error: error.message
            });
        }
    }

    return { success: results.length > 0, data: results, errors };
};

export const updateParticipation = async (id, participationData) => {
    const result = await sql`
        UPDATE member_participations
        SET
            recorded_at = ${participationData.recordedAt || sql`CURRENT_TIMESTAMP`}
        WHERE id = ${id}
        RETURNING *
    `;
    return result.rows[0];
};

export const deleteParticipation = async (id) => {
    const result = await sql`
        DELETE FROM member_participations 
        WHERE id = ${id}
        RETURNING *
    `;
    return result.rows[0];
};

export const getParticipationStats = async () => {
    const result = await sql`
        SELECT 
            COUNT(*) as total_participations,
            COUNT(DISTINCT member_id) as unique_members,
            COUNT(DISTINCT DATE(recorded_at AT TIME ZONE 'America/Sao_Paulo')) as unique_days
        FROM member_participations
    `;
    return result.rows[0];
};

export const getMemberParticipationStats = async (memberId) => {
    const result = await sql`
        SELECT 
            COUNT(*) as total_participations,
            COUNT(DISTINCT DATE(recorded_at AT TIME ZONE 'America/Sao_Paulo')) as participation_days,
            MIN(recorded_at) as first_participation,
            MAX(recorded_at) as last_participation
        FROM member_participations
        WHERE member_id = ${memberId}
    `;
    return result.rows[0];
};
