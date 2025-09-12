import express from 'express';
import { closeNodewarSession, createNodewarSession, getActiveNodewarSession, getAllNodewarSessions, getNodeWarMembersBySessionId } from '../api/nodewar-sessions.js';

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
        if (!session) {
            return res.status(404).json({ success: false, error: 'Sessão ativa não encontrada' });
        }
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
        await createNodewarSession(req.body);
        return res.status(201).json({ success: true, data: 'Sessão criada com sucesso' });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.post('/close', async (req, res) => {
    try {
        await closeNodewarSession();
        return res.status(200).json({ success: true, data: 'Sessão encerrada com sucesso' });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

export default router;
