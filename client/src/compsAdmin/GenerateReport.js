import { useEffect, useMemo, useState } from "react";
import { Container, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Row, Col, Table } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "../compsMisc/ThemeContext";
import { fetchDatasetsThunk, fetchDatasetStatsThunk, fetchDatasetThunk, fetchELInfoThunk } from "../slices/SlicePriv";
import { FaFilePdf, FaChartBar, FaDatabase, FaClipboardList, FaExclamationTriangle } from "react-icons/fa";
import CenteredSpinner from "../compsMisc/CenteredSpinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DATE_PRESETS = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "last7", label: "Last 7 Days" },
    { value: "last30", label: "Last 30 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "thisYear", label: "This Year" }
];

const REGIONS = ["Muscat", "Dhofar", "Sur", "Nizwa", "Sohar"];

const STATUS_OPTIONS = [
    { value: "all", label: "All" },
    { value: "eligible", label: "Eligible" },
    { value: "not_eligible", label: "Not Eligible" },
    { value: "needs_review", label: "Needs Review" }
];

const STATUS_LABELS = STATUS_OPTIONS.reduce((labels, option) => {
    labels[option.value] = option.label;
    return labels;
}, {});

export default function GenerateReport() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const datasets = useSelector((state) => state.priv.datasetList || []);
    const stats = useSelector((state) => state.priv.datasetStats);
    const eligibilityRecords = useSelector((state) => state.priv.elInfo || []);
    const loading = useSelector((state) => state.priv.loading);

    const [reportType, setReportType] = useState("application");
    const [selectedDatasetId, setSelectedDatasetId] = useState("");
    const [datePreset, setDatePreset] = useState("all");
    const [region, setRegion] = useState("all");
    const [status, setStatus] = useState("all");

    const isDatasetReport = reportType === "datasetSummary" || reportType === "singleDataset";
    const isApplicationReport = reportType === "application" || reportType === "fraud";
    const effectiveStatus = reportType === "fraud" ? "needs_review" : status;

    const datasetFilters = useMemo(() => ({ datePreset }), [datePreset]);
    const applicationFilters = useMemo(() => ({
        datePreset,
        region,
        status: effectiveStatus
    }), [datePreset, region, effectiveStatus]);

    useEffect(() => {
        if (isDatasetReport) {
            dispatch(fetchDatasetsThunk(datasetFilters));
            dispatch(fetchDatasetStatsThunk(datasetFilters));
        } else {
            dispatch(fetchELInfoThunk(applicationFilters));
        }
    }, [dispatch, isDatasetReport, datasetFilters, applicationFilters]);

    useEffect(() => {
        if (reportType === "singleDataset" && selectedDatasetId && !datasets.some((dataset) => dataset._id === selectedDatasetId)) {
            setSelectedDatasetId("");
        }
    }, [datasets, reportType, selectedDatasetId]);

    const formatFileSize = (bytes = 0) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getDatePresetLabel = () => DATE_PRESETS.find((preset) => preset.value === datePreset)?.label || "All Time";

    const getApplicationStatus = (record) => {
        if (record.Fraud === 1) return "Needs Review";
        if (record.Eligibility === 1) return "Eligible";
        if (record.Eligibility === 0) return "Not Eligible";
        return "Unknown";
    };

    const applicationSummary = useMemo(() => {
        return eligibilityRecords.reduce((summary, record) => {
            const recordStatus = getApplicationStatus(record);
            summary.total += 1;

            if (recordStatus === "Eligible") summary.eligible += 1;
            if (recordStatus === "Not Eligible") summary.notEligible += 1;
            if (recordStatus === "Needs Review") summary.needsReview += 1;

            return summary;
        }, { total: 0, eligible: 0, notEligible: 0, needsReview: 0 });
    }, [eligibilityRecords]);

    const reportTitle = {
        application: "Application Eligibility Report",
        fraud: "Fraud Case Report",
        datasetSummary: "Dataset Summary Report",
        singleDataset: "Single Dataset Report"
    }[reportType];

    const activeFilters = [
        `Date: ${getDatePresetLabel()}`,
        ...(isApplicationReport ? [`Region: ${region === "all" ? "All" : region}`] : []),
        ...(isApplicationReport ? [`Status: ${STATUS_LABELS[effectiveStatus] || "All"}`] : [])
    ];

    const resetFilters = () => {
        setDatePreset("all");
        setRegion("all");
        setStatus(reportType === "fraud" ? "needs_review" : "all");
    };

    const handleReportTypeChange = (event) => {
        const nextReportType = event.target.value;
        setReportType(nextReportType);

        if (nextReportType === "fraud") {
            setStatus("needs_review");
        } else if (reportType === "fraud") {
            setStatus("all");
        }
    };

    const addPdfHeader = (doc, title) => {
        doc.setFontSize(18);
        doc.text(title, 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Generated: ${formatDate(new Date())}`, 105, 28, { align: "center" });
        doc.text(activeFilters.join(" | "), 105, 36, { align: "center" });
    };

    const generateApplicationReport = () => {
        const doc = new jsPDF();
        addPdfHeader(doc, reportTitle);

        doc.setFontSize(11);
        doc.text(`Total Applications: ${applicationSummary.total}`, 14, 50);
        doc.text(`Eligible: ${applicationSummary.eligible}`, 14, 58);
        doc.text(`Not Eligible: ${applicationSummary.notEligible}`, 14, 66);
        doc.text(`Needs Review: ${applicationSummary.needsReview}`, 14, 74);

        const tableData = eligibilityRecords.map((record, index) => [
            index + 1,
            record.Email || "-",
            record.Phone || "-",
            record.Gove || "-",
            getApplicationStatus(record),
            formatDate(record.createdAt)
        ]);

        autoTable(doc, {
            startY: 84,
            head: [["#", "Email", "Phone", "Region", "Status", "Date"]],
            body: tableData,
            headStyles: { fillColor: [102, 187, 106] },
            styles: { fontSize: 8 }
        });

        doc.save(`${reportType}-report-${Date.now()}.pdf`);
        toast.success("Report generated!");
    };

    const generateDatasetSummaryReport = () => {
        const doc = new jsPDF();
        addPdfHeader(doc, "Dataset Summary Report");

        doc.setFontSize(11);
        doc.text(`Total Datasets: ${stats?.totalDatasets || datasets.length}`, 14, 50);
        doc.text(`Total Rows: ${stats?.totalRows || 0}`, 14, 58);
        doc.text(`Total Storage: ${formatFileSize(stats?.totalSize || 0)}`, 14, 66);

        const tableData = datasets.map((dataset, index) => [
            index + 1,
            dataset.originalName,
            dataset.uploadedBy,
            dataset.rowCount,
            dataset.columnCount,
            formatFileSize(dataset.fileSize),
            formatDate(dataset.createdAt)
        ]);

        autoTable(doc, {
            startY: 76,
            head: [["#", "File Name", "Uploaded By", "Rows", "Cols", "Size", "Date"]],
            body: tableData,
            headStyles: { fillColor: [102, 187, 106] },
            styles: { fontSize: 8 }
        });

        doc.save(`dataset-report-${Date.now()}.pdf`);
        toast.success("Report generated!");
    };

    const generateSingleDatasetReport = async () => {
        if (!selectedDatasetId) {
            toast.error("Please select a dataset");
            return;
        }

        try {
            const result = await dispatch(fetchDatasetThunk(selectedDatasetId)).unwrap();
            const dataset = result.data;
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text(`Dataset Report: ${dataset.originalName}`, 105, 20, { align: "center" });
            doc.setFontSize(10);
            doc.text(`Generated: ${formatDate(new Date())}`, 105, 28, { align: "center" });
            doc.text(`Date: ${getDatePresetLabel()}`, 105, 36, { align: "center" });

            doc.setFontSize(11);
            doc.text(`File Name: ${dataset.originalName}`, 14, 50);
            doc.text(`Uploaded By: ${dataset.uploadedBy}`, 14, 58);
            doc.text(`Size: ${formatFileSize(dataset.fileSize)}`, 14, 66);
            doc.text(`Rows: ${dataset.rowCount} | Columns: ${dataset.columnCount}`, 14, 74);
            doc.text(`Date: ${formatDate(dataset.createdAt)}`, 14, 82);

            if (dataset.description) {
                doc.text(`Description: ${dataset.description}`, 14, 90);
            }

            const startY = dataset.description ? 105 : 96;
            doc.text("Columns:", 14, startY);
            dataset.columns.forEach((column, index) => {
                doc.text(`${index + 1}. ${column}`, 14, startY + 8 + (index * 6));
            });

            doc.save(`dataset-${dataset.originalName.replace(".csv", "")}.pdf`);
            toast.success("Report generated!");
        } catch (err) {
            toast.error("Failed to generate report");
        }
    };

    const handleGenerateReport = async () => {
        if (reportType === "application" || reportType === "fraud") {
            generateApplicationReport();
        } else if (reportType === "datasetSummary") {
            generateDatasetSummaryReport();
        } else {
            await generateSingleDatasetReport();
        }
    };

    const cardStyle = {
        backgroundColor: theme.altBackground,
        borderRadius: "8px",
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
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "2px 2px 6px var(--shadowColor)",
        height: "100%"
    };

    const inputStyle = {
        backgroundColor: theme.altBackground,
        color: theme.textColorAlt,
        border: `1px solid ${theme.textColorAlt}`
    };

    const statLabelStyle = {
        color: theme.textColorAlt,
        opacity: 0.85,
        marginBottom: 0
    };

    const renderStatCards = () => {
        if (isDatasetReport) {
            return (
                <Row className="mb-4">
                    <Col md={4} className="mb-3">
                        <div style={statCardStyle}>
                            <FaDatabase size={30} color={theme.primaryColor} />
                            <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>{stats?.totalDatasets || datasets.length}</h3>
                            <p style={statLabelStyle}>Total Datasets</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div style={statCardStyle}>
                            <FaChartBar size={30} color={theme.primaryColor} />
                            <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>{stats?.totalRows || 0}</h3>
                            <p style={statLabelStyle}>Total Rows</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div style={statCardStyle}>
                            <FaFilePdf size={30} color={theme.primaryColor} />
                            <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>{formatFileSize(stats?.totalSize || 0)}</h3>
                            <p style={statLabelStyle}>Total Storage</p>
                        </div>
                    </Col>
                </Row>
            );
        }

        return (
            <Row className="mb-4">
                <Col md={3} sm={6} className="mb-3">
                    <div style={statCardStyle}>
                        <FaClipboardList size={30} color={theme.primaryColor} />
                        <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>{applicationSummary.total}</h3>
                        <p style={statLabelStyle}>Applications</p>
                    </div>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <div style={statCardStyle}>
                        <FaChartBar size={30} color={theme.primaryColor} />
                        <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>{applicationSummary.eligible}</h3>
                        <p style={statLabelStyle}>Eligible</p>
                    </div>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <div style={statCardStyle}>
                        <FaChartBar size={30} color={theme.secondaryColor} />
                        <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>{applicationSummary.notEligible}</h3>
                        <p style={statLabelStyle}>Not Eligible</p>
                    </div>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <div style={statCardStyle}>
                        <FaExclamationTriangle size={30} color={theme.sus || theme.secondaryColor} />
                        <h3 style={{ color: theme.textColorAlt, marginTop: "10px" }}>{applicationSummary.needsReview}</h3>
                        <p style={statLabelStyle}>Needs Review</p>
                    </div>
                </Col>
            </Row>
        );
    };

    const renderPreview = () => {
        if (isDatasetReport) {
            return (
                <Card style={cardStyle} className="mt-4">
                    <CardBody>
                        <CardTitle tag="h5" style={{ color: theme.textColorAlt }}>Filtered Dataset Preview</CardTitle>
                        <div className="table-wrapper-audit">
                            <Table className="user-table" responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>File Name</th>
                                        <th>Uploaded By</th>
                                        <th>Rows</th>
                                        <th>Cols</th>
                                        <th>Size</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datasets.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">No datasets match the selected filters</td>
                                        </tr>
                                    ) : datasets.slice(0, 10).map((dataset, index) => (
                                        <tr key={dataset._id}>
                                            <td>{index + 1}</td>
                                            <td>{dataset.originalName}</td>
                                            <td>{dataset.uploadedBy}</td>
                                            <td>{dataset.rowCount}</td>
                                            <td>{dataset.columnCount}</td>
                                            <td>{formatFileSize(dataset.fileSize)}</td>
                                            <td>{formatDate(dataset.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </CardBody>
                </Card>
            );
        }

        return (
            <Card style={cardStyle} className="mt-4">
                <CardBody>
                    <CardTitle tag="h5" style={{ color: theme.textColorAlt }}>Filtered Application Preview</CardTitle>
                    <div className="table-wrapper-audit">
                        <Table className="user-table" responsive>
                            <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Region</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                            <tbody>
                                {eligibilityRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No applications match the selected filters</td>
                                    </tr>
                                ) : eligibilityRecords.slice(0, 10).map((record, index) => (
                                    <tr key={record._id}>
                                        <td>{index + 1}</td>
                                        <td>{record.Email || "-"}</td>
                                        <td>{record.Phone || "-"}</td>
                                        <td>{record.Gove || "-"}</td>
                                        <td>{getApplicationStatus(record)}</td>
                                        <td>{formatDate(record.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>
        );
    };

    return (
        <Container className="py-4" style={{ minHeight: "80vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: theme.textColorAlt }}>Generate Reports</h2>
            </div>

            {renderStatCards()}

            <Card style={{ ...cardStyle, maxWidth: "760px", margin: "0 auto" }}>
                <CardBody className="p-4">
                    <CardTitle tag="h4" className="mb-3" style={{ color: theme.textColorAlt }}>
                        <FaFilePdf className="me-2" />Generate PDF Report
                    </CardTitle>

                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="reportType" style={{ color: theme.textColorAlt }}>Report Type</Label>
                                <Input type="select" id="reportType" value={reportType} onChange={handleReportTypeChange} style={inputStyle}>
                                    <option value="application">Application Eligibility Report</option>
                                    <option value="fraud">Fraud Case Report</option>
                                    <option value="datasetSummary">Dataset Summary Report</option>
                                    <option value="singleDataset">Single Dataset Report</option>
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="datePreset" style={{ color: theme.textColorAlt }}>Date</Label>
                                <Input type="select" id="datePreset" value={datePreset} onChange={(e) => setDatePreset(e.target.value)} style={inputStyle}>
                                    {DATE_PRESETS.map((preset) => (
                                        <option key={preset.value} value={preset.value}>{preset.label}</option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>

                    {isApplicationReport && (
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="region" style={{ color: theme.textColorAlt }}>Region</Label>
                                    <Input type="select" id="region" value={region} onChange={(e) => setRegion(e.target.value)} style={inputStyle}>
                                        <option value="all">All</option>
                                        {REGIONS.map((regionName) => (
                                            <option key={regionName} value={regionName}>{regionName}</option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="status" style={{ color: theme.textColorAlt }}>Application Status</Label>
                                    <Input
                                        type="select"
                                        id="status"
                                        value={effectiveStatus}
                                        onChange={(e) => setStatus(e.target.value)}
                                        style={inputStyle}
                                        disabled={reportType === "fraud"}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                    )}

                    {reportType === "singleDataset" && (
                        <FormGroup>
                            <Label for="datasetSelect" style={{ color: theme.textColorAlt }}>Select Dataset</Label>
                            <Input type="select" id="datasetSelect" value={selectedDatasetId} onChange={(e) => setSelectedDatasetId(e.target.value)} style={inputStyle}>
                                <option value="">-- Select a dataset --</option>
                                {datasets.map((dataset) => (
                                    <option key={dataset._id} value={dataset._id}>{dataset.originalName}</option>
                                ))}
                            </Input>
                        </FormGroup>
                    )}

                    <div className="d-flex flex-wrap gap-2 mt-3">
                        <Button className="mainButton flex-grow-1" style={buttonStyle} onClick={handleGenerateReport} disabled={loading || (reportType === "singleDataset" && !selectedDatasetId)}>
                            <FaFilePdf className="me-2" />
                            Generate PDF Report
                        </Button>
                        <Button color="secondary" onClick={resetFilters}>
                            Reset Filters
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {loading ? (
                <div className="py-4">
                    <CenteredSpinner color={theme.primaryColor} />
                </div>
            ) : renderPreview()}
        </Container>
    );
}
