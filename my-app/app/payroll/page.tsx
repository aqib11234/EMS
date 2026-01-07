"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { DollarSign, Users, Calendar, Wallet, Search } from "lucide-react"

interface EmployeePayroll {
  id: number
  name: string
  department_name: string
  salary: number
  payroll_status: string
  deductions: number
  current_net_salary: number
}

interface PayrollStats {
  total_salaries: number
  pending_salary: number
  total_employees: number
}

export default function PayrollPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeePayroll[]>([])
  const [allEmployees, setAllEmployees] = useState<any[]>([])
  const [stats, setStats] = useState<PayrollStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState("")
  const [showAdvanceForm, setShowAdvanceForm] = useState(false)

  const [advanceForm, setAdvanceForm] = useState({
    employee_id: "",
    amount: "",
    month: month.toString(),
    year: year.toString()
  })

  const fetchData = async (search = "") => {
    try {
      setLoading(true)
      const [employeesData, statsData, allEmpData] = await Promise.all([
        api.getEmployees({ month: month.toString(), year: year.toString(), search }),
        api.getPayrollStats(),
        api.getEmployees()
      ])
      setEmployees(employeesData)
      setStats(statsData)
      setAllEmployees(allEmpData)
    } catch (err) {
      console.error("Failed to fetch payroll data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(searchTerm)
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [month, year, searchTerm])

  useEffect(() => {
    setAdvanceForm(prev => ({ ...prev, month: month.toString(), year: year.toString() }))
  }, [month, year])

  const handleGeneratePayroll = async () => {
    if (confirm(`Generate/Update payroll for all employees for ${month}/${year}?`)) {
      try {
        await api.generatePayroll(month, year)
        alert("Payroll generated/updated successfully!")
        fetchData(searchTerm)
      } catch (err: any) {
        alert("Error: " + err.message)
      }
    }
  }

  const handleMarkUnpaid = async (id: number) => {
    try {
      const records = await api.getPayrollRecords({ employee_id: id.toString(), month: month.toString(), year: year.toString() });
      if (records.length > 0) {
        await api.revertPayroll(records[0].id);
        alert("Payment reverted to Pending.");
        fetchData(searchTerm);
      } else {
        alert("No payroll record found to revert.");
      }
    } catch (err: any) {
      alert("Failed to revert payment: " + err.message);
    }
  }

  const handleProcessPayroll = async (id: number) => {
    try {
      const records = await api.getPayrollRecords({ employee_id: id.toString(), month: month.toString(), year: year.toString() });
      if (records.length === 0) {
        const emp = employees.find(e => e.id === id);
        await api.createPayrollRecord({
          employee_id: id,
          month: month.toString(),
          year,
          basic_salary: emp?.salary,
          payment_date: new Date().toISOString().split('T')[0]
        })
        const newRecords = await api.getPayrollRecords({ employee_id: id.toString(), month: month.toString(), year: year.toString() });
        await api.processPayroll(newRecords[0].id, new Date().toISOString().split('T')[0]);
      } else {
        await api.processPayroll(records[0].id, new Date().toISOString().split('T')[0]);
      }
      alert("Payment processed successfully!")
      fetchData(searchTerm)
    } catch (err: any) {
      alert("Failed to process payment: " + err.message)
    }
  }

  const handleGiveAdvance = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createSalaryAdvance({
        employee_id: parseInt(advanceForm.employee_id),
        amount: parseFloat(advanceForm.amount),
        month: parseInt(advanceForm.month),
        year: parseInt(advanceForm.year)
      })
      alert("Salary advance recorded! It will be deducted from this month's payroll.")
      setShowAdvanceForm(false)
      setAdvanceForm({ ...advanceForm, employee_id: "", amount: "" })
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
            <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
            <div className="flex gap-4 items-center">
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                onClick={() => setShowAdvanceForm(!showAdvanceForm)}
                className="bg-[hsl(var(--ems-orange))] text-white"
              >
                {showAdvanceForm ? "Cancel" : "+ Advance"}
              </Button>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="border p-2 rounded bg-white h-9 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'short' })}</option>
                ))}
              </select>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="border p-1 rounded w-20 bg-white h-9 text-sm text-center"
              />
              <Button size="sm" onClick={handleGeneratePayroll} className="bg-blue-600 text-white">Generate All</Button>
            </div>
          </div>

          {showAdvanceForm && (
            <Card className="p-6 mb-8 border-2 border-[hsl(var(--ems-orange))]/30 shadow-md">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[hsl(var(--ems-orange))]" />
                Give Salary Advance
              </h2>
              <form onSubmit={handleGiveAdvance} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Employee</label>
                  <select
                    required
                    className="w-full p-2 border rounded text-sm h-10"
                    value={advanceForm.employee_id}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, employee_id: e.target.value })}
                  >
                    <option value="">Select Employee</option>
                    {allEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Amount ($)</label>
                  <Input
                    required
                    type="number"
                    placeholder="e.g. 5000"
                    className="h-10"
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Month</label>
                  <select
                    className="w-full p-2 border rounded text-sm h-10"
                    value={advanceForm.month}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, month: e.target.value })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="bg-green-600 text-white font-bold h-10">Confirm</Button>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border-l-4 border-blue-500 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-600 uppercase text-xs tracking-wider">Total Salaries</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">${(stats?.total_salaries || 0).toLocaleString()}</p>
            </Card>

            <Card className="p-6 border-l-4 border-amber-500 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-gray-600 uppercase text-xs tracking-wider">Pending Salary</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">${(stats?.pending_salary || 0).toLocaleString()}</p>
            </Card>

            <Card className="p-6 border-l-4 border-purple-500 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-600 uppercase text-xs tracking-wider">Total Employees</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_employees || 0}</p>
            </Card>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Loading payroll records...</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Employee</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-right">Base Salary</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[hsl(var(--ems-red))] uppercase text-right">Deduction</th>
                    <th className="px-6 py-4 text-xs font-semibold text-green-700 uppercase text-right">Net Pay</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No employees found.</td>
                    </tr>
                  ) : (
                    employees.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{record.name}</div>
                          <div className="text-xs text-gray-500">{record.department_name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">${Number(record.salary).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-[hsl(var(--ems-red))] font-medium text-right">
                          {record.deductions > 0 ? `-$${Number(record.deductions).toLocaleString()}` : "$0"}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-700 text-right">
                          ${Number(record.current_net_salary).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${record.payroll_status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {record.payroll_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {record.payroll_status === 'Pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleProcessPayroll(record.id)}
                                >
                                  Paid
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => handleMarkUnpaid(record.id)}
                                >
                                  Unpaid
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleMarkUnpaid(record.id)}
                              >
                                Revert
                              </Button>
                            )}
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
