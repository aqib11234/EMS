const pool = require('../config/database');

async function migratePayrollMonthToInteger() {
    const client = await pool.connect();

    try {
        console.log('🔄 Starting migration: Change payroll.month from VARCHAR to INTEGER...');

        await client.query('BEGIN');

        // Step 1: Add a temporary column
        console.log('Step 1: Adding temporary column...');
        await client.query(`
            ALTER TABLE payroll 
            ADD COLUMN IF NOT EXISTS month_temp INTEGER
        `);

        // Step 2: Copy data, converting VARCHAR to INTEGER
        console.log('Step 2: Converting existing data...');
        await client.query(`
            UPDATE payroll 
            SET month_temp = CAST(month AS INTEGER)
            WHERE month ~ '^[0-9]+$'
        `);

        // Step 3: Drop the old column
        console.log('Step 3: Dropping old column...');
        await client.query(`
            ALTER TABLE payroll 
            DROP COLUMN month
        `);

        // Step 4: Rename temp column to month
        console.log('Step 4: Renaming column...');
        await client.query(`
            ALTER TABLE payroll 
            RENAME COLUMN month_temp TO month
        `);

        // Step 5: Add NOT NULL constraint
        console.log('Step 5: Adding NOT NULL constraint...');
        await client.query(`
            ALTER TABLE payroll 
            ALTER COLUMN month SET NOT NULL
        `);

        // Step 6: Recreate the unique constraint
        console.log('Step 6: Recreating unique constraint...');
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
        console.log('✅ Migration completed successfully!');
        console.log('✅ payroll.month is now INTEGER type');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        process.exit(0);
    }
}

migratePayrollMonthToInteger();
