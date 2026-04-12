import { useEffect, useState } from "react";
import { Container, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "../compsMisc/ThemeContext";
import { fetchDatasetsThunk, deleteDatasetThunk, updateDatasetThunk, fetchDatasetThunk } from "../slices/SlicePriv";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import CenteredSpinner from "../compsMisc/CenteredSpinner";
import { getUserType } from "../functions/getUserType";

export default function ManageDatasets() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const datasets = useSelector((state) => state.priv.datasetList);
    const loading = useSelector((state) => state.priv.loading);
    const userType = getUserType(); // "Admin" or "Regulator"
    const canManage = userType === "Regulator"; // Only Regulator can edit/delete

    const [deleteModal, setDeleteModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [description, setDescription] = useState("");
    const [viewContent, setViewContent] = useState("");

    useEffect(() => {
        dispatch(fetchDatasetsThunk());
    }, [dispatch]);

    const toggleDeleteModal = (dataset = null) => {
        setSelectedDataset(dataset);
        setDeleteModal(!deleteModal);
    };

    const toggleEditModal = (dataset = null) => {
        setSelectedDataset(dataset);
        setDescription(dataset?.description || "");
        setEditModal(!editModal);
    };

    const toggleViewModal = async (dataset = null) => {
        if (dataset) {
            try {
                const result = await dispatch(fetchDatasetThunk(dataset._id)).unwrap();
                setViewContent(result.data.content);
                setSelectedDataset(dataset);
            } catch (err) {
                toast.error("Failed to load dataset content");
                return;
            }
        } else {
            setViewContent("");
            setSelectedDataset(null);
        }
        setViewModal(!viewModal);
    };

    const handleDelete = async () => {
        if (selectedDataset) {
            try {
                await dispatch(deleteDatasetThunk(selectedDataset._id)).unwrap();
                toast.success("Dataset deleted successfully");
                dispatch(fetchDatasetsThunk());
            } catch (err) {
                toast.error("Failed to delete dataset");
            }
            toggleDeleteModal();
        }
    };

    const handleUpdate = async () => {
        if (selectedDataset) {
            try {
                await dispatch(updateDatasetThunk({ _id: selectedDataset._id, description })).unwrap();
                toast.success("Dataset updated successfully");
                dispatch(fetchDatasetsThunk());
            } catch (err) {
                toast.error("Failed to update dataset");
            }
            toggleEditModal();
        }
    };

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
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const btnDeleteStyle = {
        backgroundColor: theme.secondaryColor,
        border: "none",
        borderRadius: "4px"
    };

    const btnEditStyle = {
        backgroundColor: theme.primaryColor,
        border: "none",
        borderRadius: "4px"
    };

    const btnViewStyle = {
        backgroundColor: theme.textColorBlack,
        border: "none",
        borderRadius: "4px",
        color: "#fff"
    };

    return (
        <Container className="py-4" style={{ minHeight: "80vh" }}>
            <Container className="d-flex justify-content-center align-items-center">
                <Container style={{ height: "100%" }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 style={{ color: theme.textColorAlt }}>
                            {canManage ? "Manage Datasets" : "View Datasets"}
                        </h2>
                    </div>

                    {loading ? (
                        <CenteredSpinner color={theme.primaryColor} />
                    ) : (
                        <div className="table-wrapper">
                            <Table className="user-table" responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>File Name</th>
                                        <th>Uploaded By</th>
                                        <th>Size</th>
                                        <th>Rows</th>
                                        <th>Columns</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datasets && datasets.length > 0 ? (
                                        datasets.map((dataset, index) => (
                                            <tr key={dataset._id}>
                                                <td>{index + 1}</td>
                                                <td>{dataset.originalName}</td>
                                                <td>{dataset.uploadedBy}</td>
                                                <td>{formatFileSize(dataset.fileSize)}</td>
                                                <td>{dataset.rowCount}</td>
                                                <td>{dataset.columnCount}</td>
                                                <td className="nowrap">{formatDate(dataset.createdAt)}</td>
                                                <td>
                                                    <Button
                                                        className="simpleButton"
                                                        style={btnViewStyle}
                                                        size="sm"
                                                        onClick={() => toggleViewModal(dataset)}
                                                    >
                                                        <FaEye /> View
                                                    </Button>

                                                    {canManage && (
                                                        <>
                                                            <Button
                                                                className="simpleButton"
                                                                style={btnEditStyle}
                                                                size="sm"
                                                                onClick={() => toggleEditModal(dataset)}
                                                            >
                                                                <FaEdit /> Edit
                                                            </Button>

                                                            <Button
                                                                className="simpleButton"
                                                                style={btnDeleteStyle}
                                                                size="sm"
                                                                onClick={() => toggleDeleteModal(dataset)}
                                                            >
                                                                <FaTrash /> Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4">
                                                No datasets found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    <Modal isOpen={deleteModal} toggle={() => toggleDeleteModal()} centered>
                        <ModalHeader toggle={() => toggleDeleteModal()}>
                            Confirm Delete
                        </ModalHeader>
                        <ModalBody>
                            Are you sure you want to delete this dataset?
                            {selectedDataset && (
                                <div className="mt-2">
                                    <strong>File:</strong> {selectedDataset.originalName}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button className="simpleButton" style={btnDeleteStyle} onClick={handleDelete}>
                                Delete
                            </Button>
                            <Button color="secondary" onClick={() => toggleDeleteModal()}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </Modal>

                    {/* Edit Modal */}
                    <Modal isOpen={editModal} toggle={() => toggleEditModal()} centered>
                        <ModalHeader toggle={() => toggleEditModal()}>
                            Edit Dataset Description
                        </ModalHeader>
                        <ModalBody>
                            {selectedDataset && (
                                <div>
                                    <p><strong>File:</strong> {selectedDataset.originalName}</p>
                                    <FormGroup>
                                        <Label>Description</Label>
                                        <Input
                                            type="textarea"
                                            rows="4"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter description..."
                                        />
                                    </FormGroup>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button className="simpleButton" style={btnEditStyle} onClick={handleUpdate}>
                                Update
                            </Button>
                            <Button color="secondary" onClick={() => toggleEditModal()}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </Modal>

                    {/* View Modal */}
                    <Modal isOpen={viewModal} toggle={() => toggleViewModal()} centered size="lg">
                        <ModalHeader toggle={() => toggleViewModal()}>
                            Dataset Content: {selectedDataset?.originalName}
                        </ModalHeader>
                        <ModalBody>
                            <div style={{
                                backgroundColor: theme.primaryBackground,
                                padding: "15px",
                                borderRadius: "8px",
                                maxHeight: "400px",
                                overflowY: "auto",
                                fontFamily: "monospace",
                                fontSize: "0.85rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all"
                            }}>
                                {viewContent || "No content available"}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={() => toggleViewModal()}>
                                Close
                            </Button>
                        </ModalFooter>
                    </Modal>

                </Container>
            </Container>
        </Container>
    );
}
