import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { DataTable } from 'simple-datatables';
import "simple-datatables/dist/style.css";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import axios from 'axios';
import { API_BASE_URL } from "../../config.ts";
import { useAuth } from "../../context/AuthContext.tsx";

interface NotAppliedStudent {
    student_id: number;
    student_number: string;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    gender: string;
    birth_date: string;
    username: string;
    email: string;
}

const NotApplied = () => {
    const tableRef = useRef<HTMLTableElement>(null);
    const dataTableRef = useRef<DataTable | null>(null);
    const [students, setStudents] = useState<NotAppliedStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token, user } = useAuth();

    // Check admin access
    const hasAdminAccess = useMemo(() => user?.role === 'admin', [user?.role]);

    const fetchStudents = useCallback(async () => {
        if (!hasAdminAccess) return;

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get<NotAppliedStudent[]>(`${API_BASE_URL}/api/applicants/not-applied`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 10000 // 10 second timeout
            });

            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            const errorMessage =  'Failed to load students';

            setError(errorMessage);
            await Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    }, [token, hasAdminAccess]);

    const handleArchiveStudent = useCallback(async (studentId: number, studentName: string) => {
        const result = await Swal.fire({
            title: 'Archive Student',
            text: `Are you sure you want to archive ${studentName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, archive it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.patch(`${API_BASE_URL}/api/students/${studentId}/archive`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Remove student from local state
                setStudents(prev => prev.filter(student => student.student_id !== studentId));

                await Swal.fire({
                    title: 'Archived!',
                    text: 'Student has been archived.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Error archiving student:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'Failed to archive student.',
                    icon: 'error'
                });
            }
        }
    }, [token]);

    // Handle access control
    useEffect(() => {
        if (!hasAdminAccess && user) {
            Swal.fire({
                title: 'Access Denied',
                text: 'Admin access required.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        fetchStudents();
    }, [hasAdminAccess, user, fetchStudents]);

    // Initialize DataTable
    useEffect(() => {
        if (tableRef.current && students.length > 0 && !loading) {
            // Destroy existing DataTable if it exists
            if (dataTableRef.current) {
                dataTableRef.current.destroy();
            }

            // Create new DataTable
            dataTableRef.current = new DataTable(tableRef.current, {
                perPage: 10,
                perPageSelect: [5, 10, 15, 20],
                searchable: true,
                sortable: true,
                fixedHeight: true,
                labels: {
                    placeholder: "Search students...",
                    perPage: "Students per page",
                    noRows: "No students found",
                    info: "Showing {start} to {end} of {rows} students"
                }
            });
        }

        // Cleanup function
        return () => {
            if (dataTableRef.current) {
                dataTableRef.current.destroy();
                dataTableRef.current = null;
            }
        };
    }, [students, loading]);

    const formatDate = useCallback((dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    }, []);

    const handleRetry = useCallback(() => {
        fetchStudents();
    }, [fetchStudents]);

    if (!hasAdminAccess && user) {
        return (
            <div className="container-fluid px-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Access Denied</h4>
                    <p>You don't have permission to view this page. Admin access is required.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4 shadow-sm">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title d-flex align-items-center gap-3">
                                    <div className="page-header-icon bg-primary bg-gradient text-white rounded-3 p-3">
                                        <i className="far fa-user-check" aria-hidden="true"></i>
                                    </div>
                                    <span>Potential Applicants</span>
                                </h1>
                            </div>
                            <div className="col-auto mb-3">
                        <span className="badge bg-primary bg-gradient rounded-pill px-3 py-2 fs-6">
                            {students.length} {students.length === 1 ? 'Student' : 'Students'}
                        </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl px-4">
                <div className="card mb-4 shadow-sm border-0 rounded-3">
                    <div className="card-header bg-white border-bottom py-3">
                        <div className="row align-items-center">
                            <div className="col">
                                <h5 className="card-title mb-0 fw-bold text-dark">
                                    <i className="fas fa-users me-2 text-primary"></i>
                                    Students Not Yet Applied
                                </h5>
                            </div>
                            <div className="col-auto">
                                <div className="d-flex gap-2">
                                  
                                    <button
                                        className="btn btn-success btn-sm rounded-pill px-3 shadow-sm"
                                        data-bs-toggle="modal"
                                        data-bs-target="#addModal"
                                        disabled={loading}
                                    >
                                        <i className="fas fa-plus me-1" aria-hidden="true"></i> Add Student
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {error && (
                            <div className="alert alert-danger m-4 d-flex align-items-center rounded-3 border-0 shadow-sm" role="alert">
                                <i className="fas fa-exclamation-triangle me-3 fs-4" aria-hidden="true"></i>
                                <div className="flex-grow-1">
                                    <strong>Error:</strong> {error}
                                </div>
                                <button
                                    className="btn btn-sm btn-outline-danger rounded-pill ms-2"
                                    onClick={handleRetry}
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted fw-medium">Loading students...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table
                                    ref={tableRef}
                                    id="datatablesSimple"
                                    className="table table-hover align-middle mb-0"
                                    role="table"
                                    aria-label="Students not yet applied"
                                >
                                    <thead className="bg-light border-bottom">
                                    <tr>
                                        <th scope="col" className="py-3 px-4 text-muted fw-semibold">Student Number</th>
                                        <th scope="col" className="py-3 px-4 text-muted fw-semibold">Last Name</th>
                                        <th scope="col" className="py-3 px-4 text-muted fw-semibold">First Name</th>
                                        <th scope="col" className="py-3 px-4 text-muted fw-semibold">Middle Name</th>
                                        <th scope="col" className="py-3 px-4 text-muted fw-semibold">Gender</th>
                                        <th scope="col" className="py-3 px-4 text-muted fw-semibold">Birthdate</th>
                                        <th scope="col" className="py-3 px-4 text-muted fw-semibold">Username</th>
                                        <th scope="col" className="py-3 px-4 text-muted fw-semibold">Email</th>
                                        <th scope="col" className="py-3 px-4 text-center text-muted fw-semibold">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {students.length > 0 ? (
                                        students.map((student) => (
                                            <tr key={student.student_id} className="border-bottom">
                                                <td className="px-4 py-3">
                                                    <span className="badge bg-light text-dark border fw-semibold">{student.student_number}</span>
                                                </td>
                                                <td className="px-4 py-3 fw-medium">{student.last_name}</td>
                                                <td className="px-4 py-3">{student.first_name}</td>
                                                <td className="px-4 py-3">
                                            <span className={student.middle_name ? '' : 'text-muted fst-italic'}>
                                                {student.middle_name || 'N/A'}
                                            </span>
                                                </td>
                                                <td className="px-4 py-3">
                                            <span className={`badge rounded-pill ${student.gender === 'Male' ? 'bg-primary' : 'bg-danger'}`}>
                                                <i className={`fas ${student.gender === 'Male' ? 'fa-mars' : 'fa-venus'} me-1`}></i>
                                                {student.gender}
                                            </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted">
                                                    <i className="far fa-calendar me-1"></i>
                                                    {formatDate(student.birth_date)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="bg-light text-primary px-2 py-1 rounded">{student.username}</code>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <a
                                                        href={`mailto:${student.email}`}
                                                        className="text-decoration-none text-primary d-flex align-items-center"
                                                        title={`Send email to ${student.email}`}
                                                    >
                                                        <i className="far fa-envelope me-2"></i>
                                                        {student.email}
                                                    </a>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                                        onClick={() => handleArchiveStudent(
                                                            student.student_id,
                                                            `${student.first_name} ${student.last_name}`
                                                        )}
                                                        title={`Archive ${student.first_name} ${student.last_name}`}
                                                        aria-label={`Archive student ${student.first_name} ${student.last_name}`}
                                                    >
                                                        <i className="fas fa-archive me-1" aria-hidden="true"></i>
                                                        Archive
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center py-5">
                                                <div className="text-muted">
                                                    <i className="fas fa-users-slash fa-3x mb-3 opacity-25" aria-hidden="true"></i>
                                                    <p className="mb-1 fw-semibold fs-5">No students found</p>
                                                    <small className="text-muted">Students who have already applied will not appear here.</small>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default NotApplied;