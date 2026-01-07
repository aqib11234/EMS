"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarOff,
  DollarSign,
  Clock,
  Megaphone,
  ChevronRight,
  ClipboardList,
} from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Employees", href: "/employees" },
  { icon: Briefcase, label: "Departments", href: "/departments" },
  { icon: CalendarOff, label: "Leave Management", href: "/leave" },
  { icon: DollarSign, label: "Payroll", href: "/payroll" },
  { icon: Clock, label: "Attendance", href: "/attendance" },
  { icon: Megaphone, label: "Announcements", href: "/announcements" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[280px] min-h-screen bg-[hsl(var(--ems-beige))] border-r flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-8 h-8 text-[hsl(var(--ems-orange))]" />
          <div>
            <h1 className="text-xl font-bold text-[hsl(var(--ems-orange))] leading-tight">Employee</h1>
            <h1 className="text-xl font-bold text-[hsl(var(--ems-orange))] leading-tight">Management</h1>
            <h1 className="text-xl font-bold text-[hsl(var(--ems-orange))] leading-tight">System</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6">
        <div className="px-4 mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</p>
        </div>
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-[hsl(var(--ems-orange))]/10 text-gray-900 border-l-4 border-[hsl(var(--ems-orange))] -ml-px"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {!isActive && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
