const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');

class AuthService {
    async login(email, password) {
        const user = await db('users').where({ email }).first();

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            {
                id: user.id,
                tag: user.tag,
                department_id: user.department_id,
                batch: user.batch,
                status: user.status
            },
            process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only',
            { expiresIn: '8h' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                tag: user.tag,
                department_id: user.department_id,
                batch: user.batch,
                status: user.status,
                profile_data: user.profile_data
            }
        };
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await db('users').where({ id: userId }).first();

        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid current password');
        }

        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        await db('users')
            .where({ id: userId })
            .update({ password_hash: newPasswordHash, updated_at: db.fn.now() });

        // Optionally, log the password change to audit logs
        await db('audit_logs').insert({
            user_id: userId,
            action: 'CHANGE_PASSWORD',
            resource: 'users',
            resource_id: userId,
            details: JSON.stringify({ message: 'User changed their own password' })
        });

        return true;
    }
}

module.exports = new AuthService();
