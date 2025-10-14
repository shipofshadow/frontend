import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config.ts";

type Campus = {
    id: number;
    name: string;
};

const ManageCampuses = () => {
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
    const [campusName, setCampusName] = useState("");

    useEffect(() => {
        fetchCampuses();
    }, []);

    const fetchCampuses = () => {
        setLoading(true);
        axios
            .get<Campus[]>(`${API_BASE_URL}/api/campus`)
            .then((res) => setCampuses(res.data))
            .catch((err) => console.error("Failed to load campuses", err))
        setLoading(false)

    };

    const openModal = (campus: Campus | null = null) => {
        setEditingCampus(campus);
        setCampusName(campus ? campus.name : "");
        setShowModal(true);
    };

    const handleSave = () => {
        if (!campusName.trim()) {
            alert("Campus name is required");
            return;
        }

        if (editingCampus) {
            // Update
            axios
                .put(`${API_BASE_URL}/api/campus/${editingCampus.id}`, { name: campusName })
                .then(() => {
                    fetchCampuses();
                    setShowModal(false);
                    setCampusName("");
                })
                .catch((err) => console.error("Failed to update campus", err));
        } else {
            // Create
            axios
                .post(`${API_BASE_URL}/api/campus`, { name: campusName })
                .then(() => {
                    fetchCampuses();
                    setShowModal(false);
                    setCampusName("");
                })
                .catch((err) => console.error("Failed to create campus", err));
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this campus? This action cannot be undone.")) return;
        axios
            .delete(`${API_BASE_URL}/api/campus/${id}`)
            .then(() => fetchCampuses())
            .catch((err) => console.error("Failed to delete campus", err));
    };

    return (
        <>
            <style>{`
                .stat-card {
                    transition: transform 0.2s, box-shadow 0.2s;
                    border: 1px solid #e9ecef;
                }
                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                }
                .campus-card {
                    transition: all 0.2s ease;
                    border-left: 4px solid transparent;
                }
                .campus-card:hover {
                    border-left-color: #0d6efd;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    background-color: #f8f9fa;
                }
                .table thead th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #dee2e6;
                }
                .table tbody tr {
                    transition: background-color 0.15s ease;
                }
                .table tbody tr:hover {
                    background-color: #f8f9fa;
                }
                .modal-backdrop.show {
                    opacity: 0.5;
                }
                .fade-in {
                    animation: fadeIn 0.3s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .action-btn {
                    transition: all 0.15s ease;
                }
                .action-btn:hover {
                    transform: translateY(-1px);
                }
            `}</style>

            {/* Header */}
            <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container-fluid px-4">
                    <div className="py-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-primary bg-opacity-10 rounded">
                                    <i className="fas fa-map-marker-alt fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold">Manage Campuses</h1>
                                    <p className="text-muted mb-0 small">
                                        Configure and manage campus locations for the scholarship system
                                    </p>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={() => openModal()}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Add Campus
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                {/* Stats Row */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Campuses</p>
                                        <h3 className="mb-0 fw-bold">{campuses.length}</h3>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-university fa-2x text-primary"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Active Locations</p>
                                        <h3 className="mb-0 fw-bold text-success">{campuses.length}</h3>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-check-circle fa-2x text-success"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">System Status</p>
                                        <h3 className="mb-0 fw-bold text-info">Active</h3>
                                    </div>
                                    <div className="bg-info bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-server fa-2x text-info"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom py-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <h5 className="mb-0 fw-semibold">
                                <i className="fas fa-list me-2 text-primary"></i>
                                Campus Directory
                            </h5>
                            <span className="badge bg-primary">{campuses.length} Total</span>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mb-0">Loading campuses...</p>
                            </div>
                        ) : campuses.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-map-marked-alt fa-3x text-muted mb-3 opacity-25"></i>
                                <h5 className="text-muted">No Campuses Found</h5>
                                <p className="text-muted small mb-3">
                                    Start by adding your first campus location to the system
                                </p>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openModal()}
                                >
                                    <i className="fas fa-plus me-1"></i>
                                    Add First Campus
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead>
                                    <tr>
                                        <th className="border-0" style={{ width: "80px" }}>#</th>
                                        <th className="border-0">
                                            <i className="fas fa-building me-2 text-primary"></i>
                                            Campus Name
                                        </th>
                                        <th className="border-0 text-center" style={{ width: "200px" }}>
                                            <i className="fas fa-cog me-2 text-muted"></i>
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {campuses.map((campus, index) => (
                                        <tr key={campus.id} className="fade-in">
                                            <td>
                                                    <span className="badge bg-light text-dark border fw-semibold">
                                                        {index + 1}
                                                    </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                                                        <i className="fas fa-map-pin text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <strong className="d-block">{campus.name}</strong>
                                                        <small className="text-muted">Campus ID: {campus.id}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary action-btn"
                                                        onClick={() => openModal(campus)}
                                                        title="Edit Campus"
                                                    >
                                                        <i className="fas fa-edit me-1"></i>
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger action-btn"
                                                        onClick={() => handleDelete(campus.id)}
                                                        title="Delete Campus"
                                                    >
                                                        <i className="fas fa-trash-alt me-1"></i>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {campuses.length > 0 && (
                        <div className="card-footer bg-white border-top py-3">
                            <div className="d-flex justify-content-between align-items-center text-muted small">
                                <span>
                                    <i className="fas fa-info-circle me-1"></i>
                                    Showing {campuses.length} {campuses.length === 1 ? 'campus' : 'campuses'}
                                </span>
                                <span>Last updated: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header border-0 bg-light">
                                    <div>
                                        <h5 className="modal-title fw-bold">
                                            <i className={`fas ${editingCampus ? 'fa-edit text-warning' : 'fa-plus-circle text-primary'} me-2`}></i>
                                            {editingCampus ? "Edit Campus" : "Add New Campus"}
                                        </h5>
                                        <p className="text-muted small mb-0">
                                            {editingCampus
                                                ? "Update the campus information below"
                                                : "Enter the details for the new campus location"
                                            }
                                        </p>
                                    </div>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        aria-label="Close"
                                    />
                                </div>
                                <div className="modal-body px-4 py-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="fas fa-building me-2 text-primary"></i>
                                            Campus Name
                                            <span className="text-danger ms-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="e.g., Main Campus, North Campus"
                                            value={campusName}
                                            onChange={(e) => setCampusName(e.target.value)}
                                            autoFocus
                                        />
                                        <small className="text-muted">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Enter a unique and descriptive name for this campus
                                        </small>
                                    </div>

                                    {editingCampus && (
                                        <div className="alert alert-info border-0 mb-0">
                                            <div className="d-flex align-items-start">
                                                <i className="fas fa-lightbulb me-2 mt-1"></i>
                                                <div>
                                                    <strong>Note:</strong> Updating this campus will affect all associated students, courses, and applications.
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 bg-light">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Cancel
                                    </button>
                                    <button
                                        className={`btn ${editingCampus ? 'btn-warning' : 'btn-primary'}`}
                                        onClick={handleSave}
                                        disabled={!campusName.trim()}
                                    >
                                        <i className={`fas ${editingCampus ? 'fa-save' : 'fa-check'} me-1`}></i>
                                        {editingCampus ? "Update Campus" : "Create Campus"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ManageCampuses;
