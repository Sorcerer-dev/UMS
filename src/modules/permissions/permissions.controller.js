const permissionsService = require('./permissions.service');

class PermissionsController {
    async grantPermission(req, res, next) {
        try {
            const { recipientId, action, durationMinutes } = req.body;

            if (!recipientId || !action || !durationMinutes) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            // In a real system, we'd also verify the grantor actually has the right to grant this action
            // For now, we allow the delegation insertion.
            const grant = await permissionsService.grantTemporaryPermission(
                req.user.id,
                recipientId,
                action,
                durationMinutes
            );

            res.status(201).json({
                message: 'Temporary permission granted successfully',
                grant
            });
        } catch (error) {
            if (error.message === 'Recipient not found') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }
}

module.exports = new PermissionsController();
