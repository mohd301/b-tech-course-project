import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { userLoginThunk } from "../../slices/SliceUser";
import { clearMsg } from "../../slices/SliceUser";
import { checkAuth } from "../../functions/checkAuth";
import { useTheme } from "../../compsMisc/ThemeContext";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import PasswordInput from "./PasswordInput";

export default function Login() {
  const { theme } = useTheme();

  const [loginId, setLoginId] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  const msg = useSelector((state) => state.user.msg);
  const loading = useSelector((state) => state.user.loading);
  const userlogindispatch = useDispatch();
  const navigate = useNavigate();
  const alertedRef = useRef(false);

  useEffect(() => {
    userlogindispatch(clearMsg());
    checkAuth(alertedRef, navigate);
  }, [navigate]);

  const handleLogin = async (e) => {
    try {
      e.preventDefault();
      const loginData = {
        Email: loginId,
        Password: loginPwd
      };
      const res = await userlogindispatch(userLoginThunk(loginData)).unwrap();
      const { serverMsg, token } = res;
      if (serverMsg === "Welcome" && token) {
        toast.success(serverMsg);
        localStorage.setItem("authToken", token);
        navigate("/home", { replace: true });
        return;
      } else {
        toast.error(serverMsg);
        return;
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background py-8"
      style={{ backgroundColor: theme.primaryBackground, minHeight: "82.1vh" }}
    >
      <Card 
        className="w-full max-w-lg"
        style={{ background: theme.tertiaryColor }}
      >
        <CardHeader>
          <CardTitle className="text-center text-2xl" style={{ color: "white" }}>
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email:</Label>
                <Input
                  id="email"
                  name="UserName"
                  placeholder="eg@email.com"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password:</Label>
                <PasswordInput
                  value={loginPwd}
                  onChange={(e) => setLoginPwd(e.target.value)}
                  placeholder="Enter password"
                />
              </div>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Link to="forgotPwd" className="text-sm text-white hover:text-gray-200">
                  Forgot Password
                </Link>
                <Link to="regUser" className="text-sm text-white hover:text-gray-200">
                  Register
                </Link>
                <Link to="logPriv" className="text-sm text-white hover:text-gray-200">
                  Admin / Regulator
                </Link>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  style={{ background: theme.primaryColor }}
                >
                  Login
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center p-8">
              <Skeleton className="h-8 w-32" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
