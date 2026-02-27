const NoticesModel = require('./notices.model');

exports.createNotice = async (req, res) => {
    try {
        const { title, content, department_id, visibility } = req.body;

        // HOD, Dean, Admin, etc can post notices, simple check ensuring they exist
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const noticeData = {
            title,
            content,
            author_id: req.user.id,
            department_id: department_id || null,
            visibility: visibility || []
        };

        const notice = await NoticesModel.create(noticeData);
        res.status(201).json(notice);
    } catch (error) {
        console.error('Error creating notice:', error);
        res.status(500).json({ error: 'Failed to create notice' });
    }
};

exports.getNotices = async (req, res) => {
    try {
        const { department_id } = req.query;
        // Fetch all notices for the requested department (or global notices)
        let notices = await NoticesModel.getAllByDepartment(department_id || null);

        // Filter based on user role and batch
        if (req.user && req.user.tag === 'Student') {
            const userBatch = req.user.batch;
            notices = notices.filter(n => {
                if (!n.visibility || n.visibility.length === 0) return true; // Default visibility (no specific tags = all)
                if (n.visibility.includes('All Batches')) return true;
                if (userBatch && n.visibility.includes(userBatch)) return true;
                return false;
            });
        }

        res.status(200).json(notices);
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
};
