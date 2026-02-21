import React, { useState } from "react"
import { useSelector } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { User, FileCheck, History, Bell, HelpCircle, CheckCircle } from "lucide-react"
import Profile from "./Profile"
import EligibilityCheck from "./EligibilityCheck"
import NotificationCenter from "./NotificationCenter"
import HelpDialog from "./HelpDialog"

export default function UserHome() {
  const user = useSelector((state) => state.user.user)
  const eligibilityResult = useSelector((state) => state.user.eligibilityResult)
  const [activeTab, setActiveTab] = useState("eligibility")

  const displayName = user?.Email || user?.email || "User"

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-primary text-primary-foreground border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Welcome back!
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 mt-1">
                {displayName}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <HelpDialog />
              <NotificationCenter />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("eligibility")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Eligibility Status</CardDescription>
              <FileCheck className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {eligibilityResult ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-600">
                  {eligibilityResult.eligible ? "Eligible" : "Not Eligible"}
                </span>
              </div>
            ) : (
              <div>
                <p className="font-semibold">Not Checked</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-primary"
                  onClick={() => setActiveTab("eligibility")}
                >
                  Check now &rarr;
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("profile")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>My Profile</CardDescription>
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold truncate">{displayName}</p>
            <Badge variant="secondary" className="mt-1 text-xs">Active</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Applications</CardDescription>
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {eligibilityResult ? "1 Submitted" : "None yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {eligibilityResult ? `Score: ${eligibilityResult.score}%` : "Complete eligibility check"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eligibility" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Eligibility Check</span>
            <span className="sm:hidden">Eligibility</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eligibility" className="mt-6">
          <EligibilityCheck />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Profile />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Application History
              </CardTitle>
              <CardDescription>
                Your submitted subsidy eligibility applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eligibilityResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Eligibility Check</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={eligibilityResult.eligible ? "default" : "destructive"}
                      >
                        {eligibilityResult.eligible ? "Eligible" : "Not Eligible"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Score: {eligibilityResult.score}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No applications yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete an eligibility check to see your history
                  </p>
                  <Button onClick={() => setActiveTab("eligibility")}>
                    Start Eligibility Check
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
