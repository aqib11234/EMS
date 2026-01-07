const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all attendance records
router.get('/', async (req, res) => {
    try {
        const { date, employee_id, search } = req.query;
        let query = `
      SELECT a.*, e.name as employee_name, e.email 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id
    `;
        const params = [];
        const conditions = [];

        if (date) {
            params.push(date);
            conditions.push(`a.date = $${params.length}`);
        }

        if (employee_id) {
            params.push(employee_id);
            conditions.push(`a.employee_id = $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`e.name ILIKE $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.date DESC, a.id DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

// Get attendance for today
router.get('/today', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT a.*, e.name as employee_name, e.email 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id 
      WHERE a.date = CURRENT_DATE 
      ORDER BY a.id DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching today attendance:', error);
        res.status(500).json({ error: 'Failed to fetch today attendance' });
    }
});

// Mark attendance
router.post('/', async (req, res) => {
    try {
        const { employee_id, date, check_in, check_out, status, hours } = req.body;

        const result = await pool.query(`
      INSERT INTO attendance (employee_id, date, check_in, check_out, status, hours) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (employee_id, date) 
      DO UPDATE SET check_in = $3, check_out = $4, status = $5, hours = $6, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [employee_id, date, check_in, check_out, status, hours]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

// Update attendance
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { check_in, check_out, status, hours } = req.body;

        const result = await pool.query(`
      UPDATE attendance 
      SET check_in = $1, check_out = $2, status = $3, hours = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 
      RETURNING *
    `, [check_in, check_out, status, hours, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
});

// Delete attendance
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM attendance WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        res.json({ message: 'Attendance deleted successfully' });
    } catch (error) {
        console.error('Error deleting attendance:', error);
        res.status(500).json({ error: 'Failed to delete attendance' });
    }
});

// Get attendance statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || 'CURRENT_DATE';

        const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'Late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'Half Day' THEN 1 END) as half_day
      FROM attendance 
      WHERE date = ${date ? '$1' : 'CURRENT_DATE'}
    `, date ? [date] : []);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching attendance stats:', error);
        res.status(500).json({ error: 'Failed to fetch attendance statistics' });
    }
});

module.exports = router;
