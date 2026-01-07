"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Megaphone, Calendar, User } from "lucide-react"

interface Announcement {
  id: number
  title: string
  content: string
  author: string
  date: string
  priority: "High" | "Medium" | "Low"
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const announcements: Announcement[] = [
    {
      id: 1,
      title: "Welcome to the Employee Management System",
      content:
        "We are excited to announce the launch of our new Employee Management System. This platform will help streamline all HR processes and improve communication across the organization.",
      author: "Admin",
      date: "2025-08-27",
      priority: "High",
    },
  ]

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
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <Button className="bg-[hsl(var(--ems-orange))] hover:bg-[hsl(var(--ems-orange))]/90 text-white font-medium">
              + New Announcement
            </Button>
          </div>

          <div className="space-y-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Megaphone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{announcement.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{announcement.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      announcement.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : announcement.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {announcement.priority} Priority
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">{announcement.content}</p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
