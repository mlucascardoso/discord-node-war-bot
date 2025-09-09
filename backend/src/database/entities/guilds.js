import { sql } from '@vercel/postgres';

export const getAllGuilds = async () => {
    const result = await sql`SELECT * FROM guilds`;
    return result.rows;
};

export const getGuildById = async (id) => {
    const result = await sql`SELECT * FROM guilds WHERE id = ${id}`;
    return result.rows[0];
};
