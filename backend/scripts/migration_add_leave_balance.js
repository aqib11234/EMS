const pool = require('../config/database');

async function addLeaveBalanceColumns() {
    const client = await pool.connect();

    try {
        console.log('🔄 Adding leave balance columns to employees table...');

        await client.query('BEGIN');

        // Check if columns already exist
        const checkCasual = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'employees' AND column_name = 'casual_leave_balance'
        `);

        const checkSick = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'employees' AND column_name = 'sick_leave_balance'
        `);

        if (checkCasual.rows.length === 0) {
            console.log('Adding casual_leave_balance column...');
            await client.query(`
                ALTER TABLE employees 
                ADD COLUMN casual_leave_balance INTEGER DEFAULT 12
            `);
            console.log('✅ casual_leave_balance column added');
        } else {
            console.log('✅ casual_leave_balance column already exists');
        }

        if (checkSick.rows.length === 0) {
            console.log('Adding sick_leave_balance column...');
            await client.query(`
                ALTER TABLE employees 
                ADD COLUMN sick_leave_balance INTEGER DEFAULT 10
            `);
            console.log('✅ sick_leave_balance column added');
        } else {
            console.log('✅ sick_leave_balance column already exists');
        }

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        process.exit(0);
    }
}

addLeaveBalanceColumns();
