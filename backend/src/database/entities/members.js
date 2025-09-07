/**
 * Members Entity - Database operations for guild members
 * Contains all SQL queries and database operations related to members
 */

import { sql } from '@vercel/postgres';

/**
 * Get all members ordered by family name
 * @returns {Promise<Array>} Array of member objects
 */
export async function getAllMembers() {
    try {
        const result = await sql`
            SELECT 
                id,
                family_name,
                character_name,
                class,
                level,
                ap,
                awakened_ap,
                dp,
                profile,
                gearscore,
                created_at,
                updated_at
            FROM members 
            ORDER BY family_name ASC
        `;

        return result.rows.map(mapRowToMember);
    } catch (error) {
        console.error('Error getting all members:', error);
        throw new Error(`Failed to get members: ${error.message}`);
    }
}

/**
 * Get member by ID
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

        return mapRowToMember(result.rows[0]);
    } catch (error) {
        console.error(`Error getting member ${id}:`, error);
        throw new Error(`Failed to get member: ${error.message}`);
    }
}

/**
 * Create a new member
 * @param {Object} memberData - Member data to insert
 * @returns {Promise<Object>} Created member object
 */
export async function createMember(memberData) {
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

        return mapRowToMember(result.rows[0]);
    } catch (error) {
        console.error(`Error creating member ${memberData.familyName}:`, error);

        if (error.code === '23505') {
            throw new Error('Nome da família já existe');
        }

        throw new Error(`Failed to create member: ${error.message}`);
    }
}

/**
 * Update an existing member
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
            throw new Error('Membro não encontrado');
        }

        return mapRowToMember(result.rows[0]);
    } catch (error) {
        console.error(`Error updating member ${id}:`, error);

        if (error.code === '23505') {
            throw new Error('Nome da família já existe');
        }

        throw new Error(`Failed to update member: ${error.message}`);
    }
}

/**
 * Delete a member
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
            throw new Error('Membro não encontrado');
        }

        return mapRowToMember(result.rows[0]);
    } catch (error) {
        console.error(`Error deleting member ${id}:`, error);
        throw new Error(`Failed to delete member: ${error.message}`);
    }
}

/**
 * Get members statistics
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

        classResult.rows.forEach((row) => {
            classDistribution[row.class] = parseInt(row.count);
        });

        profileResult.rows.forEach((row) => {
            profileDistribution[row.profile] = parseInt(row.count);
        });

        return {
            totalMembers: parseInt(stats.total_members),
            averageLevel: parseInt(stats.average_level) || 0,
            averageGearscore: parseInt(stats.average_gearscore) || 0,
            classDistribution,
            profileDistribution
        };
    } catch (error) {
        console.error('Error getting statistics:', error);
        throw new Error(`Failed to get statistics: ${error.message}`);
    }
}

/**
 * Check if family name exists (for validation)
 * @param {string} familyName - Family name to check
 * @param {number} excludeId - ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
export async function familyNameExists(familyName, excludeId = null) {
    try {
        let query;

        if (excludeId) {
            query = sql`
                SELECT COUNT(*) as count 
                FROM members 
                WHERE LOWER(family_name) = LOWER(${familyName}) 
                AND id != ${excludeId}
            `;
        } else {
            query = sql`
                SELECT COUNT(*) as count 
                FROM members 
                WHERE LOWER(family_name) = LOWER(${familyName})
            `;
        }

        const result = await query;
        return parseInt(result.rows[0].count) > 0;
    } catch (error) {
        console.error('Error checking family name:', error);
        throw new Error(`Failed to check family name: ${error.message}`);
    }
}

/**
 * Get members by class
 * @param {string} className - Class name to filter by
 * @returns {Promise<Array>} Array of member objects
 */
export async function getMembersByClass(className) {
    try {
        const result = await sql`
            SELECT 
                id, family_name, character_name, class, level,
                ap, awakened_ap, dp, profile, gearscore,
                created_at, updated_at
            FROM members 
            WHERE class = ${className}
            ORDER BY gearscore DESC, family_name ASC
        `;

        return result.rows.map(mapRowToMember);
    } catch (error) {
        console.error(`Error getting members by class ${className}:`, error);
        throw new Error(`Failed to get members by class: ${error.message}`);
    }
}

/**
 * Get top members by gearscore
 * @param {number} limit - Number of top members to return
 * @returns {Promise<Array>} Array of top member objects
 */
export async function getTopMembersByGearscore(limit = 10) {
    try {
        const result = await sql`
            SELECT 
                id, family_name, character_name, class, level,
                ap, awakened_ap, dp, profile, gearscore,
                created_at, updated_at
            FROM members 
            ORDER BY gearscore DESC, family_name ASC
            LIMIT ${limit}
        `;

        return result.rows.map(mapRowToMember);
    } catch (error) {
        console.error('Error getting top members:', error);
        throw new Error(`Failed to get top members: ${error.message}`);
    }
}

/**
 * Map database row to member object
 * @param {Object} row - Database row
 * @returns {Object} Member object with camelCase properties
 */
function mapRowToMember(row) {
    return {
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
}
