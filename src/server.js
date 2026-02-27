require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const permissionsRoutes = require('./modules/permissions/permissions.routes');
const channelsRoutes = require('./modules/communication/channels.routes');
const departmentsRoutes = require('./modules/departments/departments.routes');
const noticesRoutes = require('./modules/notices/notices.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/notices', noticesRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'UMS API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
