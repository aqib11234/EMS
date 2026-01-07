const pool = require('../config/database');

async function fixAttendanceConstraint() {
    try {
        console.log("Checking attendance constraints...");

        // Add unique constraint if not exists
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'attendance_employee_id_date_key'
                ) THEN 
                    ALTER TABLE attendance ADD CONSTRAINT attendance_employee_id_date_key UNIQUE (employee_id, date);
                END IF;
            END $$;
        `);

        console.log("Attendance constraint verified/added.");
        process.exit(0);
    } catch (e) {
        console.error("Failed to update attendance constraint:", e);
        process.exit(1);
    }
}

fixAttendanceConstraint();
