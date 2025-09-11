import express from 'express';
import { createNodewarSession, getActiveNodewarSession, getAllNodewarSessions, getNodeWarMembersBySessionId, updateNodewarSession } from '../api/nodewar-sessions.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const members = await getAllNodewarSessions();
        return res.json({ success: true, data: members });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/active', async (req, res) => {
    try {
        const session = await getActiveNodewarSession();
        return res.json({ success: true, data: session });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const template = await getNodeWarMembersBySessionId(id);
        if (!template) {
            return res.status(404).json({ success: false, error: 'Template não encontrado' });
        }
        return res.json({ success: true, data: template });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.post('/', async (req, res) => {
    try {
        const member = await createNodewarSession(req.body);
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
        const member = await updateNodewarSession(id, req.body);
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
