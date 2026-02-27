const db = require('../../config/db');

class PermissionsService {
    async grantTemporaryPermission(grantorId, recipientId, action, durationMinutes) {
        // 1. Verify recipient exists
        const recipient = await db('users').where({ id: recipientId }).first();
        if (!recipient) throw new Error('Recipient not found');

        // 2. Calculate expiration
        const expiresAt = new Date(Date.now() + durationMinutes * 60000);

        // 3. Insert grant
        const [grant] = await db('temporary_permissions').insert({
            grantor_id: grantorId,
            recipient_id: recipientId,
            action: action,
            expires_at: expiresAt
        }).returning('*');

        // 4. Audit Log
        await db('audit_logs').insert({
            user_id: grantorId,
            action: 'GRANT_TEMP_PERMISSION',
            resource: 'temporary_permissions',
            resource_id: grant.id,
            details: JSON.stringify({ recipientId, action, durationMinutes })
        });

        return grant;
    }
}

module.exports = new PermissionsService();
