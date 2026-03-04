import { Container, Card, CardBody, CardTitle, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import { useTheme } from "../compsMisc/ThemeContext";
import { FaUpload, FaDatabase } from "react-icons/fa";
import Logout from "../compsMisc/Logout";

export default function HomeRegulator() {
    const { theme } = useTheme();

    const cardStyle = {
        backgroundColor: theme.altBackground,
        borderRadius: "12px",
        boxShadow: "4px 4px 8px var(--shadowColor)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        height: "100%"
    };

    const linkStyle = {
        textDecoration: "none",
        color: "inherit"
    };

    return (
        <Container className="py-5" style={{ minHeight: "80vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2 style={{ color: theme.textColorAlt }}>Regulator Dashboard</h2>
                <Logout />
            </div>

            <Row className="g-4 justify-content-center">
                <Col md={6} lg={5}>
                    <Link to="/uploadDataset" style={linkStyle}>
                        <Card className="admin-card h-100" style={cardStyle}>
                            <CardBody className="d-flex flex-column align-items-center justify-content-center p-5">
                                <FaUpload size={60} color={theme.primaryColor} className="mb-4" />
                                <CardTitle tag="h3" style={{ color: theme.textColorAlt }} className="text-center">
                                    Upload Dataset
                                </CardTitle>
                                <p style={{ color: theme.tertiaryColor, textAlign: "center" }} className="mt-2">
                                    Upload CSV files containing subsidy-related data
                                </p>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>

                <Col md={6} lg={5}>
                    <Link to="/manageDatasets" style={linkStyle}>
                        <Card className="admin-card h-100" style={cardStyle}>
                            <CardBody className="d-flex flex-column align-items-center justify-content-center p-5">
                                <FaDatabase size={60} color={theme.primaryColor} className="mb-4" />
                                <CardTitle tag="h3" style={{ color: theme.textColorAlt }} className="text-center">
                                    Manage Datasets
                                </CardTitle>
                                <p style={{ color: theme.tertiaryColor, textAlign: "center" }} className="mt-2">
                                    View, edit, and delete uploaded datasets
                                </p>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>
            </Row>
        </Container>
    );
}
