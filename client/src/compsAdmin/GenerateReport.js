import { useEffect, useState } from "react";
import { Container, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "../compsMisc/ThemeContext";
import { fetchDatasetsThunk, fetchDatasetStatsThunk, fetchDatasetThunk } from "../slices/SlicePriv";
import { FaFilePdf, FaChartBar, FaDatabase } from "react-icons/fa";
import CenteredSpinner from "../compsMisc/CenteredSpinner";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function GenerateReport() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const datasets = useSelector((state) => state.priv.datasetList);
    const stats = useSelector((state) => state.priv.datasetStats);
    const loading = useSelector((state) => state.priv.loading);

    const [reportType, setReportType] = useState("summary");
    const [selectedDatasetId, setSelectedDatasetId] = useState("");

    useEffect(() => {
        dispatch(fetchDatasetsThunk());
        dispatch(fetchDatasetStatsThunk());
    }, [dispatch]);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const generateSummaryReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Dataset Summary Report", 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Generated: ${formatDate(new Date())}`, 105, 28, { align: "center" });

        doc.setFontSize(11);
        doc.text(`Total Datasets: ${stats?.totalDatasets || datasets.length}`, 14, 45);
        doc.text(`Total Rows: ${stats?.totalRows || 0}`, 14, 53);
        doc.text(`Total Storage: ${formatFileSize(stats?.totalSize || 0)}`, 14, 61);

        const tableData = datasets.map((d, i) => [
            i + 1, d.originalName, d.uploadedBy, d.rowCount, d.columnCount,
            formatFileSize(d.fileSize), new Date(d.createdAt).toLocaleDateString()
        ]);

        doc.autoTable({
            startY: 70,
            head: [["#", "File Name", "Uploaded By", "Rows", "Cols", "Size", "Date"]],
            body: tableData,
            headStyles: { fillColor: [102, 187, 106] }
        });

        doc.save(`dataset-report-${Date.now()}.pdf`);
        toast.success("Report generated!");
    };

    const generateDatasetReport = async () => {
        if (!selectedDatasetId) {
            toast.error("Please select a dataset");
            return;
        }

        try {
            const result = await dispatch(fetchDatasetThunk(selectedDatasetId)).unwrap();
            const dataset = result.data;

            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.text(`Dataset Report: ${dataset.originalName}`, 105, 20, { align: "center" });
            doc.setFontSize(10);
            doc.text(`Generated: ${formatDate(new Date())}`, 105, 28, { align: "center" });

            // Info
            doc.setFontSize(11);
            doc.text(`File Name: ${dataset.originalName}`, 14, 45);
            doc.text(`Uploaded By: ${dataset.uploadedBy}`, 14, 53);
            doc.text(`Size: ${formatFileSize(dataset.fileSize)}`, 14, 61);
            doc.text(`Rows: ${dataset.rowCount} | Columns: ${dataset.columnCount}`, 14, 69);
            doc.text(`Date: ${formatDate(dataset.createdAt)}`, 14, 77);

            if (dataset.description) {
                doc.text(`Description: ${dataset.description}`, 14, 85);
            }

            // Columns
            doc.text("Columns:", 14, dataset.description ? 100 : 90);
            dataset.columns.forEach((col, i) => {
                doc.text(`${i + 1}. ${col}`, 14, (dataset.description ? 108 : 98) + (i * 6));
            });

            doc.save(`dataset-${dataset.originalName.replace(".csv", "")}.pdf`);
            toast.success("Report generated!");
        } catch (err) {
            toast.error("Failed to generate report");
        }
    };

    const handleGenerateReport = async () => {
        if (reportType === "summary") {
            generateSummaryReport();
        } else {
            await generateDatasetReport();
        }
    };

    const cardStyle = {
        backgroundColor: theme.altBackground,
        borderRadius: "12px",
        boxShadow: "4px 4px 8px var(--shadowColor)"
    };

    const buttonStyle = {
        backgroundColor: theme.primaryColor,
        border: "none",
        borderRadius: "8px",
        padding: "12px 24px"
    };

    const statCardStyle = {
        backgroundColor: theme.altBackground,
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "2px 2px 6px var(--shadowColor)"
    };

    return (
        <Container className="py-4" style={{ minHeight: "80vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: theme.textColorAlt }}>Generate Reports</h2>
            </div>

            {loading ? (
                <CenteredSpinner color={theme.primaryColor} />
            ) : (
                <>
                    <Row className="mb-4">
                        <Col md={4} className="mb-3">
                            <div style={statCardStyle}>
                                <FaDatabase size={30} color={theme.primaryColor} />
                                <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>
                                    {stats?.totalDatasets || datasets.length}
                                </h3>
                                <p style={{ color: theme.tertiaryColor, marginBottom: 0 }}>Total Datasets</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div style={statCardStyle}>
                                <FaChartBar size={30} color={theme.primaryColor} />
                                <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>
                                    {stats?.totalRows || 0}
                                </h3>
                                <p style={{ color: theme.tertiaryColor, marginBottom: 0 }}>Total Rows</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div style={statCardStyle}>
                                <FaFilePdf size={30} color={theme.primaryColor} />
                                <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>
                                    {formatFileSize(stats?.totalSize || 0)}
                                </h3>
                                <p style={{ color: theme.tertiaryColor, marginBottom: 0 }}>Total Storage</p>
                            </div>
                        </Col>
                    </Row>

                    <Card style={{ ...cardStyle, maxWidth: "500px", margin: "0 auto" }}>
                        <CardBody className="p-4">
                            <CardTitle tag="h4" className="mb-3" style={{ color: theme.textColorAlt }}>
                                <FaFilePdf className="me-2" />Generate PDF Report
                            </CardTitle>

                                <FormGroup>
                                    <Label for="reportType" style={{ color: theme.textColorAlt }}>
                                        Report Type
                                    </Label>
                                    <Input
                                        type="select"
                                        id="reportType"
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        style={{
                                            backgroundColor: theme.altBackground,
                                            color: theme.textColorAlt,
                                            border: `1px solid ${theme.tertiaryColor}`
                                        }}
                                    >
                                        <option value="summary">Summary Report (All Datasets)</option>
                                        <option value="single">Single Dataset Report</option>
                                    </Input>
                                </FormGroup>

                                {reportType === "single" && (
                                    <FormGroup>
                                        <Label for="datasetSelect" style={{ color: theme.textColorAlt }}>
                                            Select Dataset
                                        </Label>
                                        <Input
                                            type="select"
                                            id="datasetSelect"
                                            value={selectedDatasetId}
                                            onChange={(e) => setSelectedDatasetId(e.target.value)}
                                            style={{
                                                backgroundColor: theme.altBackground,
                                                color: theme.textColorAlt,
                                                border: `1px solid ${theme.tertiaryColor}`
                                            }}
                                        >
                                            <option value="">-- Select a dataset --</option>
                                            {datasets.map((dataset) => (
                                                <option key={dataset._id} value={dataset._id}>
                                                    {dataset.originalName}
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                )}

                                <Button
                                    className="mainButton w-100 mt-3"
                                    style={buttonStyle}
                                    onClick={handleGenerateReport}
                                    disabled={loading || (reportType === "single" && !selectedDatasetId)}
                                >
                                    <FaFilePdf className="me-2" />
                                    Generate PDF Report
                                </Button>
                            </CardBody>
                        </Card>
                </>
            )}
        </Container>
    );
}
