const bcrypt = require('bcrypt');
const db = require('../../config/db');

class UsersService {
    async createUser(creatorId, creatorTag, creatorDeptId, userData) {
        const { email, password, tag, department_id, batch, name } = userData;

        // Determine target department
        // Admins and above can specify the department. Deans and below inherit the creator's department.
        let targetDeptId = null;
        const adminTags = ['Root Admin', 'Managing Director', 'Admin'];

        if (adminTags.includes(creatorTag)) {
            targetDeptId = department_id || null;
        } else {
            // Must inherit creator's department
            if (!creatorDeptId) {
                throw new Error('Creator does not belong to a department to inherit');
            }
            // Cannot override
            if (department_id && department_id !== creatorDeptId) {
                throw new Error('Forbidden: Cannot assign user to a different department');
            }
            targetDeptId = creatorDeptId;
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user within transaction to also create audit log
        const [newUser] = await db.transaction(async (trx) => {
            const [user] = await trx('users').insert({
                email,
                password_hash: passwordHash,
                tag,
                department_id: targetDeptId,
                batch: tag === 'Student' ? batch : null,
                created_by: creatorId,
                profile_data: JSON.stringify(name ? { name } : {})
            }).returning(['id', 'email', 'tag', 'department_id', 'batch', 'status', 'profile_data']);

            await trx('audit_logs').insert({
                user_id: creatorId,
                action: 'CREATE_USER',
                resource: 'users',
                resource_id: user.id,
                details: JSON.stringify({ tag, department_id: targetDeptId })
            });

            return [user];
        });

        return newUser;
    }

    async deleteUser(trx, targetUserId, actionUserId) {
        // Find if user exists to record audit before deletion
        const userToDelete = await trx('users').where({ id: targetUserId }).select('id', 'email', 'tag').first();

        if (!userToDelete) {
            return 0; // Not found or no permission
        }

        const deletedCount = await trx('users')
            .where({ id: targetUserId })
            .del();

        if (deletedCount > 0) {
            await trx('audit_logs').insert({
                user_id: actionUserId,
                action: 'DELETE_USER',
                resource: 'users',
                resource_id: targetUserId,
                details: JSON.stringify({ deleted_email: userToDelete.email, deleted_tag: userToDelete.tag })
            });
        }
        return deletedCount;
    }

    async updateUser(trx, targetUserId, updateData, actionUserId) {
        // Fetch current user and profile data first to merge jsonb and verify existence
        const targetUser = await trx('users').where({ id: targetUserId }).first();
        if (!targetUser) return null;

        // Optionally, check hierarchy if we enforce it deeply in the backend. 
        // For now, relying on req.trx RLS if applicable, or explicit API checks.

        // Merge existing profile_data with the incoming profile_data
        const existingProfile = typeof targetUser.profile_data === 'string'
            ? JSON.parse(targetUser.profile_data || '{}')
            : (targetUser.profile_data || {});

        const newProfileData = {
            ...existingProfile,
            ...(updateData.profile_data || {})
        };

        // If they want to update core fields (like name/basic stuff if added later)
        const updatePayload = {
            profile_data: JSON.stringify(newProfileData)
            // Can add other safe fields here if needed
        };

        const [updatedUser] = await trx('users')
            .where({ id: targetUserId })
            .update(updatePayload)
            .returning(['id', 'email', 'tag', 'department_id', 'batch', 'profile_data']);

        if (updatedUser) {
            await trx('audit_logs').insert({
                user_id: actionUserId,
                action: 'UPDATE_USER_PROFILE',
                resource: 'users',
                resource_id: targetUserId,
                details: JSON.stringify({ updated_fields: Object.keys(updateData.profile_data || {}) })
            });
        }

        return updatedUser;
    }

    async updateUserStatus(trx, targetUserId, status, actionUserId) {
        const [updatedUser] = await trx('users')
            .where({ id: targetUserId })
            .update({ status })
            .returning(['id', 'email', 'tag', 'department_id', 'batch', 'status', 'profile_data']);

        if (updatedUser) {
            await trx('audit_logs').insert({
                user_id: actionUserId,
                action: 'UPDATE_USER_STATUS',
                resource: 'users',
                resource_id: targetUserId,
                details: JSON.stringify({ new_status: status })
            });
        }

        return updatedUser;
    }

    async updateBatchStatus(trx, batch, departmentId, status, actionUserId) {
        // Find students that belong to the department and batch
        // Update them to the new status
        const updatedUserIds = await trx('users')
            .where({ tag: 'Student', batch, department_id: departmentId })
            .update({ status })
            .returning('id');

        if (updatedUserIds.length > 0) {
            await trx('audit_logs').insert({
                user_id: actionUserId,
                action: 'UPDATE_BATCH_STATUS',
                resource: 'users',
                resource_id: null,
                details: JSON.stringify({ batch, department_id: departmentId, new_status: status, count: updatedUserIds.length })
            });
        }

        return updatedUserIds.length;
    }
}

module.exports = new UsersService();
