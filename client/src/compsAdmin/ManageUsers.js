import { useEffect, useState } from "react";
import { Container, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "../compsMisc/ThemeContext";
import { fetchUsersThunk, deleteUserThunk, updateUserThunk } from "../slices/SlicePriv";
import { FaTrash, FaEdit } from "react-icons/fa";
import CenteredSpinner from "../compsMisc/CentredSpinner";

export default function ManageUsers() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const users = useSelector((state) => state.priv.userList);
    const loading = useSelector((state) => state.priv.loading);
    
    const [deleteModal, setDeleteModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState({});

    // Seperate useEffect to preload values when modal opens
    useEffect(() => {
        if (selectedUser) {
            setFormData(
                // create a new object from the selectedUser, excluding _id and Password
                Object.fromEntries(
                    Object.entries(selectedUser).filter(([key]) => key !== "_id" && key !== "Password")
                )
            );
        }
    }, [selectedUser]);

    // Dynamically Handle form input changes
    const handleChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value // take the previous values and append the new value for the changed key
        }));
    };

    useEffect(() => {
        dispatch(fetchUsersThunk());
    }, [dispatch]);

    const toggleDeleteModal = (user = null) => {
        setSelectedUser(user);
        setDeleteModal(!deleteModal);
    };

    const toggleEditModal = (user = null) => {
        setSelectedUser(user);
        setEditModal(!editModal);
    };

    const handleDelete = async () => {
        if (selectedUser) {
            try {
                await dispatch(deleteUserThunk(selectedUser._id)).unwrap();
                toast.success("User deleted successfully");
                dispatch(fetchUsersThunk());
            } catch (err) {
                toast.error("Failed to delete user");
            }
            toggleDeleteModal();
        }
    };

    const handleUpdate = async () => {
        if (selectedUser) {
            try {
                await dispatch(updateUserThunk({ ...formData, _id: selectedUser._id })).unwrap();
                toast.success("User updated successfully");
                dispatch(fetchUsersThunk());
            } catch (err) {
                toast.error("Failed to update user");
            }
            toggleEditModal();
        }
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

    return (
        <Container className="py-4" style={{ minHeight: "80vh" }}>
            <Container className="d-flex justify-content-center align-items-center">
                <Container style={{ height: "100%" }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 style={{ color: theme.textColorAlt }}>Manage Users</h2>
                    </div>

                    {loading ? (
                        <CenteredSpinner color={theme.primaryColor} />
                    ) : (
                        <div className="table-wrapper">
                            <Table className="user-table" responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users && users.length > 0 ? (
                                        users.map((user, index) => (
                                            <tr key={user._id}>
                                                <td>{index + 1}</td>
                                                <td>{user.Email}</td>
                                                <td>{user.Phone}</td>
                                                <td>
                                                    <Button className="simpleButton"
                                                        style={btnEditStyle}
                                                        size="sm"
                                                        onClick={() => toggleEditModal(user, "Email")}
                                                    >
                                                        <FaEdit /> Edit
                                                    </Button>

                                                    <Button className="simpleButton"
                                                        style={btnDeleteStyle}
                                                        size="sm"
                                                        onClick={() => toggleDeleteModal(user)}
                                                    >
                                                        <FaTrash /> Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">
                                                No users found
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
                            Are you sure you want to delete this user?
                            {selectedUser && (
                                <div className="mt-2">
                                    <strong>Email:</strong> {selectedUser.Email}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button style={btnDeleteStyle} onClick={handleDelete}>
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
                            Edit {selectedUser?.Email}
                        </ModalHeader>
                        <ModalBody>
                            {formData &&
                                Object.keys(formData).map((key) => (
                                    <FormGroup key={key}>
                                        <Label>{key}</Label>
                                        <Input
                                            type="text"
                                            value={formData[key] ?? ""}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                        />
                                    </FormGroup>
                                ))}
                        </ModalBody>
                        <ModalFooter>
                            <Button style={btnEditStyle} onClick={handleUpdate}>
                                Update
                            </Button>
                            <Button color="secondary" onClick={() => toggleEditModal()}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </Modal>

                </Container>
            </Container >
        </Container>
    );
}
