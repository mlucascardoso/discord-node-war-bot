import { deleteMember, getMemberById, updateMember } from '../../backend/src/api/members.js';
import { handleMethodNotAllowed, handleOptionsRequest, setCorsHeaders } from '../../backend/src/utils/cors.js';

function handleGetMember(req, res, id) {
    const member = getMemberById(id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }
    res.status(200).json(member);
}

function handleUpdateMember(req, res, id) {
    const result = updateMember(id, req.body);
    if (result.success) {
        res.status(200).json(result.data);
    } else {
        const statusCode = result.error === 'Member not found' ? 404 : 400;
        res.status(statusCode).json({
            error: result.error,
            details: result.details
        });
    }
}

function handleDeleteMember(req, res, id) {
    const result = deleteMember(id);
    if (result.success) {
        res.status(200).json({
            message: 'Member deleted successfully',
            data: result.data
        });
    } else {
        res.status(404).json({ error: result.error });
    }
}

export default function handler(req, res) {
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
                return handleGetMember(req, res, id);
            case 'PUT':
                return handleUpdateMember(req, res, id);
            case 'DELETE':
                return handleDeleteMember(req, res, id);
            default:
                return handleMethodNotAllowed(res, req.method, allowedMethods);
        }
    } catch (error) {
        console.error(`Error handling ${req.method} request for member ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
