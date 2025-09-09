import { sql } from '@vercel/postgres';

export const getAllClassProfiles = async () => {
    const result = await sql`SELECT * FROM class_profiles`;
    return result.rows;
};

export const getClassProfileById = async (id) => {
    const result = await sql`SELECT * FROM class_profiles WHERE id = ${id}`;
    return result.rows[0];
};
