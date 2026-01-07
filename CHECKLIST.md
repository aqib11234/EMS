# EMS Setup Checklist

Follow this checklist to get your Employee Management System up and running!

## ✅ Prerequisites

- [ ] Node.js installed (v14+)
- [ ] PostgreSQL installed (v12+)
- [ ] npm or yarn installed
- [ ] PostgreSQL password noted down

## ✅ Database Setup

- [ ] PostgreSQL service is running
- [ ] Created database `ems_db`
  ```sql
  CREATE DATABASE ems_db;
  ```
- [ ] Noted database credentials (username, password, port)

## ✅ Backend Setup

- [ ] Navigated to backend directory: `cd d:\projects\EMS\backend`
- [ ] Installed dependencies: `npm install`
- [ ] Updated `.env` file with PostgreSQL password
  - Open `d:\projects\EMS\backend\.env`
  - Replace `password` in `DATABASE_URL` with your actual PostgreSQL password
  - Example: `DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/ems_db`
- [ ] Initialized database: `npm run init-db`
  - Should see "✅ All tables created successfully"
  - Should see "✅ Initial data seeded successfully"
- [ ] Started backend server: `npm run dev`
  - Should see "🚀 Employee Management System Backend Server"
  - Should see "✅ Connected to PostgreSQL database"
  - Server running on http://localhost:5000

## ✅ Frontend Setup

- [ ] Opened new terminal
- [ ] Navigated to frontend directory: `cd d:\projects\EMS\my-app`
- [ ] Installed dependencies (if needed): `npm install`
- [ ] Created `.env.local` file in `my-app` directory with:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```
- [ ] Started frontend server: `npm run dev`
  - Server running on http://localhost:3000

## ✅ Verification

- [ ] Opened browser to http://localhost:3000
- [ ] Dashboard loads without errors
- [ ] Can see employee count (should be 2)
- [ ] Can see department count (should be 6)
- [ ] Can navigate to Employees page
- [ ] Can navigate to Departments page
- [ ] Can navigate to Attendance page
- [ ] Can navigate to Leave page
- [ ] Can navigate to Payroll page
- [ ] Can navigate to Announcements page

## ✅ Test API (Optional)

Open new terminal and test:

```bash
# Health check
curl http://localhost:5000/api/health

# Dashboard stats
curl http://localhost:5000/api/dashboard/stats

# Get employees
curl http://localhost:5000/api/employees

# Get departments
curl http://localhost:5000/api/departments
```

## 🎯 Quick Start Alternative

Instead of manual setup, you can use the quick start script:

```powershell
cd d:\projects\EMS
.\start-ems.ps1
```

This will automatically start both servers in separate windows!

## 🐛 Troubleshooting

### Backend won't start
- [ ] Check if PostgreSQL is running
- [ ] Verify `.env` file has correct password
- [ ] Ensure database `ems_db` exists
- [ ] Check if port 5000 is available

### Frontend won't connect
- [ ] Ensure backend is running on port 5000
- [ ] Check `.env.local` has correct API URL
- [ ] Clear browser cache and reload

### Database errors
- [ ] Verify PostgreSQL credentials
- [ ] Check PostgreSQL service status
- [ ] Try connecting with psql or pgAdmin

### Port conflicts
If port 5000 or 3000 is in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Run with `npm run dev -- -p 3001`

## 📚 Next Steps

After successful setup:

1. **Explore the Dashboard**
   - View real-time statistics
   - Navigate through different modules

2. **Add Employees**
   - Click "Add Employee" button
   - Fill in employee details
   - Assign to departments

3. **Mark Attendance**
   - Go to Attendance page
   - Mark attendance for employees
   - View attendance statistics

4. **Manage Leave**
   - Create leave requests
   - Approve/Reject requests
   - Track leave balance

5. **Process Payroll**
   - Generate payroll for all employees
   - Process individual payments
   - Track payment history

6. **Create Announcements**
   - Share company updates
   - Set priority levels
   - Manage announcements

## 🎉 Success!

If all checkboxes are ticked, congratulations! Your Employee Management System is fully operational!

---

**Need Help?**
- Check `SETUP_GUIDE.md` for detailed instructions
- Review `README.md` for project overview
- Check `backend/README.md` for API documentation
