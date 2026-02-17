import { Container, Col, Row } from "reactstrap";
import { useTheme } from "../compsMisc/ThemeContext"

export default function Footer() {
    const { theme } = useTheme();
    return (
        <>

            <Container fluid style={{ background: theme.primaryColor, height: '7vh' }} className="align-content-center text-center ">

                <Row >
                    <Col md="4"><h4 style={{ color: "white" }}><u> Contact us </u></h4>
                    </Col>
                    <Col md="4">
                        <h4 style={{ color: "white" }}> &copy; Online Subsidy Eligibility System</h4>
                    </Col>
                    <Col md="4">
                        <h4 style={{ color: "white" }}><u> About us </u></h4>
                    </Col>
                </Row>
            </Container>

        </>
    )
}