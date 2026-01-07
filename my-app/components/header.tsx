"use client"

import { Bell, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onAddEmployee?: () => void
}

export function Header({ onAddEmployee }: HeaderProps) {
  return (
    <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Button
          onClick={onAddEmployee}
          className="bg-[hsl(var(--ems-orange))] hover:bg-[hsl(var(--ems-orange))]/90 text-white font-medium"
        >
          + Add New Employee
        </Button>
        <Button className="bg-[hsl(var(--ems-red))] hover:bg-[hsl(var(--ems-red))]/90 text-white font-medium">
          Logout
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
