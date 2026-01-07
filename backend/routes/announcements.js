const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const { priority } = req.query;
        let query = 'SELECT * FROM announcements';
        const params = [];

        if (priority) {
            params.push(priority);
            query += ' WHERE priority = $1';
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// Get single announcement
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM announcements WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({ error: 'Failed to fetch announcement' });
    }
});

// Create announcement
router.post('/', async (req, res) => {
    try {
        const { title, content, priority, created_by } = req.body;

        const result = await pool.query(`
      INSERT INTO announcements (title, content, priority, created_by) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [title, content, priority || 'Normal', created_by || 'Admin']);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// Update announcement
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, priority } = req.body;

        const result = await pool.query(`
      UPDATE announcements 
      SET title = $1, content = $2, priority = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 
      RETURNING *
    `, [title, content, priority, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ error: 'Failed to update announcement' });
    }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

// Get announcement count
router.get('/stats/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM announcements');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error fetching announcement count:', error);
        res.status(500).json({ error: 'Failed to fetch announcement count' });
    }
});

module.exports = router;
