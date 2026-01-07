const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get comprehensive dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get all statistics in parallel
        const [
            employeeCount,
            departmentCount,
            todayAttendance,
            leaveStats,
            payrollStats,
            announcementCount,
            recentEmployees
        ] = await Promise.all([
            // Total employees
            pool.query('SELECT COUNT(*) as count FROM employees'),

            // Total departments
            pool.query('SELECT COUNT(*) as count FROM departments'),

            // Today's attendance
            pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
          COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent,
          COUNT(CASE WHEN status = 'Late' THEN 1 END) as late
        FROM attendance 
        WHERE date = CURRENT_DATE
      `),

            // Leave statistics
            pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'Approved' AND CURRENT_DATE BETWEEN start_date AND end_date THEN 1 END) as on_leave_today
        FROM leave_requests
      `),

            // Payroll statistics
            pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'Paid' THEN 1 END) as paid
        FROM payroll
      `),

            // Total announcements
            pool.query('SELECT COUNT(*) as count FROM announcements'),

            // Recent employees (last 5)
            pool.query(`
        SELECT e.*, d.name as department_name 
        FROM employees e 
        LEFT JOIN departments d ON e.department_id = d.id 
        ORDER BY e.created_at DESC 
        LIMIT 5
      `)
        ]);

        const stats = {
            employees: {
                total: parseInt(employeeCount.rows[0].count),
            },
            departments: {
                total: parseInt(departmentCount.rows[0].count),
            },
            attendance: {
                today: {
                    total: parseInt(todayAttendance.rows[0]?.total || 0),
                    present: parseInt(todayAttendance.rows[0]?.present || 0),
                    absent: parseInt(todayAttendance.rows[0]?.absent || 0),
                    late: parseInt(todayAttendance.rows[0]?.late || 0),
                }
            },
            leave: {
                total: parseInt(leaveStats.rows[0].total),
                pending: parseInt(leaveStats.rows[0].pending),
                approved: parseInt(leaveStats.rows[0].approved),
                onLeaveToday: parseInt(leaveStats.rows[0].on_leave_today),
            },
            payroll: {
                total: parseInt(payrollStats.rows[0].total),
                pending: parseInt(payrollStats.rows[0].pending),
                paid: parseInt(payrollStats.rows[0].paid),
            },
            announcements: {
                total: parseInt(announcementCount.rows[0].count),
            },
            recentEmployees: recentEmployees.rows,
            lastUpdated: new Date().toISOString()
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// Get department-wise employee distribution
router.get('/departments/distribution', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT d.name, d.id, COUNT(e.id) as employee_count 
      FROM departments d 
      LEFT JOIN employees e ON d.id = e.department_id 
      GROUP BY d.id, d.name 
      ORDER BY employee_count DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching department distribution:', error);
        res.status(500).json({ error: 'Failed to fetch department distribution' });
    }
});

// Get attendance trends (last 7 days)
router.get('/attendance/trends', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'Late' THEN 1 END) as late
      FROM attendance 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY date 
      ORDER BY date DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching attendance trends:', error);
        res.status(500).json({ error: 'Failed to fetch attendance trends' });
    }
});

// Get leave trends (monthly)
router.get('/leave/trends', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        TO_CHAR(start_date, 'YYYY-MM') as month,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending
      FROM leave_requests 
      WHERE start_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(start_date, 'YYYY-MM')
      ORDER BY month DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching leave trends:', error);
        res.status(500).json({ error: 'Failed to fetch leave trends' });
    }
});

module.exports = router;
