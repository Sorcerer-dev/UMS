const express = require('express');
const router = express.Router();
const permissionsController = require('./permissions.controller');
const authenticateJWT = require('../../middleware/jwtMiddleware');

router.use(authenticateJWT);

router.post('/grant', permissionsController.grantPermission);

module.exports = router;
