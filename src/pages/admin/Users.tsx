import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from "../../config.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { sha256 } from "js-sha256";

// TypeScript Interfaces
interface IUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'bitress' | 'super_admin' | 'admin' | 'student' | 'user';
    is_active: boolean;
    avatar?: string | null;
    created_at: string;
    deleted_at?: string | null;
}

interface IUserFormData {
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'user';
    isActive: boolean;
    avatar: string;
}

interface IApiResponse<T> {
    success: boolean;
    message?: string;
    users?: T[];
    user?: T;
}

// Helper function to get role badge info
const getRoleBadgeInfo = (role: string) => {
    switch (role) {
        case 'bitress':
            return { icon: '⚡', label: 'Bitress', className: 'bg-warning text-dark' };
        case 'super_admin':
            return { icon: '👑', label: 'Super Admin', className: 'bg-purple text-white' };
        case 'admin':
            return { icon: '🔧', label: 'Admin', className: 'bg-primary' };
        case 'student':
            return { icon: '🎓', label: 'Student', className: 'bg-info' };
        default:
            return { icon: '👤', label: role, className: 'bg-secondary' };
    }
};

// Check if a user is protected (bitress or super_admin with lower ID can't be modified)
const isProtectedUser = (user: IUser, currentUserRole: string | undefined) => {
    // Bitress users (ID: -999) are always protected unless current user is also bitress
    if (user.role === 'bitress') {
        return currentUserRole !== 'bitress';
    }
    // Super admins are protected from non-bitress and non-super_admin users
    if (user.role === 'super_admin') {
        return currentUserRole !== 'bitress' && currentUserRole !== 'super_admin';
    }
    return false;
};

const Users = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [deletedUsers, setDeletedUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeletedUsers, setShowDeletedUsers] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState<IUserFormData>({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'admin',
        isActive: true,
        avatar: ''
    });
    const { token, user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get<IApiResponse<IUser>>(
                `${API_BASE_URL}/api/users/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success && response.data.users) {
                setUsers(response.data.users);
            }
        } catch {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text:  'Error fetching users'
            });
        } finally {
            setLoading(false);
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
        } catch {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text:  'Error fetching deleted users'
            });
        }
    };

    const handleCreateUser = () => {
        setModalMode('create');
        setFormData({
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            email: '',
            role: 'admin',
            isActive: true,
            avatar: ''
        });
        setSelectedUser(null);
        setShowModal(true);
    };

    const handleEditUser = (user: IUser) => {
        setModalMode('edit');
        setFormData({
            username: user.username,
            password: '',
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            email: user.email || '',
            role: (user.role === 'admin' || user.role === 'user') ? user.role : 'admin',
            isActive: user.is_active,
            avatar: user.avatar || ''
        });
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload: any = { ...formData };

            if (formData.password) {
                payload.password = sha256(formData.password);
            } else if (modalMode === 'edit') {
                const { password, ...rest } = payload;
                Object.assign(payload, rest);
            }

            if (modalMode === 'create') {
                const response = await axios.post<IApiResponse<IUser>>(
                    `${API_BASE_URL}/api/users/`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'User created successfully',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    await fetchUsers();
                    setShowModal(false);
                }
            } else {
                const response = await axios.put<IApiResponse<IUser>>(
                    `${API_BASE_URL}/api/users/${selectedUser?.id}/`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'User updated successfully',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    await fetchUsers();
                    setShowModal(false);
                }
            }
        } catch {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error saving user'
            });
        }
    };

    const confirmDeleteUser = async (user: IUser) => {
        const result = await Swal.fire({
            title: 'Delete User?',
            html: `Are you sure you want to delete <strong>${user.username}</strong>?<br><small class="text-muted">This action can be reversed from the deleted users list.</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="fal fa-trash-alt me-1"></i> Delete User',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            await handleDeleteUser(user.id);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            const response = await axios.delete<IApiResponse<IUser>>(
                `${API_BASE_URL}/api/users/${userId}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'User deleted successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
                await fetchUsers();
            }
        } catch (error: any) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text:  'Error deleting user'
            });
        }
    };

    const handleToggleStatus = async (userId: number) => {
        try {
            const response = await axios.put<IApiResponse<IUser>>(
                `${API_BASE_URL}/api/users/${userId}/toggle-status/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data.message || 'User status updated',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchUsers();
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text:  'Error toggling user status'
            });
        }
    };

    const handleRestoreUser = async (userId: number) => {
        try {
            const response = await axios.put<IApiResponse<IUser>>(
                `${API_BASE_URL}/api/users/${userId}/restore/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Restored!',
                    text: 'User restored successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchDeletedUsers();
                fetchUsers();
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text:  'Error restoring user'
            });
        }
    };

    const toggleDeletedUsersView = () => {
        if (!showDeletedUsers) {
            fetchDeletedUsers();
        }
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
                                <p className="text-muted small mb-0">Manage system users and permissions</p>
                            </div>
                            <div className="col-12 col-xl-auto mb-3">
                                <button
                                    className="btn btn-sm btn-outline-secondary me-2"
                                    onClick={toggleDeletedUsersView}
                                >
                                    <i className={`fal ${showDeletedUsers ? 'fa-users' : 'fa-trash-alt'} me-1`}></i>
                                    {showDeletedUsers ? 'Active Users' : 'Deleted Users'}
                                </button>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={handleCreateUser}
                                >
                                    <i className="fal fa-user-plus me-1"></i>
                                    Add User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="card shadow-sm">
                        {/* Card Header with Search */}
                        <div className="card-header bg-white py-3">
                            <div className="row align-items-center g-3">
                                <div className="col-md-6">
                                    <h5 className="mb-0 fw-semibold">
                                        {showDeletedUsers ? 'Deleted Users' : 'Active Users'}
                                        <span className="badge bg-primary ms-2 fw-normal">
                                            {filteredUsers.length}
                                        </span>
                                    </h5>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">
                                            <i className="fal fa-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by username, name, or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th className="text-muted fw-semibold" style={{ width: '60px' }}>#</th>
                                    <th className="text-muted fw-semibold">User</th>
                                    <th className="text-muted fw-semibold">Email</th>
                                    <th className="text-muted fw-semibold" style={{ width: '120px' }}>Role</th>
                                    <th className="text-muted fw-semibold" style={{ width: '120px' }}>Status</th>
                                    <th className="text-muted fw-semibold" style={{ width: '140px' }}>Created</th>
                                    <th className="text-muted fw-semibold text-end" style={{ width: '180px' }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-5">
                                            <div className="text-muted">
                                                <i className="fal fa-inbox fa-3x mb-3 d-block"></i>
                                                <p className="mb-0">
                                                    {searchQuery ? 'No users found matching your search' : `No ${showDeletedUsers ? 'deleted' : 'active'} users found`}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : showDeletedUsers ? (
                                    deletedUsers.filter(user =>
                                        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map(user => (
                                        <tr key={user.id}>
                                            <td className="text-muted fw-medium">{user.id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar bg-light text-muted rounded-circle me-3 d-flex align-items-center justify-content-center fw-semibold"
                                                         style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-dark">{user.username}</div>
                                                        <div className="small text-muted">{user.first_name} {user.last_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-muted">{user.email}</td>
                                            <td>
                                                    {(() => {
                                                        const badgeInfo = getRoleBadgeInfo(user.role);
                                                        return (
                                                            <span className={`badge ${badgeInfo.className}`}>
                                                                {badgeInfo.icon} {badgeInfo.label}
                                                            </span>
                                                        );
                                                    })()}
                                            </td>
                                            <td>
                                                    <span className="badge bg-danger">
                                                        Deleted
                                                    </span>
                                            </td>
                                            <td className="text-muted">
                                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleRestoreUser(user.id)}
                                                    title="Restore user"
                                                >
                                                    <i className="fal fa-undo me-1"></i>
                                                    <span className="ms-1">Restore</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    users.filter(user =>
                                        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        user.email.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map(user => (
                                        <tr key={user.id}>
                                            <td className="text-muted fw-medium">{user.id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={user.avatar
                                                            ? `${API_BASE_URL}/api/profile/avatar/${encodeURIComponent(user.avatar.split("/").pop() || '')}`
                                                            : "/default.png"
                                                        }
                                                        alt={user.username}
                                                        className="rounded-circle me-3"
                                                        style={{ width: '40px', height: '40px', minWidth: '40px', objectFit: 'cover' }}
                                                        onError={(e) => { (e.target as HTMLImageElement).src = "/default.png"; }}
                                                    />
                                                    <div>
                                                        <div className="fw-semibold text-dark">{user.username}</div>
                                                        <div className="small text-muted">{user.first_name} {user.last_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-muted">{user.email}</td>
                                            <td>
                                                    {(() => {
                                                        const badgeInfo = getRoleBadgeInfo(user.role);
                                                        return (
                                                            <span className={`badge ${badgeInfo.className}`}>
                                                                {badgeInfo.icon} {badgeInfo.label}
                                                            </span>
                                                        );
                                                    })()}
                                            </td>
                                            <td>
                                                    <span className={`badge ${user.is_active ? 'bg-success' : 'bg-warning'}`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                            </td>
                                            <td className="text-muted">
                                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="text-end">
                                                {isProtectedUser(user, currentUser?.role) ? (
                                                    <span className="badge bg-secondary">
                                                        <i className="fal fa-lock me-1"></i>Protected
                                                    </span>
                                                ) : (
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => handleEditUser(user)}
                                                            title="Edit user"
                                                        >
                                                            <i className="fal fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-warning"
                                                            onClick={() => handleToggleStatus(user.id)}
                                                            title={`${user.is_active ? 'Deactivate' : 'Activate'} user`}
                                                            disabled={user.id === -999}
                                                        >
                                                            <i className="fal fa-power-off"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => confirmDeleteUser(user)}
                                                            title="Delete user"
                                                            disabled={user.id === -999}
                                                        >
                                                            <i className="fal fa-trash-alt"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content shadow-lg">
                            <div className="modal-header border-bottom">
                                <div>
                                    <h5 className="modal-title fw-semibold mb-1">
                                        {modalMode === 'create' ? 'Create New User' : 'Edit User'}
                                    </h5>
                                    <p className="text-muted small mb-0">
                                        {modalMode === 'create'
                                            ? 'Add a new user to the system'
                                            : `Update details for ${selectedUser?.username}`
                                        }
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {/* Account Credentials */}
                                    <div className="mb-4">
                                        <h6 className="fw-semibold text-dark mb-3 pb-2 border-bottom">
                                            Account Credentials
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    Username <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    required
                                                    minLength={3}
                                                    placeholder="Enter username"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    Password {modalMode === 'create' && <span className="text-danger">*</span>}
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    required={modalMode === 'create'}
                                                    minLength={8}
                                                    placeholder={modalMode === 'create' ? 'Min. 8 characters' : 'Leave empty to keep current'}
                                                />
                                                {modalMode === 'edit' && (
                                                    <div className="form-text">Leave blank to keep current password</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Information */}
                                    <div className="mb-4">
                                        <h6 className="fw-semibold text-dark mb-3 pb-2 border-bottom">
                                            Personal Information
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    First Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter first name"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    Last Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter last name"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label fw-medium">
                                                    Email Address <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Settings */}
                                    <div className="mb-3">
                                        <h6 className="fw-semibold text-dark mb-3 pb-2 border-bottom">
                                            System Settings
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Role</label>
                                                <select
                                                    className="form-select"
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="admin">Administrator</option>
                                                    <option value="user">User</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Avatar URL</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="avatar"
                                                    value={formData.avatar}
                                                    onChange={handleInputChange}
                                                    placeholder="https://example.com/avatar.jpg"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="isActive"
                                                        name="isActive"
                                                        checked={formData.isActive}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label className="form-check-label fw-medium" htmlFor="isActive">
                                                        Active User
                                                    </label>
                                                    <div className="form-text">Inactive users cannot log in to the system</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-top">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <i className="fal fa-times me-1"></i>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className={`fal ${modalMode === 'create' ? 'fa-plus' : 'fa-save'} me-1`}></i>
                                        {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .bg-purple {
                    background-color: #6f42c1 !important;
                }
            `}</style>
        </>
    );
}

export default Users;