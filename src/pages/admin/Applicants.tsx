import { useEffect, useRef, useState, type SetStateAction} from 'react';
import {DataTable} from 'simple-datatables';
import "simple-datatables/dist/style.css";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import axios from 'axios';
import {API_BASE_URL} from "../../config.ts";
import {useAuth} from "../../context/AuthContext.tsx";
import ViewApplicantReadOnlyForm from '../../components/admin/modals/ViewApplicantReadOnlyForm.tsx';
import type {Applicant} from "../../interfaces/applicant.ts";


const ApplicantsTable = () => {
    const tableRef = useRef(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const {token} = useAuth();

    const fetchApplicants = async () => {
        try {
            const response = await axios.get<Applicant[]>(`${API_BASE_URL}/api/applicants/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setApplicants(response.data);
            setFilteredApplicants(response.data);
        } catch (error) {
            console.error('Error fetching applicants:', error);
            await Swal.fire('Error', 'Failed to load applicants.', 'error');
        }
    };

    useEffect(() => {
        let filtered = [...applicants];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(applicant => applicant.status === statusFilter);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime();
                case 'oldest':
                    return new Date(a.created_at || a.updated_at || 0).getTime() - new Date(b.created_at || b.updated_at || 0).getTime();
                case 'name_asc':
                    return (a.last_name || '').localeCompare(b.last_name || '');
                case 'name_desc':
                    return (b.last_name || '').localeCompare(a.last_name || '');

                default:
                    return 0;
            }
        });

        setFilteredApplicants(filtered);
    }, [applicants, statusFilter, sortBy]);

    useEffect(() => {
        fetchApplicants().catch((err) =>
            console.error("Promise rejection in fetchApplicants:", err)
        );
    },[]);

    useEffect(() => {
        if (tableRef.current && filteredApplicants.length > 0) {


            new DataTable(tableRef.current, {
                perPage: 10,
                searchable: true,
                sortable: true,
                labels: {
                    placeholder: "Search applicants...",
                    noRows: "No applicants found matching your criteria",
                    info: "Showing {start} to {end} of {rows} applicants"
                }
            });
        }
    }, [filteredApplicants]);

    const handleStatusFilterChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setStatusFilter(e.target.value);
    };

    const handleSortChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setSortBy(e.target.value);
    };

    const getStatusCount = (status: string) => {
        if (status === 'all') return applicants.length;
        return applicants.filter(applicant => applicant.status === status).length;
    };

    const viewApplicant = async (id: number): Promise<void> => {
        setSelectedApplicant(null);
        try {
            const response = await axios.get<Applicant>(`${API_BASE_URL}/api/applicants/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedApplicant(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error viewing applicant:', error);
            await Swal.fire('Error', 'Failed to load applicant details.', 'error');
        }
    };

    const handleDelete = async (applicantId: number) => {
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
                await axios.patch(`${API_BASE_URL}/api/applicants/${applicantId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await Swal.fire('Deleted!', 'The applicant has been deleted.', 'success');
                await fetchApplicants();
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
                            <div className="col-auto mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <small className="text-muted">Total: {applicants.length} applicants</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                {/* Statistics Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="me-3">
                                    <i className="fas fa-users fa-2x opacity-75"></i>
                                </div>
                                <div>
                                    <div className="fs-4 fw-bold">{getStatusCount('all')}</div>
                                    <div className="small">Total Applications</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-warning text-white h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="me-3">
                                    <i className="fas fa-clock fa-2x opacity-75"></i>
                                </div>
                                <div>
                                    <div className="fs-4 fw-bold">{getStatusCount('pending')}</div>
                                    <div className="small">Pending Review</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="me-3">
                                    <i className="fas fa-check-circle fa-2x opacity-75"></i>
                                </div>
                                <div>
                                    <div className="fs-4 fw-bold">{getStatusCount('approved')}</div>
                                    <div className="small">Approved</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-danger text-white h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="me-3">
                                    <i className="fas fa-times-circle fa-2x opacity-75"></i>
                                </div>
                                <div>
                                    <div className="fs-4 fw-bold">{getStatusCount('denied')}</div>
                                    <div className="small">Denied</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-header">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <h5 className="card-title mb-0">
                                    <i className="fas fa-filter me-2"></i>
                                    Manage Applications
                                </h5>
                            </div>

                        </div>
                    </div>

                    <div className="card-body">
                        {/* Filter and Sort Controls */}
                        <div className="row g-3 mb-4 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">
                                    <i className="fas fa-filter me-1"></i>
                                    Filter by Status
                                </label>
                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                >
                                    <option value="all">All Status ({getStatusCount('all')})</option>
                                    <option value="pending">Pending ({getStatusCount('pending')})</option>
                                    <option value="approved">Approved ({getStatusCount('approved')})</option>
                                    <option value="denied">Denied ({getStatusCount('denied')})</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">
                                    <i className="fas fa-sort me-1"></i>
                                    Sort by
                                </label>
                                <select
                                    className="form-select"
                                    value={sortBy}
                                    onChange={handleSortChange}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="name_asc">Name (A-Z)</option>
                                    <option value="name_desc">Name (Z-A)</option>
                                    <option value="status_asc">Status (Pending First)</option>
                                    <option value="status_desc">Status (Denied First)</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setStatusFilter('all');
                                            setSortBy('newest');
                                        }}
                                    >
                                        <i className="fas fa-undo me-1"></i>
                                        Reset Filters
                                    </button>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={fetchApplicants}
                                    >
                                        <i className="fas fa-sync me-1"></i>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Info */}
                        <div className="alert alert-info d-flex align-items-center mb-3">
                            <i className="fas fa-info-circle me-2"></i>
                            <span>
                                Showing <strong>{filteredApplicants.length}</strong> of <strong>{applicants.length}</strong> applications
                                {statusFilter !== 'all' && (
                                    <span> • Filtered by: <strong className="text-capitalize">{statusFilter}</strong></span>
                                )}
                            </span>
                        </div>

                        <div className="table-responsive">
                            <table ref={tableRef} className="table table-striped table-bordered table-hover">
                                <thead className="table-dark">
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
                                {filteredApplicants.length > 0 ? (
                                    filteredApplicants.map((applicant) => (
                                        <tr key={applicant.student_id}>
                                            <td>
                                                <span className="fw-bold text-primary">{applicant.uid}</span>
                                            </td>
                                            <td>{applicant.last_name}</td>
                                            <td>{applicant.first_name}</td>
                                            <td>{applicant.middle_name || 'N/A'}</td>
                                            <td>
                                                <span className={`badge rounded-pill ${
                                                    applicant.gender === 'Male' ? 'bg-info' :
                                                        applicant.gender === 'Female' ? 'bg-pink' : 'bg-secondary'
                                                }`}>
                                                    {applicant.gender}
                                                </span>
                                            </td>
                                            <td>{applicant.campus}</td>
                                            <td>
                                                <small className="text-muted">{applicant.course}</small>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark">{applicant.year_level}</span>
                                            </td>
                                            <td>
                                                <small>{new Date(applicant.birth_date).toLocaleDateString()}</small>
                                            </td>
                                            <td>
                                                <div className={`badge rounded-pill text-capitalize fw-bold ${
                                                    applicant.status === 'pending' ? 'bg-warning text-dark' :
                                                        applicant.status === 'approved' ? 'bg-success' :
                                                            'bg-danger'
                                                }`}>
                                                    <i className={`fas ${
                                                        applicant.status === 'pending' ? 'fa-clock' :
                                                            applicant.status === 'approved' ? 'fa-check' : 'fa-times'
                                                    } me-1`}></i>
                                                    {applicant.status}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => viewApplicant(applicant.id)}
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#viewModal"
                                                        title="View Details"
                                                    >
                                                        <i className="fa-regular fa-eye"></i>
                                                    </button>

                                                    <button
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => viewApplicant(applicant.id)}
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#editModal"
                                                        title="Edit Application"
                                                    >
                                                        <i className="fa-regular fa-pen-to-square"></i>
                                                    </button>

                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        title="Archive Application"
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
                                        <td colSpan={11} className="text-center py-4">
                                            <div className="text-muted">
                                                <i className="fas fa-search fa-2x mb-2 opacity-50"></i>
                                                <p className="mb-0">No applicants found matching your criteria.</p>
                                                <small>Try adjusting your filters or search terms.</small>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <div className="modal fade" id="viewModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="fas fa-user-circle me-2"></i>
                                Applicant Details
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <ViewApplicantReadOnlyForm
                                applicant={selectedApplicant}
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
                          
                        </div>
                    </div>
                </div>
            </div>



        </div>
    );
};

export default ApplicantsTable;
