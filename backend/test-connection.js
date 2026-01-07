const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ems_db',
    password: 'root',
    port: 5432,
});

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('Host: localhost');
        console.log('Database: ems_db');
        console.log('User: postgres');
        console.log('Port: 5432');

        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL!');

        const result = await client.query('SELECT version()');
        console.log('PostgreSQL version:', result.rows[0].version);

        client.release();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testConnection();
