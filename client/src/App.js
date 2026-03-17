import "bootstrap/dist/css/bootstrap.css";
import "./styles/styles.css";

// User
import Login from "./comps/Login";
import Footer from "./comps/Footer";
import Header from "./comps/Header";
import Register from "./comps/Register";
import Home from "./comps/Home";
import ForgotPwd from "./comps/ForgotPwd"
import GovOf from "./comps/GovOf";
import Apply from "./comps/Apply";
// Might be removed
import ChangePwd from "./comps/ChangePwd";

// Priviliged User
import PrivLogin from "./compsPriv/LoginPriv";
import ManageDatasets from "./compsPriv/ManageDatasets";

// Admin
import HomeAdmin from "./compsAdmin/HomeAdmin";
import ManageUsers from "./compsAdmin/ManageUsers";
import AuditLog from "./compsAdmin/AuditLog";
import GenerateReport from "./compsAdmin/GenerateReport";

// Regulator
import HomeRegulator from "./compsRegulator/HomeRegulator";
import UploadDataset from "./compsRegulator/UploadDataset";

import { useEffect, useState, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify"
import { FaMoon } from "react-icons/fa6";
import { FaSun } from "react-icons/fa6";

import { getUserType } from "./functions/getUserType";
import { determineRoute } from "./functions/determineRoute";

import { logout } from "./slices/SliceAuth";
import { setToken } from "./slices/SliceAuth";
import { decryptToken } from "./functions/decryptToken";

import { useTheme } from "./compsMisc/ThemeContext";

function App() {
  const { toggleTheme, mode } = useTheme();

  const alertedRef = useRef(false);
  const [authMsg, setAuthMsg] = useState("");

  const navigate = useNavigate();

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

  // This useEffect sets up a timer to automatically log out the user when the JWT token expires. 
  // It calculates the remaining time until expiration and logs out the user
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const decoded = decryptToken(token);
    const expiryTime = decoded.exp * 1000;
    const timeout = expiryTime - Date.now();

    // handle when token already expired
    if (timeout <= 0) {
      dispatch(logout());
      alert("Session expired. Please log in again.");
      navigate("/", { replace: true });
      return;
    }

    if (timeout > 0) {
      const timer = setTimeout(() => {
        dispatch(logout());
        alert("Session expired. Please log in again.");
        navigate("/", { replace: true });
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [dispatch, navigate]);

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
    } else if (token && !localToken) { // If no token but redux has value then reset redux
      dispatch(logout());
    }
  }, [token, authMsg, dispatch]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-fill">
        <ToastContainer position="top-right" autoClose={3000}></ToastContainer>
        <Routes>
          <Route path='/' element={<Login />}></Route>
          <Route path='/regUser' element={<Register />}></Route>
          <Route path='/logPriv' element={<PrivLogin />}></Route>
          <Route path='/forgotPwd' element={<ForgotPwd />}></Route>
          <Route path="/gov" element={<GovOf />}></Route>


          <Route path='/changePwd' element={
            <PrivateRoute allowedRoles={["User", "Admin", "Regulator"]}>
              <ChangePwd />
            </PrivateRoute>}>
          </Route>

          <Route path="/home" element={
            <PrivateRoute allowedRoles={["User"]}>
              <Home />

            </PrivateRoute>}>
          </Route>

          <Route path="/userMap" element={
            <PrivateRoute allowedRoles={["User"]}>
              <GovOf />
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

          <Route path='/audit' element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <AuditLog />
            </PrivateRoute>}>
          </Route>

          <Route path='/manageDatasets' element={
            <PrivateRoute allowedRoles={["Admin", "Regulator"]}>
              <ManageDatasets />
            </PrivateRoute>}>
          </Route>

          <Route path='/generateReport' element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <GenerateReport />
            </PrivateRoute>}>
          </Route>

          <Route path='/homeReg' element={
            <PrivateRoute allowedRoles={["Regulator"]}>
              <HomeRegulator />
            </PrivateRoute>}>
          </Route>
          <Route path="/apply" element={
            <PrivateRoute allowedRoles={"User"}>
              <Apply />
            </PrivateRoute>}></Route>

          <Route path='/uploadDataset' element={
            <PrivateRoute allowedRoles={["Regulator"]}>
              <UploadDataset />
            </PrivateRoute>}>
          </Route>
        </Routes>

        <button className="themeButton" onClick={toggleTheme}>
          {mode === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </main>

      <Footer />
    </div>
  );
}

export default App;
