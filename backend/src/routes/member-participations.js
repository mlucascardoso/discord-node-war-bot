import express from 'express';
import multer from 'multer';
import {
    createBulkParticipations,
    createParticipation,
    deleteParticipation,
    getAllParticipations,
    getMemberParticipationStats,
    getParticipationById,
    getParticipationStats,
    getParticipationsByMember,
    getParticipationsBySession,
    processParticipationImages,
    updateParticipation
} from '../api/member-participations.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos'), false);
        }
    }
});

router.get('/', async (req, res) => {
    try {
        const participations = await getAllParticipations();
        return res.json({ success: true, data: participations });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const stats = await getParticipationStats();
        return res.json({ success: true, data: stats });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getParticipationById(id);
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
        const result = await getParticipationsByMember(memberId);
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
        const result = await getMemberParticipationStats(memberId);
        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(404).json({ success: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await getParticipationsBySession(sessionId);
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
        const result = await createParticipation(req.body);
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
        const result = await createBulkParticipations(req.body);
        if (result.success) {
            return res.status(201).json({ success: true, data: result.data, errors: result.errors });
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
        const result = await updateParticipation(id, req.body);
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
        const result = await deleteParticipation(id);
        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(404).json({ success: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

router.post('/process-images', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Nenhuma imagem foi enviada'
            });
        }

        const customDate = req.body.customDate || null;
        const result = await processParticipationImages(req.files, customDate);
        if (result.success) {
            return res.status(201).json({ success: true, data: result.data });
        } else {
            return res.status(400).json({ success: false, error: result.error, details: result.details });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

export default router;
