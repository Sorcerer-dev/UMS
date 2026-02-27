const express = require('express');
const router = express.Router();
const channelsController = require('./channels.controller');
const authenticateJWT = require('../../middleware/jwtMiddleware');

router.use(authenticateJWT);

router.post('/', channelsController.createChannel);
router.post('/:channelId/messages', channelsController.postMessage);
router.get('/:channelId/messages', channelsController.getMessages);

module.exports = router;
