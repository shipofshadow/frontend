import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config.ts";

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

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Department | null>(null);

    const [deptName, setDeptName] = useState("");
    const [selectedCampusId, setSelectedCampusId] = useState("");

    useEffect(() => {
        fetchCampuses();
        fetchDepartments();
    }, []);

    const fetchCampuses = () => {
        axios
            .get(`${API_BASE_URL}/api/campus/`)
            .then((res) => setCampuses(res.data))
            .catch((err) => console.error("Failed to load campuses", err));
    };

    const fetchDepartments = () => {
        setLoading(true);
        axios
            .get(`${API_BASE_URL}/api/campus/department`)
            .then((res) => setDepartments(res.data))
            .catch((err) => console.error("Failed to load departments", err))
            .finally(() => setLoading(false));
    };

    const openModal = (dept: Department | null = null) => {
        setEditing(dept);
        setDeptName(dept?.name || "");
        setSelectedCampusId(dept?.campus_id.toString() || "");
        setShowModal(true);
    };

    const handleSave = () => {
        if (!deptName.trim() || !selectedCampusId) {
            return alert("All fields are required");
        }

        const data = {
            name: deptName,
            campus_id: parseInt(selectedCampusId),
        };

        if (editing) {
            axios
                .put(`${API_BASE_URL}/api/campus/department/${editing.id}`, data)
                .then(() => {
                    fetchDepartments();
                    setShowModal(false);
                });
        } else {
            axios.post(`${API_BASE_URL}/api/campus/department`, data).then(() => {
                fetchDepartments();
                setShowModal(false);
            });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this department?")) return;
        axios.delete(`${API_BASE_URL}/api/campus/department/${id}`).then(() => fetchDepartments());
    };

    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i data-feather="briefcase"></i></div>
                                    Manage Departments
                                </h1>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
                                    <i className="fa fa-plus me-2"></i>Add Department
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                <div className="card">
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : (
                            <table className="table table-bordered table-hover">
                                <thead>
                                <tr>
                                    <th style={{ width: "10%" }}>#</th>
                                    <th>Department</th>
                                    <th>Campus</th>
                                    <th style={{ width: "20%" }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {departments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted">No departments found.</td>
                                    </tr>
                                ) : (
                                    departments.map((dept, index) => (
                                        <tr key={dept.id}>
                                            <td>{index + 1}</td>
                                            <td>{dept.name}</td>
                                            <td>
                                                {campuses.find(c => c.id === dept.campus_id)?.name || "Unknown Campus"}
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModal(dept)}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(dept.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow">
                            <div className="modal-header">
                                <h5 className="modal-title">{editing ? "Edit Department" : "Add Department"}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Department Name</label>
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    value={deptName}
                                    onChange={(e) => setDeptName(e.target.value)}
                                />

                                <label className="form-label">Campus</label>
                                <select
                                    className="form-select"
                                    value={selectedCampusId}
                                    onChange={(e) => setSelectedCampusId(e.target.value)}
                                >
                                    <option value="">Select Campus</option>
                                    {campuses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    {editing ? "Update" : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageDepartments;
