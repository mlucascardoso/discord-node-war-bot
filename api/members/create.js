import { createMember } from '../../backend/src/api/members.js';
import { handleMethodNotAllowed, handleOptionsRequest, setCorsHeaders } from '../../backend/src/utils/cors.js';

export default async function handler(req, res) {
    const allowedMethods = ['POST', 'OPTIONS'];
    setCorsHeaders(res, allowedMethods);

    if (handleOptionsRequest(req, res, allowedMethods)) {
        return;
    }

    if (req.method !== 'POST') {
        return handleMethodNotAllowed(res, req.method, allowedMethods);
    }

    try {
        const result = await createMember(req.body);
        if (result.success) {
            res.status(201).json(result.data);
        } else {
            res.status(400).json({
                error: result.error,
                details: result.details
            });
        }
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
