import React, { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "../ui/sheet"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Bell, Check, CheckCheck, X } from "lucide-react"

const mockNotifications = [
  {
    id: 1,
    title: "Welcome to the Subsidy System",
    description: "Thank you for registering with Oman's Government Subsidy System.",
    date: new Date().toLocaleDateString(),
    read: false,
    type: "info"
  },
  {
    id: 2,
    title: "Complete Your Profile",
    description: "Please complete your profile information to access all features.",
    date: new Date(Date.now() - 86400000).toLocaleDateString(),
    read: false,
    type: "warning"
  },
  {
    id: 3,
    title: "New Subsidy Available",
    description: "A new fuel subsidy program is now available for eligible applicants.",
    date: new Date(Date.now() - 172800000).toLocaleDateString(),
    read: false,
    type: "success"
  },
  {
    id: 4,
    title: "System Maintenance Notice",
    description: "Scheduled maintenance on Feb 25, 2026 from 2 AM to 4 AM.",
    date: new Date(Date.now() - 259200000).toLocaleDateString(),
    read: true,
    type: "info"
  }
]

export default function NotificationCenter({ open, onOpenChange, unreadCount, onMarkAllRead }) {
  const [notifications, setNotifications] = useState(mockNotifications)

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    onMarkAllRead()
  }

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "warning":
        return <Bell className="h-5 w-5 text-yellow-500" />
      case "error":
        return <X className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationBadge = (type) => {
    switch (type) {
      case "success":
        return "success"
      case "warning":
        return "warning"
      case "error":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <SheetTitle>Notifications</SheetTitle>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all ${!notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                New
                              </Badge>
                            )}
                            <Badge variant={getNotificationBadge(notification.type)} className="text-xs">
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(notification.id)}
                            title="Delete"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
