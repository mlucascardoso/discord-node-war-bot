import express from 'express';
import { getAllClassProfiles, getClassProfileById } from '../api/class-profiles.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const classProfiles = await getAllClassProfiles();
        return res.json({ success: true, data: classProfiles });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await getClassProfileById(id);
        return res.json({ success: true, data: profile });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

export default router;
