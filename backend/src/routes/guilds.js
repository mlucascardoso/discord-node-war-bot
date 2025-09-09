import express from 'express';
import { getAllGuilds, getGuildById } from '../api/guilds.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const guilds = await getAllGuilds();
        return res.json({ success: true, data: guilds });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const guild = await getGuildById(id);
        return res.json(guild);
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

export default router;
