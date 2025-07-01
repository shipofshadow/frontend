import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL} from "../../config.ts";

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
            .get(`${API_BASE_URL}/api/campuses`)
            .then((res) => setCampuses(res.data))
            .catch((err) => console.error("Failed to load campuses", err))
            .finally(() => setLoading(false));
    };

    const openModal = (campus: Campus | null = null) => {
        setEditingCampus(campus);
        setCampusName(campus ? campus.name : "");
        setShowModal(true);
    };

    const handleSave = () => {
        if (!campusName.trim()) return alert("Campus name is required");

        if (editingCampus) {
            // Update
            axios
                .put(`${API_BASE_URL}/api/campuses/${editingCampus.id}`, { name: campusName })
                .then(() => {
                    fetchCampuses();
                    setShowModal(false);
                });
        } else {
            // Create
            axios
                .post(`${API_BASE_URL}/api/campuses`, { name: campusName })
                .then(() => {
                    fetchCampuses();
                    setShowModal(false);
                });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm("Delete this campus?")) return;
        axios.delete(`${API_BASE_URL}/api/campuses/${id}`).then(() => fetchCampuses());
    };

    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon">
                                        <i data-feather="map-pin"></i>
                                    </div>
                                    Manage Campuses
                                </h1>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
                                    <i className="fa fa-plus me-2"></i>Add Campus
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
                                    <th>Campus Name</th>
                                    <th style={{ width: "20%" }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {campuses.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center text-muted">
                                            No campuses found.
                                        </td>
                                    </tr>
                                ) : (
                                    campuses.map((campus, index) => (
                                        <tr key={campus.id}>
                                            <td>{index + 1}</td>
                                            <td>{campus.name}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => openModal(campus)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(campus.id)}
                                                >
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
                                <h5 className="modal-title">{editingCampus ? "Edit Campus" : "Add Campus"}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Campus Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={campusName}
                                    onChange={(e) => setCampusName(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    {editingCampus ? "Update" : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageCampuses;
