import { deleteMember, getMemberById, updateMember } from '../../backend/src/api/members.js';
import { handleMethodNotAllowed, handleOptionsRequest, setCorsHeaders } from '../../backend/src/utils/cors.js';

async function handleGetMember(req, res, id) {
    const member = await getMemberById(id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }
    res.status(200).json(member);
}

async function handleUpdateMember(req, res, id) {
    const result = await updateMember(id, req.body);
    if (result.success) {
        res.status(200).json(result.data);
    } else {
        const statusCode = result.error === 'Membro não encontrado' ? 404 : 400;
        res.status(statusCode).json({
            error: result.error,
            details: result.details
        });
    }
}

async function handleDeleteMember(req, res, id) {
    const result = await deleteMember(id);
    if (result.success) {
        res.status(200).json({
            message: 'Member deleted successfully',
            data: result.data
        });
    } else {
        res.status(404).json({ error: result.error });
    }
}

export default async function handler(req, res) {
    const allowedMethods = ['GET', 'PUT', 'DELETE', 'OPTIONS'];
    setCorsHeaders(res, allowedMethods);

    if (handleOptionsRequest(req, res, allowedMethods)) {
        return;
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Member ID is required' });
    }

    try {
        switch (req.method) {
            case 'GET':
                return await handleGetMember(req, res, id);
            case 'PUT':
                return await handleUpdateMember(req, res, id);
            case 'DELETE':
                return await handleDeleteMember(req, res, id);
            default:
                return handleMethodNotAllowed(res, req.method, allowedMethods);
        }
    } catch (error) {
        console.error(`Error handling ${req.method} request for member ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
