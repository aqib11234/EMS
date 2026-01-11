const pool = require('../config/database');

async function runMigrations() {
    const client = await pool.connect();

    try {
        console.log('🔄 Checking and running migrations...');

        // Check if month column is VARCHAR
        const columnCheck = await client.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'payroll' AND column_name = 'month'
        `);

        if (columnCheck.rows.length === 0) {
            console.log('⚠️  Payroll table or month column does not exist yet');
            return;
        }

        const dataType = columnCheck.rows[0].data_type;
        console.log(`Current month column type: ${dataType}`);

        if (dataType === 'character varying' || dataType === 'varchar') {
            console.log('🔄 Migration needed: Converting month from VARCHAR to INTEGER...');

            await client.query('BEGIN');

            // Step 1: Add temporary column
            await client.query(`
                ALTER TABLE payroll 
                ADD COLUMN IF NOT EXISTS month_temp INTEGER
            `);

            // Step 2: Copy data, converting VARCHAR to INTEGER
            await client.query(`
                UPDATE payroll 
                SET month_temp = CAST(month AS INTEGER)
                WHERE month ~ '^[0-9]+$'
            `);

            // Step 3: Drop old column
            await client.query(`
                ALTER TABLE payroll 
                DROP COLUMN month
            `);

            // Step 4: Rename temp column
            await client.query(`
                ALTER TABLE payroll 
                RENAME COLUMN month_temp TO month
            `);

            // Step 5: Add NOT NULL constraint
            await client.query(`
                ALTER TABLE payroll 
                ALTER COLUMN month SET NOT NULL
            `);

            // Step 6: Recreate unique constraint
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
            console.log('✅ Migration completed: month is now INTEGER');
        } else if (dataType === 'integer') {
            console.log('✅ No migration needed: month is already INTEGER');
        } else {
            console.log(`⚠️  Unexpected data type: ${dataType}`);
        }

        // Migration 2: Add leave balance columns
        console.log('\n🔄 Checking leave balance columns...');
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
            console.log('🔄 Adding leave balance columns...');
            await client.query('BEGIN');

            if (casualCheck.rows.length === 0) {
                await client.query(`
                    ALTER TABLE employees 
                    ADD COLUMN casual_leave_balance INTEGER DEFAULT 12
                `);
                console.log('✅ Added casual_leave_balance column');
            }

            if (sickCheck.rows.length === 0) {
                await client.query(`
                    ALTER TABLE employees 
                    ADD COLUMN sick_leave_balance INTEGER DEFAULT 10
                `);
                console.log('✅ Added sick_leave_balance column');
            }

            await client.query('COMMIT');
            console.log('✅ Leave balance columns migration completed');
        } else {
            console.log('✅ Leave balance columns already exist');
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error);
        // Don't throw - let the app start anyway
    } finally {
        client.release();
    }
}

// Run migrations
runMigrations()
    .then(() => {
        console.log('✅ Migration check complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration error:', error);
        process.exit(1);
    });
