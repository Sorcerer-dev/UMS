const db = require('../config/db');
const auditService = require('../modules/audit/audit.service');

const checkTemporaryGrants = (action) => {
    return async (req, res, next) => {
        try {
            // First, in a full implementation, you'd check if the user inherently has the permission.
            // If not, we check temporary grants:
            const grant = await db('temporary_permissions')
                .where({
                    recipient_id: req.user.id,
                    action: action,
                    is_active: true
                })
                .andWhere('expires_at', '>', new Date())
                .first();

            if (!grant) {
                return res.status(403).json({ error: `Forbidden: No active permission for action '${action}'` });
            }

            // Log the usage of the temporary permission
            await auditService.logAction(
                req.user.id,
                `USED_TEMP_${action}`,
                'temporary_permissions',
                grant.id,
                { grantor_id: grant.grantor_id }
            );

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = checkTemporaryGrants;
