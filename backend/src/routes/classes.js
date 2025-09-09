import express from 'express';
import { getAllClasses, getClassById } from '../api/classes.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const classes = await getAllClasses();
        return res.json({ success: true, data: classes });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bdoClass = await getClassById(id);
        return res.json(bdoClass);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

export default router;
