const pool = require('../config/database');

async function checkSchema() {
    try {
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name));

        const tablesToCheck = ['employees', 'attendance', 'leaves', 'payroll', 'departments'];

        for (const tableName of tablesToCheck) {
            const columns = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [tableName]);
            console.log(`\nColumns for ${tableName}:`);
            console.table(columns.rows);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
