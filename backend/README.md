# Employee Management System - Backend

Complete backend API for the Employee Management System built with Express.js and PostgreSQL.

## Features

- ✅ Employee Management (CRUD)
- ✅ Department Management
- ✅ Attendance Tracking
- ✅ Leave Management with Approval Workflow
- ✅ Payroll Processing
- ✅ Announcements
- ✅ Real-time Dashboard Statistics
- ✅ RESTful API Design

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` with your PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/ems_db
   ```

3. Create the PostgreSQL database:
```bash
# Using psql
psql -U postgres
CREATE DATABASE ems_db;
\q
```

4. Initialize the database (create tables and seed data):
```bash
npm run init-db
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get comprehensive dashboard statistics
- `GET /api/dashboard/departments/distribution` - Department-wise employee distribution
- `GET /api/dashboard/attendance/trends` - Attendance trends (last 7 days)
- `GET /api/dashboard/leave/trends` - Leave trends (monthly)

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats/count` - Get employee count

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get single department
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department
- `GET /api/departments/stats/count` - Get department count

### Attendance
- `GET /api/attendance` - Get all attendance records (supports filters)
- `GET /api/attendance/today` - Get today's attendance
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance
- `GET /api/attendance/stats/summary` - Get attendance statistics

### Leave Management
- `GET /api/leave` - Get all leave requests (supports filters)
- `GET /api/leave/:id` - Get single leave request
- `POST /api/leave` - Create leave request
- `PATCH /api/leave/:id/status` - Approve/Reject leave
- `PUT /api/leave/:id` - Update leave request
- `DELETE /api/leave/:id` - Delete leave request
- `GET /api/leave/stats/summary` - Get leave statistics

### Payroll
- `GET /api/payroll` - Get all payroll records (supports filters)
- `GET /api/payroll/:id` - Get single payroll record
- `POST /api/payroll` - Create payroll record
- `PUT /api/payroll/:id` - Update payroll
- `PATCH /api/payroll/:id/process` - Process payroll (mark as paid)
- `DELETE /api/payroll/:id` - Delete payroll
- `GET /api/payroll/stats/summary` - Get payroll statistics
- `POST /api/payroll/generate` - Generate payroll for all employees

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get single announcement
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement
- `GET /api/announcements/stats/count` - Get announcement count

## Database Schema

### Tables
- `employees` - Employee information
- `departments` - Department details
- `attendance` - Daily attendance records
- `leave_requests` - Leave applications
- `payroll` - Payroll records
- `announcements` - System announcements

## Environment Variables

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/ems_db
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## Testing the API

You can test the API using:
- Postman
- cURL
- Your frontend application

Example cURL request:
```bash
curl http://localhost:5000/api/dashboard/stats
```

## Error Handling

The API returns consistent error responses:
```json
{
  "error": "Error message here"
}
```

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

## License

MIT
