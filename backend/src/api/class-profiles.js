import { getAllClassProfiles as dbGetAllClassProfiles, getClassProfileById as dbGetClassProfileById } from '../database/entities/class-profiles.js';

export const getAllClassProfiles = async () => {
    const classProfiles = await dbGetAllClassProfiles();
    return classProfiles;
};

export const getClassProfileById = async (id) => {
    const profile = await dbGetClassProfileById(id);
    return profile;
};
