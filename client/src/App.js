import { Toaster } from "sonner"
import { TooltipProvider } from "./components/ui/tooltip.jsx"

// Layouts
import AuthLayout from "./layouts/AuthLayout"
import MainLayout from "./layouts/MainLayout"

// Auth
import Login from "./components/auth/Login.jsx"
import Register from "./components/auth/Register.jsx"
import ForgotPwd from "./components/auth/ForgotPwd.jsx"
import LoginPriv from "./components/auth/LoginPriv.jsx"

// User
import UserHome from "./components/user/UserHome.jsx"

// Privileged
import AdminHome from "./components/admin/AdminHome.jsx"
import RegulatorHome from "./components/regulator/RegulatorHome.jsx"

import { useEffect, useRef, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"

import { getUserType } from "./functions/getUserType"
import { determineRoute } from "./functions/determineRoute"

import { logoutUser, setUserToken } from "./slices/SliceUser"
import { logoutPriv, setPrivToken } from "./slices/SlicePriv"

function App() {
  const alertedRef = useRef(false)
  const [authMsg, setAuthMsg] = useState("")

  function PrivateRoute({ children, allowedRoles }) {
    const type = getUserType()
    if (!allowedRoles.includes(type)) {
      setAuthMsg("Unauthorized access")
      return <Navigate to={determineRoute(type)} />
    }
    return children
  }

  const userToken = useSelector((state) => state.user.token)
  const privToken = useSelector((state) => state.priv.token)
  const dispatch = useDispatch()

  useEffect(() => {
    const localToken = localStorage.getItem("authToken")
    const type = getUserType()

    if (authMsg === "Unauthorized access" && !alertedRef.current) {
      alertedRef.current = true
      alert(authMsg)
    }

    if (!type) return

    if ((type === "Admin" || type === "Regulator") && !privToken && localToken) {
      dispatch(setPrivToken(localToken))
    } else if ((type === "Admin" || type === "Regulator") && privToken && !localToken) {
      dispatch(logoutPriv())
    }

    if (type === "User" && !userToken && localToken) {
      dispatch(setUserToken(localToken))
    } else if (type === "User" && userToken && !localToken) {
      dispatch(logoutUser())
    }
  }, [userToken, privToken, authMsg, dispatch])

  return (
    <BrowserRouter>
      <TooltipProvider>
      <div className="min-h-screen">
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/regUser" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/logPriv" element={<AuthLayout><LoginPriv /></AuthLayout>} />
          <Route path="/forgotPwd" element={<AuthLayout><ForgotPwd /></AuthLayout>} />

          {/* User routes */}
          <Route path="/home" element={
            <PrivateRoute allowedRoles={["User"]}>
              <MainLayout><UserHome /></MainLayout>
            </PrivateRoute>
          } />

          {/* Admin routes */}
          <Route path="/homeAdmin" element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <MainLayout><AdminHome /></MainLayout>
            </PrivateRoute>
          } />

          {/* Regulator routes */}
          <Route path="/homeReg" element={
            <PrivateRoute allowedRoles={["Regulator"]}>
              <MainLayout><RegulatorHome /></MainLayout>
            </PrivateRoute>
          } />
        </Routes>
      </div>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
