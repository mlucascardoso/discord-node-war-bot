import { getAllClasses as dbGetAllClasses, getClassById as dbGetClassById } from '../database/entities/classes.js';

export const getAllClasses = async () => {
    const classes = await dbGetAllClasses();
    return classes;
};

export const getClassById = async (id) => {
    const bdoClass = await dbGetClassById(id);
    return bdoClass;
};
