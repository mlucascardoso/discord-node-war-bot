/**
 * Members API - CRUD operations for guild members
 * Handles all member-related operations with in-memory storage
 */

// In-memory storage for members (will be replaced with database later)
let members = [
    {
        id: 1,
        familyName: 'Lutteh',
        characterName: 'Kelzyh',
        class: 'Guardian',
        level: 63,
        ap: 391,
        awakenedAp: 391,
        dp: 444,
        profile: 'Despertar',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 2,
        familyName: 'Banshee',
        characterName: 'BansheeWarrior',
        class: 'Warrior',
        level: 65,
        ap: 280,
        awakenedAp: 285,
        dp: 350,
        profile: 'Sucessão',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
    },
    {
        id: 3,
        familyName: 'ShadowHunter',
        characterName: 'DarkArcher',
        class: 'Archer',
        level: 63,
        ap: 270,
        awakenedAp: 275,
        dp: 340,
        profile: 'Despertar',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03')
    }
];

// Calculate initial gearscores
members = members.map((member) => ({
    ...member,
    gearscore: calculateGearscore(member.ap, member.awakenedAp, member.dp)
}));

/**
 * Calculate gearscore using the formula: ((ap + awakenedAp) / 2) + dp
 * @param {number} ap - Attack Power
 * @param {number} awakenedAp - Awakened Attack Power
 * @param {number} dp - Defense Power
 * @returns {number} Calculated gearscore
 */
function calculateGearscore(ap, awakenedAp, dp) {
    const numAp = Number(ap) || 0;
    const numAwakenedAp = Number(awakenedAp) || 0;
    const numDp = Number(dp) || 0;

    return Math.round((numAp + numAwakenedAp) / 2 + numDp);
}

/**
 * Validate member data
 * @param {object} memberData - Member data to validate
 * @returns {object} Validation result with isValid flag and errors array
 */
function validateMember(memberData) {
    const errors = [];
    if (!memberData.familyName?.trim()) {
        errors.push('Family name is required');
    }
    if (!memberData.characterName?.trim()) {
        errors.push('Character name is required');
    }
    if (!memberData.class?.trim()) {
        errors.push('Class is required');
    }
    if (!memberData.profile?.trim()) {
        errors.push('Profile is required');
    }
    const level = Number(memberData.level);
    if (!level || level < 1 || level > 70) {
        errors.push('Level must be between 1 and 70');
    }
    const ap = Number(memberData.ap);
    if (ap < 0 || ap > 999) {
        errors.push('AP must be between 0 and 999');
    }
    const awakenedAp = Number(memberData.awakenedAp);
    if (awakenedAp < 0 || awakenedAp > 999) {
        errors.push('Awakened AP must be between 0 and 999');
    }
    const dp = Number(memberData.dp);
    if (dp < 0 || dp > 999) {
        errors.push('DP must be between 0 and 999');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Sanitize and prepare member data for storage
 * @param {object} memberData - Raw member data
 * @returns {object} Sanitized member data
 */
function sanitizeMemberData(memberData) {
    return {
        familyName: memberData.familyName?.trim(),
        characterName: memberData.characterName?.trim(),
        class: memberData.class?.trim(),
        level: Number(memberData.level) || 1,
        ap: Number(memberData.ap) || 0,
        awakenedAp: Number(memberData.awakenedAp) || 0,
        dp: Number(memberData.dp) || 0,
        profile: memberData.profile?.trim()
    };
}

/**
 * Generate next available ID
 * @returns {number} Next ID
 */
function getNextId() {
    return members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1;
}

/**
 * Get all members
 * @returns {array} Members list ordered by family name
 */
export function getAllMembers() {
    return [...members].sort((a, b) => a.familyName.localeCompare(b.familyName));
}

/**
 * Get member by ID
 * @param {number} id - Member ID
 * @returns {object|null} Member data or null if not found
 */
export function getMemberById(id) {
    return members.find((member) => member.id === Number(id)) || null;
}

/**
 * Create new member
 * @param {object} memberData - Member data
 * @returns {object} Result with success flag and data/error
 */
export function createMember(memberData) {
    const validation = validateMember(memberData);

    if (!validation.isValid) {
        return {
            success: false,
            error: 'Validation failed',
            details: validation.errors
        };
    }
    const existingMember = members.find((m) => m.familyName.toLowerCase() === memberData.familyName.toLowerCase());
    if (existingMember) {
        return {
            success: false,
            error: 'Family name already exists'
        };
    }

    const sanitizedData = sanitizeMemberData(memberData);
    const gearscore = calculateGearscore(sanitizedData.ap, sanitizedData.awakenedAp, sanitizedData.dp);
    const newMember = {
        id: getNextId(),
        ...sanitizedData,
        gearscore,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    members.push(newMember);

    return {
        success: true,
        data: newMember
    };
}

/**
 * Update existing member
 * @param {number} id - Member ID
 * @param {object} memberData - Updated member data
 * @returns {object} Result with success flag and data/error
 */
export function updateMember(id, memberData) {
    const memberId = Number(id);
    const memberIndex = members.findIndex((m) => m.id === memberId);
    if (memberIndex === -1) {
        return {
            success: false,
            error: 'Member not found'
        };
    }
    const validation = validateMember(memberData);
    if (!validation.isValid) {
        return {
            success: false,
            error: 'Validation failed',
            details: validation.errors
        };
    }
    const existingMember = members.find((m) => m.id !== memberId && m.familyName.toLowerCase() === memberData.familyName.toLowerCase());
    if (existingMember) {
        return {
            success: false,
            error: 'Family name already exists'
        };
    }
    const sanitizedData = sanitizeMemberData(memberData);
    const gearscore = calculateGearscore(sanitizedData.ap, sanitizedData.awakenedAp, sanitizedData.dp);
    const updatedMember = {
        ...members[memberIndex],
        ...sanitizedData,
        gearscore,
        updatedAt: new Date()
    };
    members[memberIndex] = updatedMember;
    return { success: true, data: updatedMember };
}

/**
 * Delete member
 * @param {number} id - Member ID
 * @returns {object} Result with success flag and data/error
 */
export function deleteMember(id) {
    const memberId = Number(id);
    const memberIndex = members.findIndex((m) => m.id === memberId);

    if (memberIndex === -1) {
        return {
            success: false,
            error: 'Member not found'
        };
    }

    const deletedMember = members[memberIndex];
    members.splice(memberIndex, 1);

    return {
        success: true,
        data: deletedMember
    };
}

/**
 * Get members statistics
 * @returns {object} Statistics data
 */
export function getMembersStats() {
    if (members.length === 0) {
        return {
            total: 0,
            averageGearscore: 0,
            highestGearscore: 0,
            lowestGearscore: 0,
            averageLevel: 0,
            classDistribution: {},
            profileDistribution: {}
        };
    }

    const gearscores = members.map((m) => m.gearscore);
    const levels = members.map((m) => m.level);

    // Class distribution
    const classDistribution = members.reduce((acc, member) => {
        acc[member.class] = (acc[member.class] || 0) + 1;
        return acc;
    }, {});

    // Profile distribution
    const profileDistribution = members.reduce((acc, member) => {
        acc[member.profile] = (acc[member.profile] || 0) + 1;
        return acc;
    }, {});

    return {
        total: members.length,
        averageGearscore: Math.round(gearscores.reduce((a, b) => a + b, 0) / members.length),
        highestGearscore: Math.max(...gearscores),
        lowestGearscore: Math.min(...gearscores),
        averageLevel: Math.round(levels.reduce((a, b) => a + b, 0) / members.length),
        classDistribution,
        profileDistribution,
        topMember: members.find((m) => m.gearscore === Math.max(...gearscores))
    };
}
