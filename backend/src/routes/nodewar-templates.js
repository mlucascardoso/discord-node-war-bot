import express from 'express';
import { createNodeWarTemplate, getAllNodeWarTypes, getNodeWarTypeById, updateNodeWarTemplate } from '../api/nodewar-templates.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const members = await getAllNodeWarTypes();
        return res.json({ success: true, data: members });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const member = await getNodeWarTypeById(id);
        return res.json(member);
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.post('/', async (req, res) => {
    try {
        const member = await createNodeWarTemplate(req.body);
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
        const member = await updateNodeWarTemplate(id, req.body);
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

export default router;
