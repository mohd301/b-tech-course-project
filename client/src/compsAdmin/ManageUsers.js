import { useEffect, useState } from "react";
import { Container, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "../compsMisc/ThemeContext";
import { fetchUsersThunk, deleteUserThunk, updateUserThunk } from "../slices/SliceUser";
import Logout from "../compsMisc/Logout";
import { FaTrash, FaEdit } from "react-icons/fa";

export default function ManageUsers() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const users = useSelector((state) => state.user.userList);
    const loading = useSelector((state) => state.user.loading);

    const [deleteModal, setDeleteModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editField, setEditField] = useState("");
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        dispatch(fetchUsersThunk());
    }, [dispatch]);

    const toggleDeleteModal = (user = null) => {
        setSelectedUser(user);
        setDeleteModal(!deleteModal);
    };

    const toggleEditModal = (user = null, field = "") => {
        setSelectedUser(user);
        setEditField(field);
        setEditValue(field === "Email" ? user?.Email || "" : user?.Phone || "");
        setEditModal(!editModal);
    };

    const handleDelete = async () => {
        if (selectedUser) {
            try {
                await dispatch(deleteUserThunk({ Email: selectedUser.Email })).unwrap();
                toast.success("User deleted successfully");
                dispatch(fetchUsersThunk());
            } catch (err) {
                toast.error("Failed to delete user");
            }
            toggleDeleteModal();
        }
    };

    const handleUpdate = async () => {
        if (selectedUser && editValue.trim()) {
            const updateData = {
                Email: selectedUser.Email,
                newEmail: editField === "Email" ? editValue : selectedUser.Email,
                newPhone: editField === "Phone" ? editValue : selectedUser.Phone
            };
            try {
                await dispatch(updateUserThunk(updateData)).unwrap();
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
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: theme.textColorAlt }}>Manage Users</h2>
                <Logout />
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: theme.primaryColor }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
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
                                            <Button
                                                style={btnEditStyle}
                                                size="sm"
                                                onClick={() => toggleEditModal(user, "Email")}
                                            >
                                                <FaEdit /> Email
                                            </Button>
                                            <Button
                                                style={btnEditStyle}
                                                size="sm"
                                                onClick={() => toggleEditModal(user, "Phone")}
                                            >
                                                <FaEdit /> Phone
                                            </Button>
                                            <Button
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
                    Edit {editField}
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="editValue">New {editField}</Label>
                        <Input
                            type={editField === "Email" ? "email" : "text"}
                            id="editValue"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                        />
                    </FormGroup>
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
    );
}
