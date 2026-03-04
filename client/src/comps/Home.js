import { useTheme } from "../compsMisc/ThemeContext.js";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText } from "reactstrap";
import { FaClipboardCheck } from "react-icons/fa";
export default function Home() {
    const { theme } = useTheme();
        

    const cardStyle = {
        backgroundColor: theme.altBackground,
        border: `1px solid ${theme.tertiaryColor}`,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        textDecoration: "none"
    };

    const iconContainerStyle = {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: theme.primaryColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px"
    };
    return (
          <Container className="py-5">
        
                    <Row className="g-4">
                        <Col md="6" lg="4">
                            <Link to="/apply" style={{ textDecoration: "none" }}>
                                <Card style={cardStyle} className="h-100 admin-card">
                                    <CardBody className="text-center d-flex flex-column align-items-center justify-content-center py-5">
                                        <div style={iconContainerStyle}>
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
                    </Row>
                </Container>
    )
}