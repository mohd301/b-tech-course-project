import { Container, Card, CardBody, CardTitle, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import { useTheme } from "../compsMisc/ThemeContext";
import { FaUpload, FaDatabase, FaFlask, FaSyncAlt, FaChartLine, FaScroll} from "react-icons/fa";

export default function HomeRegulator() {
    const { theme } = useTheme();

    const iconSize = "85px"
    const iconStyle = {
        height: iconSize,
        width: iconSize,
    }

    return (
        <Container className="py-5" style={{ minHeight: "80vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2 style={{ color: theme.textColorAlt }}>Regulator Dashboard</h2>
            </div>

            <Row className="g-4 justify-content-center">
                <Col md={6} lg={4}>
                    <Link to="/uploadDataset" style={{ textDecoration: "none" }}>
                        <Card className="dash-card h-100">
                            <CardBody className="d-flex flex-column align-items-center justify-content-center p-5">
                                <div style={iconStyle} className="iconContainer mb-2">
                                    <FaUpload size={50} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h3" style={{ color: theme.textColorAlt }} className="text-center">
                                    Upload Dataset
                                </CardTitle>
                                <p style={{ color: theme.textColorAlt, textAlign: "center" }} className="mt-2">
                                    Upload CSV files containing subsidy-related data
                                </p>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>

                <Col md={6} lg={4}>
                    <Link to="/dataCreator" style={{ textDecoration: "none" }}>
                        <Card className="dash-card h-100">
                            <CardBody className="d-flex flex-column align-items-center justify-content-center p-5">
                                <div style={iconStyle} className="iconContainer mb-2">
                                    <FaFlask size={50} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h3" style={{ color: theme.textColorAlt }} className="text-center">
                                    Synthetic Builder
                                </CardTitle>
                                <p style={{ color: theme.textColorAlt, textAlign: "center" }} className="mt-2">
                                    Build and generate synthetic subsidy datasets
                                </p>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>

                <Col md={6} lg={4}>
                    <Link to="/manageDatasets" style={{ textDecoration: "none" }}>
                        <Card className="dash-card h-100">
                            <CardBody className="d-flex flex-column align-items-center justify-content-center p-5">
                                <div style={iconStyle} className="iconContainer mb-2">
                                    <FaDatabase size={50} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h3" style={{ color: theme.textColorAlt }} className="text-center">
                                    Manage Datasets
                                </CardTitle>
                                <p style={{ color: theme.textColorAlt, textAlign: "center" }} className="mt-2">
                                    View, edit, and delete uploaded datasets
                                </p>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>

                <Col md={6} lg={4}>
                    <Link to="/retrainModels" style={{ textDecoration: "none" }}>
                        <Card className="dash-card h-100">
                            <CardBody className="d-flex flex-column align-items-center justify-content-center p-5">
                                <div style={iconStyle} className="iconContainer mb-2">
                                    <FaSyncAlt size={50} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h3" style={{ color: theme.textColorAlt }} className="text-center">
                                    Retrain Models
                                </CardTitle>
                                <p style={{ color: theme.textColorAlt, textAlign: "center" }} className="mt-2">
                                    Retrain eligibility and fraud models from the latest synthetic dataset
                                </p>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>
                <Col md={6} lg={4}>
                    <Link to="/eanaltics" style={{ textDecoration: "none" }}>
                        <Card className="dash-card h-100">
                            <CardBody className="d-flex flex-column align-items-center justify-content-center p-5">
                                <div style={iconStyle} className="iconContainer mb-2">
                                    <FaChartLine size={50} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h3" style={{ color: theme.textColorAlt }} className="text-center">
                                    View analytics
                                </CardTitle>
                                <p style={{ color: theme.textColorAlt, textAlign: "center" }} className="mt-2">
                                    View, edit, and delete analytics
                                </p>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>
                <Col md={6} lg={4}>
                    <Link to="/eligibilityInfo" style={{ textDecoration: "none" }}>
                        <Card className="dash-card h-100">
                            <CardBody className="d-flex flex-column align-items-center justify-content-center p-5">
                                <div style={iconStyle} className="iconContainer mb-2">
                                    <FaScroll size={50} color={theme.textColorAlt} />
                                </div>
                                <CardTitle tag="h3" style={{ color: theme.textColorAlt }} className="text-center">
                                    View Eligibility and Fraud Cases
                                </CardTitle>
                                <p style={{ color: theme.textColorAlt, textAlign: "center" }} className="mt-2">
                                    View Individual Eligibility and Fraud cases
                                </p>
                            </CardBody>
                        </Card>
                    </Link>
                </Col>
            </Row>
        </Container >
    );
}
