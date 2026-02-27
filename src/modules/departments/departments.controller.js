const db = require('../../config/db');

// @desc    Get all active departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
    try {
        const departments = await db('departments')
            .select('*')
            .orderBy('name', 'asc');

        res.status(200).json(departments);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Root Admin, Admin)
exports.createDepartment = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        // In PostgreSQL, RETURNING * gets the created row back
        const [newDept] = await db('departments')
            .insert({ name })
            .returning('*');

        res.status(201).json(newDept);
    } catch (error) {
        // Handle unique constraint violations
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Department name already exists' });
        }
        next(error);
    }
};
