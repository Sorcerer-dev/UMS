const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const authenticateJWT = require('../../middleware/jwtMiddleware');
const { validateAddDownRule } = require('../../middleware/hierarchyValidator');
const setPostgresContext = require('../../middleware/setPostgresContext');

// Protect all user routes
router.use(authenticateJWT);

// Apply Postgres Context for RLS
router.use(setPostgresContext);

// Get users (filtered by RLS policies in DB)
router.get('/', usersController.getUsers);

// Delete a user
router.delete('/:id', usersController.deleteUser);

// Create a new user (enforces add-down rule hierarchically)
router.post('/', validateAddDownRule, usersController.createUser);

// Update a user's profile
router.put('/:id', usersController.updateUser);

// Update a specific user's status
router.patch('/:id/status', usersController.updateUserStatus);

// Update status for an entire batch within a department
// Requires departmentId in body so we don't accidentally deactivate same-named batches in other departments
router.patch('/batch/:batch/status', usersController.updateBatchStatus);

module.exports = router;
