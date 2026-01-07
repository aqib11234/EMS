const pool = require('../config/database');

async function migrate() {
    try {
        console.log("Adding month and year to salary_advances...");
        await pool.query(`
            ALTER TABLE salary_advances 
            ADD COLUMN IF NOT EXISTS month INTEGER,
            ADD COLUMN IF NOT EXISTS year INTEGER;
        `);
        console.log("Migration successful.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
migrate();
