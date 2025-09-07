/**
 * CORS utility functions for API routes
 */

/**
 * Set CORS headers for API responses
 * @param {Object} res - Express/Vercel response object
 * @param {string[]} methods - Allowed HTTP methods
 */
export function setCorsHeaders(res, methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handle OPTIONS preflight request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string[]} methods - Allowed HTTP methods
 * @returns {boolean} True if OPTIONS was handled, false otherwise
 */
export function handleOptionsRequest(req, res, methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']) {
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res, methods);
        res.status(200).end();
        return true;
    }
    return false;
}

/**
 * Handle method not allowed error
 * @param {Object} res - Response object
 * @param {string} method - Current request method
 * @param {string[]} allowedMethods - Allowed HTTP methods
 */
export function handleMethodNotAllowed(res, method, allowedMethods) {
    res.status(405).json({
        error: 'Method not allowed',
        allowed: allowedMethods,
        received: method
    });
}
