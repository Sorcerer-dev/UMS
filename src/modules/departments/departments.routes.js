const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment } = require('./departments.controller');
const authenticateJWT = require('../../middleware/jwtMiddleware');

router.route('/')
    .get(authenticateJWT, getDepartments)
    .post(authenticateJWT, createDepartment);

module.exports = router;
