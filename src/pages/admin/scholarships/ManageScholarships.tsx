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

interface NewScholarshipForm {
    name: string;
    description: string;
    is_active: boolean;
    grant_amount: number;
    rules: {
        min_gwa: string;
        max_gwa: string;
        min_income: string;
        max_income: string;
        priorities: ScholarshipPriorities;
        preferred_course_ids: number[];
        preferred_department_ids: number[];
        preferred_campus_ids: number[];
        preferred_year_levels: number[];
        min_units_enrolled: string;
        max_units_enrolled: string;
    };
}

const ManageScholarships = () => {
    const { token } = useAuth();
    const tableRef = useRef<HTMLTableElement>(null);
    const [scholarships, setScholarships] = useState<Scholarship>();
    const [datatable, setDatatable] = useState<DataTable | null>(null);
    const [editScholarship, setEditScholarship] = useState<Scholarship>();

    const [newScholarship, setNewScholarship] = useState<NewScholarshipForm>({
        name: "",
        description: "",
        grant_amount: 0,
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


    const fetchScholarships = async () => {
        try {
            const response = await axios.get<Scholarship>(`${API_BASE_URL}/api/scholarships/`, {
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

    const handleAddScholarship = async () => {
        try {
            // Convert form data to API format
            const payload = {
                name: newScholarship.name,
                description: newScholarship.description || null,
                grant_amount: newScholarship.grant_amount || 0,
                is_active: newScholarship.is_active,
                rules: {
                    min_gwa: newScholarship.rules.min_gwa ? parseFloat(newScholarship.rules.min_gwa) : null,
                    max_gwa: newScholarship.rules.max_gwa ? parseFloat(newScholarship.rules.max_gwa) : null,
                    min_income: newScholarship.rules.min_income ? parseInt(newScholarship.rules.min_income) : null,
                    max_income: newScholarship.rules.max_income ? parseInt(newScholarship.rules.max_income) : null,
                    priorities: newScholarship.rules.priorities,
                    preferred_course_ids: newScholarship.rules.preferred_course_ids,
                    preferred_department_ids: newScholarship.rules.preferred_department_ids,
                    preferred_campus_ids: newScholarship.rules.preferred_campus_ids,
                    preferred_year_levels: newScholarship.rules.preferred_year_levels,
                    min_units_enrolled: newScholarship.rules.min_units_enrolled ? parseInt(newScholarship.rules.min_units_enrolled) : null,
                    max_units_enrolled: newScholarship.rules.max_units_enrolled ? parseInt(newScholarship.rules.max_units_enrolled) : null,
                }
            };

            await axios.post(`${API_BASE_URL}/api/scholarships/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchScholarships();

            // Reset form
            setNewScholarship({
                name: "",
                description: "",
                grant_amount: 0,
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
            const errorMessage = error.response?.data?.error || "Could not add scholarship.";
            await Swal.fire("Error", errorMessage, "error");
        }
    };

    const handleEditScholarship = async () => {
        try {

            const payload = {
                name: editScholarship.name,
                description: editScholarship.description || null,
                grant_amount: editScholarship.grant_amount || 0,
                is_active: editScholarship.is_active,
                rules: {
                    min_gwa: editScholarship.rules?.min_gwa || null,
                    max_gwa: editScholarship.rules?.max_gwa || null,
                    min_income: editScholarship.rules?.min_income || null,
                    max_income: editScholarship.rules?.max_income || null,
                    priorities: editScholarship.rules?.priorities || {
                        must_be_ofw: false,
                        prefer_farmers_child: false,
                        require_ip: false,
                        prefer_pwd: false,
                    },
                    preferred_course_ids: editScholarship.rules?.preferred_course_ids || [],
                    preferred_department_ids: editScholarship.rules?.preferred_department_ids || [],
                    preferred_campus_ids: editScholarship.rules?.preferred_campus_ids || [],
                    preferred_year_levels: editScholarship.rules?.preferred_year_levels || [],
                    min_units_enrolled: editScholarship.rules?.min_units_enrolled || null,
                    max_units_enrolled: editScholarship.rules?.max_units_enrolled || null,
                }
            };

            await axios.put<NewScholarshipForm>(`${API_BASE_URL}/api/scholarships/${editScholarship.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchScholarships();
            setEditScholarship(null);
            (document.getElementById("editModalClose") as HTMLButtonElement)?.click();
            await Swal.fire("Success", "Scholarship updated successfully!", "success");
        } catch (error: any) {
            console.error("Edit error:", error);
            const errorMessage = error.response?.data?.error || "Could not update scholarship.";
            Swal.fire("Error", errorMessage, "error");
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
            } catch (error: any) {
                console.error("Delete error:", error);
                const errorMessage = error.response?.data?.error || "Could not delete scholarship.";
                Swal.fire("Error", errorMessage, "error");
            }
        }
    };

    const handleEditClick = (scholarship: Scholarship) => {
        setEditScholarship({
            id: scholarship.id,
            name: scholarship.name,
            description: scholarship.description || "",
            grant_amount: scholarship.grant_amount || 0,
            is_active: scholarship.is_active,
            rules: scholarship.rules || {
                min_gwa: null,
                max_gwa: null,
                min_income: null,
                max_income: null,
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
                min_units_enrolled: null,
                max_units_enrolled: null,
            }
        });

    };

    useEffect(() => {
        fetchScholarships();
    }, []);

    useEffect(() => {
        if (tableRef.current && scholarships.length > 0) {
            const newTable = new DataTable(tableRef.current, {
                searchable: true,
                sortable: true,
                paging: true,
                perPage: 10,
            });
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
                                    <div className="page-header-icon"><i className="fas fa-graduation-cap"></i></div>
                                    Manage Scholarships
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Scholarship Programs</h5>
                        <button className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addModal">
                            <i className="fas fa-plus me-1"></i>
                            Add New Scholarship
                        </button>
                    </div>

                    <div className="card-body">
                        <div className="table-responsive">
                            <table ref={tableRef} className="table table-bordered table-striped">
                                <thead className="table-dark">
                                <tr>
                                    <th>Scholarship Name</th>
                                    <th>Description</th>
                                    <th>Grant Amount</th>
                                    <th>GWA Range</th>
                                    <th>Income Limit</th>
                                    <th>Must be OFW</th>
                                    <th>Prefer Farmer's Child</th>
                                    <th>Require IP</th>
                                    <th>Prefer PWD</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {scholarships.length > 0 ? (
                                    scholarships.map((scholarship) => (
                                        <tr key={scholarship.id}>
                                            <td>
                                                <strong>{scholarship.name}</strong>
                                            </td>
                                            <td>
                                                <span className="text-muted" title={scholarship.description || "No description"}>
                                                    {scholarship.description ?
                                                        (scholarship.description.length > 50 ?
                                                                scholarship.description.substring(0, 50) + "..."
                                                                : scholarship.description
                                                        )
                                                        : "No description"
                                                    }
                                                </span>
                                            </td>
                                            <td>{scholarship.grant_amount}</td>
                                            <td>
                                                {scholarship.rules?.min_gwa || scholarship.rules?.max_gwa ?
                                                    `${scholarship.rules.min_gwa || "—"} - ${scholarship.rules.max_gwa || "—"}`
                                                    : "—"
                                                }
                                            </td>
                                            <td>
                                                {scholarship.rules?.max_income ?
                                                    `₱${scholarship.rules.max_income.toLocaleString()}`
                                                    : "—"
                                                }
                                            </td>
                                            <td>
                                                <span className={`badge ${scholarship.rules?.priorities?.must_be_ofw ? 'bg-success' : 'bg-secondary'}`}>
                                                    {scholarship.rules?.priorities?.must_be_ofw ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${scholarship.rules?.priorities?.prefer_farmers_child ? 'bg-info' : 'bg-secondary'}`}>
                                                    {scholarship.rules?.priorities?.prefer_farmers_child ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${scholarship.rules?.priorities?.require_ip ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                    {scholarship.rules?.priorities?.require_ip ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${scholarship.rules?.priorities?.prefer_pwd ? 'bg-primary' : 'bg-secondary'}`}>
                                                    {scholarship.rules?.priorities?.prefer_pwd ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${scholarship.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                    {scholarship.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        title="Edit"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#editModal"
                                                        onClick={() => handleEditClick(scholarship)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        title="Delete"
                                                        onClick={() => handleDeleteScholarship(scholarship.id)}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="text-center text-muted py-4">
                                            <i className="fas fa-inbox fa-2x mb-2"></i>
                                            <p>No scholarships found.</p>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Scholarship Modal */}
            <div className="modal fade" id="addModal" tabIndex={-1} aria-labelledby="addModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header bg-success text-white">
                            <h1 className="modal-title fs-5" id="addModalLabel">
                                <i className="fas fa-plus-circle me-2"></i>
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
                                    {/* Basic Information */}
                                    <div className="col-12">
                                        <h6 className="text-primary border-bottom pb-2 mb-3">
                                            <i className="fas fa-info-circle me-1"></i>
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
                                            placeholder="Enter scholarship name"
                                            value={newScholarship.name}
                                            onChange={(e) => setNewScholarship({ ...newScholarship, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Grant Amount</label>
                                        <input id="addGrantAmount" type="number" className="form-control"
                                               placeholder="Enter grant amount" value={newScholarship.grant_amount}
                                        onChange={(e) => setNewScholarship({...newScholarship, grant_amount: e.target.value })}/>
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
                                            placeholder="Provide a detailed description of the scholarship program..."
                                            value={newScholarship.description}
                                            onChange={(e) => setNewScholarship({ ...newScholarship, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Academic Requirements */}
                                    <div className="col-12 mt-4">
                                        <h6 className="text-primary border-bottom pb-2 mb-3">
                                            <i className="fas fa-graduation-cap me-1"></i>
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
                                            placeholder="1.75"
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
                                            Min Units
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
                                            Max Units
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

                                    {/* Financial Requirements */}
                                    <div className="col-12 mt-4">
                                        <h6 className="text-primary border-bottom pb-2 mb-3">
                                            <i className="fas fa-money-bill-wave me-1"></i>
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

                                    {/* Priority Settings */}
                                    <div className="col-12 mt-4">
                                        <h6 className="text-primary border-bottom pb-2 mb-3">
                                            <i className="fas fa-users me-1"></i>
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
                        <div className="modal-footer bg-light">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                            >
                                <i className="fas fa-times me-1"></i>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleAddScholarship}
                                disabled={!newScholarship.name.trim()}
                            >
                                <i className="fas fa-check me-1"></i>
                                Save Scholarship
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Scholarship Modal */}
            {editScholarship && (
                <div className="modal fade" id="editModal" tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header bg-warning text-dark">
                                <h1 className="modal-title fs-5" id="editModalLabel">
                                    <i className="fas fa-edit me-2"></i>
                                    Edit Scholarship: {editScholarship.name}
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
                                        {/* Basic Information */}
                                        <div className="col-12">
                                            <h6 className="text-primary border-bottom pb-2 mb-3">
                                                <i className="fas fa-info-circle me-1"></i>
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
                                            <label className="form-label fw-semibold">Grant Amount</label>
                                            <input id="addGrantAmount" type="number" className="form-control"
                                                   placeholder="Enter grant amount" value={editScholarship.grant_amount}
                                                   onChange={(e) => setEditScholarship({...editScholarship, grant_amount: e.target.value })}/>
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
                                                placeholder="Provide a detailed description of the scholarship program..."
                                                value={editScholarship.description}
                                                onChange={(e) => setEditScholarship({ ...editScholarship, description: e.target.value })}
                                            />
                                        </div>

                                        {/* Academic Requirements */}
                                        <div className="col-12 mt-4">
                                            <h6 className="text-primary border-bottom pb-2 mb-3">
                                                <i className="fas fa-graduation-cap me-1"></i>
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
                                                placeholder="1.75"
                                                value={editScholarship.rules?.min_gwa || ""}
                                                onChange={(e) => setEditScholarship({
                                                    ...editScholarship,
                                                    rules: {
                                                        ...editScholarship.rules,
                                                        min_gwa: e.target.value ? parseFloat(e.target.value) : null
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
                                                        max_gwa: e.target.value ? parseFloat(e.target.value) : null
                                                    }
                                                })}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label htmlFor="editMinUnits" className="form-label fw-semibold">
                                                Min Units
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
                                                        min_units_enrolled: e.target.value ? parseInt(e.target.value) : null
                                                    }
                                                })}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label htmlFor="editMaxUnits" className="form-label fw-semibold">
                                                Max Units
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
                                                        max_units_enrolled: e.target.value ? parseInt(e.target.value) : null
                                                    }
                                                })}
                                            />
                                        </div>

                                        {/* Financial Requirements */}
                                        <div className="col-12 mt-4">
                                            <h6 className="text-primary border-bottom pb-2 mb-3">
                                                <i className="fas fa-money-bill-wave me-1"></i>
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
                                                            min_income: e.target.value ? parseInt(e.target.value) : null
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
                                                            max_income: e.target.value ? parseInt(e.target.value) : null
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        {/* Priority Settings */}
                                        <div className="col-12 mt-4">
                                            <h6 className="text-primary border-bottom pb-2 mb-3">
                                                <i className="fas fa-users me-1"></i>
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
                            <div className="modal-footer bg-light">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
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