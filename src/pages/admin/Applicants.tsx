import { useEffect, useRef, useState } from 'react';
import { DataTable } from 'simple-datatables';
import "simple-datatables/dist/style.css";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import axios from 'axios';
import { API_BASE_URL } from "../../config.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import ViewApplicantReadOnlyForm from '../../components/admin/modals/ViewApplicantReadOnlyForm.tsx';
import type {Applicant} from "../../interfaces/applicant.ts";
import FilePreview from "../../components/admin/FilePreview.tsx";

const ApplicantsTable = () => {
    const tableRef = useRef(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [editApplicant, setEditApplicant] = useState(null);
    const { token, user } = useAuth();

    const fetchApplicants = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/applicants/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setApplicants(response.data);
        } catch (error) {
            console.error('Error fetching applicants:', error);
            await Swal.fire('Error', 'Failed to load applicants.', 'error');
        }
    };

    useEffect(() => {
        if (user?.role !== 'admin') {
            Swal.fire('Access Denied', 'Admin access required.', 'error');
            return;
        }
        fetchApplicants();
    }, []);

    useEffect(() => {
        if (tableRef.current && applicants.length > 0) {
            new DataTable(tableRef.current, {
                perPage: 5,
                searchable: true,
                sortable: true,
            });
        }
    }, [applicants]);



    const viewApplicant = async (id: number): Promise<void> => {
        setSelectedApplicant(null);
        setEditApplicant(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/applicants/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedApplicant(response.data);
            setEditApplicant(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error viewing applicant:', error);
            await Swal.fire('Error', 'Failed to load applicant details.', 'error');
        }
    };

    const handleApplicationStatus = async (
        applicationId: number,
        status: 'approved' | 'denied',
        remarks?: string
    ) => {
        const confirm = await Swal.fire({
            title: `Are you sure?`,
            text: `You are about to ${status} this application.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed!',
        });

        if (!confirm.isConfirmed) return;

        try {
            await axios.put(
                `${API_BASE_URL}/api/applicants/${applicationId}/status`,
                {
                    status,
                    remarks,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await Swal.fire(
                'Success',
                `Application has been ${status}.`,
                'success'
            ).then(() => {
                window.location.reload();
            });

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to update status.', 'error');
        }
    };

    const handleDelete = async (applicantId) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!'
        });

        if (confirm.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/api/applicants/${applicantId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Deleted!', 'The applicant has been deleted.', 'success');
                fetchApplicants();
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete applicant.', 'error');
            }
        }
    };

    return (
        <div>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i className="far fa-user-check"></i></div>
                                    Application Management
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-end">
                        <button className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addModal">
                            Add New Applicant
                        </button>
                    </div>

                    <div className="card-body">
                        <table ref={tableRef} className="table table-striped table-bordered">
                            <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Last Name</th>
                                <th>First Name</th>
                                <th>Middle Name</th>
                                <th>Gender</th>
                                <th>Campus</th>
                                <th>Course</th>
                                <th>Year Level</th>
                                <th>Birthdate</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {applicants.length > 0 ? (
                                applicants.map((applicant) => (
                                    <tr key={applicant.student_id}>
                                        <td>{applicant.uid}</td>
                                        <td>{applicant.last_name}</td>
                                        <td>{applicant.first_name}</td>
                                        <td>{applicant.middle_name || 'N/A'}</td>
                                        <td>{applicant.gender}</td>
                                        <td>{applicant.campus}</td>
                                        <td>{applicant.course}</td>
                                        <td>{applicant.year_level}</td>
                                        <td>{new Date(applicant.birth_date).toLocaleDateString()}</td>
                                        <td>
                                            <div className={`badge rounded-pill text-capitalize ${
                                                applicant.status === 'pending' ? 'bg-warning' :
                                                applicant.status === 'approved' ? 'bg-success' :
                                                'bg-danger'
                                            }`}>
                                                {applicant.status}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => viewApplicant(applicant.student_id)}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#viewModal"
                                                    title="View"
                                                >
                                                    <i className="fa-regular fa-eye"></i>
                                                </button>

                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => viewApplicant(applicant.student_id)}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#editModal"
                                                    title="Edit"
                                                >
                                                    <i className="fa-regular fa-pen-to-square"></i>
                                                </button>


                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    title="Delete"
                                                    onClick={() => handleDelete(applicant.id)}
                                                >
                                                    <i className="fa-regular fa-archive"></i>
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11">
                                            <span>No applicants found.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <div className="modal fade" id="viewModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Applicant Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <ViewApplicantReadOnlyForm
                                applicant={selectedApplicant}
                                onApplicationStatus={handleApplicationStatus}
                            />

                        </div>
                </div>
            </div>
            </div>

            {/* Edit Modal */}
            <div className="modal fade" id="editModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Applicant</h5>
                            <button id="editModalClose" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {editApplicant ? (
                                <form >
                                    {/* --- PERSONAL INFORMATION --- */}
                                    <h5 className="mb-3">Personal Information</h5>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">First Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.first_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, first_name: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Middle Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.middle_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, middle_name: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.last_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, last_name: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label">Name Extension</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.name_extension || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        name_extension: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label">Student ID</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant["students.student_id"] || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        ["students.student_id"]: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label">Birth Date</label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={editApplicant.birth_date?.split("T")[0] || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, birth_date: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Gender</label>
                                            <select
                                                className="form-control form-control-sm"
                                                value={editApplicant.gender || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, gender: e.target.value })
                                                }
                                            >
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label">Citizenship</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.citizenship || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, citizenship: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label">Civil Status</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.civil_status || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, civil_status: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Contact Number</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.contact_number || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        contact_number: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-control form-control-sm"
                                                value={editApplicant.email || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, email: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* --- ADDRESS --- */}
                                    <h5 className="mb-3 mt-4">Address</h5>
                                    <div className="mb-3">
                                        <label className="form-label">Street</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={editApplicant.street || ""}
                                            onChange={(e) =>
                                                setEditApplicant({ ...editApplicant, street: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Barangay</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.barangay_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        barangay_name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Municipality</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.municipality_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        municipality_name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Province</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.province_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        province_name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">ZIP Code</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.zip_code || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, zip_code: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* --- EDUCATIONAL INFORMATION --- */}
                                    <h5 className="mb-3 mt-4">Educational Information</h5>
                                    <div className="row">
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Campus</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.campus || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, campus: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Department</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.department || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, department: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Course</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.course || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, course: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Year Level</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.year_level || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, year_level: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Enrollment Status</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.enrollment_status || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        enrollment_status: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Total Units</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.total_units || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, total_units: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* --- FAMILY BACKGROUND --- */}
                                    <h5 className="mb-3 mt-4">Family Background</h5>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Father's First Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.father_first_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        father_first_name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Father's Middle Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.father_middle_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        father_middle_name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Father's Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.father_last_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        father_last_name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Father's Occupation</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.father_occupation || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        father_occupation: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Father's Income</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.father_income || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, father_income: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Mother's First Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.mother_first_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        mother_first_name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Mother's Middle Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.mother_middle_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        mother_middle_name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Mother's Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.mother_last_name || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        mother_last_name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Mother's Occupation</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.mother_occupation || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        mother_occupation: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Mother's Income</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.mother_income || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({ ...editApplicant, mother_income: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* --- OTHER INFORMATION --- */}
                                    <h5 className="mb-3 mt-4">Other Information</h5>
                                    <div className="row">
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">IP Affiliation</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.ip_affiliation || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        ip_affiliation: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label">4Ps Member</label>
                                            <select
                                                className="form-control form-control-sm"
                                                value={editApplicant.is_4ps_member ? "Yes" : "No"}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        is_4ps_member: e.target.value === "Yes",
                                                    })
                                                }
                                            >
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label">Household Number</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.household_number || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        household_number: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label">Siblings</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.siblings || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        siblings: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <label className="form-label">Siblings Studying</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editApplicant.sublings_studying || ""}
                                                onChange={(e) =>
                                                    setEditApplicant({
                                                        ...editApplicant,
                                                        sublings_studying: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary mt-4">
                                        Save Changes
                                    </button>
                                </form>
                            ) : <p>Loading...</p>}
                        </div>
                    </div>
                </div>
            </div>



        </div>
    );
};

export default ApplicantsTable;
