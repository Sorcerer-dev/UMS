const db = require('../../config/db');
const { TAG_RANKS } = require('../../middleware/hierarchyValidator');

class ChannelsService {
    async createChannel(name, minimumTagRequired, creatorId) {
        const [channel] = await db('channels').insert({
            name,
            minimum_tag_required: minimumTagRequired
        }).returning('*');

        await db('audit_logs').insert({
            user_id: creatorId,
            action: 'CREATE_CHANNEL',
            resource: 'channels',
            resource_id: channel.id,
            details: JSON.stringify({ name, minimumTagRequired })
        });

        return channel;
    }

    async postMessage(channelId, senderId, senderTag, content) {
        const channel = await db('channels').where({ id: channelId }).first();
        if (!channel) throw new Error('Channel not found');

        if (TAG_RANKS[senderTag] < TAG_RANKS[channel.minimum_tag_required]) {
            throw new Error('Tag level insufficient to participate in this channel');
        }

        const [message] = await db('messages').insert({
            channel_id: channelId,
            sender_id: senderId,
            sender_tag: senderTag,
            content: content
        }).returning('*');

        return message;
    }

    async getMessages(channelId, fetcherTag) {
        const channel = await db('channels').where({ id: channelId }).first();
        if (!channel) throw new Error('Channel not found');

        if (TAG_RANKS[fetcherTag] < TAG_RANKS[channel.minimum_tag_required]) {
            throw new Error('Tag level insufficient to participate in this channel');
        }

        // Retrieve messages
        return await db('messages')
            .where({ channel_id: channelId })
            .orderBy('created_at', 'desc')
            .limit(50);
    }
}

module.exports = new ChannelsService();
