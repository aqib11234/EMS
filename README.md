# Employee Management System

A complete, full-stack Employee Management System with real-time dashboard updates, built with Next.js, Express.js, and PostgreSQL.

![EMS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

### Core Modules
- ✅ **Dashboard** - Real-time statistics and analytics
- ✅ **Employee Management** - Complete CRUD operations
- ✅ **Department Management** - Organize teams efficiently
- ✅ **Attendance Tracking** - Daily check-in/check-out system
- ✅ **Leave Management** - Request and approval workflow
- ✅ **Payroll Processing** - Salary management and processing
- ✅ **Announcements** - Company-wide communication

### Key Highlights
- 🔄 **Real-time Updates** - Dashboard auto-refreshes every 30 seconds
- 📊 **Comprehensive Analytics** - Track all metrics in one place
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔐 **Secure** - Built with security best practices
- 📱 **Responsive** - Works on all devices
- ⚡ **Fast** - Optimized performance

## 📁 Project Structure

```
EMS/
├── my-app/                 # Frontend (Next.js + TypeScript)
│   ├── app/               # Next.js app directory
│   │   ├── page.tsx       # Dashboard
│   │   ├── employees/     # Employee management
│   │   ├── departments/   # Department management
│   │   ├── attendance/    # Attendance tracking
│   │   ├── leave/         # Leave management
│   │   ├── payroll/       # Payroll processing
│   │   └── announcements/ # Announcements
│   ├── components/        # Reusable components
│   ├── lib/              # Utilities and API client
│   └── public/           # Static assets
│
├── backend/              # Backend (Express.js + PostgreSQL)
│   ├── routes/          # API routes
│   │   ├── employees.js
│   │   ├── departments.js
│   │   ├── attendance.js
│   │   ├── leave.js
│   │   ├── payroll.js
│   │   ├── announcements.js
│   │   └── dashboard.js
│   ├── config/          # Configuration files
│   ├── scripts/         # Database initialization
│   └── server.js        # Main server file
│
└── SETUP_GUIDE.md       # Detailed setup instructions
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: pg (node-postgres)

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## ⚡ Quick Start

### 1. Clone or Navigate to Project
```bash
cd d:\projects\EMS
```

### 2. Set Up PostgreSQL Database
```sql
-- Open psql or pgAdmin
CREATE DATABASE ems_db;
```

### 3. Configure Backend
```bash
cd backend

# Install dependencies
npm install

# Update .env file with your PostgreSQL password
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ems_db

# Initialize database (creates tables and seeds data)
npm run init-db

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Configure Frontend
```bash
# Open new terminal
cd my-app

# Install dependencies (if needed)
npm install

# Create .env.local file with:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### 5. Access Application
Open your browser and visit: **http://localhost:3000**

## 📖 Detailed Setup

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🔌 API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get all dashboard statistics
- `GET /api/dashboard/departments/distribution` - Department distribution
- `GET /api/dashboard/attendance/trends` - Attendance trends
- `GET /api/dashboard/leave/trends` - Leave trends

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/today` - Today's attendance
- `GET /api/attendance/stats/summary` - Attendance statistics

### Leave Management
- `GET /api/leave` - Get leave requests
- `POST /api/leave` - Create leave request
- `PATCH /api/leave/:id/status` - Approve/Reject leave
- `GET /api/leave/stats/summary` - Leave statistics

### Payroll
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll
- `POST /api/payroll/generate` - Generate payroll for all
- `PATCH /api/payroll/:id/process` - Process payment
- `GET /api/payroll/stats/summary` - Payroll statistics

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

## 🗄️ Database Schema

### Tables
- **employees** - Employee information
- **departments** - Department details
- **attendance** - Daily attendance records
- **leave_requests** - Leave applications
- **payroll** - Payroll records
- **announcements** - System announcements

## 🎯 Default Data

After initialization:
- 6 Departments (Engineering, Finance, HR, Marketing, Operations, Support)
- 2 Sample Employees
- 1 Welcome Announcement

## 🧪 Testing

### Test Backend
```bash
# Health check
curl http://localhost:5000/api/health

# Dashboard stats
curl http://localhost:5000/api/dashboard/stats
```

### Test Frontend
Visit `http://localhost:3000` and navigate through all modules

## 🚀 Production Deployment

### Backend
1. Set environment variables
2. Use production PostgreSQL database
3. Enable SSL for database
4. Configure CORS for production domain
5. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend
1. Update `NEXT_PUBLIC_API_URL` to production backend
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or your platform

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/ems_db
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review API documentation in `backend/README.md`
3. Check console logs for errors

## 🎉 Acknowledgments

Built with modern web technologies and best practices for enterprise-level employee management.

---

**Made with ❤️ for efficient employee management**
