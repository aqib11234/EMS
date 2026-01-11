const pool = require('../config/database');

async function createSalaryAdvancesTable() {
    const client = await pool.connect();

    try {
        console.log('🔄 Checking salary_advances table...');

        // Check if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'salary_advances'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('Creating salary_advances table...');
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
            console.log('✅ salary_advances table created successfully!');
        } else {
            console.log('✅ salary_advances table already exists');

            // Check if month and year columns exist
            const monthCheck = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'salary_advances' AND column_name = 'month'
            `);

            const yearCheck = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'salary_advances' AND column_name = 'year'
            `);

            if (monthCheck.rows.length === 0 || yearCheck.rows.length === 0) {
                console.log('Adding month and year columns...');
                await client.query('BEGIN');

                if (monthCheck.rows.length === 0) {
                    await client.query(`
                        ALTER TABLE salary_advances 
                        ADD COLUMN month INTEGER
                    `);
                    console.log('✅ Added month column');
                }

                if (yearCheck.rows.length === 0) {
                    await client.query(`
                        ALTER TABLE salary_advances 
                        ADD COLUMN year INTEGER
                    `);
                    console.log('✅ Added year column');
                }

                await client.query('COMMIT');
            }
        }

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

createSalaryAdvancesTable();
