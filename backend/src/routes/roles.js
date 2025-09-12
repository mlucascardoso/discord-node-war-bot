import express from 'express';
import { addMemberRole, getAllRoles, getMemberRoles, getRoleById, removeMemberRole, updateMemberRoles } from '../api/roles.js';

const router = express.Router();

// ==================== ROLES ====================

/**
 * GET /api/roles
 * Busca todas as roles disponíveis
 */
router.get('/', async (req, res) => {
    try {
        const roles = await getAllRoles();
        res.json({
            success: true,
            roles
        });
    } catch (error) {
        console.error('Erro ao buscar roles:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar roles',
            details: error.message
        });
    }
});

/**
 * GET /api/roles/:id
 * Busca uma role específica por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const role = await getRoleById(parseInt(id));

        if (!role) {
            return res.status(404).json({
                success: false,
                error: 'Role não encontrada'
            });
        }

        res.json({
            success: true,
            role
        });
    } catch (error) {
        console.error('Erro ao buscar role:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar role',
            details: error.message
        });
    }
});

// ==================== MEMBER ROLES ====================

/**
 * GET /api/roles/member/:memberId
 * Busca todas as roles de um membro específico
 */
router.get('/member/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;
        const roles = await getMemberRoles(parseInt(memberId));

        res.json({
            success: true,
            roles
        });
    } catch (error) {
        console.error('Erro ao buscar roles do membro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar roles do membro',
            details: error.message
        });
    }
});

/**
 * POST /api/roles/member/:memberId
 * Adiciona uma role a um membro
 * Body: { roleId: number }
 */
router.post('/member/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;
        const { roleId } = req.body;

        if (!roleId) {
            return res.status(400).json({
                success: false,
                error: 'roleId é obrigatório'
            });
        }

        const result = await addMemberRole(parseInt(memberId), parseInt(roleId));

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Erro ao adicionar role ao membro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao adicionar role ao membro',
            details: error.message
        });
    }
});

/**
 * DELETE /api/roles/member/:memberId/:roleId
 * Remove uma role de um membro
 */
router.delete('/member/:memberId/:roleId', async (req, res) => {
    try {
        const { memberId, roleId } = req.params;
        const result = await removeMemberRole(parseInt(memberId), parseInt(roleId));

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Erro ao remover role do membro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao remover role do membro',
            details: error.message
        });
    }
});

/**
 * PUT /api/roles/member/:memberId
 * Atualiza todas as roles de um membro (substitui as existentes)
 * Body: { roleIds: number[] }
 */
router.put('/member/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;
        const { roleIds } = req.body;

        if (!Array.isArray(roleIds)) {
            return res.status(400).json({
                success: false,
                error: 'roleIds deve ser um array'
            });
        }

        const result = await updateMemberRoles(parseInt(memberId), roleIds);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Erro ao atualizar roles do membro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar roles do membro',
            details: error.message
        });
    }
});

export default router;
