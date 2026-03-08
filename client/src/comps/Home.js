import { useTheme } from "../compsMisc/ThemeContext.js";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText } from "reactstrap";
import { FaClipboardCheck, FaLocationDot  } from "react-icons/fa6";
export default function Home() {
    const { theme } = useTheme();

    const iconsSize = "50px"
    const iconStyle = {
        height: iconsSize,
        width: iconsSize,
    }

    return (
        <Container className="py-5">

            <Row className="g-4">
                <Col md="6" lg="4">
                    <Link to="/apply" style={{ textDecoration: "none" }}>
                        <Card className="h-100 dash-card">
                            <CardBody className="text-center d-flex flex-column align-items-center justify-content-center py-5">
                                <div style={iconStyle} className="iconContainer mb-2">
                                    <FaClipboardCheck size={28} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h5" style={{ color: theme.textColorAlt, fontWeight: "600" }}>
                                    Apply for subsidy
                                </CardTitle>
                                <CardText style={{ color: theme.textColorAlt, opacity: 0.8 }}>
                                    Apply for subsidy using your ID number
                                </CardText>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>

                <Col md="6" lg="4">
                    <Link to="/userMap" style={{ textDecoration: "none" }}>
                        <Card className="h-100 dash-card">
                            <CardBody className="text-center d-flex flex-column align-items-center justify-content-center py-5">
                                <div style={iconStyle} className="iconContainer mb-2">
                                    <FaLocationDot  size={28} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h5" style={{ color: theme.textColorAlt, fontWeight: "600" }}>
                                    Map
                                </CardTitle>
                                <CardText style={{ color: theme.textColorAlt, opacity: 0.8 }}>
                                    View map of government offices
                                </CardText>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>
            </Row>
        </Container>
    )
}