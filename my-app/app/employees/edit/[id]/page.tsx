"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "sonner" // Assuming we have toast or fallback to alert

interface Department {
    id: number
    name: string
}

export default function EditEmployeePage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        department_id: "",
        position: "",
        salary: "",
        hire_date: "",
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [departmentsData, employee] = await Promise.all([
                    api.getDepartments(),
                    api.getEmployee(id)
                ])
                setDepartments(departmentsData)
                setFormData({
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone || "",
                    department_id: employee.department_id ? employee.department_id.toString() : "",
                    position: employee.position || "",
                    salary: employee.salary,
                    hire_date: employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : "",
                })
            } catch (err) {
                console.error("Failed to fetch data:", err)
                alert("Failed to load employee data")
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            fetchData()
        }
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                department_id: formData.department_id ? parseInt(formData.department_id) : null,
                position: formData.position,
                salary: parseFloat(formData.salary),
                hire_date: formData.hire_date,
            }
            await api.updateEmployee(id, payload)
            // alert("Employee updated successfully!")
            router.push("/employees")
        } catch (err: any) {
            console.error("Failed to update employee:", err)
            alert(err.message || "Failed to update employee")
        } finally {
            setSaving(false)
        }
    }

    const handleAddEmployee = () => {
        router.push("/employees/add")
    }

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header onAddEmployee={handleAddEmployee} />
                <main className="flex-1 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Employee</h1>

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
                                disabled={saving}
                                className="bg-[hsl(var(--ems-orange))] hover:bg-[hsl(var(--ems-orange))]/90 text-white font-medium px-8"
                            >
                                {saving ? "Saving..." : "Save Changes"}
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
