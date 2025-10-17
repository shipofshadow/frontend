import { useEffect, useRef, useState, useMemo } from 'react';
import { DataTable } from 'simple-datatables';
import "simple-datatables/dist/style.css";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import axios from 'axios';
import { API_BASE_URL } from "../../config.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import ViewApplicantReadOnlyForm from '../../components/admin/modals/ViewApplicantReadOnlyForm.tsx';
import type {Applicant} from "../../interfaces/applicant.ts";

const ArchivedApplicants = () => {
    const tableRef = useRef(null);
    const dataTableRef = useRef<DataTable | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant>();
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();

    const hasAdminAccess = useMemo(() => user?.role === 'admin', [user?.role]);

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Applicant[]>(`${API_BASE_URL}/api/applicants/archived`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setApplicants(response.data);
        } catch (error) {
            console.error('Error fetching applicants:', error);
            await Swal.fire('Error', 'Failed to load archived applicants.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasAdminAccess) {
            Swal.fire('Access Denied', 'Admin access required.', 'error');
            return;
        }
        fetchApplicants();
    }, [hasAdminAccess]);

    useEffect(() => {
        if (tableRef.current && applicants.length > 0 && !loading) {
            if (dataTableRef.current) {
                dataTableRef.current.destroy();
            }

            dataTableRef.current = new DataTable(tableRef.current, {
                perPage: 10,
                perPageSelect: [5, 10, 15, 20, 25],
                searchable: true,
                sortable: true,
                fixedHeight: false,
                labels: {
                    placeholder: "Search archived applicants...",
                    perPage: "Applicants per page",
                    noRows: "No archived applicants found",
                    info: "Showing {start} to {end} of {rows} applicants"
                }
            });
        }

        return () => {
            if (dataTableRef.current) {
                dataTableRef.current.destroy();
                dataTableRef.current = null;
            }
        };
    }, [applicants, loading]);

    const viewApplicant = async (id: number) => {
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

    const statusCounts = useMemo(() => {
        return {
            pending: applicants.filter(a => a.status === 'pending').length,
            approved: applicants.filter(a => a.status === 'approved').length,
            rejected: applicants.filter(a => a.status === 'rejected').length,
        };
    }, [applicants]);

    if (!hasAdminAccess) {
        return (
            <div className="container-fluid px-4">
                <div className="alert alert-danger border-0 shadow-sm" role="alert">
                    <div className="d-flex align-items-center">
                        <i className="fas fa-exclamation-triangle fa-2x me-3"></i>
                        <div>
                            <h4 className="alert-heading mb-1">Access Denied</h4>
                            <p className="mb-0">You don't have permission to view this page. Admin access is required.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                .status-badge {
                    font-size: 0.75rem;
                    padding: 0.35em 0.65em;
                }
            `}</style>

            {/* Header */}
            <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container-fluid px-4">
                    <div className="py-4">
                        <div className="d-flex align-items-center">
                            <div className="me-3 p-3 bg-secondary bg-opacity-10 rounded">
                                <i className="fas fa-archive fa-2x text-secondary"></i>
                            </div>
                            <div>
                                <h1 className="h3 mb-1 fw-bold">Archived Applications</h1>
                                <p className="text-muted mb-0 small">
                                    View and manage archived scholarship applications
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                {/* Stats Row */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Archived</p>
                                        <h3 className="mb-0 fw-bold">{applicants.length}</h3>
                                    </div>
                                    <div className="bg-secondary bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-folder-open fa-2x text-secondary"></i>
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
                                        <p className="text-muted small mb-1">Pending</p>
                                        <h3 className="mb-0 fw-bold text-warning">{statusCounts.pending}</h3>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-clock fa-2x text-warning"></i>
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
                                        <p className="text-muted small mb-1">Approved</p>
                                        <h3 className="mb-0 fw-bold text-success">{statusCounts.approved}</h3>
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
                                        <p className="text-muted small mb-1">Rejected</p>
                                        <h3 className="mb-0 fw-bold text-danger">{statusCounts.rejected}</h3>
                                    </div>
                                    <div className="bg-danger bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-times-circle fa-2x text-danger"></i>
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
                                <i className="fas fa-list me-2 text-secondary"></i>
                                Archived Applicants List
                            </h5>
                            <span className="badge bg-secondary">{applicants.length} Total</span>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-secondary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted fw-medium">Loading archived applications...</p>
                            </div>
                        ) : applicants.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-folder-open fa-3x text-muted mb-3 opacity-25"></i>
                                <h5 className="text-muted">No Archived Applications Found</h5>
                                <p className="text-muted small mb-3">
                                    Archived applications will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table ref={tableRef} className="table table-hover align-middle mb-0">
                                    <thead>
                                    <tr>
                                        <th className="border-0">
                                            <i className="fas fa-id-card me-2 text-secondary"></i>
                                            Student ID
                                        </th>
                                        <th className="border-0">
                                            <i className="fas fa-user me-2 text-primary"></i>
                                            Full Name
                                        </th>
                                        <th className="border-0 text-center">
                                            <i className="fas fa-venus-mars me-2 text-info"></i>
                                            Gender
                                        </th>
                                        <th className="border-0">
                                            <i className="fas fa-map-marker-alt me-2 text-success"></i>
                                            Campus
                                        </th>
                                        <th className="border-0">
                                            <i className="fas fa-book me-2 text-warning"></i>
                                            Course
                                        </th>
                                        <th className="border-0 text-center">
                                            <i className="fas fa-layer-group me-2 text-danger"></i>
                                            Year
                                        </th>
                                        <th className="border-0">
                                            <i className="fas fa-calendar me-2 text-primary"></i>
                                            Birthdate
                                        </th>
                                        <th className="border-0 text-center">
                                            <i className="fas fa-flag me-2 text-warning"></i>
                                            Status
                                        </th>
                                        <th className="border-0 text-center">
                                            <i className="fas fa-cog me-2 text-muted"></i>
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {applicants.map((applicant) => (
                                        <tr key={applicant.student_id} className="fade-in">
                                            <td>
                                                <span className="badge status-badge bg-light text-dark border fw-semibold">
                                                    {applicant.uid}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong className="d-block">
                                                        {applicant.last_name}, {applicant.first_name}
                                                    </strong>
                                                    <small className="text-muted">
                                                        {applicant.middle_name || 'No middle name'}
                                                    </small>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge status-badge ${applicant.gender === 'Male' ? 'bg-primary' : 'bg-danger'}`}>
                                                    <i className={`fas ${applicant.gender === 'Male' ? 'fa-mars' : 'fa-venus'} me-1`}></i>
                                                    {applicant.gender}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge status-badge bg-success bg-opacity-10 text-success border border-success">
                                                    <i className="fas fa-university me-1"></i>
                                                    {applicant.campus}
                                                </span>
                                            </td>
                                            <td className="small">{applicant.course}</td>
                                            <td className="text-center">
                                                <span className="badge status-badge bg-info text-white">
                                                    {applicant.year_level}
                                                </span>
                                            </td>
                                            <td className="small text-muted">
                                                {new Date(applicant.birth_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge status-badge text-capitalize ${
                                                    applicant.status === 'pending' ? 'bg-warning' :
                                                        applicant.status === 'approved' ? 'bg-success' :
                                                            'bg-danger'
                                                }`}>
                                                    <i className={`fas ${
                                                        applicant.status === 'pending' ? 'fa-clock' :
                                                            applicant.status === 'approved' ? 'fa-check-circle' :
                                                                'fa-times-circle'
                                                    } me-1`}></i>
                                                    {applicant.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-info action-btn"
                                                    onClick={() => viewApplicant(applicant.id)}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#viewModal"
                                                    title="View applicant details"
                                                >
                                                    <i className="fas fa-eye me-1"></i>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {applicants.length > 0 && (
                        <div className="card-footer bg-white border-top py-3">
                            <div className="d-flex justify-content-between align-items-center text-muted small">
                                <span>
                                    <i className="fas fa-info-circle me-1"></i>
                                    {applicants.length} {applicants.length === 1 ? 'application' : 'applications'} archived
                                </span>
                                <span>Last updated: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Modal */}
            <div className="modal fade" id="viewModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header border-0 bg-light">
                            <div>
                                <h5 className="modal-title fw-bold">
                                    <i className="fas fa-file-alt text-secondary me-2"></i>
                                    Archived Application Details
                                </h5>
                                {selectedApplicant && (
                                    <p className="text-muted small mb-0">
                                        Application for {selectedApplicant.first_name} {selectedApplicant.last_name}
                                    </p>
                                )}
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {selectedApplicant && (
                                <ViewApplicantReadOnlyForm applicant={selectedApplicant} />
                            )}

                        </div>
                        <div className="modal-footer border-0 bg-light">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                <i className="fas fa-times me-1"></i>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ArchivedApplicants;
