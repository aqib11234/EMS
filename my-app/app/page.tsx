"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  CalendarOff,
  Briefcase,
  CheckCircle,
  UserCheck,
  Megaphone,
  ClipboardCheck,
  DollarSign,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/lib/api"

interface DashboardStats {
  employees: { total: number }
  departments: { total: number }
  attendance: { today: { total: number; present: number; absent: number; late: number } }
  leave: { total: number; pending: number; approved: number; onLeaveToday: number }
  payroll: { total: number; pending: number; paid: number }
  announcements: { total: number }
  lastUpdated: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const data = await api.getDashboardStats()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()

    // Refresh dashboard every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardStats, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleAddEmployee = () => {
    router.push("/employees/add")
  }

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return new Date().toLocaleDateString('en-US', options)
  }

  if (loading && !stats) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--ems-orange))] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardStats}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onAddEmployee={handleAddEmployee} />
        <main className="flex-1 p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, Admin</h1>
              <p className="text-gray-600">{"Here's what's happening with your team today."}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">{getCurrentDate()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-[hsl(var(--ems-orange))] text-white p-6 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mb-2">
                <p className="text-white/90 text-sm mb-1">Total Employees</p>
                <p className="text-4xl font-bold">{stats?.employees.total || 0}</p>
              </div>
              <Link href="/employees">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/20 p-0 h-auto font-medium"
                >
                  View List
                </Button>
              </Link>
            </Card>

            <Card className="bg-[hsl(var(--ems-purple))] text-white p-6 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <CalendarOff className="w-6 h-6" />
                </div>
              </div>
              <div className="mb-2">
                <p className="text-white/90 text-sm mb-1">On Leave Today</p>
                <p className="text-4xl font-bold">{stats?.leave.onLeaveToday || 0}</p>
              </div>
              <Link href="/leave">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/20 p-0 h-auto font-medium"
                >
                  View List
                </Button>
              </Link>
            </Card>

            <Card className="bg-[hsl(var(--ems-teal))] text-white p-6 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>
              <div className="mb-2">
                <p className="text-white/90 text-sm mb-1">Total Departments</p>
                <p className="text-4xl font-bold">{stats?.departments.total || 0}</p>
              </div>
              <Link href="/departments">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/20 p-0 h-auto font-medium"
                >
                  View List
                </Button>
              </Link>
            </Card>

            <Card className="bg-[hsl(var(--ems-blue))] text-white p-6 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="mb-2">
                <p className="text-white/90 text-sm mb-1">Pending Approvals</p>
                <p className="text-4xl font-bold">{stats?.leave.pending || 0}</p>
              </div>
              <Link href="/leave">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/20 p-0 h-auto font-medium"
                >
                  View List
                </Button>
              </Link>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Present Today</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-[hsl(var(--ems-green))]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">{stats?.attendance.today.present || 0}</p>
              <Link href="/attendance">
                <Button variant="link" className="text-blue-600 p-0 h-auto font-medium">
                  View All
                </Button>
              </Link>
            </Card>

            <Card className="p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Total Announcements</h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">{stats?.announcements.total || 0}</p>
              <Link href="/announcements">
                <Button variant="link" className="text-blue-600 p-0 h-auto font-medium">
                  View All
                </Button>
              </Link>
            </Card>

            <Card className="p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Approved Leave</h3>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClipboardCheck className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">{stats?.leave.approved || 0}</p>
              <Link href="/leave">
                <Button variant="link" className="text-blue-600 p-0 h-auto font-medium">
                  View All
                </Button>
              </Link>
            </Card>

            <Card className="p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Pending Payrolls</h3>
                <div className="p-2 bg-red-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-[hsl(var(--ems-red))]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">{stats?.payroll.pending || 0}</p>
              <Link href="/payroll">
                <Button variant="link" className="text-blue-600 p-0 h-auto font-medium">
                  View All
                </Button>
              </Link>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
