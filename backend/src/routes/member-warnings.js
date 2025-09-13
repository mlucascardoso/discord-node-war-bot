import express from 'express';
import {
    createBulkWarnings,
    createWarning,
    deleteWarning,
    getAllWarnings,
    getMemberWarningStats,
    getWarningById,
    getWarningStats,
    getWarningsByFilters,
    getWarningsByMember,
    updateWarning
} from '../api/member-warnings.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const warnings = await getAllWarnings();
        return res.json({ success: true, data: warnings });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const stats = await getWarningStats();
        return res.json({ success: true, data: stats });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/search', async (req, res) => {
    try {
        const filters = {};

        if (req.query.memberId) filters.memberId = parseInt(req.query.memberId);
        if (req.query.warningType) filters.warningType = req.query.warningType;

        const warnings = await getWarningsByFilters(filters);
        return res.json({ success: true, data: warnings });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getWarningById(id);
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
        const result = await getWarningsByMember(memberId);
        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(404).json({ success: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});


router.get('/member/:memberId/stats', async (req, res) => {
    try {
        const { memberId } = req.params;
        const result = await getMemberWarningStats(memberId);
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
        const result = await createWarning(req.body);
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
        const result = await createBulkWarnings(req.body);
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
        const result = await updateWarning(id, req.body);
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
        const result = await deleteWarning(id);
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
