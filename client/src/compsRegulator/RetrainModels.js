import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    Alert,
    Badge,
    Button,
    Card,
    CardBody,
    CardText,
    CardTitle,
    Col,
    Container,
    Row
} from "reactstrap";
import { FaShieldHalved, FaTriangleExclamation } from "react-icons/fa6";
import { useTheme } from "../compsMisc/ThemeContext";

const API_PORT = process.env.REACT_APP_PORT || "7500";

function ResultCard({ title, description, actionLabel, onAction, busy, result, theme, accent }) {
    return (
        <Card
            className="h-100"
            style={{
                backgroundColor: theme.altBackground,
                borderRadius: "16px",
                border: `1px solid ${accent}`,
                boxShadow: "0 10px 26px var(--shadowColor)"
            }}
        >
            <CardBody className="d-flex flex-column">
                <CardTitle tag="h4" style={{ color: theme.textColorAlt }}>
                    {title}
                </CardTitle>
                <CardText style={{ color: theme.textColorAlt }}>
                    {description}
                </CardText>
                <div className="mt-auto">
                    <Button className="mainButton" onClick={onAction} disabled={busy}>
                        {busy ? "Retraining..." : actionLabel}
                    </Button>
                </div>
                {result && (
                    <pre
                        style={{
                            backgroundColor: theme.primaryBackground,
                            color: theme.textColorAlt,
                            borderRadius: "12px",
                            padding: "16px",
                            marginTop: "16px",
                            marginBottom: 0,
                            overflow: "auto",
                            minHeight: "220px",
                            border: `1px solid ${accent}`
                        }}
                    >
                        {JSON.stringify(result, null, 2)}
                    </pre>
                )}
            </CardBody>
        </Card>
    );
}

export default function RetrainModels() {
    const { theme } = useTheme();
    const [eligibilityBusy, setEligibilityBusy] = useState(false);
    const [fraudBusy, setFraudBusy] = useState(false);
    const [eligibilityResult, setEligibilityResult] = useState(null);
    const [fraudResult, setFraudResult] = useState(null);

    const postWithAuth = async (endpoint) => {
        return axios.post(`http://localhost:${API_PORT}/${endpoint}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`
            }
        });
    };

    const runRetrain = async (endpoint, setBusy, setResult, successMessage) => {
        setBusy(true);
        try {
            const response = await postWithAuth(endpoint);
            setResult(response.data);
            toast.success(response.data.serverMsg || successMessage);
        } catch (error) {
            const serverMsg =
                error.response?.data?.serverMsg ||
                error.response?.data?.error ||
                "Retraining failed.";
            setResult(error.response?.data || { serverMsg, flag: false });
            toast.error(serverMsg);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Container className="py-4" style={{ minHeight: "80vh" }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 style={{ color: theme.textColorAlt, marginBottom: "8px" }}>Model Retraining</h2>
                </div>
            </div>

            <Alert className="AlertStyle p-3">
                <span style={{fontSize: "1.2rem"}}>
                Retrain models from the dataset currently marked Active in Manage Datasets. Activate the
                dataset first, then run these actions.
                </span>
            </Alert>

            <Row className="g-4">
                <Col lg="6">
                    <ResultCard
                        title="Eligibility Model"
                        description="Rebuild the eligibility classifier from the active dataset and save the refreshed model."
                        actionLabel="Retrain Eligibility Model"
                        onAction={() => runRetrain("retrainEmodel", setEligibilityBusy, setEligibilityResult, "Eligibility model retrained.")}
                        busy={eligibilityBusy}
                        result={eligibilityResult?.data}
                        theme={theme}
                        accent="rgba(102, 187, 106, 0.25)"
                    />
                </Col>
                <Col lg="6">
                    <ResultCard
                        title="Fraud Model"
                        description="Rebuild the fraud detection model from the active dataset and inspect the preview of detected fraud rows."
                        actionLabel="Retrain Fraud Model"
                        onAction={() => runRetrain("retrainImodel", setFraudBusy, setFraudResult, "Fraud model retrained.")}
                        busy={fraudBusy}
                        result={fraudResult?.data}
                        theme={theme}
                        accent="rgba(255, 167, 38, 0.28)"
                    />
                </Col>
            </Row>

            <Row className="g-4 mt-1">
                <Col lg="6">
                    <Card
                        style={{
                            backgroundColor: theme.altBackground,
                            borderRadius: "16px",
                            border: "1px solid rgba(102, 187, 106, 0.18)"
                        }}
                    >
                        <CardBody>
                            <CardTitle tag="h5" style={{ color: theme.textColorAlt }}>
                                <FaShieldHalved className="me-2" />
                                Eligibility retrain output
                            </CardTitle>
                            <CardText style={{ color: theme.textColorAlt, marginBottom: 0 }}>
                                Get accuracy, confusion matrix, F1 score, and recall to check the refreshed classifier.
                            </CardText>
                        </CardBody>
                    </Card>
                </Col>
                <Col lg="6">
                    <Card
                        style={{
                            backgroundColor: theme.altBackground,
                            borderRadius: "16px",
                            border: "1px solid rgba(255, 167, 38, 0.18)"
                        }}
                    >
                        <CardBody>
                            <CardTitle tag="h5" style={{ color: theme.textColorAlt }}>
                                <FaTriangleExclamation className="me-2" />
                                Fraud retrain output
                            </CardTitle>
                            <CardText style={{ color: theme.textColorAlt, marginBottom: 0 }}>
                                Returns a small preview of flagged rows from the newly processed active dataset.
                            </CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
