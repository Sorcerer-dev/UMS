const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

const authenticateJWT = require('../../middleware/jwtMiddleware');

// Note: No public registration endpoint per requirements.
// Users are created hierarchically by authenticated users via the Users module.

router.post('/login', authController.login);

// Change password (requires auth)
router.put('/change-password', authenticateJWT, authController.changePassword);

module.exports = router;
