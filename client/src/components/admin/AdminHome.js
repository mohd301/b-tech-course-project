import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.jsx"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet.jsx"
import { Button } from "../ui/button.jsx"
import { Menu, LayoutDashboard, Users, Database, BarChart3, Settings } from "lucide-react"
import { useMobile } from "../../hooks/use-mobile.js"
import DashboardTab from "./DashboardTab.js"
import UsersTab from "./UsersTab.js"
import MLDataTab from "./MLDataTab.js"
import AnalyticsTab from "./AnalyticsTab.js"
import SettingsTab from "./SettingsTab.js"

const sidebarItems = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "users", label: "Users", icon: Users },
  { value: "ml-data", label: "ML Data", icon: Database },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "settings", label: "Settings", icon: Settings },
]

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Hamburger Menu */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-16 left-4 z-40"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="h-full py-4">
              <div className="px-4 mb-4">
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">Manage your platform</p>
              </div>
              <nav className="space-y-1 px-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.value
                  return (
                    <button
                      key={item.value}
                      onClick={() => {
                        setActiveTab(item.value)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-64 border-r bg-background min-h-screen">
            <div className="h-full py-4">
              <div className="px-4 mb-4">
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">Manage your platform</p>
              </div>
              <nav className="space-y-1 px-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.value
                  return (
                    <button
                      key={item.value}
                      onClick={() => setActiveTab(item.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
            <TabsContent value="ml-data">
              <MLDataTab />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
