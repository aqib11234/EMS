const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all payroll records
router.get('/', async (req, res) => {
    try {
        const { month, year, status, employee_id, search } = req.query;
        let query = `
      SELECT p.*, e.name as employee_name, e.email, e.position, d.name as department_name
      FROM payroll p 
      JOIN employees e ON p.employee_id = e.id 
      LEFT JOIN departments d ON e.department_id = d.id
    `;
        const params = [];
        const conditions = [];

        if (month) {
            params.push(month);
            conditions.push(`p.month = $${params.length}`);
        }

        if (year) {
            params.push(parseInt(year));
            conditions.push(`p.year = $${params.length}`);
        }

        if (status) {
            params.push(status);
            conditions.push(`p.status = $${params.length}`);
        }

        if (employee_id) {
            params.push(employee_id);
            conditions.push(`p.employee_id = $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`e.name ILIKE $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.year DESC, p.month DESC, p.id DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching payroll:', error);
        res.status(500).json({ error: 'Failed to fetch payroll records' });
    }
});

// Revert payroll status to Pending
router.patch('/:id/revert', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            UPDATE payroll 
            SET status = 'Pending', payment_date = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error reverting payroll:', error);
        res.status(500).json({ error: 'Failed to revert payroll' });
    }
});

// Get single payroll record
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT p.*, e.name as employee_name, e.email, e.position 
      FROM payroll p 
      JOIN employees e ON p.employee_id = e.id 
      WHERE p.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching payroll:', error);
        res.status(500).json({ error: 'Failed to fetch payroll record' });
    }
});

// Create payroll record
router.post('/', async (req, res) => {
    try {
        const { employee_id, month, year, basic_salary, allowances, deductions, payment_date } = req.body;

        // Check for active advances
        const advances = await pool.query(
            "SELECT * FROM salary_advances WHERE employee_id = $1 AND status = 'Active'",
            [employee_id]
        );

        let totalAdvanceDeduction = 0;
        for (const sa of advances.rows) {
            if (sa.deduction_type === 'Full') {
                totalAdvanceDeduction += parseFloat(sa.remaining_amount);
            } else {
                totalAdvanceDeduction += Math.min(parseFloat(sa.installment_amount), parseFloat(sa.remaining_amount));
            }
        }

        const finalDeductions = parseFloat(deductions || 0) + totalAdvanceDeduction;
        const net_salary = parseFloat(basic_salary) + parseFloat(allowances || 0) - finalDeductions;

        const result = await pool.query(`
      INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary, status, payment_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `, [employee_id, month, year, basic_salary, allowances || 0, finalDeductions, net_salary, 'Pending', payment_date]);

        res.status(201).json({ ...result.rows[0], advance_deduction: totalAdvanceDeduction });
    } catch (error) {
        console.error('Error creating payroll:', error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Payroll already exists for this employee and period' });
        } else {
            res.status(500).json({ error: 'Failed to create payroll record' });
        }
    }
});

// Update payroll record (skip complex logic for manual update for now, or just mirror)
// ...

// Process payroll (mark as paid)
router.patch('/:id/process', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { payment_date } = req.body;

        // Get payroll info
        const payrollRes = await client.query('SELECT * FROM payroll WHERE id = $1', [id]);
        if (payrollRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Payroll record not found' });
        }
        const payroll = payrollRes.rows[0];

        // Deduct from advances if applicable
        // We look for active advances and deduct based on deduction_type
        // Note: In a real system we'd store which advance was deducted in a join table.
        // For "Simple Model", we'll just deduct from active advances.
        // Mark advances for this month/year as Paid
        await client.query(
            "UPDATE salary_advances SET remaining_amount = 0, status = 'Paid', updated_at = CURRENT_TIMESTAMP WHERE employee_id = $1 AND month = $2 AND year = $3 AND status = 'Active'",
            [payroll.employee_id, payroll.month, payroll.year]
        );

        const result = await client.query(`
      UPDATE payroll 
      SET status = 'Paid', payment_date = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING *
    `, [payment_date || new Date(), id]);

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing payroll:', error);
        res.status(500).json({ error: 'Failed to process payroll' });
    } finally {
        client.release();
    }
});

// Get payroll statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        COALESCE(SUM(basic_salary), 0) as total_salaries,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN net_salary ELSE 0 END), 0) as pending_salary,
        (SELECT COUNT(*) FROM employees WHERE status = 'Approved') as total_employees
      FROM payroll
    `);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching payroll stats:', error);
        res.status(500).json({ error: 'Failed to fetch payroll statistics' });
    }
});

// Generate payroll for all employees for a specific month
router.post('/generate', async (req, res) => {
    try {
        const { month, year } = req.body;

        // Get all employees
        const employees = await pool.query('SELECT * FROM employees WHERE status = $1', ['Approved']);

        const created = [];
        const errors = [];

        for (const employee of employees.rows) {
            try {
                // Calculation of deductions from advances for THIS SPECIFIC month/year
                const advances = await pool.query(
                    "SELECT SUM(remaining_amount) as total_advance FROM salary_advances WHERE employee_id = $1 AND status = 'Active' AND month = $2 AND year = $3",
                    [employee.id, parseInt(month), parseInt(year)]
                );
                let advanceDeduction = parseFloat(advances.rows[0].total_advance || 0);

                // 2. Unpaid Leave Deduction
                // Fetch Approved Unpaid leaves for this month
                const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
                const endDate = new Date(year, month, 0).toISOString().split('T')[0];

                const unpaidLeaves = await pool.query(`
                    SELECT SUM(days) as total_unpaid_days 
                    FROM leave_requests 
                    WHERE employee_id = $1 
                    AND leave_type = 'Unpaid' 
                    AND status = 'Approved'
                    AND start_date >= $2 AND end_date <= $3
                `, [employee.id, startDate, endDate]);

                let unpaidDeduction = 0;
                const unpaidDays = parseFloat(unpaidLeaves.rows[0].total_unpaid_days || 0);
                if (unpaidDays > 0) {
                    const perDaySalary = parseFloat(employee.salary) / 30; // Assuming 30 days
                    unpaidDeduction = unpaidDays * perDaySalary;
                }

                const totalDeductions = advanceDeduction + unpaidDeduction;
                const net_salary = parseFloat(employee.salary) - totalDeductions;

                const result = await pool.query(`
          INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary, status) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
          ON CONFLICT (employee_id, month, year) DO UPDATE SET deductions = EXCLUDED.deductions, net_salary = EXCLUDED.net_salary
          RETURNING *
        `, [employee.id, month, year, employee.salary, 0, totalDeductions, net_salary, 'Pending']);

                if (result.rows.length > 0) {
                    created.push({ ...result.rows[0], advance_deduction: advanceDeduction, unpaid_deduction: unpaidDeduction });
                }
            } catch (err) {
                errors.push({ employee_id: employee.id, error: err.message });
            }
        }

        res.json({
            message: 'Payroll generation completed',
            created: created.length,
            errors: errors.length,
            details: { created, errors }
        });
    } catch (error) {
        console.error('Error generating payroll:', error);
        res.status(500).json({ error: 'Failed to generate payroll' });
    }
});

// Pay Salary In Advance (Create 'Paid' record immediately)
router.post('/advance', async (req, res) => {
    try {
        const { employee_id, month, year, amount } = req.body;

        // Check if payroll exists
        const existing = await pool.query(
            'SELECT * FROM payroll WHERE employee_id = $1 AND month = $2 AND year = $3',
            [employee_id, month, year]
        );

        if (existing.rows.length > 0) {
            const record = existing.rows[0];
            if (record.status === 'Paid') {
                return res.status(400).json({ error: 'Salary already paid for this month' });
            }
            // Update to Paid
            const updated = await pool.query(`
                UPDATE payroll 
                SET status = 'Paid', payment_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
             `, [record.id]);
            return res.json(updated.rows[0]);
        }

        // Create new Paid record
        // Assuming we need to fetch salary amount if not provided
        let salaryAmount = amount;
        if (!salaryAmount) {
            const emp = await pool.query('SELECT salary FROM employees WHERE id = $1', [employee_id]);
            if (emp.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
            salaryAmount = emp.rows[0].salary;
        }

        const result = await pool.query(`
            INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary, status, payment_date)
            VALUES ($1, $2, $3, $4, 0, 0, $4, 'Paid', CURRENT_DATE)
            RETURNING *
        `, [employee_id, month, year, salaryAmount]);

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error paying advance salary:', error);
        res.status(500).json({ error: 'Failed to pay advance salary' });
    }
});

module.exports = router;
