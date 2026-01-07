"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Search } from "lucide-react"

interface Employee {
  id: number
  name: string
  department_name: string
  position: string
  phone: string
  salary: string
  attendance_status: string
  payroll_status: string
  hire_date: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchEmployees = async (search = "") => {
    try {
      setLoading(true)
      const data = await api.getEmployees({ search })
      setEmployees(data)
    } catch (err) {
      console.error("Failed to fetch employees:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees(searchTerm)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const handleAddEmployee = () => {
    router.push("/employees/add")
  }

  const handleEdit = (id: number) => {
    router.push(`/employees/edit/${id}`)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.deleteEmployee(id)
        setEmployees(employees.filter((emp) => emp.id !== id))
      } catch (err) {
        console.error("Failed to delete employee:", err)
        alert("Failed to delete employee")
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onAddEmployee={handleAddEmployee} />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">View Employees</h1>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Loading employees...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name & Joining
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Salary Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No employees found.
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">{employee.name}</div>
                          <div className="text-xs text-gray-500">Joined: {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{employee.department_name || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{employee.position || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{employee.phone || "N/A"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${employee.attendance_status === 'Present' ? 'bg-green-100 text-green-700' :
                            employee.attendance_status === 'Absent' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {employee.attendance_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">${Number(employee.salary).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${employee.payroll_status === 'Paid' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                            }`}>
                            {employee.payroll_status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="link"
                              className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                              onClick={() => handleEdit(employee.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="link"
                              className="text-[hsl(var(--ems-red))] hover:text-[hsl(var(--ems-red))]/80 p-0 h-auto font-medium"
                              onClick={() => handleDelete(employee.id)}
                            >
                              Delete
                            </Button>
                          </div>
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
