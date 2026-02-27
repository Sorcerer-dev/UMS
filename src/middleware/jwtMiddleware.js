const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only', (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
            }

            // Attach user payload to request
            req.user = decoded;
            next();
        });
    } else {
        res.status(401).json({ error: 'Unauthorized: Missing token' });
    }
};

module.exports = authenticateJWT;
