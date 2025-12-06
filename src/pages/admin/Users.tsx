import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { sha256 } from 'js-sha256';
import { API_BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";

// --- Interfaces ---
interface IUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'bitress' | 'super_admin' | 'admin' | 'faculty' | 'student' | 'user';
    is_active: boolean;
    avatar?: string | null;
    created_at: string;
    deleted_at?: string | null;
    campus_id?: number;
    campus_name?: string;
}

interface ICampus {
    id: number;
    name: string;
}

interface IUserFormData {
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'faculty' | 'user';
    isActive: boolean;
    avatar: string;
    campusId?: number;
}

interface IApiResponse<T> {
    success: boolean;
    message?: string;
    users?: T[];
    user?: T;
}

const Users = () => {
    // --- State ---
    const [users, setUsers] = useState<IUser[]>([]);
    const [deletedUsers, setDeletedUsers] = useState<IUser[]>([]);
    const [campuses, setCampuses] = useState<ICampus[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeletedUsers, setShowDeletedUsers] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState<IUserFormData>({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'admin',
        isActive: true,
        avatar: '',
        campusId: undefined
    });

    // File Upload State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { token } = useAuth(); // Removed unused 'user' alias

    // --- Effects ---
    useEffect(() => {
        fetchUsers();
        fetchCampuses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- API Fetchers ---
    const fetchUsers = async () => {
        try {
            const response = await axios.get<IApiResponse<IUser>>(
                `${API_BASE_URL}/api/users/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success && response.data.users) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error(error);
            await Swal.fire({ icon: 'error', title: 'Error', text: 'Error fetching users' });
        }
    };

    const fetchCampuses = async () => {
        try {
            const response = await axios.get<ICampus[]>(`${API_BASE_URL}/api/campus`);
            setCampuses(response.data);
        } catch (error) {
            console.error('Error fetching campuses:', error);
        }
    };

    const fetchDeletedUsers = async () => {
        try {
            const response = await axios.get<IApiResponse<IUser>>(
                `${API_BASE_URL}/api/users/deleted/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success && response.data.users) {
                setDeletedUsers(response.data.users);
            }
        } catch (error) {
            console.error(error);
            await Swal.fire({ icon: 'error', title: 'Error', text: 'Error fetching deleted users' });
        }
    };

    // --- Handlers ---
    const handleCreateUser = () => {
        setModalMode('create');
        setFormData({
            username: '', password: '', firstName: '', lastName: '', email: '',
            role: 'admin', isActive: true, avatar: '', campusId: undefined
        });
        setAvatarFile(null);
        setAvatarPreview(null);
        setSelectedUser(null);
        setShowModal(true);
    };

    const handleEditUser = (user: IUser) => {
        setModalMode('edit');
        setFormData({
            username: user.username,
            password: '', // Empty means don't change
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            email: user.email || '',
            // Safe cast: ensure database role maps to form role, default to admin if mismatch
            role: (['admin', 'faculty', 'user'].includes(user.role) ? user.role : 'admin') as IUserFormData['role'],
            isActive: user.is_active,
            avatar: user.avatar || '',
            campusId: user.campus_id
        });

        // Handle Avatar Preview
        const existingUrl = user.avatar
            ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}/api/profile/avatar/${user.avatar.split('/').pop()}`)
            : null;
        setAvatarPreview(existingUrl);
        setAvatarFile(null);

        setSelectedUser(user);
        setShowModal(true);
    };

    // FIXED: Properly handle different input types (checkbox vs text/select)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;

        // Checkboxes only exist on input elements, not select
        const value = (target.type === 'checkbox' && target instanceof HTMLInputElement)
            ? target.checked
            : target.value;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };
            // Clear campus ID if role changes to non-faculty
            if (name === 'role' && value !== 'faculty') {
                newData.campusId = undefined;
            }
            return newData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.role === 'faculty' && !formData.campusId) {
            await Swal.fire({ icon: 'warning', title: 'Campus Required', text: 'Please select a campus for the faculty user.' });
            return;
        }

        // 1. Create FormData for Multipart Upload
        const submitData = new FormData();
        submitData.append('username', formData.username);
        submitData.append('firstName', formData.firstName);
        submitData.append('lastName', formData.lastName);
        submitData.append('email', formData.email);
        submitData.append('role', formData.role);
        submitData.append('isActive', String(formData.isActive));

        if (formData.campusId) {
            submitData.append('campusId', String(formData.campusId));
        }

        // 2. Handle Password with SHA-256 Hashing
        if (formData.password) {
            submitData.append('password', sha256(formData.password));
        }

        // 3. Handle Avatar File or String
        if (avatarFile) {
            submitData.append('avatar_file', avatarFile);
        } else if (formData.avatar) {
            submitData.append('avatar', formData.avatar);
        }

        try {
            let response;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            // Use generic to type the response
            if (modalMode === 'create') {
                response = await axios.post<IApiResponse<IUser>>(`${API_BASE_URL}/api/users/`, submitData, config);
            } else {
                response = await axios.put<IApiResponse<IUser>>(`${API_BASE_URL}/api/users/${selectedUser?.id}/`, submitData, config);
            }

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `User ${modalMode === 'create' ? 'created' : 'updated'} successfully`,
                    timer: 1500,
                    showConfirmButton: false
                });
                await fetchUsers();
                setShowModal(false);
            }
        } catch (error: any) {
            console.error(error);
            await Swal.fire({ icon: 'error', title: 'Error', text: 'Error saving user' });
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            const response = await axios.delete<IApiResponse<IUser>>(
                `${API_BASE_URL}/api/users/${userId}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'User deleted successfully', timer: 1500, showConfirmButton: false });
                await fetchUsers();
            }
        } catch (error: any) {
            console.error(error);
            await Swal.fire({ icon: 'error', title: 'Error', text: 'Error deleting user' });
        }
    };

    const confirmDeleteUser = async (user: IUser) => {
        const result = await Swal.fire({
            title: 'Delete User?',
            text: `Are you sure you want to delete ${user.username}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Delete'
        });
        if (result.isConfirmed) handleDeleteUser(user.id);
    };

    const handleRestoreUser = async (userId: number) => {
        try {
            const response = await axios.put<IApiResponse<IUser>>(
                `${API_BASE_URL}/api/users/${userId}/restore/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Restored!', timer: 1500, showConfirmButton: false });
                fetchDeletedUsers();
                fetchUsers();
            }
        } catch (error: any) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error restoring user' });
        }
    };

    const handleToggleStatus = async (userId: number) => {
        try {
            const response = await axios.put<IApiResponse<IUser>>(
                `${API_BASE_URL}/api/users/${userId}/toggle-status/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data.message,
                    timer: 1500,
                    showConfirmButton: false
                });
                await fetchUsers();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.data.message || 'Failed to toggle status'
                });
            }
        } catch (error: any) {
            // Safe access using optional chaining on 'any' typed error
            const errorMessage = error.response?.data?.message || 'Error toggling status';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    };

    const toggleDeletedUsersView = () => {
        if (!showDeletedUsers) fetchDeletedUsers();
        setShowDeletedUsers(!showDeletedUsers);
    };

    const filteredUsers = (showDeletedUsers ? deletedUsers : users).filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Header */}
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i className="fal fa-users"></i></div>
                                    User Management
                                </h1>
                            </div>
                            <div className="col-12 col-xl-auto mb-3">
                                <button className="btn btn-sm btn-outline-secondary me-2" onClick={toggleDeletedUsersView}>
                                    <i className={`fal ${showDeletedUsers ? 'fa-users' : 'fa-trash-alt'} me-1`}></i>
                                    {showDeletedUsers ? 'Active Users' : 'Deleted Users'}
                                </button>
                                <button className="btn btn-sm btn-primary" onClick={handleCreateUser}>
                                    <i className="fal fa-user-plus me-1"></i> Add User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                <div className="card shadow-sm">
                    {/* Search & Header */}
                    <div className="card-header bg-white py-3">
                        <div className="row align-items-center g-3">
                            <div className="col-md-6">
                                <h5 className="mb-0 fw-semibold">
                                    {showDeletedUsers ? 'Deleted Users' : 'Active Users'} ({filteredUsers.length})
                                </h5>
                            </div>
                            <div className="col-md-6">
                                <input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={user.avatar
                                                    ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}/api/profile/avatar/${user.avatar.split('/').pop()}`)
                                                    : "/default.png"
                                                }
                                                alt="Avatar" className="rounded-circle me-2"
                                                style={{width: 32, height: 32, objectFit: 'cover'}}
                                                onError={(e) => { (e.target as HTMLImageElement).src = "/default.png"; }}
                                            />
                                            <div>
                                                <div className="fw-bold">{user.username}</div>
                                                <div className="small text-muted">{user.first_name} {user.last_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td><span className="badge bg-light text-dark border">{user.role}</span></td>
                                    <td>
                                        {showDeletedUsers
                                            ? <span className="badge bg-danger">Deleted</span>
                                            : <span className={`badge ${user.is_active ? 'bg-success' : 'bg-warning'}`}>{user.is_active ? 'Active' : 'Inactive'}</span>
                                        }
                                    </td>
                                    <td className="text-end">
                                        {showDeletedUsers ? (
                                            <button className="btn btn-sm btn-success" onClick={() => handleRestoreUser(user.id)}>Restore</button>
                                        ) : (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-primary" onClick={() => handleEditUser(user)}><i className="fal fa-edit"></i></button>
                                                <button className="btn btn-outline-warning" onClick={() => handleToggleStatus(user.id)}><i className="fal fa-power-off"></i></button>
                                                <button className="btn btn-outline-danger" onClick={() => confirmDeleteUser(user)}><i className="fal fa-trash-alt"></i></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{modalMode === 'create' ? 'Create User' : 'Edit User'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    {/* Avatar Upload */}
                                    <div className="d-flex justify-content-center mb-4">
                                        <div className="text-center position-relative" style={{cursor: 'pointer'}} onClick={() => fileInputRef.current?.click()}>
                                            <img
                                                src={avatarPreview || '/default.png'}
                                                alt="Preview"
                                                className="rounded-circle border border-3 border-light shadow-sm"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                            <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-1 shadow-sm" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <i className="fal fa-camera"></i>
                                            </div>
                                        </div>
                                        <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleFileChange} />
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Username</label>
                                            <input type="text" className="form-control" name="username" value={formData.username} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder={modalMode === 'create' ? 'Required' : 'Leave blank to keep current'}
                                                required={modalMode === 'create'}
                                            />
                                            {modalMode === 'edit' && <small className="text-muted">Enter new password to reset directly (overrides old).</small>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">First Name</label>
                                            <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Last Name</label>
                                            <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Role</label>
                                            <select className="form-select" name="role" value={formData.role} onChange={handleInputChange}>
                                                <option value="admin">Administrator</option>
                                                <option value="faculty">Faculty</option>
                                                <option value="user">User</option>
                                            </select>
                                        </div>
                                        {formData.role === 'faculty' && (
                                            <div className="col-md-6">
                                                <label className="form-label">Campus</label>
                                                <select className="form-select" name="campusId" value={formData.campusId || ''} onChange={handleInputChange} required>
                                                    <option value="">Select Campus</option>
                                                    {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div className="col-12 mt-3">
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                                                <label className="form-check-label" htmlFor="isActive">Active User</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Users;