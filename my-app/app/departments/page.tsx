"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Briefcase, Users, DollarSign, TrendingUp } from "lucide-react"

interface Department {
  id: number
  name: string
  description: string
  employee_count: number
}

const ICON_MAP: Record<string, any> = {
  "Finance": DollarSign,
  "HR": Users,
  "Engineering": Briefcase,
  "Marketing": TrendingUp,
  "Sales": TrendingUp,
  "Operations": Briefcase,
}

const COLOR_MAP: Record<string, string> = {
  "Finance": "bg-blue-500",
  "HR": "bg-green-500",
  "Engineering": "bg-purple-500",
  "Marketing": "bg-orange-500",
  "Sales": "bg-teal-500",
  "Operations": "bg-indigo-500",
}

export default function DepartmentsPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const data = await api.getDepartments()
      setDepartments(data)
    } catch (err) {
      console.error("Failed to fetch departments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

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
            <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
            <Button className="bg-[hsl(var(--ems-orange))] hover:bg-[hsl(var(--ems-orange))]/90 text-white font-medium">
              + Add Department
            </Button>
          </div>

          {loading ? (
            <div className="text-center p-8 text-gray-600">Loading departments...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.length === 0 ? (
                <div className="col-span-full text-center p-8 text-gray-500">No departments found.</div>
              ) : (
                departments.map((dept) => {
                  const Icon = ICON_MAP[dept.name] || Briefcase
                  const colorClass = COLOR_MAP[dept.name] || "bg-gray-500"
                  return (
                    <Card key={dept.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 ${colorClass} rounded-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{dept.name}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Employees:</span>
                          <span className="font-semibold text-gray-900">{dept.employee_count || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600 line-clamp-2">{dept.description}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        View Details
                      </Button>
                    </Card>
                  )
                })
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
