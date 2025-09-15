import express from 'express';
import { createMember, deleteMember, getAllMembers, getMemberById, updateMember } from '../api/members.js';

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
        if (member.success) {
            return res.status(201).json(member.data);
        } else {
            return res.status(400).json({ success: false, error: member.error, details: member.details });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const member = await updateMember(id, req.body);
        if (member.success) {
            return res.status(200).json(member.data);
        } else {
            console.log(member);

            return res.status(400).json({ success: false, error: member.error, details: member.details });
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteMember(parseInt(id));
        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(404).json({ success: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

export default router;
