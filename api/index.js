export default function handler(req, res) {
    res.json({
        message: 'Discord Node War Bot API',
        endpoints: {
            status: '/api/status',
            channels: '/api/channels',
            nodewar: 'POST /api/nodewar'
        }
    });
}
