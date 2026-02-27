const db = require('../../config/db');

class NoticesModel {
    static async create(noticeData) {
        const [notice] = await db('notices')
            .insert({
                title: noticeData.title,
                content: noticeData.content,
                author_id: noticeData.author_id,
                department_id: noticeData.department_id,
                visibility: JSON.stringify(noticeData.visibility || []),
            })
            .returning('*');
        return notice;
    }

    static async getAllByDepartment(departmentId) {
        const query = db('notices')
            .select('notices.*', 'users.name as author_name', 'users.email as author_email')
            .leftJoin('users', 'notices.author_id', 'users.id')
            .orderBy('notices.created_at', 'desc');

        if (departmentId) {
            query.where('notices.department_id', departmentId).orWhereNull('notices.department_id');
        }

        const notices = await query;
        return notices.map(n => ({
            ...n,
            visibility: typeof n.visibility === 'string' ? JSON.parse(n.visibility) : n.visibility
        }));
    }
}

module.exports = NoticesModel;
