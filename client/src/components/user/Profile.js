import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Timeline, TimelineItem, TimelineContent, TimelineDate, TimelineTitle, TimelineDescription } from "../ui/timeline"
import { toast } from "sonner"
import { userChgPwdThunk } from "../../slices/SliceUser"
import { getUserType } from "../../functions/getUserType"

export default function Profile() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)
  const userToken = useSelector((state) => state.user.token)
  const loading = useSelector((state) => state.user.loading)
  const msg = useSelector((state) => state.user.msg)
  const flag = useSelector((state) => state.user.flag)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    if (flag && msg) {
      toast.success(msg)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPasswordError("")
    } else if (!flag && msg) {
      toast.error(msg)
    }
  }, [flag, msg])

  const handlePasswordChange = (e) => {
    e.preventDefault()
    setPasswordError("")

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    const type = getUserType()
    const token = type === "User" ? userToken : localStorage.getItem("authToken")

    dispatch(userChgPwdThunk({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword,
      token: token
    }))
  }

  const mockHistory = [
    {
      title: "Account Created",
      date: new Date().toLocaleDateString(),
      description: "Your account was successfully registered",
      status: "completed"
    },
    {
      title: "Email Verified",
      date: new Date().toLocaleDateString(),
      description: "Email address verified through OTP",
      status: "completed"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Manage your account settings and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Profile Info</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user?.Email || ""} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={user?.Phone || ""} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Input value="User" readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your profile information is managed by the system administrators. To update your personal details, please contact support.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {passwordError}
                </div>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="history">
            <Timeline>
              <TimelineItem>
                <TimelineContent>
                  <TimelineDate>{mockHistory[0].date}</TimelineDate>
                  <TimelineTitle>{mockHistory[0].title}</TimelineTitle>
                  <TimelineDescription>{mockHistory[0].description}</TimelineDescription>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineContent>
                  <TimelineDate>{mockHistory[1].date}</TimelineDate>
                  <TimelineTitle>{mockHistory[1].title}</TimelineTitle>
                  <TimelineDescription>{mockHistory[1].description}</TimelineDescription>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
