const pool = require('../config/database');

async function testEmployeesQuery() {
    try {
        console.log("Testing Employees Query...");

        // Simulating the logic in routes/employees.js
        const month = "1";
        const year = "2026";
        const queryParams = [];
        let paramIndex = 1;

        let dateCondition = `a.date = CURRENT_DATE`;
        let monthCondition = `CAST(p.month AS INTEGER) = CAST(EXTRACT(MONTH FROM CURRENT_DATE) AS INTEGER)`;
        if (month) {
            monthCondition = `CAST(p.month AS INTEGER) = $${paramIndex}::integer`;
            queryParams.push(parseInt(month));
            paramIndex++;
        }

        let yearCondition = `p.year = CAST(EXTRACT(YEAR FROM CURRENT_DATE) AS INTEGER)`;
        if (year) {
            yearCondition = `p.year = $${paramIndex}::integer`;
            queryParams.push(parseInt(year));
            paramIndex++;
        }

        const query = `
            SELECT e.*, d.name as department_name,
                   COALESCE(a.status, 'Pending') as attendance_status,
                   COALESCE(p.status, 'Pending') as payroll_status,
                   COALESCE(p.deductions, 0) as deductions,
                   COALESCE(p.net_salary, e.salary) as current_net_salary,
                   EXISTS(
                       SELECT 1 FROM leave_requests lr 
                       WHERE lr.employee_id = e.id 
                       AND lr.status = 'Approved' 
                       AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date
                   ) as is_on_leave
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.id 
            LEFT JOIN attendance a ON e.id = a.employee_id AND ${dateCondition}
            LEFT JOIN payroll p ON e.id = p.employee_id AND ${monthCondition} AND ${yearCondition}
            ORDER BY e.id DESC
        `;

        console.log("Query:", query);
        console.log("Params:", queryParams);

        const result = await pool.query(query, queryParams);
        console.log("Result rows count:", result.rows.length);
        if (result.rows.length > 0) {
            console.log("First row position:", result.rows[0].position);
        } else {
            const allEmps = await pool.query("SELECT * FROM employees");
            console.log("Total employees in DB:", allEmps.rows.length);
        }

        process.exit(0);
    } catch (e) {
        console.error("Query Failed!");
        console.error(e);
        process.exit(1);
    }
}

testEmployeesQuery();
