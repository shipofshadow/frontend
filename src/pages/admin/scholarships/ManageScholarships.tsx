import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext.tsx";
import axios from "axios";
import { API_BASE_URL } from "../../../config.ts";
import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";

interface ScholarshipPriorities {
    must_be_ofw: boolean;
    prefer_farmers_child: boolean;
    require_ip: boolean;
    prefer_pwd: boolean;
}

interface ScholarshipRules {
    rule_id?: number;
    min_gwa?: number | null;
    max_gwa?: number | null;
    min_income?: number | null;
    max_income?: number | null;
    priorities: ScholarshipPriorities;
    preferred_course_ids: number[];
    preferred_department_ids: number[];
    preferred_campus_ids: number[];
    preferred_year_levels: number[];
    min_units_enrolled?: number | null;
    max_units_enrolled?: number | null;
}

interface Scholarship {
    id: number;
    name: string;
    description: string | null;
    grant_amount: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    rules?: ScholarshipRules | null;
}

interface ScholarshipForm {
    id: number | null;
    name: string;
    description: string;
    is_active: boolean;
    grant_amount: string | number;
    rules: {
        min_gwa?: string | number;
        max_gwa?: string | number;
        min_income?: string | number;
        max_income?: string | number;
        priorities: ScholarshipPriorities;
        preferred_course_ids: number[];
        preferred_department_ids: number[];
        preferred_campus_ids: number[];
        preferred_year_levels: number[];
        min_units_enrolled?: string | number;
        max_units_enrolled?: string | number;
    };
}

const ManageScholarships = () => {
    const { token } = useAuth();
    const tableRef = useRef<HTMLTableElement>(null);
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [datatable, setDatatable] = useState<DataTable | null>(null);
    const [viewScholarship, setViewScholarship] = useState<Scholarship | null>(null);

    const [newScholarship, setNewScholarship] = useState<ScholarshipForm>({
        id: null,
        name: "",
        description: "",
        grant_amount: "",
        is_active: true,
        rules: {
            min_gwa: "",
            max_gwa: "",
            min_income: "",
            max_income: "",
            priorities: {
                must_be_ofw: false,
                prefer_farmers_child: false,
                require_ip: false,
                prefer_pwd: false,
            },
            preferred_course_ids: [],
            preferred_department_ids: [],
            preferred_campus_ids: [],
            preferred_year_levels: [],
            min_units_enrolled: "",
            max_units_enrolled: "",
        }
    });

    const [editScholarship, setEditScholarship] = useState<ScholarshipForm | null>(null);

    const fetchScholarships = async () => {
        try {
            const response = await axios.get<Scholarship[]>(`${API_BASE_URL}/api/scholarships/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setScholarships(response.data);

            if (datatable) {
                datatable.destroy();
                setDatatable(null);
            }
        } catch (error) {
            console.error("Error fetching scholarships:", error);
            await Swal.fire("Error", "Failed to load scholarships.", "error");
        }
    };

    const convertToApiFormat = (form: ScholarshipForm) => {
        return {
            name: form.name,
            description: form.description || null,
            grant_amount: form.grant_amount ? Number(form.grant_amount) : 0,
            is_active: form.is_active,
            rules: {
                min_gwa: form.rules.min_gwa ? Number(form.rules.min_gwa) : null,
                max_gwa: form.rules.max_gwa ? Number(form.rules.max_gwa) : null,
                min_income: form.rules.min_income ? Number(form.rules.min_income) : null,
                max_income: form.rules.max_income ? Number(form.rules.max_income) : null,
                priorities: form.rules.priorities,
                preferred_course_ids: form.rules.preferred_course_ids,
                preferred_department_ids: form.rules.preferred_department_ids,
                preferred_campus_ids: form.rules.preferred_campus_ids,
                preferred_year_levels: form.rules.preferred_year_levels,
                min_units_enrolled: form.rules.min_units_enrolled ? Number(form.rules.min_units_enrolled) : null,
                max_units_enrolled: form.rules.max_units_enrolled ? Number(form.rules.max_units_enrolled) : null,
            }
        };
    };

    const handleAddScholarship = async () => {
        try {
            const payload = convertToApiFormat(newScholarship);

            await axios.post(`${API_BASE_URL}/api/scholarships/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchScholarships();

            setNewScholarship({
                id: null,
                name: "",
                description: "",
                grant_amount: "",
                is_active: true,
                rules: {
                    min_gwa: "",
                    max_gwa: "",
                    min_income: "",
                    max_income: "",
                    priorities: {
                        must_be_ofw: false,
                        prefer_farmers_child: false,
                        require_ip: false,
                        prefer_pwd: false,
                    },
                    preferred_course_ids: [],
                    preferred_department_ids: [],
                    preferred_campus_ids: [],
                    preferred_year_levels: [],
                    min_units_enrolled: "",
                    max_units_enrolled: "",
                }
            });

            (document.getElementById("addModalClose") as HTMLButtonElement)?.click();
            await Swal.fire("Success", "Scholarship created successfully!", "success");
        } catch (error) {
            console.error("Add error:", error);
            await Swal.fire("Error", "Could not add scholarship.", "error");
        }
    };

    const handleEditScholarship = async () => {
        if (!editScholarship) {
            await Swal.fire("Error", "No scholarship selected for editing.", "error");
            return;
        }

        try {
            const payload = convertToApiFormat(editScholarship);

            await axios.put(`${API_BASE_URL}/api/scholarships/${editScholarship.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchScholarships();
            (document.getElementById("editModalClose") as HTMLButtonElement)?.click();
            await Swal.fire("Success", "Scholarship updated successfully!", "success");
        } catch (error) {
            console.error("Edit error:", error);
            await Swal.fire("Error", "Could not update scholarship.", "error");
        }
    };

    const handleDeleteScholarship = async (id: number) => {
        const result = await Swal.fire({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this scholarship?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "#d33"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/api/scholarships/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await fetchScholarships();
                await Swal.fire("Deleted!", "Scholarship has been deleted.", "success");
            } catch (error) {
                console.error("Delete error:", error);
                await Swal.fire("Error", "Could not delete scholarship.", "error");
            }
        }
    };

    const handleEditClick = (scholarship: Scholarship) => {
        setEditScholarship({
            id: scholarship.id,
            name: scholarship.name,
            description: scholarship.description || "",
            grant_amount: scholarship.grant_amount || "",
            is_active: scholarship.is_active,
            rules: {
                min_gwa: scholarship.rules?.min_gwa || "",
                max_gwa: scholarship.rules?.max_gwa || "",
                min_income: scholarship.rules?.min_income || "",
                max_income: scholarship.rules?.max_income || "",
                priorities: scholarship.rules?.priorities || {
                    must_be_ofw: false,
                    prefer_farmers_child: false,
                    require_ip: false,
                    prefer_pwd: false,
                },
                preferred_course_ids: scholarship.rules?.preferred_course_ids || [],
                preferred_department_ids: scholarship.rules?.preferred_department_ids || [],
                preferred_campus_ids: scholarship.rules?.preferred_campus_ids || [],
                preferred_year_levels: scholarship.rules?.preferred_year_levels || [],
                min_units_enrolled: scholarship.rules?.min_units_enrolled || "",
                max_units_enrolled: scholarship.rules?.max_units_enrolled || "",
            }
        });
    };

    const handleViewClick = (scholarship: Scholarship) => {
        setViewScholarship(scholarship);
    };

    useEffect(() => {
        fetchScholarships().catch((err) =>
            console.error("Promise rejection in fetchScholarships:", err)
        );
    }, []);

    useEffect(() => {
        if (tableRef.current && scholarships.length > 0 && !datatable) {
            const dt = new DataTable(tableRef.current, {
                searchable: true,
                perPageSelect: [5, 10, 25, 50],
                perPage: 10,
                labels: {
                    placeholder: "Search scholarships...",
                    noRows: "No scholarships found",
                }
            });
            setDatatable(dt);
        }
    }, [scholarships, datatable]);

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
                .badge-priority {
                    font-size: 0.7rem;
                    padding: 0.25em 0.5em;
                }
                .table-actions .btn {
                    margin: 0 2px;
                }
                .modal-section-title {
                    color: #0d6efd;
                    font-weight: 600;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 0.5rem;
                    margin-bottom: 1rem;
                }
                .form-check-input:checked {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
                .table thead th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #dee2e6;
                }
                .scholarship-card {
                    border-left: 4px solid #0d6efd;
                }
                .info-row {
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #f1f3f5;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .modal-backdrop.show {
                    opacity: 0.5;
                }
            `}</style>

            {/* Header */}
            <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container-fluid px-4">
                    <div className="py-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-primary bg-opacity-10 rounded">
                                    <i className="fas fa-graduation-cap fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold">Manage Scholarships</h1>
                                    <p className="text-muted mb-0 small">Create and configure scholarship programs with eligibility rules</p>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center"
                                data-bs-toggle="modal"
                                data-bs-target="#addModal"
                            >
                                <i className="fas fa-plus me-2"></i>
                                Add Scholarship
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Scholarships</p>
                                        <h3 className="mb-0 fw-bold">{scholarships.length}</h3>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-award fa-2x text-primary"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Active Programs</p>
                                        <h3 className="mb-0 fw-bold text-success">
                                            {scholarships.filter(s => s.is_active).length}
                                        </h3>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-check-circle fa-2x text-success"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Inactive Programs</p>
                                        <h3 className="mb-0 fw-bold text-danger">
                                            {scholarships.filter(s => !s.is_active).length}
                                        </h3>
                                    </div>
                                    <div className="bg-danger bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-times-circle fa-2x text-danger"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Table Card */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom py-3">
                        <h5 className="mb-0 fw-semibold">
                            <i className="fas fa-list me-2 text-primary"></i>
                            Scholarship Programs
                        </h5>
                    </div>

                    <div className="card-body p-0">
                        {scholarships.length > 0 ? (
                            <div className="table-responsive">
                                <table ref={tableRef} className="table table-hover mb-0 align-middle">
                                    <thead>
                                    <tr>
                                        <th className="border-0">Name</th>
                                        <th className="border-0">Description</th>
                                        <th className="border-0 text-end">Grant Amount</th>
                                        <th className="border-0 text-center">GWA Range</th>
                                        <th className="border-0 text-end">Income Limit</th>
                                        <th className="border-0 text-center">Priorities</th>
                                        <th className="border-0 text-center">Status</th>
                                        <th className="border-0 text-center">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {scholarships.map((scholarship) => (
                                        <tr key={scholarship.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                                                        <i className="fas fa-trophy text-primary"></i>
                                                    </div>
                                                    <strong>{scholarship.name}</strong>
                                                </div>
                                            </td>
                                            <td className="small text-muted" style={{ maxWidth: '200px' }}>
                                                {scholarship.description
                                                    ? (scholarship.description.length > 60
                                                        ? scholarship.description.substring(0, 60) + "..."
                                                        : scholarship.description)
                                                    : <span className="fst-italic">No description</span>
                                                }
                                            </td>
                                            <td className="text-end fw-semibold text-success">
                                                ₱{scholarship.grant_amount.toLocaleString()}
                                            </td>
                                            <td className="text-center small">
                                                <span className="badge bg-light text-dark border">
                                                    {scholarship.rules?.min_gwa ?? "—"} - {scholarship.rules?.max_gwa ?? "—"}
                                                </span>
                                            </td>
                                            <td className="text-end small">
                                                {scholarship.rules?.max_income != null
                                                    ? `₱${scholarship.rules.max_income.toLocaleString()}`
                                                    : "—"}
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1 justify-content-center">
                                                    {scholarship.rules?.priorities?.must_be_ofw && (
                                                        <span className="badge badge-priority bg-success" title="Must be OFW">OFW</span>
                                                    )}
                                                    {scholarship.rules?.priorities?.prefer_farmers_child && (
                                                        <span className="badge badge-priority bg-info" title="Prefer Farmer's Child">Farmer</span>
                                                    )}
                                                    {scholarship.rules?.priorities?.require_ip && (
                                                        <span className="badge badge-priority bg-warning text-dark" title="Require IP">IP</span>
                                                    )}
                                                    {scholarship.rules?.priorities?.prefer_pwd && (
                                                        <span className="badge badge-priority bg-primary" title="Prefer PWD">PWD</span>
                                                    )}
                                                    {!scholarship.rules?.priorities?.must_be_ofw &&
                                                        !scholarship.rules?.priorities?.prefer_farmers_child &&
                                                        !scholarship.rules?.priorities?.require_ip &&
                                                        !scholarship.rules?.priorities?.prefer_pwd && (
                                                            <span className="text-muted small fst-italic">None</span>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge ${scholarship.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                    {scholarship.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center table-actions">
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        title="View Details"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#viewModal"
                                                        onClick={() => handleViewClick(scholarship)}
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Edit"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#editModal"
                                                        onClick={() => handleEditClick(scholarship)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Delete"
                                                        onClick={() => handleDeleteScholarship(scholarship.id)}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <i className="fas fa-inbox fa-3x text-muted mb-3 opacity-25"></i>
                                <h5 className="text-muted">No scholarships found</h5>
                                <p className="text-muted small mb-3">Create your first scholarship program to get started</p>
                                <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addModal">
                                    <i className="fas fa-plus me-1"></i>
                                    Add Scholarship
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Scholarship Modal */}
            {viewScholarship && (
                <div className="modal fade" id="viewModal" tabIndex={-1} aria-labelledby="viewModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header border-0 bg-light">
                                <div>
                                    <h5 className="modal-title fw-bold" id="viewModalLabel">
                                        <i className="fas fa-trophy text-primary me-2"></i>
                                        {viewScholarship.name}
                                    </h5>
                                    <p className="text-muted small mb-0">Scholarship Details</p>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="scholarship-card card border mb-3">
                                    <div className="card-body">
                                        <h6 className="modal-section-title">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Basic Information
                                        </h6>
                                        <div className="info-row">
                                            <div className="row">
                                                <div className="col-4 text-muted small">Scholarship Name:</div>
                                                <div className="col-8 fw-semibold">{viewScholarship.name}</div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="row">
                                                <div className="col-4 text-muted small">Description:</div>
                                                <div className="col-8">{viewScholarship.description || <span className="fst-italic text-muted">No description</span>}</div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="row">
                                                <div className="col-4 text-muted small">Grant Amount:</div>
                                                <div className="col-8 fw-bold text-success">₱{viewScholarship.grant_amount.toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="row">
                                                <div className="col-4 text-muted small">Status:</div>
                                                <div className="col-8">
                                                    <span className={`badge ${viewScholarship.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                        {viewScholarship.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="scholarship-card card border mb-3">
                                    <div className="card-body">
                                        <h6 className="modal-section-title">
                                            <i className="fas fa-graduation-cap me-2"></i>
                                            Academic Requirements
                                        </h6>
                                        <div className="info-row">
                                            <div className="row">
                                                <div className="col-4 text-muted small">GWA Range:</div>
                                                <div className="col-8">
                                                    <span className="badge bg-light text-dark border">
                                                        {viewScholarship.rules?.min_gwa ?? "—"} to {viewScholarship.rules?.max_gwa ?? "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="row">
                                                <div className="col-4 text-muted small">Units Range:</div>
                                                <div className="col-8">
                                                    {viewScholarship.rules?.min_units_enrolled ?? "—"} to {viewScholarship.rules?.max_units_enrolled ?? "—"} units
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="scholarship-card card border mb-3">
                                    <div className="card-body">
                                        <h6 className="modal-section-title">
                                            <i className="fas fa-money-bill-wave me-2"></i>
                                            Financial Requirements
                                        </h6>
                                        <div className="info-row">
                                            <div className="row">
                                                <div className="col-4 text-muted small">Income Range:</div>
                                                <div className="col-8">
                                                    ₱{viewScholarship.rules?.min_income?.toLocaleString() ?? "0"} to ₱{viewScholarship.rules?.max_income?.toLocaleString() ?? "No limit"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="scholarship-card card border">
                                    <div className="card-body">
                                        <h6 className="modal-section-title">
                                            <i className="fas fa-users me-2"></i>
                                            Priority Settings
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            <span className={`badge ${viewScholarship.rules?.priorities?.must_be_ofw ? 'bg-success' : 'bg-secondary'}`}>
                                                {viewScholarship.rules?.priorities?.must_be_ofw ? '✓' : '✗'} Must be OFW
                                            </span>
                                            <span className={`badge ${viewScholarship.rules?.priorities?.prefer_farmers_child ? 'bg-info' : 'bg-secondary'}`}>
                                                {viewScholarship.rules?.priorities?.prefer_farmers_child ? '✓' : '✗'} Prefer Farmer's Child
                                            </span>
                                            <span className={`badge ${viewScholarship.rules?.priorities?.require_ip ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                {viewScholarship.rules?.priorities?.require_ip ? '✓' : '✗'} Require IP
                                            </span>
                                            <span className={`badge ${viewScholarship.rules?.priorities?.prefer_pwd ? 'bg-primary' : 'bg-secondary'}`}>
                                                {viewScholarship.rules?.priorities?.prefer_pwd ? '✓' : '✗'} Prefer PWD
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 bg-light">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-dismiss="modal"
                                    data-bs-toggle="modal"
                                    data-bs-target="#editModal"
                                    onClick={() => handleEditClick(viewScholarship)}
                                >
                                    <i className="fas fa-edit me-1"></i>
                                    Edit Scholarship
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Scholarship Modal */}
            <div className="modal fade" id="addModal" tabIndex={-1} aria-labelledby="addModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header border-0 bg-primary text-white">
                            <h5 className="modal-title" id="addModalLabel">
                                <i className="fas fa-plus-circle me-2"></i>
                                Create New Scholarship
                            </h5>
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
                                <div className="row g-4">
                                    <div className="col-12">
                                        <h6 className="modal-section-title">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Basic Information
                                        </h6>
                                    </div>

                                    <div className="col-md-4">
                                        <label htmlFor="addScholarshipName" className="form-label fw-semibold">
                                            Scholarship Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            id="addScholarshipName"
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., Presidential Scholarship"
                                            value={newScholarship.name}
                                            onChange={(e) => setNewScholarship({ ...newScholarship, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Grant Amount (₱)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="e.g., 5000"
                                            value={newScholarship.grant_amount}
                                            onChange={(e) => setNewScholarship({ ...newScholarship, grant_amount: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label htmlFor="addIsActive" className="form-label fw-semibold">
                                            Status
                                        </label>
                                        <select
                                            id="addIsActive"
                                            className="form-select"
                                            value={newScholarship.is_active ? "true" : "false"}
                                            onChange={(e) => setNewScholarship({ ...newScholarship, is_active: e.target.value === "true" })}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="addScholarshipDescription" className="form-label fw-semibold">
                                            Description
                                        </label>
                                        <textarea
                                            id="addScholarshipDescription"
                                            className="form-control"
                                            rows={3}
                                            placeholder="Describe the scholarship program, eligibility criteria, and benefits..."
                                            value={newScholarship.description}
                                            onChange={(e) => setNewScholarship({ ...newScholarship, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-12 mt-4">
                                        <h6 className="modal-section-title">
                                            <i className="fas fa-graduation-cap me-2"></i>
                                            Academic Requirements
                                        </h6>
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="addMinGwa" className="form-label fw-semibold">
                                            Minimum GWA
                                        </label>
                                        <input
                                            id="addMinGwa"
                                            type="number"
                                            step="0.01"
                                            min="1.00"
                                            max="5.00"
                                            className="form-control"
                                            placeholder="1.00"
                                            value={newScholarship.rules.min_gwa}
                                            onChange={(e) => setNewScholarship({
                                                ...newScholarship,
                                                rules: { ...newScholarship.rules, min_gwa: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="addMaxGwa" className="form-label fw-semibold">
                                            Maximum GWA
                                        </label>
                                        <input
                                            id="addMaxGwa"
                                            type="number"
                                            step="0.01"
                                            min="1.00"
                                            max="5.00"
                                            className="form-control"
                                            placeholder="2.50"
                                            value={newScholarship.rules.max_gwa}
                                            onChange={(e) => setNewScholarship({
                                                ...newScholarship,
                                                rules: { ...newScholarship.rules, max_gwa: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="addMinUnits" className="form-label fw-semibold">
                                            Minimum Units
                                        </label>
                                        <input
                                            id="addMinUnits"
                                            type="number"
                                            min="1"
                                            max="30"
                                            className="form-control"
                                            placeholder="12"
                                            value={newScholarship.rules.min_units_enrolled}
                                            onChange={(e) => setNewScholarship({
                                                ...newScholarship,
                                                rules: { ...newScholarship.rules, min_units_enrolled: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="addMaxUnits" className="form-label fw-semibold">
                                            Maximum Units
                                        </label>
                                        <input
                                            id="addMaxUnits"
                                            type="number"
                                            min="1"
                                            max="30"
                                            className="form-control"
                                            placeholder="30"
                                            value={newScholarship.rules.max_units_enrolled}
                                            onChange={(e) => setNewScholarship({
                                                ...newScholarship,
                                                rules: { ...newScholarship.rules, max_units_enrolled: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="col-12 mt-4">
                                        <h6 className="modal-section-title">
                                            <i className="fas fa-money-bill-wave me-2"></i>
                                            Financial Requirements
                                        </h6>
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="addMinIncome" className="form-label fw-semibold">
                                            Minimum Family Income
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">₱</span>
                                            <input
                                                id="addMinIncome"
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                placeholder="0"
                                                value={newScholarship.rules.min_income}
                                                onChange={(e) => setNewScholarship({
                                                    ...newScholarship,
                                                    rules: { ...newScholarship.rules, min_income: e.target.value }
                                                })}
                                            />
                                        </div>
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
                                                value={newScholarship.rules.max_income}
                                                onChange={(e) => setNewScholarship({
                                                    ...newScholarship,
                                                    rules: { ...newScholarship.rules, max_income: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 mt-4">
                                        <h6 className="modal-section-title">
                                            <i className="fas fa-users me-2"></i>
                                            Priority Settings
                                        </h6>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="addMustBeOfw"
                                                checked={newScholarship.rules.priorities.must_be_ofw}
                                                onChange={(e) => setNewScholarship({
                                                    ...newScholarship,
                                                    rules: {
                                                        ...newScholarship.rules,
                                                        priorities: {
                                                            ...newScholarship.rules.priorities,
                                                            must_be_ofw: e.target.checked
                                                        }
                                                    }
                                                })}
                                            />
                                            <label className="form-check-label" htmlFor="addMustBeOfw">
                                                Must be OFW
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="addPreferFarmersChild"
                                                checked={newScholarship.rules.priorities.prefer_farmers_child}
                                                onChange={(e) => setNewScholarship({
                                                    ...newScholarship,
                                                    rules: {
                                                        ...newScholarship.rules,
                                                        priorities: {
                                                            ...newScholarship.rules.priorities,
                                                            prefer_farmers_child: e.target.checked
                                                        }
                                                    }
                                                })}
                                            />
                                            <label className="form-check-label" htmlFor="addPreferFarmersChild">
                                                Prefer Farmer's Child
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="addRequireIp"
                                                checked={newScholarship.rules.priorities.require_ip}
                                                onChange={(e) => setNewScholarship({
                                                    ...newScholarship,
                                                    rules: {
                                                        ...newScholarship.rules,
                                                        priorities: {
                                                            ...newScholarship.rules.priorities,
                                                            require_ip: e.target.checked
                                                        }
                                                    }
                                                })}
                                            />
                                            <label className="form-check-label" htmlFor="addRequireIp">
                                                Require IP
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="addPreferPwd"
                                                checked={newScholarship.rules.priorities.prefer_pwd}
                                                onChange={(e) => setNewScholarship({
                                                    ...newScholarship,
                                                    rules: {
                                                        ...newScholarship.rules,
                                                        priorities: {
                                                            ...newScholarship.rules.priorities,
                                                            prefer_pwd: e.target.checked
                                                        }
                                                    }
                                                })}
                                            />
                                            <label className="form-check-label" htmlFor="addPreferPwd">
                                                Prefer PWD
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-0 bg-light">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                <i className="fas fa-times me-1"></i>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddScholarship}
                                disabled={!newScholarship.name.trim()}
                            >
                                <i className="fas fa-check me-1"></i>
                                Create Scholarship
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Scholarship Modal */}
            {editScholarship && (
                <div className="modal fade" id="editModal" tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header border-0 bg-warning">
                                <h5 className="modal-title text-dark" id="editModalLabel">
                                    <i className="fas fa-edit me-2"></i>
                                    Edit: {editScholarship.name}
                                </h5>
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
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <h6 className="modal-section-title">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Basic Information
                                            </h6>
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="editScholarshipName" className="form-label fw-semibold">
                                                Scholarship Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="editScholarshipName"
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter scholarship name"
                                                value={editScholarship.name}
                                                onChange={(e) => setEditScholarship({ ...editScholarship, name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold">Grant Amount (₱)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter grant amount"
                                                value={editScholarship.grant_amount}
                                                onChange={(e) => setEditScholarship({ ...editScholarship, grant_amount: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="editIsActive" className="form-label fw-semibold">
                                                Status
                                            </label>
                                            <select
                                                id="editIsActive"
                                                className="form-select"
                                                value={editScholarship.is_active ? "true" : "false"}
                                                onChange={(e) => setEditScholarship({ ...editScholarship, is_active: e.target.value === "true" })}
                                            >
                                                <option value="true">Active</option>
                                                <option value="false">Inactive</option>
                                            </select>
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="editScholarshipDescription" className="form-label fw-semibold">
                                                Description
                                            </label>
                                            <textarea
                                                id="editScholarshipDescription"
                                                className="form-control"
                                                rows={3}
                                                placeholder="Provide a detailed description..."
                                                value={editScholarship.description}
                                                onChange={(e) => setEditScholarship({ ...editScholarship, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-12 mt-4">
                                            <h6 className="modal-section-title">
                                                <i className="fas fa-graduation-cap me-2"></i>
                                                Academic Requirements
                                            </h6>
                                        </div>

                                        <div className="col-md-3">
                                            <label htmlFor="editMinGwa" className="form-label fw-semibold">
                                                Minimum GWA
                                            </label>
                                            <input
                                                id="editMinGwa"
                                                type="number"
                                                step="0.01"
                                                min="1.00"
                                                max="5.00"
                                                className="form-control"
                                                placeholder="1.00"
                                                value={editScholarship.rules?.min_gwa || ""}
                                                onChange={(e) => setEditScholarship({
                                                    ...editScholarship,
                                                    rules: {
                                                        ...editScholarship.rules,
                                                        min_gwa: e.target.value
                                                    }
                                                })}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label htmlFor="editMaxGwa" className="form-label fw-semibold">
                                                Maximum GWA
                                            </label>
                                            <input
                                                id="editMaxGwa"
                                                type="number"
                                                step="0.01"
                                                min="1.00"
                                                max="5.00"
                                                className="form-control"
                                                placeholder="2.50"
                                                value={editScholarship.rules?.max_gwa || ""}
                                                onChange={(e) => setEditScholarship({
                                                    ...editScholarship,
                                                    rules: {
                                                        ...editScholarship.rules,
                                                        max_gwa: e.target.value
                                                    }
                                                })}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label htmlFor="editMinUnits" className="form-label fw-semibold">
                                                Minimum Units
                                            </label>
                                            <input
                                                id="editMinUnits"
                                                type="number"
                                                min="1"
                                                max="30"
                                                className="form-control"
                                                placeholder="12"
                                                value={editScholarship.rules?.min_units_enrolled || ""}
                                                onChange={(e) => setEditScholarship({
                                                    ...editScholarship,
                                                    rules: {
                                                        ...editScholarship.rules,
                                                        min_units_enrolled: e.target.value
                                                    }
                                                })}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label htmlFor="editMaxUnits" className="form-label fw-semibold">
                                                Maximum Units
                                            </label>
                                            <input
                                                id="editMaxUnits"
                                                type="number"
                                                min="1"
                                                max="30"
                                                className="form-control"
                                                placeholder="30"
                                                value={editScholarship.rules?.max_units_enrolled || ""}
                                                onChange={(e) => setEditScholarship({
                                                    ...editScholarship,
                                                    rules: {
                                                        ...editScholarship.rules,
                                                        max_units_enrolled: e.target.value
                                                    }
                                                })}
                                            />
                                        </div>

                                        <div className="col-12 mt-4">
                                            <h6 className="modal-section-title">
                                                <i className="fas fa-money-bill-wave me-2"></i>
                                                Financial Requirements
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="editMinIncome" className="form-label fw-semibold">
                                                Minimum Family Income
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text">₱</span>
                                                <input
                                                    id="editMinIncome"
                                                    type="number"
                                                    min="0"
                                                    className="form-control"
                                                    placeholder="0"
                                                    value={editScholarship.rules?.min_income || ""}
                                                    onChange={(e) => setEditScholarship({
                                                        ...editScholarship,
                                                        rules: {
                                                            ...editScholarship.rules,
                                                            min_income: e.target.value
                                                        }
                                                    })}
                                                />
                                            </div>
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
                                                    value={editScholarship.rules?.max_income || ""}
                                                    onChange={(e) => setEditScholarship({
                                                        ...editScholarship,
                                                        rules: {
                                                            ...editScholarship.rules,
                                                            max_income: e.target.value
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-12 mt-4">
                                            <h6 className="modal-section-title">
                                                <i className="fas fa-users me-2"></i>
                                                Priority Settings
                                            </h6>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="editMustBeOfw"
                                                    checked={editScholarship.rules?.priorities?.must_be_ofw || false}
                                                    onChange={(e) => setEditScholarship({
                                                        ...editScholarship,
                                                        rules: {
                                                            ...editScholarship.rules,
                                                            priorities: {
                                                                ...editScholarship.rules?.priorities,
                                                                must_be_ofw: e.target.checked
                                                            }
                                                        }
                                                    })}
                                                />
                                                <label className="form-check-label" htmlFor="editMustBeOfw">
                                                    Must be OFW
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="editPreferFarmersChild"
                                                    checked={editScholarship.rules?.priorities?.prefer_farmers_child || false}
                                                    onChange={(e) => setEditScholarship({
                                                        ...editScholarship,
                                                        rules: {
                                                            ...editScholarship.rules,
                                                            priorities: {
                                                                ...editScholarship.rules?.priorities,
                                                                prefer_farmers_child: e.target.checked
                                                            }
                                                        }
                                                    })}
                                                />
                                                <label className="form-check-label" htmlFor="editPreferFarmersChild">
                                                    Prefer Farmer's Child
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="editRequireIp"
                                                    checked={editScholarship.rules?.priorities?.require_ip || false}
                                                    onChange={(e) => setEditScholarship({
                                                        ...editScholarship,
                                                        rules: {
                                                            ...editScholarship.rules,
                                                            priorities: {
                                                                ...editScholarship.rules?.priorities,
                                                                require_ip: e.target.checked
                                                            }
                                                        }
                                                    })}
                                                />
                                                <label className="form-check-label" htmlFor="editRequireIp">
                                                    Require IP
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="editPreferPwd"
                                                    checked={editScholarship.rules?.priorities?.prefer_pwd || false}
                                                    onChange={(e) => setEditScholarship({
                                                        ...editScholarship,
                                                        rules: {
                                                            ...editScholarship.rules,
                                                            priorities: {
                                                                ...editScholarship.rules?.priorities,
                                                                prefer_pwd: e.target.checked
                                                            }
                                                        }
                                                    })}
                                                />
                                                <label className="form-check-label" htmlFor="editPreferPwd">
                                                    Prefer PWD
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer border-0 bg-light">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    <i className="fas fa-times me-1"></i>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={handleEditScholarship}
                                    disabled={!editScholarship.name?.trim()}
                                >
                                    <i className="fas fa-save me-1"></i>
                                    Save Changes
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
