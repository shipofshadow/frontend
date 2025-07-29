import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext.tsx";
import axios from "axios";
import { API_BASE_URL } from "../../../config.ts";
import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";

interface ScholarshipRule {
    rule_id: number;
    min_gwa: number;
    max_income: number;
    ip_required: boolean;
}

interface Scholarships {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    rules: ScholarshipRule;
}

const ManageScholarships = () => {
    const { token } = useAuth();
    const tableRef = useRef<HTMLTableElement>(null);
    const [scholarships, setScholarships] = useState<Scholarships[]>([]);
    const [datatable, setDatatable] = useState(null);

    const [newScholarship, setNewScholarship] = useState({
        name: "",
        description: "",
        min_gwa: "",
        max_income: "",
        ip_required: false,
    });

    const [editScholarship, setEditScholarship] = useState<any>(null);

    const fetchScholarships = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/scholarships/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setScholarships(response.data);
        } catch (error) {
            console.error("Error fetching scholarships:", error);
            await Swal.fire("Error", "Failed to load scholarships.", "error");
        }
    };

    const handleAddScholarship = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/scholarships/`, newScholarship, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchScholarships();
            (document.getElementById("addModalClose") as HTMLButtonElement)?.click();
        } catch (error) {
            console.error("Add error:", error);
            Swal.fire("Error", "Could not add scholarship.", "error");
        }
    };

    const handleEditScholarship = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/scholarships/${editScholarship.id}`, editScholarship, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchScholarships();
            (document.getElementById("editModalClose") as HTMLButtonElement)?.click();
        } catch (error) {
            console.error("Edit error:", error);
            Swal.fire("Error", "Could not update scholarship.", "error");
        }
    };

    const handleDeleteScholarship = async (id: number) => {
        const result = await Swal.fire({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this scholarship?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/api/scholarships/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await fetchScholarships();
            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire("Error", "Could not delete scholarship.", "error");
            }
        }
    };

    useEffect(() => {
        fetchScholarships();
    }, []);

    useEffect(() => {
        if (tableRef.current && scholarships.length > 0) {
            const newTable = new DataTable(tableRef.current);
            setDatatable(newTable);
        }
    }, [scholarships]);

    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i className="fas fa-hand-holding-usd"></i></div>
                                    Manage Scholarships
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-end">
                        <button className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addModal">
                            Add New Scholarship
                        </button>
                    </div>

                    <div className="card-body">
                        <table ref={tableRef} className="table table-bordered table-striped">
                            <thead>
                            <tr>
                                <th>Scholarship Name</th>
                                <th>Scholarship Description</th>
                                <th>Min GWA</th>
                                <th>Max Income</th>
                                <th>IP Required</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {scholarships.length > 0 ? (
                                scholarships.map((scholarship) => (
                                    <tr key={scholarship.id}>
                                        <td>{scholarship.name}</td>
                                        <td>{scholarship.description}</td>
                                        <td>{scholarship.rules?.min_gwa ?? '—'}</td>
                                        <td>{scholarship.rules?.max_income ?? '—'}</td>
                                        <td>{scholarship.rules?.ip_required ? 'Yes' : 'No'}</td>
                                        <td>
                                            <div className="btn-group" role="group">
                                                <button className="btn btn-outline-secondary btn-sm" title="Edit" data-bs-toggle="modal" data-bs-target="#editModal" onClick={() => setEditScholarship({ ...scholarship, ...scholarship.rules })}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-outline-danger btn-sm" title="Delete" onClick={() => handleDeleteScholarship(scholarship.id)}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted">
                                        No scholarships found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Scholarship Modal */}
            <div className="modal fade" id="addModal" tabIndex={-1} aria-labelledby="addModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="addModalLabel">
                                <i className="bi bi-plus-circle me-2"></i>
                                Add New Scholarship
                            </h1>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                id="addModalClose"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label htmlFor="addScholarshipName" className="form-label fw-semibold">
                                            Scholarship Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            id="addScholarshipName"
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="Enter scholarship name"
                                            value={newScholarship.name}
                                            onChange={(e) => setNewScholarship({ ...newScholarship, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="addScholarshipDescription" className="form-label fw-semibold">
                                            Description
                                        </label>
                                        <textarea
                                            id="addScholarshipDescription"
                                            className="form-control"
                                            rows="4"
                                            placeholder="Provide a detailed description of the scholarship program..."
                                            value={newScholarship.description}
                                            onChange={(e) => setNewScholarship({ ...newScholarship, description: e.target.value })}
                                        />
                                        <div className="form-text">
                                            Include eligibility criteria, benefits, and application process.
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="addMinGwa" className="form-label fw-semibold">
                                            Minimum GWA <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <input
                                                id="addMinGwa"
                                                type="number"
                                                step="0.01"
                                                min="1.00"
                                                max="5.00"
                                                className="form-control"
                                                placeholder="1.75"
                                                value={newScholarship.min_gwa}
                                                onChange={(e) => setNewScholarship({ ...newScholarship, min_gwa: e.target.value })}
                                                required
                                            />
                                            <span className="input-group-text">GWA</span>
                                        </div>
                                        <div className="form-text">Scale: 1.00 (highest) to 5.00 (lowest)</div>
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="addMaxIncome" className="form-label fw-semibold">
                                            Maximum Family Income
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">₱</span>
                                            <input
                                                id="addMaxIncome"
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                placeholder="50000"
                                                value={newScholarship.max_income}
                                                onChange={(e) => setNewScholarship({ ...newScholarship, max_income: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="card border-info">
                                            <div className="card-body p-3">
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="addIpRequired"
                                                        checked={newScholarship.ip_required}
                                                        onChange={(e) => setNewScholarship({ ...newScholarship, ip_required: e.target.checked })}
                                                    />
                                                    <label className="form-check-label fw-semibold" htmlFor="addIpRequired">
                                                        Indigenous Peoples (IP) Exclusive
                                                    </label>
                                                </div>
                                                <small className="text-muted">
                                                    Check this if the scholarship is exclusively for Indigenous Peoples
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer bg-light">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                            >
                                <i className="bi bi-x-circle me-1"></i>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddScholarship}
                                disabled={!newScholarship.name || !newScholarship.min_gwa}
                            >
                                <i className="bi bi-check-circle me-1"></i>
                                Save Scholarship
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Scholarship Modal */}
            {editScholarship && (
                <div className="modal fade" id="editModal" tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="editModalLabel">
                                    <i className="bi bi-pencil-square me-2"></i>
                                    Edit Scholarship
                                </h1>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    id="editModalClose"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label htmlFor="editScholarshipName" className="form-label fw-semibold">
                                                Scholarship Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="editScholarshipName"
                                                type="text"
                                                className="form-control form-control-lg"
                                                placeholder="Enter scholarship name"
                                                value={editScholarship.name}
                                                onChange={(e) => setEditScholarship({ ...editScholarship, name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="editScholarshipDescription" className="form-label fw-semibold">
                                                Description
                                            </label>
                                            <textarea
                                                id="editScholarshipDescription"
                                                className="form-control"
                                                rows="4"
                                                placeholder="Provide a detailed description of the scholarship program..."
                                                value={editScholarship.description}
                                                onChange={(e) => setEditScholarship({ ...editScholarship, description: e.target.value })}
                                            />
                                            <div className="form-text">
                                                Include eligibility criteria, benefits, and application process.
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="editMinGwa" className="form-label fw-semibold">
                                                Minimum GWA <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    id="editMinGwa"
                                                    type="number"
                                                    step="0.01"
                                                    min="1.00"
                                                    max="5.00"
                                                    className="form-control"
                                                    placeholder="1.75"
                                                    value={editScholarship.min_gwa}
                                                    onChange={(e) => setEditScholarship({ ...editScholarship, min_gwa: e.target.value })}
                                                    required
                                                />
                                                <span className="input-group-text">GWA</span>
                                            </div>
                                            <div className="form-text">Scale: 1.00 (highest) to 5.00 (lowest)</div>
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="editMaxIncome" className="form-label fw-semibold">
                                                Maximum Family Income
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text">₱</span>
                                                <input
                                                    id="editMaxIncome"
                                                    type="number"
                                                    min="0"
                                                    className="form-control"
                                                    placeholder="50000"
                                                    value={editScholarship.max_income}
                                                    onChange={(e) => setEditScholarship({ ...editScholarship, max_income: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="card border-info">
                                                <div className="card-body p-3">
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            id="editIpRequired"
                                                            checked={editScholarship.ip_required}
                                                            onChange={(e) => setEditScholarship({ ...editScholarship, ip_required: e.target.checked })}
                                                        />
                                                        <label className="form-check-label fw-semibold" htmlFor="editIpRequired">
                                                            Indigenous Peoples (IP) Exclusive
                                                        </label>
                                                    </div>
                                                    <small className="text-muted">
                                                        Check this if the scholarship is exclusively for Indigenous Peoples
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer bg-light">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={handleEditScholarship}
                                    disabled={!editScholarship.name || !editScholarship.min_gwa}
                                >
                                    <i className="bi bi-check-circle me-1"></i>
                                    Update Scholarship
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageScholarships;