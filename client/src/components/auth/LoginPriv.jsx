import React, { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Skeleton } from "../ui/skeleton"
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { privLoginThunk } from "../../slices/SlicePriv"
import { getUserType } from "../../functions/getUserType"
import { checkAuth } from "../../functions/checkAuth"

export default function LoginPriv() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const alertedRef = useRef(false)

  const loading = useSelector((state) => state.priv.loading)

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    checkAuth(alertedRef, navigate)
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }
    try {
      const res = await dispatch(
        privLoginThunk({ Email: formData.email, Password: formData.password })
      ).unwrap()

      const { serverMsg, token } = res
      if (serverMsg === "Welcome" && token) {
        toast.success("Welcome back!")
        localStorage.setItem("authToken", token)
        const type = getUserType()
        if (type === "Admin") {
          navigate("/homeAdmin", { replace: true })
        } else if (type === "Regulator") {
          navigate("/homeReg", { replace: true })
        }
      } else {
        toast.error(serverMsg || "Login failed")
      }
    } catch (err) {
      toast.error("Invalid credentials")
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center space-y-3 pb-2">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Admin / Regulator Login</CardTitle>
        <CardDescription>
          Privileged access for system administrators and regulators
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to User Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
