# Employee Management System - Complete Setup Guide

This guide will help you set up the complete Employee Management System with frontend (Next.js) and backend (Express.js + PostgreSQL).

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

## Project Structure

```
EMS/
├── my-app/          # Frontend (Next.js)
└── backend/         # Backend (Express.js + PostgreSQL)
```

## Step 1: PostgreSQL Database Setup

### 1.1 Install PostgreSQL
Download and install PostgreSQL from the official website for Windows.

### 1.2 Create Database
Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE ems_db;
```

### 1.3 Note Your Credentials
You'll need:
- Username (default: `postgres`)
- Password (set during PostgreSQL installation)
- Database name: `ems_db`
- Port (default: `5432`)

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd d:\projects\EMS\backend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Configure Environment Variables
The `.env` file has been created with default values. Update it with your PostgreSQL credentials:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ems_db
JWT_SECRET=ems_secret_key_change_this_in_production_2026
NODE_ENV=development
```

**Important:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### 2.4 Initialize Database
This will create all tables and seed initial data:

```bash
npm run init-db
```

You should see:
```
✅ All tables created successfully
✅ Initial data seeded successfully
✅ Database initialization complete!
```

### 2.5 Start Backend Server
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

You should see:
```
==================================================
🚀 Employee Management System Backend Server
==================================================
📡 Server running on port 5000
🌐 API URL: http://localhost:5000
📊 Health Check: http://localhost:5000/api/health
📈 Dashboard Stats: http://localhost:5000/api/dashboard/stats
==================================================
✅ Connected to PostgreSQL database
```

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory
Open a **new terminal** and run:

```bash
cd d:\projects\EMS\my-app
```

### 3.2 Install Dependencies (if not already installed)
```bash
npm install
```

### 3.3 Configure Environment Variables
Create a `.env.local` file in the `my-app` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3.4 Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Step 4: Access the Application

1. Open your browser and navigate to: `http://localhost:3000`
2. You should see the Employee Management System dashboard with real-time data!

## Features Overview

### ✅ Dashboard
- Real-time statistics
- Employee count
- Department count
- Attendance tracking
- Leave management overview
- Payroll status
- Auto-refreshes every 30 seconds

### ✅ Employee Management
- Add new employees
- Edit employee details
- Delete employees
- View all employees
- Assign to departments

### ✅ Department Management
- Create departments
- Edit department details
- View employee count per department
- Delete departments

### ✅ Attendance Tracking
- Mark daily attendance
- Check-in/Check-out times
- Track hours worked
- View attendance history
- Filter by date and employee

### ✅ Leave Management
- Submit leave requests
- Approve/Reject leaves
- Track leave types (Sick, Casual, etc.)
- View leave history
- Pending approvals

### ✅ Payroll Processing
- Generate payroll for all employees
- Process individual payroll
- Track salary components (Basic, Allowances, Deductions)
- Mark as paid
- View payroll history

### ✅ Announcements
- Create company-wide announcements
- Set priority levels
- Edit/Delete announcements
- View all announcements

## API Testing

Test if the backend is working:

```bash
# Health check
curl http://localhost:5000/api/health

# Get dashboard stats
curl http://localhost:5000/api/dashboard/stats

# Get all employees
curl http://localhost:5000/api/employees

# Get all departments
curl http://localhost:5000/api/departments
```

## Troubleshooting

### Backend won't start
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in `.env` file
3. Ensure database `ems_db` exists
4. Check if port 5000 is available

### Frontend can't connect to backend
1. Ensure backend is running on port 5000
2. Check `.env.local` has correct API URL
3. Verify CORS is enabled (already configured)

### Database connection errors
1. Verify PostgreSQL credentials
2. Check if PostgreSQL service is running
3. Ensure database name is correct
4. Test connection using psql or pgAdmin

### Port already in use
```bash
# Backend (change PORT in .env)
PORT=5001

# Frontend (use different port)
npm run dev -- -p 3001
```

## Default Data

After initialization, you'll have:
- **6 Departments**: Engineering, Finance, HR, Marketing, Operations, Support
- **2 Sample Employees**: sumit kumar, mohan kumar
- **1 Announcement**: Welcome message

## Next Steps

1. **Add More Employees**: Click "Add Employee" button
2. **Mark Attendance**: Go to Attendance page and mark daily attendance
3. **Create Leave Requests**: Submit leave applications
4. **Generate Payroll**: Use bulk payroll generation for all employees
5. **Create Announcements**: Share company updates

## Production Deployment

For production deployment:

1. **Backend**:
   - Use environment variables for sensitive data
   - Set `NODE_ENV=production`
   - Use a production PostgreSQL database
   - Enable SSL for database connection
   - Configure proper CORS origins

2. **Frontend**:
   - Update `NEXT_PUBLIC_API_URL` to production backend URL
   - Build the application: `npm run build`
   - Deploy to Vercel, Netlify, or your preferred platform

## Support

For issues or questions:
1. Check the README files in backend and frontend directories
2. Review API documentation in backend/README.md
3. Check console logs for errors

## Technology Stack

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication (ready for implementation)

---

**Congratulations!** 🎉 Your Employee Management System is now fully functional with real-time updates!
