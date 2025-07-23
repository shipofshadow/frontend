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

    const viewApplicant = async (id: number): Promise<void> => {
        setSelectedApplicant(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/applicants/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedApplicant(response.data);
        } catch (error) {
            console.error('Error viewing applicant:', error);
            await Swal.fire('Error', 'Failed to load applicant details.', 'error');
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
                                            <div className="d-flex align-items-center gap-1">
                                                <button
                                                    className="btn btn-datatable btn-icon btn-transparent-dark"
                                                    onClick={() => viewApplicant(applicant.student_id)}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#viewModal"
                                                    title="View"
                                                >
                                                    <i className="fa-regular fa-eye"></i>
                                                </button>

                                                <button
                                                    className="btn btn-datatable btn-icon btn-transparent-dark"
                                                    onClick={() => editApplicant(applicant.student_id)}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#editModal"
                                                    title="Edit"
                                                >
                                                    <i className="fa-regular fa-pen-to-square"></i>
                                                </button>

                                                <button
                                                    className="btn btn-datatable btn-icon btn-transparent-dark"
                                                    onClick={() => viewApplicant(applicant.student_id)}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#filesModal"
                                                    title="Files"
                                                >
                                                    <i className="far fa-file"></i>
                                                </button>

                                                <button
                                                    className="btn btn-datatable btn-icon btn-transparent-dark"
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
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Applicant Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <ViewApplicantReadOnlyForm applicant={selectedApplicant} />
                        </div>
                </div>
            </div>
            </div>

            {/* Edit Modal */}
            <div className="modal fade" id="editModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Applicant</h5>
                            <button id="editModalClose" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {editApplicant ? (
                                <form onSubmit={handleEditSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editApplicant.first_name}
                                            onChange={(e) => setEditApplicant({ ...editApplicant, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editApplicant.last_name}
                                            onChange={(e) => setEditApplicant({ ...editApplicant, last_name: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </form>
                            ) : <p>Loading...</p>}
                        </div>
                    </div>
                </div>
            </div>


            <div className="modal fade" id="filesModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Applicant Files</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {selectedApplicant ? (
                                <div className="d-flex flex-column gap-3">
                                    {selectedApplicant.itr_file && (
                                        <FilePreview
                                            label="ITR File"
                                            filePath={selectedApplicant.itr_file}
                                        />
                                    )}
                                    {selectedApplicant.grades_file && (
                                        <FilePreview
                                            label="Grades File"
                                            filePath={selectedApplicant.grades_file}
                                        />
                                    )}
                                </div>
                            ) : <p>Loading files...</p>}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default ApplicantsTable;
