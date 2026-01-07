const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all departments
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT d.*, COUNT(e.id) as employee_count 
      FROM departments d 
      LEFT JOIN employees e ON d.id = e.department_id 
      GROUP BY d.id 
      ORDER BY d.name
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

// Get single department
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ error: 'Failed to fetch department' });
    }
});

// Create new department
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;

        const result = await pool.query(
            'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating department:', error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Department name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create department' });
        }
    }
});

// Update department
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const result = await pool.query(
            'UPDATE departments SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [name, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ error: 'Failed to update department' });
    }
});

// Delete department
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json({ message: 'Department deleted successfully', department: result.rows[0] });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

// Get department count
router.get('/stats/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM departments');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error fetching department count:', error);
        res.status(500).json({ error: 'Failed to fetch department count' });
    }
});

module.exports = router;
