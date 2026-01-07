"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/lib/api"

interface Department {
  id: number
  name: string
}

export default function AddEmployeePage() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department_id: "",
    position: "",
    salary: "",
    hire_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await api.getDepartments()
        setDepartments(data)
      } catch (err) {
        console.error("Failed to fetch departments:", err)
      }
    }
    fetchDepartments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        position: formData.position,
        salary: parseFloat(formData.salary),
        experience: "N/A", // Default value as field is removed
        hire_date: formData.hire_date,
      }
      await api.createEmployee(payload)
      alert("Employee added successfully!")
      router.push("/employees")
    } catch (err: any) {
      console.error("Failed to add employee:", err)
      alert(err.message || "Failed to add employee")
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Employee</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-900">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-900">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-gray-900">
                  Department
                </Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger className="h-12 border-gray-300">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium text-gray-900">
                  Position
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="h-12 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary" className="text-sm font-medium text-gray-900">
                  Salary
                </Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="h-12 border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date" className="text-sm font-medium text-gray-900">
                  Hire Date
                </Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  className="h-12 border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[hsl(var(--ems-orange))] hover:bg-[hsl(var(--ems-orange))]/90 text-white font-medium px-8"
              >
                {loading ? "Adding..." : "Add Employee"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/employees")}
                className="font-medium px-8"
              >
                Cancel
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
