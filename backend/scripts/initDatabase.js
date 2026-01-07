const pool = require('../config/database');

const createTables = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create Departments table
        await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create Employees table
        await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        position VARCHAR(100),
        salary DECIMAL(10, 2),
        experience VARCHAR(50),
        hire_date DATE,
        status VARCHAR(20) DEFAULT 'Approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create Attendance table
        await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status VARCHAR(20) DEFAULT 'Present',
        hours DECIMAL(4, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, date)
      )
    `);

        // Create Leave Requests table
        await client.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        leave_type VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days INTEGER NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create Payroll table
        await client.query(`
      CREATE TABLE IF NOT EXISTS payroll (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        month VARCHAR(20) NOT NULL,
        year INTEGER NOT NULL,
        basic_salary DECIMAL(10, 2) NOT NULL,
        allowances DECIMAL(10, 2) DEFAULT 0,
        deductions DECIMAL(10, 2) DEFAULT 0,
        net_salary DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        payment_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, month, year)
      )
    `);

        // Create Announcements table
        await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'Normal',
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await client.query('COMMIT');
        console.log('✅ All tables created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        client.release();
    }
};

const seedInitialData = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert default departments
        const departments = [
            ['Engineering', 'Software Development and IT'],
            ['Finance', 'Financial Management and Accounting'],
            ['HR', 'Human Resources Management'],
            ['Marketing', 'Marketing and Sales'],
            ['Operations', 'Operations and Logistics'],
            ['Support', 'Customer Support']
        ];

        for (const [name, description] of departments) {
            await client.query(
                'INSERT INTO departments (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
                [name, description]
            );
        }

        // Insert sample employees
        const employees = [
            ['sumit kumar', 'sumit@example.com', '1234567890', null, 'Developer', 10000.00, '2 years', '2023-01-15'],
            ['mohan kumar', 'mohan@example.com', '0987654321', 2, 'Accountant', 9000.00, '3 years', '2022-06-20']
        ];

        for (const emp of employees) {
            await client.query(
                `INSERT INTO employees (name, email, phone, department_id, position, salary, experience, hire_date, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (email) DO NOTHING`,
                [...emp, 'Approved']
            );
        }

        // Insert sample announcement
        await client.query(
            `INSERT INTO announcements (title, content, priority, created_by) 
       VALUES ($1, $2, $3, $4)`,
            ['Welcome to EMS', 'Welcome to our new Employee Management System!', 'High', 'Admin']
        );

        await client.query('COMMIT');
        console.log('✅ Initial data seeded successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding data:', error);
        throw error;
    } finally {
        client.release();
    }
};

const initializeDatabase = async () => {
    try {
        console.log('🚀 Initializing database...');
        await createTables();
        await seedInitialData();
        console.log('✅ Database initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { createTables, seedInitialData, initializeDatabase };
