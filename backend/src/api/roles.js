import {
    addMemberRole as dbAddMemberRole,
    getMemberRoles as dbGetMemberRoles,
    removeMemberRole as dbRemoveMemberRole,
    updateMemberRoles as dbUpdateMemberRoles
} from '../database/entities/member-roles.js';
import { getAllRoles as dbGetAllRoles, getRoleById as dbGetRoleById } from '../database/entities/roles.js';

// ==================== ROLES ====================

export const getAllRoles = async () => {
    return dbGetAllRoles();
};

export const getRoleById = async (id) => {
    return dbGetRoleById(id);
};

// ==================== MEMBER ROLES ====================

export const getMemberRoles = async (memberId) => {
    return dbGetMemberRoles(memberId);
};

export const addMemberRole = async (memberId, roleId) => {
    return dbAddMemberRole(memberId, roleId);
};

export const removeMemberRole = async (memberId, roleId) => {
    return dbRemoveMemberRole(memberId, roleId);
};

export const updateMemberRoles = async (memberId, roleIds) => {
    return dbUpdateMemberRoles(memberId, roleIds);
};
