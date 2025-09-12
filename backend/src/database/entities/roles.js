import { sql } from '../connection.js';

export const getAllRoles = async () => {
    const result = await sql`
        SELECT * FROM roles
    `;
    return result.rows;
};

export const getRoleById = async (id) => {
    const result = await sql`
        SELECT * FROM roles WHERE id = ${id}
    `;
    return result.rows[0];
};
