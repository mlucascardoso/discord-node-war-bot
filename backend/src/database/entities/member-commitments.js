import { sql } from '../connection.js';

export const getAllCommitments = async () => {
    const result = await sql`
        SELECT 
            mc.*,
            m.family_name as member_name
        FROM member_commitments mc
        INNER JOIN members m ON mc.member_id = m.id
        ORDER BY mc.created_at DESC
    `;
    return result.rows;
};

export const getCommitmentById = async (id) => {
    const result = await sql`
        SELECT 
            mc.*,
            m.family_name as member_name
        FROM member_commitments mc
        INNER JOIN members m ON mc.member_id = m.id
        WHERE mc.id = ${id}
    `;
    return result.rows[0];
};

export const getCommitmentsByMember = async (memberId) => {
    const result = await sql`
        SELECT * FROM member_commitments 
        WHERE member_id = ${memberId}
        ORDER BY created_at DESC
    `;
    return result.rows;
};

export const getCurrentCommitmentByMember = async (memberId) => {
    const result = await sql`
        SELECT * FROM member_commitments 
        WHERE member_id = ${memberId}
        ORDER BY created_at DESC
        LIMIT 1
    `;
    return result.rows[0];
};

export const createCommitment = async (commitmentData) => {
    const result = await sql`
        INSERT INTO member_commitments (
            member_id, 
            committed_participations, 
            notes
        ) VALUES (
            ${commitmentData.memberId},
            ${commitmentData.committedParticipations},
            ${commitmentData.notes}
        ) RETURNING *
    `;
    return result.rows[0];
};

export const createBulkCommitments = async (commitments) => {
    const results = [];

    for (const commitment of commitments) {
        const result = await sql`
            INSERT INTO member_commitments (
                member_id, 
                committed_participations, 
                notes
            ) VALUES (
                ${commitment.memberId},
                ${commitment.committedParticipations},
                ${commitment.notes}
            ) RETURNING *
        `;
        results.push(result.rows[0]);
    }

    return results;
};

export const updateCommitment = async (id, commitmentData) => {
    const result = await sql`
        UPDATE member_commitments
        SET
            committed_participations = ${commitmentData.committedParticipations},
            notes = ${commitmentData.notes}
        WHERE id = ${id}
        RETURNING *
    `;
    return result.rows[0];
};

export const deleteCommitment = async (id) => {
    const result = await sql`
        DELETE FROM member_commitments 
        WHERE id = ${id}
        RETURNING *
    `;
    return result.rows[0];
};

export const getCommitmentStats = async () => {
    const result = await sql`
        SELECT 
            COUNT(*) as total_commitments,
            COUNT(CASE WHEN actual_participations >= committed_participations THEN 1 END) as fulfilled_commitments,
            COUNT(CASE WHEN actual_participations < committed_participations THEN 1 END) as pending_commitments,
            AVG(committed_participations) as avg_committed,
            AVG(actual_participations) as avg_actual
        FROM member_commitments
    `;
    return result.rows[0];
};

export const getCommitmentsWithProgress = async () => {
    const result = await sql`
        SELECT 
            mc.*,
            m.family_name as member_name,
            CASE 
                WHEN mc.committed_participations = 0 THEN 100
                ELSE ROUND((mc.actual_participations::decimal / mc.committed_participations::decimal) * 100, 2)
            END as progress_percentage,
            CASE 
                WHEN mc.actual_participations >= mc.committed_participations THEN 'fulfilled'
                WHEN mc.actual_participations > 0 THEN 'pending'
                ELSE 'overdue'
            END as status
        FROM member_commitments mc
        INNER JOIN members m ON mc.member_id = m.id
        ORDER BY mc.created_at DESC
    `;
    return result.rows;
};
