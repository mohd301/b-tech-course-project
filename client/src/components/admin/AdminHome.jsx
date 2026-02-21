import React, { useState } from "react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { cn } from "../../lib/utils"
import {
  LayoutDashboard,
  Users,
  Database,
  BarChart3,
  Settings,
  Menu,
  Shield,
} from "lucide-react"

import DashboardTab from "./DashboardTab"
import UsersTab from "./UsersTab"
import MLDataTab from "./MLDataTab"
import AnalyticsTab from "./AnalyticsTab"
import SettingsTab from "./SettingsTab"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "ml", label: "ML Data", icon: Database },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
]

function SidebarContent({ activeTab, setActiveTab, onSelect }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-none">Admin Panel</h2>
            <p className="text-xs text-muted-foreground mt-0.5">System Administration</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                if (onSelect) onSelect()
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />
      case "users": return <UsersTab />
      case "ml": return <MLDataTab />
      case "analytics": return <AnalyticsTab />
      case "settings": return <SettingsTab />
      default: return <DashboardTab />
    }
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col border-r bg-card">
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SidebarContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelect={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b bg-card px-4 py-3 md:hidden">
          <SheetTrigger asChild onClick={() => setMobileOpen(true)}>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <span className="font-semibold">
            {navItems.find((n) => n.id === activeTab)?.label}
          </span>
        </div>

        <div className="p-4 md:p-6">
          {renderTab()}
        </div>
      </main>
    </div>
  )
}
