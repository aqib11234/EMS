const pool = require('../config/database');

async function checkSchema() {
    try {
        console.log("Checking schema...");
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'payroll';
        `);
        console.table(res.rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
