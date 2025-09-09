import { getAllGuilds as dbGetAllGuilds, getGuildById as dbGetGuildById } from '../database/entities/guilds.js';

export const getAllGuilds = async () => {
    const guilds = await dbGetAllGuilds();
    return guilds;
};

export const getGuildById = async (id) => {
    const guild = await dbGetGuildById(id);
    return guild;
};
