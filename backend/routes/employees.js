const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all employees with optional status info
router.get('/', async (req, res) => {
    try {
        const { date, month, year, search } = req.query;

        // Default to current date/month if not provided, but allow overriding
        // detailed parameter management
        const queryParams = [];
        let paramIndex = 1;

        let dateCondition = `a.date = CURRENT_DATE`;
        if (date) {
            dateCondition = `a.date = $${paramIndex}::date`;
            queryParams.push(date);
            paramIndex++;
        }

        let monthCondition = `CAST(p.month AS INTEGER) = CAST(EXTRACT(MONTH FROM CURRENT_DATE) AS INTEGER)`;
        if (month) {
            monthCondition = `CAST(p.month AS INTEGER) = $${paramIndex}::integer`;
            queryParams.push(parseInt(month));
            paramIndex++;
        }

        let yearCondition = `p.year = CAST(EXTRACT(YEAR FROM CURRENT_DATE) AS INTEGER)`;
        if (year) {
            yearCondition = `p.year = $${paramIndex}::integer`;
            queryParams.push(parseInt(year));
            paramIndex++;
        }

        let searchCondition = "";
        if (search) {
            searchCondition = `AND (e.name ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex} OR e.position ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        const query = `
            SELECT e.*, d.name as department_name,
                   COALESCE(a.status, 'Pending') as attendance_status,
                   COALESCE(p.status, 'Pending') as payroll_status,
                   COALESCE(p.deductions, 0) as deductions,
                   COALESCE(p.net_salary, e.salary) as current_net_salary,
                   EXISTS(
                       SELECT 1 FROM leave_requests lr 
                       WHERE lr.employee_id = e.id 
                       AND lr.status = 'Approved' 
                       AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date
                   ) as is_on_leave
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.id 
            LEFT JOIN attendance a ON e.id = a.employee_id AND ${dateCondition}
            LEFT JOIN payroll p ON e.id = p.employee_id AND ${monthCondition} AND ${yearCondition}
            WHERE 1=1 ${searchCondition}
            ORDER BY e.id DESC
        `;

        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Get single employee
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

// Create new employee
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, department_id, position, salary, experience, hire_date } = req.body;

        const result = await pool.query(`
      INSERT INTO employees (name, email, phone, department_id, position, salary, experience, hire_date, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `, [name, email, phone, department_id, position, salary, experience, hire_date, 'Approved']);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating employee:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create employee' });
        }
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, department_id, position, salary, experience, hire_date, status } = req.body;

        const result = await pool.query(`
      UPDATE employees 
      SET name = $1, email = $2, phone = $3, department_id = $4, position = $5, 
          salary = $6, experience = $7, hire_date = $8, status = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 
      RETURNING *
    `, [name, email, phone, department_id, position, salary, experience, hire_date, status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({ message: 'Employee deleted successfully', employee: result.rows[0] });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// Get employee count
router.get('/stats/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM employees');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error fetching employee count:', error);
        res.status(500).json({ error: 'Failed to fetch employee count' });
    }
});

module.exports = router;
