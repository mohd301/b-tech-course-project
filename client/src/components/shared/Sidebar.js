import React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import { Home, FileText, Settings, Users, Shield } from "lucide-react"

const sidebarItems = {
  User: [
    {
      title: "Dashboard",
      path: "/home",
      icon: Home,
    },
    {
      title: "My Applications",
      path: "/home",
      icon: FileText,
    },
    {
      title: "Settings",
      path: "/changePwd",
      icon: Settings,
    },
  ],
  Admin: [
    {
      title: "Admin Dashboard",
      path: "/homeAdmin",
      icon: Shield,
    },
    {
      title: "User Management",
      path: "/homeAdmin",
      icon: Users,
    },
    {
      title: "Settings",
      path: "/changePwd",
      icon: Settings,
    },
  ],
  Regulator: [
    {
      title: "Regulator Dashboard",
      path: "/homeReg",
      icon: Shield,
    },
    {
      title: "Audit Logs",
      path: "/homeReg",
      icon: FileText,
    },
    {
      title: "Settings",
      path: "/changePwd",
      icon: Settings,
    },
  ],
}

export default function Sidebar() {
  const location = useLocation()
  const userType = localStorage.getItem("userType")

  const items = sidebarItems[userType] || sidebarItems.User

  return (
    <div className="h-full py-4">
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold">Menu</h2>
        <p className="text-sm text-muted-foreground">{userType}</p>
      </div>
      <nav className="space-y-1 px-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
