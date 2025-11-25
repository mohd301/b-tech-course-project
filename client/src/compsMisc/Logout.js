import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../slices/SliceUser";
import { logoutPriv } from "../slices/SlicePriv";
import { getUserType } from "../functions/getUserType";

export default function Logout() {
    const navigate = useNavigate();
    const logoutDispatch = useDispatch()

    const handleLogout = () => {
        const type=getUserType()
        localStorage.removeItem("authToken");
        if(type==="User"){
            logoutDispatch(logoutUser());
        } else if(type==="Admin" || type==="Regulator"){
            logoutDispatch(logoutPriv())
        }
        navigate("/", { replace: true });
    };

    return (
        <button className="primaryButton" onClick={handleLogout}>
            Logout
        </button>
    );
}