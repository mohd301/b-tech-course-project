import { Container, Col, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux"
import { FaUser } from "react-icons/fa6";
import { Link } from "react-router-dom";

import { useTheme } from "./ThemeContext.js";
import Logout from "./Logout.js";

export default function Navbar() {
    const { theme } = useTheme();

    const user = useSelector(state => state.user.user)
    const priv = useSelector(state => state.priv.priv)
    return (
        user && (
            <Container fluid style={{ background: theme.secondaryColor, minHeight: '5vh' }} className="p-4 d-flex position-relative align-items-center justify-content-center">
                <div className="profileMenu" style={{ position: 'absolute', left: '1rem', fontSize: '1.5rem' }}>
                    <div className="iconButton d-flex align-items-center justify-content-center">
                        <FaUser />
                    </div>

                    <div className="dropdownMenu">
                        <Link style={{ color: theme.textColor }} to="changePwd">Change Password</Link>
                        <Logout />
                    </div>
                </div>
            </Container>
        )
    )
}