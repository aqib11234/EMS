const pool = require('../config/database');

async function migrate() {
    try {
        console.log("Starting migration...");

        // 1. Update employees table
        console.log("Adding leave balance columns to employees...");
        await pool.query(`
            ALTER TABLE employees 
            ADD COLUMN IF NOT EXISTS casual_leave_balance INTEGER DEFAULT 12,
            ADD COLUMN IF NOT EXISTS sick_leave_balance INTEGER DEFAULT 8;
        `);

        // 2. Create salary_advances table
        console.log("Creating salary_advances table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS salary_advances (
                id SERIAL PRIMARY KEY,
                employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
                amount NUMERIC NOT NULL,
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                deduction_type VARCHAR(50) NOT NULL,
                installment_amount NUMERIC DEFAULT 0,
                remaining_amount NUMERIC NOT NULL,
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
