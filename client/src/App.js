import "bootstrap/dist/css/bootstrap.css";
import "./styles/styles.css";

// User
import Login from "./comps/Login";
import Footer from "./comps/Footer";
import Header from "./comps/Header";
import Register from "./comps/Register";
import Home from "./comps/Home";
import ForgotPwd from "./comps/ForgotPwd"

// Might be removed
import ChangePwd from "./comps/ChangePwd";

// Priviliged User
import PrivLogin from "./compsPriv/LoginPriv";
import HomeAdmin from "./compsAdmin/HomeAdmin";
import ManageUsers from "./compsAdmin/ManageUsers";
import HomeRegulator from "./compsRegulator/HomeRegulator";

import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify"
import { FaMoon } from "react-icons/fa6";
import { FaSun } from "react-icons/fa6";

import { getUserType } from "./functions/getUserType";
import { determineRoute } from "./functions/determineRoute";

import { logout } from "./slices/SliceAuth";
import { setToken } from "./slices/SliceAuth";

import { useTheme } from "./compsMisc/ThemeContext";

function App() {
  const {toggleTheme, mode} = useTheme();

  const alertedRef = useRef(false);
  const [authMsg, setAuthMsg] = useState("");

  // Protect routes to prevent unauthorised access
  function PrivateRoute({ children, allowedRoles }) {
    let route = "";
    const type = getUserType();

    if (!allowedRoles.includes(type)) {
      setAuthMsg("Unauthorized access");
      route = determineRoute(type);
      return <Navigate to={route} />
    }

    // Only return children when user is of authorized type
    return children;
  }

  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    const localToken = localStorage.getItem("authToken");
    const type = getUserType();

    if (authMsg === "Unauthorized access" && !alertedRef.current) {
      alertedRef.current = true;
      alert(authMsg);
    }

    if (!type) return; // no valid token

    // If token exists but redux is empty then fill redux
    if (!token && localToken) {
      dispatch(setToken(localToken));
    } else if ( token && !localToken) { // If no token but redux has value then reset redux
      dispatch(logout());
    }
  }, [token, authMsg, dispatch]);

  return (
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-fill">
            <ToastContainer position="top-right" autoClose={3000}></ToastContainer>
            <Routes>
              <Route path='/' element={<Login />}></Route>
              <Route path='/regUser' element={<Register />}></Route>
              <Route path='/logPriv' element={<PrivLogin />}></Route>
              <Route path='/forgotPwd' element={<ForgotPwd />}></Route>

              <Route path='/changePwd' element={
                <PrivateRoute allowedRoles={["User"]}>
                  <ChangePwd />
                </PrivateRoute>}>
              </Route>

              <Route path='/homeAdmin' element={
                <PrivateRoute allowedRoles={["Admin"]}>
                  <HomeAdmin />
                </PrivateRoute>}>
              </Route>

              <Route path='/manageUsers' element={
                <PrivateRoute allowedRoles={["Admin"]}>
                  <ManageUsers />
                </PrivateRoute>}>
              </Route>

              <Route path='/homeReg' element={
                <PrivateRoute allowedRoles={["Regulator"]}>
                  <HomeRegulator />
                </PrivateRoute>}>
              </Route>

              <Route path="/home" element={
                <PrivateRoute allowedRoles={["User"]}>
                  <Home />
                </PrivateRoute>}>
              </Route>
            </Routes>

            <button className="themeButton" onClick={toggleTheme}>
              {mode === "light" ? <FaMoon /> : <FaSun />}
            </button>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
  );
}

export default App;
