import express from 'express';
import {
    createBulkCommitments,
    createCommitment,
    deleteCommitment,
    getAllCommitments,
    getCommitmentById,
    getCommitmentStats,
    getCommitmentsByMember,
    getCommitmentsWithProgress,
    getCurrentCommitmentByMember,
    updateCommitment
} from '../api/member-commitments.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const commitments = await getAllCommitments();
        return res.json({ success: true, data: commitments });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/progress', async (req, res) => {
    try {
        const commitments = await getCommitmentsWithProgress();
        return res.json({ success: true, data: commitments });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const stats = await getCommitmentStats();
        return res.json({ success: true, data: stats });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getCommitmentById(id);
        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(404).json({ success: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/member/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;
        const result = await getCommitmentsByMember(memberId);
        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(404).json({ success: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/member/:memberId/current', async (req, res) => {
    try {
        const { memberId } = req.params;
        const result = await getCurrentCommitmentByMember(memberId);
        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(404).json({ success: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.post('/', async (req, res) => {
    try {
        const result = await createCommitment(req.body);
        if (result.success) {
            return res.status(201).json({ success: true, data: result.data });
        } else {
            return res.status(400).json({ success: false, error: result.error, details: result.details });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.post('/bulk', async (req, res) => {
    try {
        const result = await createBulkCommitments(req.body);
        if (result.success) {
            return res.status(201).json({ success: true, data: result.data });
        } else {
            return res.status(400).json({ success: false, error: result.error, details: result.details });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await updateCommitment(id, req.body);
        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(400).json({ success: false, error: result.error, details: result.details });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteCommitment(id);
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
