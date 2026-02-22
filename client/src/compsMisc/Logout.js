import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../slices/SliceAuth";
import { getUserType } from "../functions/getUserType";

export default function Logout() {
    const navigate = useNavigate();
    const logoutDispatch = useDispatch()

    const handleLogout = () => {
        const type = getUserType()
        localStorage.removeItem("authToken");
        if (type) {
            logoutDispatch(logout());
        } 
        navigate("/", { replace: true });
    };

    return (
        <p className="txtBtn text-center" onClick={handleLogout}><u>Logout</u></p>
    );
}