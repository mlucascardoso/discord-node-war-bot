import { sql } from '@vercel/postgres';

export const getAllClasses = async () => {
    const result = await sql`SELECT * FROM classes`;
    return result.rows;
};

export const getClassById = async (id) => {
    const result = await sql`SELECT * FROM classes WHERE id = ${id}`;
    return result.rows[0];
};
