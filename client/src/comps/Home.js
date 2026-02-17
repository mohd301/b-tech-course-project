import Logout from "../compsMisc/Logout";
import { useTheme } from "../compsMisc/ThemeContext.js";

export default function Home() {
    const { theme } = useTheme();
    return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <h1 style={{color: theme.textColorAlt}}> Welcome User </h1>
            <Logout/>
        </div>
    )
}