import { Container } from "reactstrap";
import Navbar from "../compsMisc/Navbar.js"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "../compsMisc/ThemeContext.js";
import { useEffect } from "react";

export default function Header() {
    const { theme } = useTheme();
    const token = useSelector((state) => state.auth.token)

    return (
        <>
            <Container fluid style={{ background: theme.primaryColor, minHeight: '7vh' }} className="p-4 d-flex align-items-center justify-content-center">
                <h1 style={{ color: "white" }}>Online Subsidy Eligibility System</h1>
            </Container>

            {token && (
                <Navbar />
            )}
        </>
    )
}