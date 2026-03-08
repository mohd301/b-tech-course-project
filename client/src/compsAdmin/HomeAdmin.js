import { Container, Row, Col, Card, CardBody, CardTitle, CardText } from "reactstrap";
import { Link } from "react-router-dom";
import { FaUsers, FaDatabase, FaFilePdf, FaClipboardList } from "react-icons/fa";
import { useTheme } from "../compsMisc/ThemeContext.js";

export default function HomeAdmin() {
    const { theme } = useTheme();
    
    const iconsSize = "50px"
    const iconStyle = {
        height: iconsSize,
        width: iconsSize,
    }

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: theme.textColorAlt }}>Admin Dashboard</h2>
            </div>

            <Row className="g-4">
                <Col md="6" lg="3">
                    <Link to="/manageUsers" style={{ textDecoration: "none" }}>
                        <Card className="h-100 dash-card">
                            <CardBody className="text-center d-flex flex-column align-items-center justify-content-center py-5">
                                <div style={iconStyle} className="iconContainer mb-2">
                                    <FaUsers size={28} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h5" style={{ color: theme.textColorAlt, fontWeight: "600" }}>
                                    Manage Users
                                </CardTitle>
                                <CardText style={{ color: theme.textColorAlt, opacity: 0.8 }}>
                                    View, edit, and delete user accounts
                                </CardText>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>

                <Col md="6" lg="3">
                    <Link to="/manageDatasets" style={{ textDecoration: "none" }}>
                        <Card className="h-100 dash-card">
                            <CardBody className="text-center d-flex flex-column align-items-center justify-content-center py-5">
                                <div  style={iconStyle} className="iconContainer mb-2">
                                    <FaDatabase size={28} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h5" style={{ color: theme.textColorAlt, fontWeight: "600" }}>
                                    View Datasets
                                </CardTitle>
                                <CardText style={{ color: theme.textColorAlt, opacity: 0.8 }}>
                                    View uploaded datasets (read-only)
                                </CardText>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>

                <Col md="6" lg="3">
                    <Link to="/generateReport" style={{ textDecoration: "none" }}>
                        <Card className="h-100 dash-card">
                            <CardBody className="text-center d-flex flex-column align-items-center justify-content-center py-5">
                                <div  style={iconStyle} className="iconContainer mb-2">
                                    <FaFilePdf size={28} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h5" style={{ color: theme.textColorAlt, fontWeight: "600" }}>
                                    Generate Reports
                                </CardTitle>
                                <CardText style={{ color: theme.textColorAlt, opacity: 0.8 }}>
                                    Generate PDF reports for datasets
                                </CardText>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>

                <Col md="6" lg="3">
                    <Link to="/audit" style={{ textDecoration: "none" }}>
                        <Card className="h-100 dash-card">
                            <CardBody className="text-center d-flex flex-column align-items-center justify-content-center py-5">
                                <div  style={iconStyle} className="iconContainer mb-2">
                                    <FaClipboardList size={28} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h5" style={{ color: theme.textColorAlt, fontWeight: "600" }}>
                                    Audit Log
                                </CardTitle>
                                <CardText style={{ color: theme.textColorAlt, opacity: 0.8 }}>
                                    View system activity logs
                                </CardText>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>
            </Row>
        </Container>
    );
}
