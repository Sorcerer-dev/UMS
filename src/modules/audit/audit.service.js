const db = require('../../config/db');

class AuditService {
    /**
     * Logs an action asynchronously to avoid blocking the main thread
     */
    async logAction(userId, action, resource, resourceId, details = null) {
        try {
            await db('audit_logs').insert({
                user_id: userId,
                action,
                resource,
                resource_id: resourceId,
                details: details ? JSON.stringify(details) : null
            });
        } catch (error) {
            console.error('Failed to write audit log:', error);
            // We log but don't strictly throw to avoid breaking flow unless necessary
        }
    }

    /**
     * Retrieves audit logs with optional filtering (Admin only in controller)
     */
    async getLogs(filters = {}) {
        let query = db('audit_logs').select('*').orderBy('created_at', 'desc');

        if (filters.user_id) query = query.where({ user_id: filters.user_id });
        if (filters.action) query = query.where({ action: filters.action });

        return await query;
    }
}

module.exports = new AuditService();
