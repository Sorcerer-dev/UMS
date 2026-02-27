const db = require('../config/db');

const setDbSettings = async (req, res, next) => {
    if (!req.user) {
        return next(new Error('User must be authenticated before setting DB context'));
    }

    // Create a connection specifically for this request to apply context to.
    // We'll attach this instance to the request object so services can use it.
    try {
        const trx = await db.transaction();

        await trx.raw(`
      SELECT set_config('request.jwt.claim.department_id', ?, true),
             set_config('request.jwt.claim.tag', ?, true),
             set_config('request.jwt.claim.user_id', ?, true);
    `, [req.user.department_id || '', req.user.tag || '', req.user.id || '']);

        req.trx = trx;

        // We must commit or rollback the transaction at the end of the request
        res.on('finish', () => {
            if (!trx.isCompleted()) {
                if (res.statusCode >= 400) {
                    trx.rollback();
                } else {
                    trx.commit();
                }
            }
        });

        res.on('close', () => {
            if (!trx.isCompleted()) {
                trx.rollback();
            }
        });

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = setDbSettings;
