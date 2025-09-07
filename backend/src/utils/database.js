/**
 * Database utilities for PostgreSQL operations
 * Handles all database interactions for the guild management system
 */

import { sql } from '@vercel/postgres';

/**
 * Load all members from database
 * @returns {Promise<Array>} Array of member objects
 */
export async function loadMembers() {
    try {
        const result = await sql`
            SELECT id, family_name, character_name, class, level, ap, awakened_ap, dp, profile, gearscore, created_at, updated_at
            FROM members 
            ORDER BY family_name ASC
        `;
        const members = result.rows.map((row) => ({
            id: row.id,
            familyName: row.family_name,
            characterName: row.character_name,
            class: row.class,
            level: row.level,
            ap: row.ap,
            awakenedAp: row.awakened_ap,
            dp: row.dp,
            profile: row.profile,
            gearscore: parseFloat(row.gearscore),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
        return members;
    } catch (error) {
        throw new Error(`Failed to load members: ${error.message}`);
    }
}

/**
 * Save a new member to database
 * @param {Object} memberData - Member data to save
 * @returns {Promise<Object>} Created member object
 */
export async function saveMember(memberData) {
    try {
        const result = await sql`
            INSERT INTO members (
                family_name, character_name, class, level, 
                ap, awakened_ap, dp, profile
            ) VALUES (
                ${memberData.familyName},
                ${memberData.characterName},
                ${memberData.class},
                ${memberData.level},
                ${memberData.ap},
                ${memberData.awakenedAp},
                ${memberData.dp},
                ${memberData.profile}
            )
            RETURNING 
                id, family_name, character_name, class, level,
                ap, awakened_ap, dp, profile, gearscore,
                created_at, updated_at
        `;

        const row = result.rows[0];
        const member = {
            id: row.id,
            familyName: row.family_name,
            characterName: row.character_name,
            class: row.class,
            level: row.level,
            ap: row.ap,
            awakenedAp: row.awakened_ap,
            dp: row.dp,
            profile: row.profile,
            gearscore: parseFloat(row.gearscore),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        return member;
    } catch (error) {
        throw new Error(`Failed to save member: ${error.message}`);
    }
}

/**
 * Update an existing member in database
 * @param {number} id - Member ID
 * @param {Object} memberData - Updated member data
 * @returns {Promise<Object>} Updated member object
 */
export async function updateMember(id, memberData) {
    try {
        const result = await sql`
            UPDATE members SET
                family_name = ${memberData.familyName},
                character_name = ${memberData.characterName},
                class = ${memberData.class},
                level = ${memberData.level},
                ap = ${memberData.ap},
                awakened_ap = ${memberData.awakenedAp},
                dp = ${memberData.dp},
                profile = ${memberData.profile},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING 
                id, family_name, character_name, class, level,
                ap, awakened_ap, dp, profile, gearscore,
                created_at, updated_at
        `;

        if (result.rows.length === 0) {
            throw new Error('Member not found');
        }
        const row = result.rows[0];
        const member = {
            id: row.id,
            familyName: row.family_name,
            characterName: row.character_name,
            class: row.class,
            level: row.level,
            ap: row.ap,
            awakenedAp: row.awakened_ap,
            dp: row.dp,
            profile: row.profile,
            gearscore: parseFloat(row.gearscore),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        return member;
    } catch (error) {
        throw new Error(`Failed to update member: ${error.message}`);
    }
}

/**
 * Delete a member from database
 * @param {number} id - Member ID
 * @returns {Promise<Object>} Deleted member object
 */
export async function deleteMember(id) {
    try {
        const result = await sql`
            DELETE FROM members 
            WHERE id = ${id}
            RETURNING 
                id, family_name, character_name, class, level,
                ap, awakened_ap, dp, profile, gearscore,
                created_at, updated_at
        `;
        if (result.rows.length === 0) {
            throw new Error('Member not found');
        }

        const row = result.rows[0];
        const member = {
            id: row.id,
            familyName: row.family_name,
            characterName: row.character_name,
            class: row.class,
            level: row.level,
            ap: row.ap,
            awakenedAp: row.awakened_ap,
            dp: row.dp,
            profile: row.profile,
            gearscore: parseFloat(row.gearscore),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        return member;
    } catch (error) {
        throw new Error(`Failed to delete member: ${error.message}`);
    }
}

/**
 * Get member by ID from database
 * @param {number} id - Member ID
 * @returns {Promise<Object|null>} Member object or null if not found
 */
export async function getMemberById(id) {
    try {
        const result = await sql`
            SELECT 
                id, family_name, character_name, class, level,
                ap, awakened_ap, dp, profile, gearscore,
                created_at, updated_at
            FROM members 
            WHERE id = ${id}
        `;

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        const member = {
            id: row.id,
            familyName: row.family_name,
            characterName: row.character_name,
            class: row.class,
            level: row.level,
            ap: row.ap,
            awakenedAp: row.awakened_ap,
            dp: row.dp,
            profile: row.profile,
            gearscore: parseFloat(row.gearscore),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        return member;
    } catch (error) {
        throw new Error(`Failed to get member: ${error.message}`);
    }
}

/**
 * Get members statistics from database
 * @returns {Promise<Object>} Statistics object
 */
export async function getMembersStats() {
    try {
        const statsResult = await sql`
            SELECT 
                COUNT(*) as total_members,
                ROUND(AVG(level)) as average_level,
                ROUND(AVG(gearscore)) as average_gearscore
            FROM members
        `;
        const classResult = await sql`
            SELECT class, COUNT(*) as count
            FROM members
            GROUP BY class
            ORDER BY count DESC
        `;
        const profileResult = await sql`
            SELECT profile, COUNT(*) as count
            FROM members
            GROUP BY profile
            ORDER BY count DESC
        `;

        const stats = statsResult.rows[0];
        const classDistribution = {};
        const profileDistribution = {};

        classResult.rows.forEach((row) => (classDistribution[row.class] = parseInt(row.count)));
        profileResult.rows.forEach((row) => (profileDistribution[row.profile] = parseInt(row.count)));

        const result = {
            totalMembers: parseInt(stats.total_members),
            averageLevel: parseInt(stats.average_level) || 0,
            averageGearscore: parseInt(stats.average_gearscore) || 0,
            classDistribution,
            profileDistribution
        };
        return result;
    } catch (error) {
        throw new Error(`Failed to get statistics: ${error.message}`);
    }
}
