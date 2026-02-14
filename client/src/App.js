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
import HomeRegulator from "./compsRegulator/HomeRegulator";

import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify"

import { getUserType } from "./functions/getUserType";
import { determineRoute } from "./functions/determineRoute";

import { logoutUser } from "./slices/SliceUser";
import { logoutPriv } from "./slices/SlicePriv";
import { setUserToken } from "./slices/SliceUser";
import { setPrivToken } from "./slices/SlicePriv";

function App() {
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

  const userToken = useSelector((state) => state.user.token);
  const privToken = useSelector((state) => state.priv.token);
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
    if ((type === "Admin" || type === "Regulator") && !privToken && localToken) {
      dispatch(setPrivToken(localToken));
    } else if ((type === "Admin" || type === "Regulator") && privToken && !localToken) { // If no token but redux has value then reset redux
      dispatch(logoutPriv());
    }

    // same logic but for user
    if (type === "User" && !userToken && localToken) {
      dispatch(setUserToken(localToken));
    } else if (type === "User" && userToken && !localToken) {
      dispatch(logoutUser());
    }
  }, [userToken, privToken, authMsg, dispatch]);

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
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
