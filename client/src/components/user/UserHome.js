import React from "react"
import { useSelector } from "react-redux"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { User, CheckCircle2, History, Bell, HelpCircle } from "lucide-react"
import Profile from "./Profile"
import EligibilityCheck from "./EligibilityCheck"
import NotificationCenter from "./NotificationCenter"
import HelpDialog from "./HelpDialog"

export default function UserHome() {
  const [notificationCount, setNotificationCount] = React.useState(3)
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showHelp, setShowHelp] = React.useState(false)
  const user = useSelector((state) => state.user.user)

  const quickActions = [
    {
      title: "Check Eligibility",
      description: "Verify your eligibility for government subsidies",
      icon: <CheckCircle2 className="h-8 w-8" />,
      color: "bg-blue-500",
      onClick: () => document.querySelector('[data-value="eligibility"]')?.click()
    },
    {
      title: "View Profile",
      description: "Manage your personal information",
      icon: <User className="h-8 w-8" />,
      color: "bg-green-500",
      onClick: () => document.querySelector('[data-value="profile"]')?.click()
    },
    {
      title: "Application History",
      description: "View your past subsidy applications",
      icon: <History className="h-8 w-8" />,
      color: "bg-purple-500",
      onClick: () => document.querySelector('[data-value="history"]')?.click()
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.Email?.split('@')[0] || 'User'}</h1>
          <p className="text-muted-foreground">Manage your subsidy applications and profile</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                {notificationCount}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowHelp(true)}>
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.onClick}>
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white mb-2`}>
                {action.icon}
              </div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" data-value="profile">Profile</TabsTrigger>
          <TabsTrigger value="eligibility" data-value="eligibility">Eligibility Check</TabsTrigger>
          <TabsTrigger value="history" data-value="history">Application History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Profile />
        </TabsContent>

        <TabsContent value="eligibility">
          <EligibilityCheck />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
              <CardDescription>Your past subsidy eligibility checks and applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No application history yet</p>
                <p className="text-sm">Complete an eligibility check to see your history here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notification Center */}
      <NotificationCenter
        open={showNotifications}
        onOpenChange={setShowNotifications}
        unreadCount={notificationCount}
        onMarkAllRead={() => setNotificationCount(0)}
      />

      {/* Help Dialog */}
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </div>
  )
}
