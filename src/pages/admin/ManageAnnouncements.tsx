import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { notyf } from '../../utils/utils';
import Swal from 'sweetalert2';

interface Announcement {
    id: number;
    title: string;
    message: string;
    audience_type: 'all' | 'role' | 'specific';
    audience_filter?: { role?: string };
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    author_name?: string;
}

const ManageAnnouncements = () => {
    const { token } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [campuses, setCampuses] = useState<{ id: number; name: string }[]>([]);

    const initialFormState = {
        title: '',
        message: '',
        priority: 'normal',
        audience_type: 'all',
        role_filter: 'student',
        campus_filter: '',
        publish_now: true
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- Actions ---

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/announcements/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setAnnouncements(json.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
        fetch(`${API_BASE_URL}/api/campus`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCampuses(data);
                else if (data?.data && Array.isArray(data.data)) setCampuses(data.data);
            })
            .catch(() => {});
    }, [token]);

    const handleEdit = (item: Announcement) => {
        setIsEditing(true);
        setEditId(item.id);
        setFormData({
            title: item.title,
            message: item.message,
            priority: item.priority,
            audience_type: item.audience_type,
            role_filter: item.audience_filter?.role || 'student',
            campus_filter: (item.audience_filter as any)?.campus_id || '',
            publish_now: false // Default to false when editing
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete Announcement?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    notyf.success('Deleted successfully');
                    fetchAnnouncements();
                } else {
                    notyf.error(json.message);
                }
            } catch (err) {
                notyf.error('Network error');
            }
        }
    };

    const handlePublish = async (id: number) => {
        const result = await Swal.fire({
            title: 'Publish Now?',
            text: "This will send notifications to all target users.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, Publish'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/announcements/${id}/publish`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    notyf.success(`Published! Sent to ${json.sent_count} users.`);
                    fetchAnnouncements();
                }
            } catch (err) {
                notyf.error('Network error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title: formData.title,
            message: formData.message,
            priority: formData.priority,
            audience_type: formData.audience_type,
            audience_filter: formData.audience_type === 'role' ? {
                role: formData.role_filter,
                ...(formData.campus_filter ? { campus_id: formData.campus_filter } : {})
            } : {},
            publish_now: !isEditing && formData.publish_now
        };

        const url = isEditing
            ? `${API_BASE_URL}/api/announcements/${editId}`
            : `${API_BASE_URL}/api/announcements/create`;

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.success) {
                notyf.success(isEditing ? 'Updated successfully' : 'Created successfully');
                setShowModal(false);
                resetForm();
                fetchAnnouncements();
            } else {
                notyf.error(json.message || 'Operation failed');
            }
        } catch (err) {
            notyf.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setEditId(null);
    };

    // --- Helpers ---

    const getPriorityBadge = (p: string) => {
        const colors: any = { low: 'bg-secondary', normal: 'bg-info text-dark', high: 'bg-warning text-dark', urgent: 'bg-danger' };
        return <span className={`badge ${colors[p] || 'bg-light'} rounded-pill text-uppercase`} style={{fontSize: '0.7rem'}}>{p}</span>;
    };

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Announcements</h3>
                    <p className="text-muted mb-0">Manage system-wide broadcasts and notifications.</p>
                </div>
                <button className="btn btn-primary px-4 py-2 fw-semibold shadow-sm" onClick={() => { resetForm(); setShowModal(true); }}>
                    <i className="fas fa-plus me-2"></i> Create New
                </button>
            </div>

            {/* List Card */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light border-bottom">
                            <tr>
                                <th className="ps-4 py-3 text-uppercase small text-muted fw-bold">Title & Content</th>
                                <th className="py-3 text-uppercase small text-muted fw-bold">Target</th>
                                <th className="py-3 text-uppercase small text-muted fw-bold">Status</th>
                                <th className="py-3 text-uppercase small text-muted fw-bold">Date</th>
                                <th className="pe-4 py-3 text-end text-uppercase small text-muted fw-bold">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {announcements.map((a) => (
                                <tr key={a.id}>
                                    <td className="ps-4 py-3" style={{maxWidth: '350px'}}>
                                        <div className="d-flex align-items-center mb-1">
                                            <span className="fw-bold text-dark me-2">{a.title}</span>
                                            {getPriorityBadge(a.priority)}
                                        </div>
                                        <div className="text-muted small text-truncate">{a.message}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="fw-semibold text-dark text-capitalize">{a.audience_type}</span>
                                            {a.audience_type === 'role' && (
                                                <span className="badge bg-light text-dark border w-auto mt-1">
                                                        {a.audience_filter?.role}
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {a.is_published ? (
                                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                                                    <i className="fas fa-check-circle me-1"></i> Published
                                                </span>
                                        ) : (
                                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 rounded-pill">
                                                    <i className="fas fa-pencil-alt me-1"></i> Draft
                                                </span>
                                        )}
                                    </td>
                                    <td className="text-muted small">
                                        <div className="fw-semibold">{new Date(a.created_at).toLocaleDateString()}</div>
                                        <div>{new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </td>
                                    <td className="pe-4 text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            {!a.is_published && (
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    title="Publish Now"
                                                    onClick={() => handlePublish(a.id)}
                                                >
                                                    <i className="fas fa-paper-plane"></i>
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                title="Edit"
                                                onClick={() => handleEdit(a)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                title="Delete"
                                                onClick={() => handleDelete(a.id)}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {announcements.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-5 text-muted bg-light">
                                        <div className="py-4">
                                            <i className="fas fa-bullhorn display-6 mb-3 opacity-25"></i>
                                            <p className="mb-0">No announcements found. Click "Create New" to start.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show" style={{zIndex: 1040}}></div>
                    <div className="modal fade show d-block" style={{zIndex: 1050}}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-header border-0 pb-0">
                                        <h5 className="modal-title fw-bold">
                                            {isEditing ? 'Edit Announcement' : 'Compose Announcement'}
                                        </h5>
                                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-uppercase text-muted">Title</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg bg-light border-0"
                                                required
                                                value={formData.title}
                                                onChange={e => setFormData({...formData, title: e.target.value})}
                                                placeholder="e.g., System Maintenance Scheduled"
                                            />
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-uppercase text-muted">Priority</label>
                                                <select
                                                    className="form-select bg-light border-0"
                                                    value={formData.priority}
                                                    onChange={e => setFormData({...formData, priority: e.target.value})}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="normal">Normal</option>
                                                    <option value="high">High</option>
                                                    <option value="urgent">Urgent</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-uppercase text-muted">Audience</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-select bg-light border-0"
                                                        value={formData.audience_type}
                                                        onChange={e => setFormData({...formData, audience_type: e.target.value})}
                                                        disabled={isEditing && announcements.find(a => a.id === editId)?.is_published}
                                                    >
                                                        <option value="all">Everyone</option>
                                                        <option value="role">Specific Role</option>
                                                    </select>
                                                    {formData.audience_type === 'role' && (
                                                        <select
                                                            className="form-select bg-light border-0"
                                                            value={formData.role_filter}
                                                            onChange={e => setFormData({...formData, role_filter: e.target.value})}
                                                            disabled={isEditing && announcements.find(a => a.id === editId)?.is_published}
                                                        >
                                                            <option value="student">Student</option>
                                                            <option value="admin">Admin</option>
                                                            <option value="staff">Staff</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {formData.audience_type === 'role' && (
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-uppercase text-muted">Target Campus</label>
                                                <select
                                                    className="form-select bg-light border-0"
                                                    value={formData.campus_filter}
                                                    onChange={e => setFormData({...formData, campus_filter: e.target.value})}
                                                    disabled={isEditing && announcements.find(a => a.id === editId)?.is_published}
                                                >
                                                    <option value="">All Campuses</option>
                                                    {campuses.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-uppercase text-muted">Message</label>
                                            <textarea
                                                className="form-control bg-light border-0"
                                                rows={6}
                                                required
                                                value={formData.message}
                                                onChange={e => setFormData({...formData, message: e.target.value})}
                                                placeholder="Enter full details..."
                                            ></textarea>
                                        </div>

                                        {!isEditing && (
                                            <div className="form-check p-3 rounded bg-primary-subtle border border-primary-subtle">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="publishNow"
                                                    checked={formData.publish_now}
                                                    onChange={e => setFormData({...formData, publish_now: e.target.checked})}
                                                />
                                                <label className="form-check-label fw-semibold text-primary-emphasis" htmlFor="publishNow">
                                                    Publish and send notifications immediately
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    <div className="modal-footer border-0 pt-0 px-4 pb-4">
                                        <button type="button" className="btn btn-light fw-bold" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary fw-bold px-4" disabled={loading}>
                                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-save me-2"></i>}
                                            {isEditing ? 'Save Changes' : (formData.publish_now ? 'Post Announcement' : 'Save Draft')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageAnnouncements;