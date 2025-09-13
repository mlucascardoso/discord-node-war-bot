import { sql } from '../connection.js';

export const getAllParticipations = async () => {
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
        const existing = await sql`
            SELECT id FROM member_participations 
            WHERE member_id = ${participationData.memberId} 
            AND session_id = ${participationData.sessionId}
        `;

        if (existing.rows.length > 0) {
            return { success: false, error: 'Participação já registrada para este membro nesta sessão' };
        }

        const result = await sql`
            INSERT INTO member_participations (
                member_id,
                session_id,
                participation_status,
                absence_reason,
                recorded_by_id
            ) VALUES (
                ${participationData.memberId},
                ${participationData.sessionId},
                ${participationData.participationStatus},
                ${participationData.absenceReason},
                ${participationData.recordedById}
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
            const existing = await sql`
                SELECT id FROM member_participations 
                WHERE member_id = ${participation.memberId} 
                AND session_id = ${participation.sessionId}
            `;

            if (existing.rows.length > 0) {
                errors.push({
                    memberId: participation.memberId,
                    error: 'Participação já registrada'
                });
                continue;
            }

            const result = await sql`
                INSERT INTO member_participations (
                    member_id,
                    session_id,
                    participation_status,
                    absence_reason,
                    recorded_by_id
                ) VALUES (
                    ${participation.memberId},
                    ${participation.sessionId},
                    ${participation.participationStatus},
                    ${participation.absenceReason},
                    ${participation.recordedById}
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
            participation_status = ${participationData.participationStatus},
            absence_reason = ${participationData.absenceReason}
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
            COUNT(CASE WHEN participation_status = 'present' THEN 1 END) as present_count,
            COUNT(CASE WHEN participation_status = 'late' THEN 1 END) as late_count,
            COUNT(CASE WHEN participation_status = 'absent' THEN 1 END) as absent_count,
            ROUND(
                (COUNT(CASE WHEN participation_status = 'present' THEN 1 END)::decimal / 
                 NULLIF(COUNT(*), 0)::decimal) * 100, 2
            ) as presence_rate
        FROM member_participations
    `;
    return result.rows[0];
};

export const getMemberParticipationStats = async (memberId) => {
    const result = await sql`
        SELECT 
            COUNT(*) as total_participations,
            COUNT(CASE WHEN participation_status = 'present' THEN 1 END) as present_count,
            COUNT(CASE WHEN participation_status = 'late' THEN 1 END) as late_count,
            COUNT(CASE WHEN participation_status = 'absent' THEN 1 END) as absent_count,
            ROUND(
                (COUNT(CASE WHEN participation_status = 'present' THEN 1 END)::decimal / 
                 NULLIF(COUNT(*), 0)::decimal) * 100, 2
            ) as presence_rate
        FROM member_participations
        WHERE member_id = ${memberId}
    `;
    return result.rows[0];
};
