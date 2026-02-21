import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Button } from '../ui/button'
import DashboardTab from './DashboardTab'
import CaseComparison from './CaseComparison'
import ComplianceReports from './ComplianceReports'
import AuditTrail from './AuditTrail'
import Logout from '../../compsMisc/Logout'

export default function RegulatorHome() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'comparison', label: 'Case Comparison', icon: '⚖️' },
    { id: 'reports', label: 'Compliance Reports', icon: '📋' },
    { id: 'audit', label: 'Audit Trail', icon: '📝' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Button>
              ))}
              <Logout />
            </div>
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold">Regulator Dashboard</h2>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen p-4">
          <h2 className="text-xl font-bold mb-6 px-2">Regulator Portal</h2>
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="pt-4 border-t">
            <Logout />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            <TabsContent value="comparison">
              <CaseComparison />
            </TabsContent>
            <TabsContent value="reports">
              <ComplianceReports />
            </TabsContent>
            <TabsContent value="audit">
              <AuditTrail />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
