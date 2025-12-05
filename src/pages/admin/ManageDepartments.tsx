import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config.ts";
import {useAuth} from "../../context/AuthContext.tsx";

type Campus = {
    id: number;
    name: string;
};

type Department = {
    id: number;
    name: string;
    campus_id: number;
};

const ManageDepartments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Department | null>(null);

    const [deptName, setDeptName] = useState("");
    const [selectedCampusId, setSelectedCampusId] = useState("");
    const {token} = useAuth();

    useEffect(() => {
        fetchCampuses();
        fetchDepartments();
    }, []);

    const fetchCampuses = () => {
        axios
            .get<Campus[]>(`${API_BASE_URL}/api/campus/`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setCampuses(res.data))
            .catch((err) => console.error("Failed to load campuses", err));
    };

    const fetchDepartments = () => {
        setLoading(true);
        axios
            .get<Department[]>(`${API_BASE_URL}/api/campus/department`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setDepartments(res.data))
            .catch((err) => console.error("Failed to load departments", err))
        setLoading(false)

    };
    const openModal = (dept: Department | null = null) => {
        setEditing(dept);
        setDeptName(dept?.name || "");
        setSelectedCampusId(dept?.campus_id.toString() || "");
        setShowModal(true);
    };

    const handleSave = () => {
        if (!deptName.trim() || !selectedCampusId) {
            alert("All fields are required");
            return;
        }

        const data = {
            name: deptName,
            campus_id: parseInt(selectedCampusId),
        };

        if (editing) {
            axios
                .put(`${API_BASE_URL}/api/campus/department/${editing.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then(() => {
                    fetchDepartments();
                    setShowModal(false);
                    setDeptName("");
                    setSelectedCampusId("");
                })
                .catch((err) => console.error("Failed to update department", err));
        } else {
            axios
                .post(`${API_BASE_URL}/api/campus/department`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                }   )
                .then(() => {
                    fetchDepartments();
                    setShowModal(false);
                    setDeptName("");
                    setSelectedCampusId("");
                })
                .catch((err) => console.error("Failed to create department", err));
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this department? This action cannot be undone.")) return;
        axios
            .delete(`${API_BASE_URL}/api/campus/department/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => fetchDepartments())
            .catch((err) => console.error("Failed to delete department", err));
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
                .campus-badge {
                    font-size: 0.75rem;
                    padding: 0.35em 0.65em;
                }
            `}</style>

            {/* Header */}
            <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container-fluid px-4">
                    <div className="py-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-primary bg-opacity-10 rounded">
                                    <i className="fas fa-building fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold">Manage Departments</h1>
                                    <p className="text-muted mb-0 small">
                                        Configure academic departments across all campus locations
                                    </p>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={() => openModal()}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Add Department
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
                                        <p className="text-muted small mb-1">Total Departments</p>
                                        <h3 className="mb-0 fw-bold">{departments.length}</h3>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-briefcase fa-2x text-primary"></i>
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
                                        <p className="text-muted small mb-1">Campuses</p>
                                        <h3 className="mb-0 fw-bold text-success">{campuses.length}</h3>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-map-marker-alt fa-2x text-success"></i>
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
                                Department Directory
                            </h5>
                            <span className="badge bg-primary">{departments.length} Total</span>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mb-0">Loading departments...</p>
                            </div>
                        ) : departments.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-building fa-3x text-muted mb-3 opacity-25"></i>
                                <h5 className="text-muted">No Departments Found</h5>
                                <p className="text-muted small mb-3">
                                    Start by adding your first department to organize academic programs
                                </p>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openModal()}
                                >
                                    <i className="fas fa-plus me-1"></i>
                                    Add First Department
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead>
                                    <tr>
                                        <th className="border-0" style={{ width: "80px" }}>#</th>
                                        <th className="border-0">
                                            <i className="fas fa-briefcase me-2 text-primary"></i>
                                            Department Name
                                        </th>
                                        <th className="border-0">
                                            <i className="fas fa-map-marker-alt me-2 text-success"></i>
                                            Campus
                                        </th>
                                        <th className="border-0 text-center" style={{ width: "200px" }}>
                                            <i className="fas fa-cog me-2 text-muted"></i>
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {departments.map((dept, index) => {
                                        const campus = campuses.find(c => c.id === dept.campus_id);
                                        return (
                                            <tr key={dept.id} className="fade-in">
                                                <td>
                                                        <span className="badge bg-light text-dark border fw-semibold">
                                                            {index + 1}
                                                        </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                                                            <i className="fas fa-graduation-cap text-primary"></i>
                                                        </div>
                                                        <div>
                                                            <strong className="d-block">{dept.name}</strong>
                                                            <small className="text-muted">Dept ID: {dept.id}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                        <span className="badge campus-badge bg-success bg-opacity-10 text-success border border-success">
                                                            <i className="fas fa-map-pin me-1"></i>
                                                            {campus?.name || "Unknown Campus"}
                                                        </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary action-btn"
                                                            onClick={() => openModal(dept)}
                                                            title="Edit Department"
                                                        >
                                                            <i className="fas fa-edit me-1"></i>
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger action-btn"
                                                            onClick={() => handleDelete(dept.id)}
                                                            title="Delete Department"
                                                        >
                                                            <i className="fas fa-trash-alt me-1"></i>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {departments.length > 0 && (
                        <div className="card-footer bg-white border-top py-3">
                            <div className="d-flex justify-content-between align-items-center text-muted small">
                                <span>
                                    <i className="fas fa-info-circle me-1"></i>
                                    Showing {departments.length} {departments.length === 1 ? 'department' : 'departments'}
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
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header border-0 bg-light">
                                    <div>
                                        <h5 className="modal-title fw-bold">
                                            <i className={`fas ${editing ? 'fa-edit text-warning' : 'fa-plus-circle text-primary'} me-2`}></i>
                                            {editing ? "Edit Department" : "Add New Department"}
                                        </h5>
                                        <p className="text-muted small mb-0">
                                            {editing
                                                ? "Update the department information below"
                                                : "Enter the details for the new department"
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
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                <i className="fas fa-briefcase me-2 text-primary"></i>
                                                Department Name
                                                <span className="text-danger ms-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                placeholder="e.g., College of Engineering, School of Business"
                                                value={deptName}
                                                onChange={(e) => setDeptName(e.target.value)}
                                                autoFocus
                                            />
                                            <small className="text-muted">
                                                <i className="fas fa-info-circle me-1"></i>
                                                Enter the official department or college name
                                            </small>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                <i className="fas fa-map-marker-alt me-2 text-success"></i>
                                                Campus Location
                                                <span className="text-danger ms-1">*</span>
                                            </label>
                                            <select
                                                className="form-select form-select-lg"
                                                value={selectedCampusId}
                                                onChange={(e) => setSelectedCampusId(e.target.value)}
                                            >
                                                <option value="">Select Campus</option>
                                                {campuses.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted">
                                                <i className="fas fa-info-circle me-1"></i>
                                                Choose which campus this department belongs to
                                            </small>
                                        </div>
                                    </div>

                                    {editing && (
                                        <div className="alert alert-info border-0 mt-3 mb-0">
                                            <div className="d-flex align-items-start">
                                                <i className="fas fa-lightbulb me-2 mt-1"></i>
                                                <div>
                                                    <strong>Note:</strong> Updating this department will affect all associated courses, students, and scholarship rules.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {campuses.length === 0 && (
                                        <div className="alert alert-warning border-0 mt-3 mb-0">
                                            <div className="d-flex align-items-start">
                                                <i className="fas fa-exclamation-triangle me-2 mt-1"></i>
                                                <div>
                                                    <strong>No campuses available.</strong> Please create a campus first before adding departments.
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
                                        className={`btn ${editing ? 'btn-warning' : 'btn-primary'}`}
                                        onClick={handleSave}
                                        disabled={!deptName.trim() || !selectedCampusId}
                                    >
                                        <i className={`fas ${editing ? 'fa-save' : 'fa-check'} me-1`}></i>
                                        {editing ? "Update Department" : "Create Department"}
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

export default ManageDepartments;
