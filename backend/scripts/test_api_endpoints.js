const http = require('http');

async function testApi() {
    const endpoints = [
        '/api/employees',
        '/api/employees?date=2026-01-07',
        '/api/payroll/stats/summary',
        '/api/attendance/stats/summary'
    ];

    for (const endpoint of endpoints) {
        console.log(`\nTesting ${endpoint}...`);
        await new Promise((resolve) => {
            http.get(`http://localhost:5000${endpoint}`, (res) => {
                console.log(`Status: ${res.statusCode}`);
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (Array.isArray(json)) {
                            console.log(`Received array with ${json.length} items.`);
                        } else if (json.error) {
                            console.log(`Error: ${json.error}`);
                        } else {
                            console.log(`Received object:`, Object.keys(json));
                        }
                    } catch (e) {
                        console.log(`Raw data: ${data.substring(0, 100)}...`);
                    }
                    resolve();
                });
            }).on('error', (err) => {
                console.log(`Error: ${err.message}`);
                resolve();
            });
        });
    }
}

testApi();
