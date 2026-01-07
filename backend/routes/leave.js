const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all leave requests
router.get('/', async (req, res) => {
    try {
        const { status, employee_id, search } = req.query;
        let query = `
      SELECT lr.*, e.name as employee_name, e.email, e.department_id 
      FROM leave_requests lr 
      JOIN employees e ON lr.employee_id = e.id
    `;
        const params = [];
        const conditions = [];

        if (status) {
            params.push(status);
            conditions.push(`lr.status = $${params.length}`);
        }

        if (employee_id) {
            params.push(employee_id);
            conditions.push(`lr.employee_id = $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`e.name ILIKE $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY lr.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
});

// Get single leave request
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT lr.*, e.name as employee_name, e.email 
      FROM leave_requests lr 
      JOIN employees e ON lr.employee_id = e.id 
      WHERE lr.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching leave request:', error);
        res.status(500).json({ error: 'Failed to fetch leave request' });
    }
});

// Create leave request (Admin side)
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { employee_id, leave_type, start_date, end_date, reason } = req.body;

        // Calculate days
        const start = new Date(start_date);
        const end = new Date(end_date);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // 1. Check/Deduct Balance for Casual/Sick
        if (leave_type === 'Casual' || leave_type === 'Sick') {
            const balanceColumn = leave_type === 'Casual' ? 'casual_leave_balance' : 'sick_leave_balance';
            const empRes = await client.query(`SELECT ${balanceColumn} FROM employees WHERE id = $1`, [employee_id]);
            const currentBalance = empRes.rows[0][balanceColumn];

            if (currentBalance < days) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: `Insufficient ${leave_type} leave balance. Available: ${currentBalance}` });
            }

            await client.query(`UPDATE employees SET ${balanceColumn} = ${balanceColumn} - $1 WHERE id = $2`, [days, employee_id]);
        }

        // 2. Create Leave Record (Set Approved immediately as it is from Admin)
        const result = await client.query(`
            INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days, reason, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
        `, [employee_id, leave_type, start_date, end_date, days, reason, 'Approved']);

        // 3. Auto-mark Attendance
        // For each day in range, create attendance record with status 'Leave'
        let current = new Date(start_date);
        const endDay = new Date(end_date);
        while (current <= endDay) {
            const dateStr = current.toISOString().split('T')[0];
            await client.query(`
                INSERT INTO attendance (employee_id, date, status)
                VALUES ($1, $2, $3)
                ON CONFLICT (employee_id, date) DO UPDATE SET status = 'Leave'
            `, [employee_id, dateStr, 'Leave']);
            current.setDate(current.getDate() + 1);
        }

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating leave request:', error);
        res.status(500).json({ error: 'Failed to create leave request' });
    } finally {
        client.release();
    }
});

// Update leave request status (Approve/Reject)
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(`
      UPDATE leave_requests 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING *
    `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ error: 'Failed to update leave status' });
    }
});

// Update leave request
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { leave_type, start_date, end_date, days, reason, status } = req.body;

        const result = await pool.query(`
      UPDATE leave_requests 
      SET leave_type = $1, start_date = $2, end_date = $3, days = $4, reason = $5, status = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 
      RETURNING *
    `, [leave_type, start_date, end_date, days, reason, status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({ error: 'Failed to update leave request' });
    }
});

// Delete leave request
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM leave_requests WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        res.json({ message: 'Leave request deleted successfully' });
    } catch (error) {
        console.error('Error deleting leave request:', error);
        res.status(500).json({ error: 'Failed to delete leave request' });
    }
});

// Get leave statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'Approved' AND CURRENT_DATE BETWEEN start_date AND end_date THEN 1 END) as on_leave_today
      FROM leave_requests
    `);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching leave stats:', error);
        res.status(500).json({ error: 'Failed to fetch leave statistics' });
    }
});

module.exports = router;
