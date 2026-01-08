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
            res.status(400).json({
                error: `Unexpected data type: ${dataType}`,
                details
            });
        }

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
