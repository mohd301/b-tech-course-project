import { Container,Col, Row } from "reactstrap";
import { colors } from "../styles/colors.js";

export default function Header() {
    return (
        <Container fluid style={{ background: colors.primaryColor, minHeight: '10vh' }} className="p-4 text-center">
            <h1>Online Subsidy Eligibility System</h1>
        </Container>
    )
}