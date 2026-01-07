"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Calendar, Clock, CheckCircle, XCircle, Search } from "lucide-react"

interface EmployeeAttendance {
  id: number
  name: string
  department_name: string
  attendance_status: string // 'Pending' | 'Present' | 'Absent' | 'Late' etc.
}

interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  half_day: number
}

export default function AttendancePage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeAttendance[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = async (search = "") => {
    try {
      setLoading(true)
      const [employeesData, statsData] = await Promise.all([
        api.getEmployees({ date, search }),
        api.getAttendanceStats(date)
      ])

      setEmployees(employeesData)
      setStats(statsData)
    } catch (err) {
      console.error("Failed to fetch attendance data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(searchTerm)
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [date, searchTerm])

  const handleMarkAttendance = async (employeeId: number, status: string) => {
    try {
      await api.markAttendance({
        employee_id: employeeId,
        date: date,
        status: status,
        check_in: status === 'Present' ? '09:00' : null,
        check_out: status === 'Present' ? '17:00' : null,
        hours: status === 'Present' ? 8 : 0
      })
      // Refresh data
      fetchData(searchTerm)
    } catch (err: any) {
      alert("Failed to mark attendance: " + err.message)
    }
  }

  const handleAddEmployee = () => {
    router.push("/employees/add")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onAddEmployee={handleAddEmployee} />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
            <div className="flex gap-4 items-center">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search employee..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border p-2 rounded bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border-l-4 border-blue-500 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Total</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
            </Card>

            <Card className="p-6 border-l-4 border-green-500 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Present</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.present || 0}</p>
            </Card>

            <Card className="p-6 border-l-4 border-red-500 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Absent</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.absent || 0}</p>
            </Card>

            <Card className="p-6 border-l-4 border-yellow-500 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Late</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.late || 0}</p>
            </Card>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Loading attendance records...</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Employee</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No employees found.
                      </td>
                    </tr>
                  ) : (
                    employees.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{record.name}</div>
                          <div className="text-xs text-gray-500">{date}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{record.department_name}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${record.attendance_status === "Present"
                              ? "bg-green-100 text-green-700"
                              : record.attendance_status === "Absent"
                                ? "bg-red-100 text-red-700"
                                : record.attendance_status === "Leave"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {record.attendance_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {record.attendance_status === 'Pending' ? (
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleMarkAttendance(record.id, 'Present')}
                              >
                                Present
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleMarkAttendance(record.id, 'Absent')}
                              >
                                Absent
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mx-auto"
                              onClick={() => handleMarkAttendance(record.id, record.attendance_status === 'Present' ? 'Absent' : 'Present')}
                            >
                              Change
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
