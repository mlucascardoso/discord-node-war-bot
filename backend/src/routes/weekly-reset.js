import express from 'express';
import { executeWeeklyReset, getLastReset, getMemberPerformance, getResetHistory, getResetPreview } from '../api/weekly-reset.js';

const router = express.Router();

router.get('/preview', async (req, res) => {
    try {
        const preview = await getResetPreview();
        res.json({
            success: true,
            data: preview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.post('/execute', async (req, res) => {
    try {
        const result = await executeWeeklyReset();
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.get('/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const history = await getResetHistory(limit);
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.get('/last', async (req, res) => {
    try {
        const lastReset = await getLastReset();
        res.json({
            success: true,
            data: lastReset
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.get('/member-performance', async (req, res) => {
    try {
        const performance = await getMemberPerformance();
        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

export default router;
