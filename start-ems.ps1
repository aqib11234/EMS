# Employee Management System - Quick Start Script
# This script starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Employee Management System - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL is not running. Please start PostgreSQL service." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠ Could not detect PostgreSQL service. Make sure it's installed and running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Write-Host "Location: d:\projects\EMS\backend" -ForegroundColor Gray
Write-Host "URL: http://localhost:5000" -ForegroundColor Gray
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\projects\EMS\backend'; Write-Host 'Starting Backend Server...' -ForegroundColor Cyan; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "Location: d:\projects\EMS\my-app" -ForegroundColor Gray
Write-Host "URL: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\projects\EMS\my-app'; Write-Host 'Starting Frontend Server...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Wait a few seconds for servers to fully start," -ForegroundColor Yellow
Write-Host "then open http://localhost:3000 in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
