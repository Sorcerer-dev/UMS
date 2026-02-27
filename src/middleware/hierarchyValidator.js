const TAG_RANKS = {
    'Root Admin': 100,
    'Managing Director': 90,
    'Admin': 80,
    'Dean': 70,
    'HOD': 60,
    'Staff': 50,
    'Student': 40
};

const validateAddDownRule = (req, res, next) => {
    const creatorTag = req.user.tag;
    const targetTag = req.body.tag;

    if (!TAG_RANKS[targetTag]) {
        return res.status(400).json({ error: 'Invalid tag provided' });
    }

    // Add-down rule: Creator rank must be strictly greater than Target rank
    if (TAG_RANKS[creatorTag] <= TAG_RANKS[targetTag]) {
        return res.status(403).json({
            error: 'Hierarchical violation: Cannot create user at or above your own level'
        });
    }

    next();
};

module.exports = {
    TAG_RANKS,
    validateAddDownRule
};
