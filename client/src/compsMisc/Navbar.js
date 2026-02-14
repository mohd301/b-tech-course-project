import { Container, Col, Row } from "reactstrap";
import { colors } from "../styles/colors.js";
import { useDispatch, useSelector } from "react-redux"
import { FaUser } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function Navbar() {
    const user = useSelector(state => state.user.user)
    return (
        <Container fluid style={{ background: colors.secondaryColor, minHeight: '5vh' }} className="p-4 d-flex position-relative align-items-center justify-content-center">
            {user && (
                <div className="profileMenu" style={{ position: 'absolute', left: '1rem', fontSize: '1.5rem' }}>
                    <div className="iconButton d-flex align-items-center justify-content-center">
                        <FaUser />
                    </div>

                    <div className="dropdownMenu">
                        <Link to="changePwd">Change Password</Link>
                    </div>
                </div>
            )}
        </Container>
    )
}