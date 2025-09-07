import { getMembersStats } from '../../backend/src/api/members.js';
import { handleMethodNotAllowed, handleOptionsRequest, setCorsHeaders } from '../../backend/src/utils/cors.js';

export default function handler(req, res) {
    const allowedMethods = ['GET', 'OPTIONS'];
    setCorsHeaders(res, allowedMethods);

    if (handleOptionsRequest(req, res, allowedMethods)) {
        return;
    }

    if (req.method !== 'GET') {
        return handleMethodNotAllowed(res, req.method, allowedMethods);
    }

    try {
        const stats = getMembersStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error getting members stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
