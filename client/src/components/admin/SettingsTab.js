import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { Button } from "../ui/button.jsx"
import { Input } from "../ui/input.jsx"
import { Label } from "../ui/label.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.jsx"
import { Separator } from "../ui/separator.jsx"
import { Save, RefreshCw, Users, Database, Settings as SettingsIcon } from "lucide-react"
import { toast } from "sonner"

export default function SettingsTab() {
  const [activeTab, setActiveTab] = useState("users")

  // User Settings
  const [userSettings, setUserSettings] = useState({
    maxUsers: 10000,
    defaultUserRole: "User",
    allowSelfRegistration: true,
    requireEmailVerification: true,
  })

  // ML Model Settings
  const [mlSettings, setMlSettings] = useState({
    autoRetrain: false,
    retrainInterval: 30,
    minDataPoints: 100,
    accuracyThreshold: 0.85,
  })

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    enableNotifications: true,
    logRetentionDays: 90,
    sessionTimeout: 60,
  })

  const handleSaveUserSettings = () => {
    toast.success("User settings saved successfully")
  }

  const handleSaveMLSettings = () => {
    toast.success("ML settings saved successfully")
  }

  const handleSaveSystemSettings = () => {
    toast.success("System settings saved successfully")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure system settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            ML Model
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Users Settings */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management Settings</CardTitle>
              <CardDescription>
                Configure user registration and management options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Maximum Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={userSettings.maxUsers}
                  onChange={(e) =>
                    setUserSettings({ ...userSettings, maxUsers: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of users allowed in the system
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Self-Registration</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable new users to register themselves
                    </p>
                  </div>
                  <Button
                    variant={userSettings.allowSelfRegistration ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setUserSettings({ ...userSettings, allowSelfRegistration: !userSettings.allowSelfRegistration })
                    }
                  >
                    {userSettings.allowSelfRegistration ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-xs text-muted-foreground">
                      Require users to verify their email address
                    </p>
                  </div>
                  <Button
                    variant={userSettings.requireEmailVerification ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setUserSettings({ ...userSettings, requireEmailVerification: !userSettings.requireEmailVerification })
                    }
                  >
                    {userSettings.requireEmailVerification ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveUserSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Model Settings */}
        <TabsContent value="ml" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Machine Learning Model Settings</CardTitle>
              <CardDescription>
                Configure ML model training and prediction settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="retrainInterval">Auto-Retrain Interval (Days)</Label>
                <Input
                  id="retrainInterval"
                  type="number"
                  value={mlSettings.retrainInterval}
                  onChange={(e) =>
                    setMlSettings({ ...mlSettings, retrainInterval: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  How often to automatically retrain the model
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minDataPoints">Minimum Data Points</Label>
                <Input
                  id="minDataPoints"
                  type="number"
                  value={mlSettings.minDataPoints}
                  onChange={(e) =>
                    setMlSettings({ ...mlSettings, minDataPoints: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum number of data points required for training
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accuracyThreshold">Accuracy Threshold</Label>
                <Input
                  id="accuracyThreshold"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={mlSettings.accuracyThreshold}
                  onChange={(e) =>
                    setMlSettings({ ...mlSettings, accuracyThreshold: parseFloat(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum accuracy threshold for model deployment
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Retrain Model</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically retrain the model on a schedule
                  </p>
                </div>
                <Button
                  variant={mlSettings.autoRetrain ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setMlSettings({ ...mlSettings, autoRetrain: !mlSettings.autoRetrain })
                  }
                >
                  {mlSettings.autoRetrain ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retrain Now
                </Button>
                <Button onClick={handleSaveMLSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={systemSettings.sessionTimeout}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  User session inactivity timeout duration
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logRetention">Log Retention (Days)</Label>
                <Input
                  id="logRetention"
                  type="number"
                  value={systemSettings.logRetentionDays}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, logRetentionDays: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Number of days to retain system logs
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Put the system in maintenance mode
                  </p>
                </div>
                <Button
                  variant={systemSettings.maintenanceMode ? "destructive" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode })
                  }
                >
                  {systemSettings.maintenanceMode ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Send system notifications to users
                  </p>
                </div>
                <Button
                  variant={systemSettings.enableNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSystemSettings({ ...systemSettings, enableNotifications: !systemSettings.enableNotifications })
                  }
                >
                  {systemSettings.enableNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveSystemSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
