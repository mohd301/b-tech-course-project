import { useState } from "react";
import { Container, Card, CardBody, CardTitle, Form, FormGroup, Label, Input, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "../compsMisc/ThemeContext";
import { uploadDatasetThunk } from "../slices/SlicePriv";
import { FaUpload, FaFileCsv } from "react-icons/fa";
import CenteredSpinner from "../compsMisc/CenteredSpinner";
import Logout from "../compsMisc/Logout";

export default function UploadDataset() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.priv.loading);

    const [selectedFile, setSelectedFile] = useState(null);
    const [description, setDescription] = useState("");
    const [uploadInfo, setUploadInfo] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        validateAndSetFile(file);
    };

    const validateAndSetFile = (file) => {
        if (!file) return;

        if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
            toast.error("Please select a CSV file");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        setSelectedFile(file);
        setUploadInfo(null);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error("Please select a file to upload");
            return;
        }

        const formData = new FormData();
        formData.append("dataset", selectedFile);
        formData.append("description", description);

        try {
            const result = await dispatch(uploadDatasetThunk(formData)).unwrap();
            toast.success("Dataset uploaded successfully");
            setUploadInfo(result.data);
            setSelectedFile(null);
            setDescription("");
            document.getElementById("datasetFile").value = "";
        } catch (err) {
            toast.error(err || "Failed to upload dataset");
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const cardStyle = {
        backgroundColor: theme.altBackground,
        borderRadius: "12px",
        boxShadow: "4px 4px 8px var(--shadowColor)"
    };

    const dropZoneStyle = {
        border: `2px dashed ${dragActive ? theme.primaryColor : theme.tertiaryColor}`,
        borderRadius: "12px",
        padding: "40px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        backgroundColor: dragActive ? "rgba(102, 187, 106, 0.1)" : "transparent"
    };

    const buttonStyle = {
        backgroundColor: theme.primaryColor,
        border: "none",
        borderRadius: "8px",
        padding: "12px 24px"
    };

    return (
        <Container className="py-4" style={{ minHeight: "80vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: theme.textColorAlt }}>Upload Dataset</h2>
                <Logout />
            </div>

            <Container className="d-flex justify-content-center">
                <Card style={{ ...cardStyle, maxWidth: "700px", width: "100%" }}>
                    <CardBody className="p-4">
                        <CardTitle tag="h4" className="mb-4" style={{ color: theme.textColorAlt }}>
                            <FaFileCsv className="me-2" />
                            Upload CSV Dataset
                        </CardTitle>

                        {loading ? (
                            <CenteredSpinner color={theme.primaryColor} />
                        ) : (
                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label for="datasetFile" style={{ color: theme.textColorAlt }}>
                                        Select CSV File
                                    </Label>
                                    <div
                                        style={dropZoneStyle}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById("datasetFile").click()}
                                    >
                                        <FaUpload size={40} color={theme.primaryColor} className="mb-3" />
                                        <p style={{ color: theme.textColorAlt, marginBottom: "8px" }}>
                                            {selectedFile ? selectedFile.name : "Drag & drop a CSV file here, or click to select"}
                                        </p>
                                        {selectedFile && (
                                            <p style={{ color: theme.tertiaryColor, fontSize: "0.9rem" }}>
                                                Size: {formatFileSize(selectedFile.size)}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        type="file"
                                        id="datasetFile"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label for="description" style={{ color: theme.textColorAlt }}>
                                        Description (Optional)
                                    </Label>
                                    <Input
                                        type="textarea"
                                        id="description"
                                        rows="3"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter a description for this dataset..."
                                        style={{
                                            backgroundColor: theme.altBackground,
                                            color: theme.textColorAlt,
                                            border: `1px solid ${theme.tertiaryColor}`
                                        }}
                                    />
                                </FormGroup>

                                <Button
                                    type="submit"
                                    className="mainButton w-100"
                                    style={buttonStyle}
                                    disabled={!selectedFile || loading}
                                >
                                    <FaUpload className="me-2" />
                                    Upload Dataset
                                </Button>
                            </Form>
                        )}

                        {uploadInfo && (
                            <div className="mt-4 p-3" style={{
                                backgroundColor: "rgba(102, 187, 106, 0.1)",
                                borderRadius: "8px",
                                border: `1px solid ${theme.primaryColor}`
                            }}>
                                <h5 style={{ color: theme.textColorAlt }}>Upload Successful!</h5>
                                <p style={{ color: theme.textColorAlt, marginBottom: "4px" }}>
                                    <strong>Rows:</strong> {uploadInfo.rowCount}
                                </p>
                                <p style={{ color: theme.textColorAlt, marginBottom: "4px" }}>
                                    <strong>Columns:</strong> {uploadInfo.columnCount}
                                </p>
                                <p style={{ color: theme.textColorAlt, marginBottom: "0" }}>
                                    <strong>Column Names:</strong> {uploadInfo.columns?.join(", ")}
                                </p>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </Container>
        </Container>
    );
}
