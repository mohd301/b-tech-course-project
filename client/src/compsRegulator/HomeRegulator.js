import { Container, Row, Col, Card, CardTitle, CardBody, Button } from "reactstrap"
import { colors } from "../styles/colors.js";
import { useNavigate } from "react-router-dom";

export default function HomeRegulator() {

    return (
        <div style={{ background: colors.primaryBackground, height: "80vh" }}>
            <Container fluid>

                <Row>
                    <col xs="2">&nbsp; &nbsp;</col>
                    <Col xs="6">
                <Card>
                    <CardBody>
                        <h3>Welcome Relulator</h3>
                    </CardBody>
                </Card>
                </Col>
                </Row>

            </Container>
        </div>
    )
}