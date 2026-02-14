import { Container } from "reactstrap";
import { colors } from "../styles/colors.js";
import Navbar from "../compsMisc/Navbar.js"
import { useDispatch, useSelector } from "react-redux"

export default function Header() {
    const user = useSelector(state => state.user.user)
    return (
        <>
            <Container fluid style={{ background: colors.primaryColor, minHeight: '7vh' }} className="p-4 d-flex align-items-center justify-content-center">
                <h1 style={{ color: "white" }}>Online Subsidy Eligibility System</h1>
            </Container>

            {user && (
                <Navbar />
            )}
        </>
    )
}