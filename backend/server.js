const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Import routes
const employeesRoutes = require('./routes/employees');
const departmentsRoutes = require('./routes/departments');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const payrollRoutes = require('./routes/payroll');
const announcementsRoutes = require('./routes/announcements');
const dashboardRoutes = require('./routes/dashboard');
const salaryAdvancesRoutes = require('./routes/salary_advances');
const adminRoutes = require('./routes/admin');

// API Routes
app.use('/api/employees', employeesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/salary-advances', salaryAdvancesRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'EMS Backend Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Employee Management System API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            dashboard: '/api/dashboard/stats',
            employees: '/api/employees',
            departments: '/api/departments',
            attendance: '/api/attendance',
            leave: '/api/leave',
            payroll: '/api/payroll',
            announcements: '/api/announcements'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Employee Management System Backend Server');
    console.log('='.repeat(50));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📈 Dashboard Stats: http://localhost:${PORT}/api/dashboard/stats`);
    console.log('='.repeat(50));
});

module.exports = app;
