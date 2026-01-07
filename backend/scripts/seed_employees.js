const pool = require('../config/database');

async function seedEmployees() {
    try {
        console.log("Seeding 100 employees...");

        // Get existing departments
        const depts = await pool.query("SELECT id FROM departments");
        if (depts.rows.length === 0) {
            console.log("No departments found. Creating 'General' department...");
            const newDept = await pool.query("INSERT INTO departments (name) VALUES ('General') RETURNING id");
            depts.rows.push(newDept.rows[0]);
        }

        const deptIds = depts.rows.map(d => d.id);
        const roles = ['Software Engineer', 'Project Manager', 'HR Specialist', 'QA Engineer', 'UI/UX Designer', 'Accountant', 'Sales Executive', 'Ops Manager'];

        for (let i = 1; i <= 100; i++) {
            const name = `Employee ${i}`;
            const email = `employee${i}@ems.com`;
            const phone = `+92300${1000000 + i}`;
            const deptId = deptIds[i % deptIds.length];
            const role = roles[i % roles.length];
            const salary = 20000 + (Math.floor(Math.random() * 80) * 1000);
            const experience = Math.floor(Math.random() * 10);
            const hireDate = new Date(2023, 0, 1 + (i % 30));

            await pool.query(`
                INSERT INTO employees (name, email, phone, department_id, position, salary, experience, hire_date, status, casual_leave_balance, sick_leave_balance)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Approved', 12, 8)
                ON CONFLICT (email) DO NOTHING
            `, [name, email, phone, deptId, role, salary, experience, hireDate]);
        }

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedEmployees();
