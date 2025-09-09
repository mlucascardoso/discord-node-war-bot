import { sql } from '@vercel/postgres';

export const getAllMembers = async () => {
    const result = await sql`SELECT * FROM members order by family_name asc`;
    return result.rows;
};

export const getMemberById = async (id) => {
    const result = await sql`SELECT * FROM members WHERE id = ${id}`;
    return result.rows[0];
};

export const getMemberByFamilyName = async (familyName) => {
    const result = await sql`SELECT * FROM members WHERE family_name = ${familyName}`;
    return result.rows[0];
};

export const createMember = async (memberData) => {
    const result = await sql`
        INSERT INTO 
            members (family_name, guild_id, class_id, class_profile_id, level, ap, awakened_ap, dp, gearscore)
        VALUES (
            ${memberData.familyName},
            ${memberData.guildId},
            ${memberData.classId},
            ${memberData.classProfileId},
            ${memberData.level},
            ${memberData.ap},
            ${memberData.awakenedAp},
            ${memberData.dp},
            ${memberData.gearscore}
        ) RETURNING *`;
    return result.rows[0];
};

export const updateMember = async (id, memberData) => {
    const result = await sql`
        UPDATE
            members
        SET
            family_name = ${memberData.familyName},
            guild_id = ${memberData.guildId},
            class_id = ${memberData.classId},
            class_profile_id = ${memberData.classProfileId},
            level = ${memberData.level},
            ap = ${memberData.ap},
            awakened_ap = ${memberData.awakenedAp},
            dp = ${memberData.dp}
        WHERE id = ${id} RETURNING *`;
    return result.rows[0];
};
