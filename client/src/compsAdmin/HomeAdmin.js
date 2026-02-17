import Logout from "../compsMisc/Logout";
import { useTheme } from "../compsMisc/ThemeContext.js";

export default function HomeAdmin() {
    const { theme } = useTheme();

    return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <h3 style={{ color: theme.textColorAlt }}>Welcome Admin</h3>
            <Logout />
        </div>
    )
}