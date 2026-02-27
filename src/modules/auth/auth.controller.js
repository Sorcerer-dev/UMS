const authService = require('./auth.service');

class AuthController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const result = await authService.login(email, password);
            res.status(200).json({
                message: 'Login successful',
                ...result
            });
        } catch (error) {
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const userId = req.user.id; // from authenticateJWT middleware
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current password and new password are required' });
            }

            await authService.changePassword(userId, currentPassword, newPassword);

            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            if (error.message === 'Invalid current password') {
                return res.status(401).json({ error: 'Invalid current password' });
            }
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            next(error);
        }
    }
}

module.exports = new AuthController();
