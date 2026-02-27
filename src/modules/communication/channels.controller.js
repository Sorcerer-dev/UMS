const channelsService = require('./channels.service');

class ChannelsController {
    async createChannel(req, res, next) {
        try {
            const { name, minimumTagRequired } = req.body;
            if (!name || !minimumTagRequired) {
                return res.status(400).json({ error: 'Name and minimum tag are required' });
            }

            // Typically only Admins or Root Admins can create overarching channels
            const allowedTags = ['Root Admin', 'Managing Director', 'Admin'];
            if (!allowedTags.includes(req.user.tag)) {
                return res.status(403).json({ error: 'Only administrators can create channels' });
            }

            const channel = await channelsService.createChannel(name, minimumTagRequired, req.user.id);
            res.status(201).json({ channel });
        } catch (error) {
            next(error);
        }
    }

    async postMessage(req, res, next) {
        try {
            const { channelId } = req.params;
            const { content } = req.body;

            if (!content) return res.status(400).json({ error: 'Message content required' });

            const message = await channelsService.postMessage(
                channelId,
                req.user.id,
                req.user.tag,
                content
            );

            res.status(201).json({ message });
        } catch (error) {
            if (error.message.includes('Tag level insufficient') || error.message.includes('not found')) {
                return res.status(403).json({ error: error.message });
            }
            next(error);
        }
    }

    async getMessages(req, res, next) {
        try {
            const { channelId } = req.params;
            const messages = await channelsService.getMessages(channelId, req.user.tag);
            res.status(200).json({ messages });
        } catch (error) {
            if (error.message.includes('Tag level insufficient') || error.message.includes('not found')) {
                return res.status(403).json({ error: error.message });
            }
            next(error);
        }
    }
}

module.exports = new ChannelsController();
