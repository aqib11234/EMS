"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Calendar, Search } from "lucide-react"

interface Employee {
  id: number
  name: string
  department_name: string
  casual_leave_balance: number
  sick_leave_balance: number
  is_on_leave: boolean
}

export default function LeavePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    leave_type: "Casual",
    start_date: "",
    end_date: "",
    reason: ""
  })

  const fetchData = async (search = "") => {
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
      fetchData(searchTerm)
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const handleOpenModal = (emp: Employee) => {
    setSelectedEmp(emp)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmp) return

    try {
      await api.createLeave({
        ...formData,
        employee_id: selectedEmp.id
      })
      alert("Leave created successfully!")
      setShowModal(false)
      fetchData(searchTerm)
    } catch (err: any) {
      alert("Error: " + err.message)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onAddEmployee={() => { }} />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
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

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Loading leave data...</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Employee Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Branch / Dept</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Leave Balances</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No employees found.</td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{emp.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{emp.department_name}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-4">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                              <b>CL:</b> {emp.casual_leave_balance}
                            </span>
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                              <b>SL:</b> {emp.sick_leave_balance}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.is_on_leave ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {emp.is_on_leave ? 'On Leave' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            onClick={() => handleOpenModal(emp)}
                            size="sm"
                            className="bg-[hsl(var(--ems-orange))] text-white hover:bg-[hsl(var(--ems-orange))]/90"
                          >
                            Create Leave
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {showModal && selectedEmp && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[hsl(var(--ems-orange))]" />
                  Create Leave for {selectedEmp.name}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Leave Type</label>
                    <select
                      className="w-full p-2 border rounded mt-1"
                      value={formData.leave_type}
                      onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">From Date</label>
                      <Input
                        required
                        type="date"
                        className="mt-1"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">To Date</label>
                      <Input
                        required
                        type="date"
                        className="mt-1"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason (Optional)</label>
                    <Input
                      placeholder="Brief reason"
                      className="mt-1"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">Confirm Leave</Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
