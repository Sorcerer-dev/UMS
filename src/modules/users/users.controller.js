const usersService = require('./users.service');

class UsersController {
    async createUser(req, res, next) {
        try {
            const { email, password, tag } = req.body;

            if (!email || !password || !tag) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newUser = await usersService.createUser(
                req.user.id,
                req.user.tag,
                req.user.department_id,
                req.body
            );

            res.status(201).json({
                message: 'User created successfully',
                user: newUser
            });
        } catch (error) {
            if (error.code === '23505') { // Postgres unique violation (email)
                return res.status(409).json({ error: 'Email already exists' });
            }
            if (error.message.includes('Forbidden') || error.message.includes('inherit')) {
                return res.status(403).json({ error: error.message });
            }
            next(error);
        }
    }

    async getUsers(req, res, next) {
        try {
            // req.trx was injected by setPostgresContext middleware, so RLS is active.
            // This query will be automatically filtered by the DB.
            const users = await req.trx('users').select('id', 'email', 'tag', 'department_id', 'batch', 'status', 'profile_data', 'created_at');

            res.status(200).json({ users });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const userId = req.params.id;
            // Execute deletion using the RLS context so users can only delete what they have permission for
            const deletedCount = await usersService.deleteUser(req.trx, userId, req.user.id);

            if (deletedCount === 0) {
                return res.status(404).json({ error: 'User not found or you do not have permission to delete them' });
            }

            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            const userId = req.params.id;
            const updateData = req.body;

            // Execute update using the RLS context and service
            const updatedUser = await usersService.updateUser(req.trx, userId, updateData, req.user.id);

            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found or you do not have permission to edit them' });
            }

            res.status(200).json({
                message: 'User profile updated successfully',
                user: updatedUser
            });
        } catch (error) {
            if (error.message.includes('Forbidden')) {
                return res.status(403).json({ error: error.message });
            }
            next(error);
        }
    }

    async updateUserStatus(req, res, next) {
        try {
            const userId = req.params.id;
            const { status } = req.body;
            if (!['Active', 'Inactive'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            const updatedUser = await usersService.updateUserStatus(req.trx, userId, status, req.user.id);
            if (!updatedUser) return res.status(404).json({ error: 'User not found' });
            res.status(200).json({ message: 'User status updated', user: updatedUser });
        } catch (error) {
            next(error);
        }
    }

    async updateBatchStatus(req, res, next) {
        try {
            const batch = req.params.batch;
            const { departmentId, status } = req.body;
            if (!['Active', 'Inactive'].includes(status) || !departmentId) {
                return res.status(400).json({ error: 'Invalid status or missing departmentId' });
            }

            const updatedCount = await usersService.updateBatchStatus(req.trx, batch, departmentId, status, req.user.id);
            res.status(200).json({ message: `Batch status updated for ${updatedCount} students` });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UsersController();
