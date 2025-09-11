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
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon">
                                        <i className="far fa-user-check" aria-hidden="true"></i>
                                    </div>
                                    Potential Applicants
                                </h1>
                            </div>
                            <div className="col-auto mb-3">
                                <span className="badge bg-info">
                                    {students.length} {students.length === 1 ? 'Student' : 'Students'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl px-4">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0">Students Not Yet Applied</h5>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={handleRetry}
                                disabled={loading}
                                title="Refresh data"
                            >
                                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`} aria-hidden="true"></i>
                                {loading ? ' Loading...' : ' Refresh'}
                            </button>
                            <button
                                className="btn btn-success btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#addModal"
                                disabled={loading}
                            >
                                <i className="fas fa-plus" aria-hidden="true"></i> Add New Student
                            </button>
                        </div>
                    </div>

                    <div className="card-body">
                        {error && (
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                <i className="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
                                <div>
                                    <strong>Error:</strong> {error}
                                    <button
                                        className="btn btn-link btn-sm ms-2 p-0"
                                        onClick={handleRetry}
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading students...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table
                                    ref={tableRef}
                                    id="datatablesSimple"
                                    className="table table-striped table-bordered table-hover"
                                    role="table"
                                    aria-label="Students not yet applied"
                                >
                                    <thead className="table-dark">
                                    <tr>
                                        <th scope="col">Student Number</th>
                                        <th scope="col">Last Name</th>
                                        <th scope="col">First Name</th>
                                        <th scope="col">Middle Name</th>
                                        <th scope="col">Gender</th>
                                        <th scope="col">Birthdate</th>
                                        <th scope="col">Username</th>
                                        <th scope="col">Email</th>
                                        <th scope="col" className="text-center">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {students.length > 0 ? (
                                        students.map((student) => (
                                            <tr key={student.student_id}>
                                                <td>
                                                    <strong>{student.student_number}</strong>
                                                </td>
                                                <td>{student.last_name}</td>
                                                <td>{student.first_name}</td>
                                                <td>
                                                        <span className={student.middle_name ? '' : 'text-muted fst-italic'}>
                                                            {student.middle_name || 'N/A'}
                                                        </span>
                                                </td>
                                                <td>
                                                        <span className={`badge ${student.gender === 'Male' ? 'bg-primary' : 'bg-danger'}`}>
                                                            {student.gender}
                                                        </span>
                                                </td>
                                                <td>{formatDate(student.birth_date)}</td>
                                                <td>
                                                    <code className="text-primary">{student.username}</code>
                                                </td>
                                                <td>
                                                    <a
                                                        href={`mailto:${student.email}`}
                                                        className="text-decoration-none"
                                                        title={`Send email to ${student.email}`}
                                                    >
                                                        {student.email}
                                                    </a>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleArchiveStudent(
                                                            student.student_id,
                                                            `${student.first_name} ${student.last_name}`
                                                        )}
                                                        title={`Archive ${student.first_name} ${student.last_name}`}
                                                        aria-label={`Archive student ${student.first_name} ${student.last_name}`}
                                                    >
                                                        <i className="fas fa-archive" aria-hidden="true"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center text-muted py-4">
                                                <i className="fas fa-users-slash fa-2x mb-2" aria-hidden="true"></i>
                                                <p className="mb-0">No students found.</p>
                                                <small>Students who have already applied will not appear here.</small>
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