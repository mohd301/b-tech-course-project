import { Link } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { userLoginThunk } from "../../slices/SliceUser"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { clearMsg } from "../../slices/SliceUser"
import { checkAuth } from "../../functions/checkAuth"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

export default function Login() {
    const [loginId, setLoginId] = useState("")
    const [loginPwd, setLoginPwd] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const msg = useSelector((state) => state.user.msg)
    const loading = useSelector((state) => state.user.loading)
    const userLoginDispatch = useDispatch()
    const navigate = useNavigate()
    const alertedRef = useRef(false);

    useEffect(() => {
        userLoginDispatch(clearMsg())
        checkAuth(alertedRef, navigate)
    }, [navigate, userLoginDispatch]);

    const handleLogin = async (e) => {
        try {
            e.preventDefault()
            const loginData = {
                Email: loginId,
                Password: loginPwd
            }
            const res = await userLoginDispatch(userLoginThunk(loginData)).unwrap()
            const { serverMsg, token } = res
            if (serverMsg === "Welcome" && token) {
                toast.success(serverMsg)
                localStorage.setItem("authToken", token);
                navigate("/home", { replace: true });
                return;
            } else {
                toast.error(serverMsg);
                return;
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="w-full">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center font-bold">Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="eg@email.com"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password"
                                        value={loginPwd}
                                        onChange={(e) => setLoginPwd(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link to="forgotPwd" className="text-sm text-primary hover:underline block">
                                    Forgot Password?
                                </Link>
                                <Link to="regUser" className="text-sm text-primary hover:underline block">
                                    Don't have an account? Register
                                </Link>
                                <Link to="logPriv" className="text-sm text-primary hover:underline block">
                                    Admin / Regulator Login
                                </Link>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Skeleton className="h-5 w-20" /> : "Login"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

