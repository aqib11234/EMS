const pool = require('../config/database');

async function testQuery() {
    try {
        console.log("Testing FINAL query...");

        // Test 1: Default Case
        console.log("--- Test 1: Default Case ---");
        const dateCondition1 = `a.date = CURRENT_DATE`;
        const monthCondition1 = `CAST(p.month AS INTEGER) = CAST(EXTRACT(MONTH FROM CURRENT_DATE) AS INTEGER)`;
        const yearCondition1 = `p.year = CAST(EXTRACT(YEAR FROM CURRENT_DATE) AS INTEGER)`;

        const query1 = `
            SELECT e.*, d.name as department_name,
                   COALESCE(a.status, 'Pending') as attendance_status,
                   COALESCE(p.status, 'Pending') as payroll_status
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.id 
            LEFT JOIN attendance a ON e.id = a.employee_id AND ${dateCondition1}
            LEFT JOIN payroll p ON e.id = p.employee_id AND ${monthCondition1} AND ${yearCondition1}
            ORDER BY e.id DESC
        `;
        await pool.query(query1);
        console.log("Test 1 Passed");

        // Test 2: Param Case
        console.log("--- Test 2: Param Case ---");
        const dateCondition2 = `a.date = $1::date`;
        const monthCondition2 = `CAST(p.month AS INTEGER) = $2::integer`;
        const yearCondition2 = `p.year = $3::integer`;
        const params2 = ['2025-01-01', 1, 2025];

        const query2 = `
            SELECT e.*, d.name as department_name,
                   COALESCE(a.status, 'Pending') as attendance_status,
                   COALESCE(p.status, 'Pending') as payroll_status
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.id 
            LEFT JOIN attendance a ON e.id = a.employee_id AND ${dateCondition2}
            LEFT JOIN payroll p ON e.id = p.employee_id AND ${monthCondition2} AND ${yearCondition2}
            ORDER BY e.id DESC
        `;
        await pool.query(query2, params2);
        console.log("Test 2 Passed");

        console.log("ALL TESTS PASSED!");
        process.exit(0);
    } catch (error) {
        console.error("Query Failed!");
        console.error(error);
        process.exit(1);
    }
}

testQuery();
