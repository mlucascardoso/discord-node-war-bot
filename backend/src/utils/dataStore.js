/**
 * Data persistence utilities for serverless environment
 * Uses JSON file for simple data storage
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');

// Default members data
const DEFAULT_MEMBERS = [
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
        gearscore: 417.5,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
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
        gearscore: 632.5,
        createdAt: new Date('2024-01-02').toISOString(),
        updatedAt: new Date('2024-01-02').toISOString()
    }
];

/**
 * Ensure data directory exists
 */
function ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

/**
 * Load members from file or return defaults
 * @returns {Array} Members array
 */
export function loadMembers() {
    try {
        ensureDataDirectory();

        if (!fs.existsSync(MEMBERS_FILE)) {
            saveMembers(DEFAULT_MEMBERS);
            return DEFAULT_MEMBERS;
        }

        const data = fs.readFileSync(MEMBERS_FILE, 'utf8');
        const members = JSON.parse(data);

        // Validate data structure
        if (!Array.isArray(members)) {
            console.warn('Invalid members data format, using defaults');
            saveMembers(DEFAULT_MEMBERS);
            return DEFAULT_MEMBERS;
        }

        return members;
    } catch (error) {
        console.error('Error loading members:', error);
        return DEFAULT_MEMBERS;
    }
}

/**
 * Save members to file
 * @param {Array} members - Members array to save
 */
export function saveMembers(members) {
    try {
        ensureDataDirectory();
        fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving members:', error);
        throw new Error('Failed to save members data');
    }
}

/**
 * Get next available ID
 * @param {Array} members - Current members array
 * @returns {number} Next ID
 */
export function getNextId(members) {
    if (members.length === 0) return 1;
    return Math.max(...members.map((m) => m.id)) + 1;
}
