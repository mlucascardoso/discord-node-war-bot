import { sql } from '../connection.js';

export const getAllClasses = async () => {
    const result = await sql`SELECT * FROM classes order by name asc`;
    return result.rows;
};

export const getClassById = async (id) => {
    const result = await sql`SELECT * FROM classes WHERE id = ${id}`;
    return result.rows[0];
};
