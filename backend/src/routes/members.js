import express from 'express';
import { createMember, getAllMembers, getMemberById, updateMember } from '../api/members.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const members = await getAllMembers();
        return res.json({ success: true, data: members });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const member = await getMemberById(id);
        return res.json(member);
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.post('/', async (req, res) => {
    try {
        const member = await createMember(req.body);
        return res.json(member);
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const member = await updateMember(id, req.body);
        return res.json(member);
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

export default router;
