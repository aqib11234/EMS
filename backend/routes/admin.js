const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Run migrations
router.post('/migrate', async (req, res) => {
    const client = await pool.connect();

    try {
        const details = [];
        details.push('Checking database schema...');

        // Check if month column is VARCHAR
        const columnCheck = await client.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'payroll' AND column_name = 'month'
        `);

        if (columnCheck.rows.length === 0) {
            return res.status(400).json({
                error: 'Payroll table or month column does not exist',
                details
            });
        }

        const dataType = columnCheck.rows[0].data_type;
        details.push(`Current month column type: ${dataType}`);

        if (dataType === 'character varying' || dataType === 'varchar') {
            details.push('Migration needed: Converting month from VARCHAR to INTEGER');

            await client.query('BEGIN');

            // Step 1: Add temporary column
            details.push('Step 1/6: Adding temporary column...');
            await client.query(`
                ALTER TABLE payroll 
                ADD COLUMN IF NOT EXISTS month_temp INTEGER
            `);

            // Step 2: Copy data
            details.push('Step 2/6: Converting existing data...');
            await client.query(`
                UPDATE payroll 
                SET month_temp = CAST(month AS INTEGER)
                WHERE month ~ '^[0-9]+$'
            `);

            // Step 3: Drop old column
            details.push('Step 3/6: Dropping old column...');
            await client.query(`
                ALTER TABLE payroll 
                DROP COLUMN month
            `);

            // Step 4: Rename temp column
            details.push('Step 4/6: Renaming column...');
            await client.query(`
                ALTER TABLE payroll 
                RENAME COLUMN month_temp TO month
            `);

            // Step 5: Add NOT NULL constraint
            details.push('Step 5/6: Adding NOT NULL constraint...');
            await client.query(`
                ALTER TABLE payroll 
                ALTER COLUMN month SET NOT NULL
            `);

            // Step 6: Recreate unique constraint
            details.push('Step 6/6: Recreating unique constraint...');
            await client.query(`
                ALTER TABLE payroll 
                DROP CONSTRAINT IF EXISTS payroll_employee_id_month_year_key
            `);
            await client.query(`
                ALTER TABLE payroll 
                ADD CONSTRAINT payroll_employee_id_month_year_key 
                UNIQUE (employee_id, month, year)
            `);

            await client.query('COMMIT');
            details.push('Migration completed successfully!');

            res.json({
                message: 'Migration completed: month is now INTEGER',
                details
            });
        } else if (dataType === 'integer') {
            details.push('No migration needed: month is already INTEGER');
            res.json({
                message: 'No migration needed',
                details
            });
        } else {
            details.push(`Unexpected data type: ${dataType}`);
        }

        // Migration 2: Add leave balance columns
        details.push('');
        details.push('Checking leave balance columns...');
        const casualCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'employees' AND column_name = 'casual_leave_balance'
        `);

        const sickCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'employees' AND column_name = 'sick_leave_balance'
        `);

        if (casualCheck.rows.length === 0 || sickCheck.rows.length === 0) {
            details.push('Adding leave balance columns...');
            await client.query('BEGIN');

            if (casualCheck.rows.length === 0) {
                await client.query(`
                    ALTER TABLE employees 
                    ADD COLUMN casual_leave_balance INTEGER DEFAULT 12
                `);
                details.push('✓ Added casual_leave_balance column (default: 12 days)');
            }

            if (sickCheck.rows.length === 0) {
                await client.query(`
                    ALTER TABLE employees 
                    ADD COLUMN sick_leave_balance INTEGER DEFAULT 10
                `);
                details.push('✓ Added sick_leave_balance column (default: 10 days)');
            }

            await client.query('COMMIT');
            details.push('Leave balance columns migration completed!');
        } else {
            details.push('✓ Leave balance columns already exist');
        }

        // Migration 3: Create salary_advances table
        details.push('');
        details.push('Checking salary_advances table...');
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'salary_advances'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            details.push('Creating salary_advances table...');
            await client.query('BEGIN');

            await client.query(`
                CREATE TABLE salary_advances (
                    id SERIAL PRIMARY KEY,
                    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
                    amount DECIMAL(10, 2) NOT NULL,
                    date DATE NOT NULL DEFAULT CURRENT_DATE,
                    month INTEGER NOT NULL,
                    year INTEGER NOT NULL,
                    deduction_type VARCHAR(20) DEFAULT 'Full',
                    installment_amount DECIMAL(10, 2),
                    remaining_amount DECIMAL(10, 2) NOT NULL,
                    status VARCHAR(20) DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await client.query('COMMIT');
            details.push('✓ salary_advances table created successfully!');
        } else {
            details.push('✓ salary_advances table already exists');
        }

        // Return success response
        res.json({
            message: 'All migrations completed successfully',
            details
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration error:', error);
        res.status(500).json({
            error: 'Migration failed: ' + error.message
        });
    } finally {
        client.release();
    }
});

// Check schema
router.get('/check-schema', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'payroll'
            ORDER BY ordinal_position
        `);

        res.json({
            message: 'Schema retrieved successfully',
            schema: result.rows
        });
    } catch (error) {
        console.error('Schema check error:', error);
        res.status(500).json({
            error: 'Failed to check schema: ' + error.message
        });
    }
});

module.exports = router;
