const pool = require('../config/database');

async function checkLeaveRequests() {
    try {
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'leave_requests'
        `);
        console.table(columns.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkLeaveRequests();
