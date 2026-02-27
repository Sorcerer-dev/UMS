const express = require('express');
const router = express.Router();
const noticesController = require('./notices.controller');
const authenticateJWT = require('../../middleware/jwtMiddleware');

router.use(authenticateJWT);

router.post('/', noticesController.createNotice);
router.get('/', noticesController.getNotices);

module.exports = router;
