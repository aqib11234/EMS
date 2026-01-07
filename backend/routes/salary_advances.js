const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all salary advances
router.get('/', async (req, res) => {
    try {
        const { employee_id, status, month, year } = req.query;
        let query = `
            SELECT sa.*, e.name as employee_name, d.name as department_name
            FROM salary_advances sa
            JOIN employees e ON sa.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
        `;
        const params = [];
        const conditions = [];

        if (employee_id) {
            params.push(employee_id);
            conditions.push(`sa.employee_id = $${params.length}`);
        }
        if (status) {
            params.push(status);
            conditions.push(`sa.status = $${params.length}`);
        }
        if (month) {
            params.push(parseInt(month));
            conditions.push(`sa.month = $${params.length}`);
        }
        if (year) {
            params.push(parseInt(year));
            conditions.push(`sa.year = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY sa.date DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching advances:', error);
        res.status(500).json({ error: 'Failed to fetch salary advances' });
    }
});

// Create salary advance
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { employee_id, amount, month, year } = req.body;

        const result = await client.query(`
            INSERT INTO salary_advances (employee_id, amount, date, month, year, deduction_type, remaining_amount, status)
            VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7)
            RETURNING *
        `, [employee_id, amount, month, year, 'Full', amount, 'Active']);

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating advance:', error);
        res.status(500).json({ error: 'Failed to create salary advance' });
    } finally {
        client.release();
    }
});

module.exports = router;
