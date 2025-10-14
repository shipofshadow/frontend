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
    const [selectedStudent, setSelectedStudent] = useState<NotAppliedStudent | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [sendingNotifications, setSendingNotifications] = useState(false);
    const { token, user } = useAuth();

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
                timeout: 10000
            });

            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            const errorMessage = 'Failed to load students';

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
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, archive it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await axios.patch(`${API_BASE_URL}/api/students/${studentId}/archive`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setStudents(prev => prev.filter(student => student.student_id !== studentId));

                await Swal.fire({
                    title: 'Archived!',
                    text: 'Student has been archived successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Error archiving student:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'Failed to archive student. Please try again.',
                    icon: 'error'
                });
            }
        }
    }, [token]);

    const handleNotifySingle = useCallback((student: NotAppliedStudent) => {
        setSelectedStudent(student);
        setNotificationMessage(`Hi ${student.first_name},\n\nWe noticed you haven't applied for any scholarships yet. We encourage you to explore available opportunities that may help support your education.\n\nBest regards,\nScholarship Office`);
        setShowNotifyModal(true);
    }, []);

    const handleNotifyAll = useCallback(() => {
        setSelectedStudent(null);
        setNotificationMessage(`Dear Student,\n\nWe noticed you haven't applied for any scholarships yet. We encourage you to explore available opportunities that may help support your education.\n\nBest regards,\nScholarship Office`);
        setShowNotifyModal(true);
    }, []);

    const sendNotification = useCallback(async () => {
        setSendingNotifications(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const recipientCount = selectedStudent ? 1 : students.length;

            setShowNotifyModal(false);
            setNotificationMessage('');
            setSelectedStudent(null);

            await Swal.fire({
                title: 'Notifications Sent!',
                text: `Successfully sent notifications to ${recipientCount} ${recipientCount === 1 ? 'student' : 'students'}.`,
                icon: 'success',
                timer: 2500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error sending notifications:', error);
            await Swal.fire({
                title: 'Error',
                text: 'Failed to send notifications. Please try again.',
                icon: 'error'
            });
        } finally {
            setSendingNotifications(false);
        }
    }, [selectedStudent, students.length]);

    const handleViewDetails = useCallback((student: NotAppliedStudent) => {
        setSelectedStudent(student);
        setShowDetailsModal(true);
    }, []);

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

    useEffect(() => {
        if (tableRef.current && students.length > 0 && !loading) {
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
                    placeholder: "Search by name, student number, email...",
                    perPage: "Students per page",
                    noRows: "No students found",
                    info: "Showing {start} to {end} of {rows} students"
                }
            });
        }

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

    const calculateAge = useCallback((birthDate: string) => {
        try {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        } catch {
            return 'N/A';
        }
    }, []);

    const handleRetry = useCallback(() => {
        fetchStudents();
    }, [fetchStudents]);

    if (!hasAdminAccess && user) {
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

    const maleCount = students.filter(s => s.gender === 'Male').length;
    const femaleCount = students.filter(s => s.gender === 'Female').length;

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
                    position: sticky;
                    top: 0;
                    z-index: 10;
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
                .student-badge {
                    font-size: 0.75rem;
                    padding: 0.35em 0.65em;
                }
                .notify-pulse {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}</style>

            {/* Header */}
            <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container-fluid px-4">
                    <div className="py-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-warning bg-opacity-10 rounded">
                                    <i className="fas fa-user-clock fa-2x text-warning"></i>
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold">Potential Applicants</h1>
                                    <p className="text-muted mb-0 small">
                                        Students who have registered but not yet applied for scholarships
                                    </p>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={handleNotifyAll}
                                disabled={loading || students.length === 0}
                            >
                                <i className="fas fa-bell me-2 notify-pulse"></i>
                                Notify All Students
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                {/* Stats Row */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Students</p>
                                        <h3 className="mb-0 fw-bold">{students.length}</h3>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-users fa-2x text-warning"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Male Students</p>
                                        <h3 className="mb-0 fw-bold text-primary">{maleCount}</h3>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-mars fa-2x text-primary"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Female Students</p>
                                        <h3 className="mb-0 fw-bold text-danger">{femaleCount}</h3>
                                    </div>
                                    <div className="bg-danger bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-venus fa-2x text-danger"></i>
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
                                <i className="fas fa-list me-2 text-warning"></i>
                                Students Not Yet Applied
                            </h5>
                            <span className="badge bg-warning text-dark">{students.length} Total</span>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {error && (
                            <div className="alert alert-danger m-4 border-0 shadow-sm" role="alert">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-exclamation-triangle me-3"></i>
                                        <div>
                                            <strong>Error:</strong> {error}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-danger action-btn"
                                        onClick={handleRetry}
                                    >
                                        <i className="fas fa-redo me-1"></i>
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted fw-medium">Loading students...</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-users-slash fa-3x text-muted mb-3 opacity-25"></i>
                                <h5 className="text-muted">No Potential Applicants Found</h5>
                                <p className="text-muted small mb-3">
                                    All registered students have already applied for scholarships
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table
                                    ref={tableRef}
                                    className="table table-hover align-middle mb-0"
                                >
                                    <thead>
                                    <tr>
                                        <th className="border-0">
                                            <i className="fas fa-id-card me-2 text-warning"></i>
                                            Student #
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
                                            <i className="fas fa-birthday-cake me-2 text-success"></i>
                                            Birthdate
                                        </th>
                                        <th className="border-0">
                                            <i className="fas fa-user-tag me-2 text-secondary"></i>
                                            Username
                                        </th>
                                        <th className="border-0">
                                            <i className="fas fa-envelope me-2 text-danger"></i>
                                            Email
                                        </th>
                                        <th className="border-0 text-center">
                                            <i className="fas fa-cog me-2 text-muted"></i>
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {students.map((student) => (
                                        <tr key={student.student_id} className="fade-in">
                                            <td>
                                                <span className="badge student-badge bg-light text-dark border fw-semibold">
                                                    {student.student_number}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong className="d-block">
                                                        {student.last_name}, {student.first_name}
                                                    </strong>
                                                    <small className="text-muted">
                                                        {student.middle_name || 'No middle name'}
                                                    </small>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge student-badge ${student.gender === 'Male' ? 'bg-primary' : 'bg-danger'}`}>
                                                    <i className={`fas ${student.gender === 'Male' ? 'fa-mars' : 'fa-venus'} me-1`}></i>
                                                    {student.gender}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <span className="d-block">{formatDate(student.birth_date)}</span>
                                                    <small className="text-muted">
                                                        Age: {calculateAge(student.birth_date)}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                <code className="bg-light text-primary px-2 py-1 rounded small">
                                                    {student.username}
                                                </code>
                                            </td>
                                            <td>
                                                <a
                                                    href={`mailto:${student.email}`}
                                                    className="text-decoration-none text-primary d-flex align-items-center small"
                                                    title={`Send email to ${student.email}`}
                                                >
                                                    <i className="far fa-envelope me-2"></i>
                                                    {student.email}
                                                </a>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-info action-btn"
                                                        onClick={() => handleViewDetails(student)}
                                                        title="View details"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary action-btn"
                                                        onClick={() => handleNotifySingle(student)}
                                                        title="Send notification"
                                                    >
                                                        <i className="fas fa-bell"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger action-btn"
                                                        onClick={() => handleArchiveStudent(
                                                            student.student_id,
                                                            `${student.first_name} ${student.last_name}`
                                                        )}
                                                        title="Archive student"
                                                    >
                                                        <i className="fas fa-archive"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {students.length > 0 && (
                        <div className="card-footer bg-white border-top py-3">
                            <div className="d-flex justify-content-between align-items-center text-muted small">
                                <span>
                                    <i className="fas fa-info-circle me-1"></i>
                                    {students.length} {students.length === 1 ? 'student' : 'students'} not yet applied
                                </span>
                                <span>Last updated: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notify Modal */}
            {showNotifyModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header border-0 bg-light">
                                    <div>
                                        <h5 className="modal-title fw-bold">
                                            <i className="fas fa-bell text-primary me-2"></i>
                                            Send Notification
                                        </h5>
                                        <p className="text-muted small mb-0">
                                            {selectedStudent
                                                ? `Sending to: ${selectedStudent.first_name} ${selectedStudent.last_name}`
                                                : `Sending to all ${students.length} students`
                                            }
                                        </p>
                                    </div>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowNotifyModal(false)}
                                        disabled={sendingNotifications}
                                        aria-label="Close"
                                    />
                                </div>
                                <div className="modal-body px-4 py-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="fas fa-envelope me-2 text-primary"></i>
                                            Message
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows={8}
                                            value={notificationMessage}
                                            onChange={(e) => setNotificationMessage(e.target.value)}
                                            placeholder="Enter your message here..."
                                            disabled={sendingNotifications}
                                        />
                                        <small className="text-muted">
                                            <i className="fas fa-info-circle me-1"></i>
                                            This message will be sent via email to the selected student(s)
                                        </small>
                                    </div>

                                    <div className="alert alert-info border-0 mb-0">
                                        <div className="d-flex align-items-start">
                                            <i className="fas fa-lightbulb me-2 mt-1"></i>
                                            <div>
                                                <strong>Tip:</strong> Personalize your message to encourage students to explore scholarship opportunities. Include deadlines and application links if applicable.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowNotifyModal(false)}
                                        disabled={sendingNotifications}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={sendNotification}
                                        disabled={!notificationMessage.trim() || sendingNotifications}
                                    >
                                        {sendingNotifications ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-1"></i>
                                                Send Notification
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Student Details Modal */}
            {showDetailsModal && selectedStudent && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header border-0 bg-light">
                                    <div>
                                        <h5 className="modal-title fw-bold">
                                            <i className="fas fa-user-circle text-warning me-2"></i>
                                            Student Details
                                        </h5>
                                        <p className="text-muted small mb-0">
                                            Complete information for {selectedStudent.first_name} {selectedStudent.last_name}
                                        </p>
                                    </div>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowDetailsModal(false)}
                                        aria-label="Close"
                                    />
                                </div>
                                <div className="modal-body px-4 py-4">
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Personal Information
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="text-muted small d-block mb-1">Student Number</label>
                                            <strong>{selectedStudent.student_number}</strong>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="text-muted small d-block mb-1">Gender</label>
                                            <span className={`badge ${selectedStudent.gender === 'Male' ? 'bg-primary' : 'bg-danger'}`}>
                                                <i className={`fas ${selectedStudent.gender === 'Male' ? 'fa-mars' : 'fa-venus'} me-1`}></i>
                                                {selectedStudent.gender}
                                            </span>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="text-muted small d-block mb-1">First Name</label>
                                            <strong>{selectedStudent.first_name}</strong>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="text-muted small d-block mb-1">Middle Name</label>
                                            <strong>{selectedStudent.middle_name || 'N/A'}</strong>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="text-muted small d-block mb-1">Last Name</label>
                                            <strong>{selectedStudent.last_name}</strong>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="text-muted small d-block mb-1">Birthdate</label>
                                            <div>
                                                <strong className="d-block">{formatDate(selectedStudent.birth_date)}</strong>
                                                <small className="text-muted">Age: {calculateAge(selectedStudent.birth_date)} years old</small>
                                            </div>
                                        </div>

                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold text-success border-bottom pb-2 mb-3">
                                                <i className="fas fa-key me-2"></i>
                                                Account Information
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="text-muted small d-block mb-1">Username</label>
                                            <code className="bg-light text-primary px-2 py-1 rounded">
                                                {selectedStudent.username}
                                            </code>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="text-muted small d-block mb-1">Email Address</label>
                                            <a
                                                href={`mailto:${selectedStudent.email}`}
                                                className="text-decoration-none text-primary d-flex align-items-center"
                                            >
                                                <i className="far fa-envelope me-2"></i>
                                                {selectedStudent.email}
                                            </a>
                                        </div>

                                        <div className="col-12 mt-3">
                                            <div className="alert alert-warning border-0 mb-0">
                                                <div className="d-flex align-items-start">
                                                    <i className="fas fa-exclamation-circle me-2 mt-1"></i>
                                                    <div>
                                                        <strong>Note:</strong> This student has not yet submitted a scholarship application. Consider reaching out to encourage them to apply.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowDetailsModal(false)}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Close
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleNotifySingle(selectedStudent);
                                        }}
                                    >
                                        <i className="fas fa-bell me-1"></i>
                                        Send Notification
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleArchiveStudent(
                                                selectedStudent.student_id,
                                                `${selectedStudent.first_name} ${selectedStudent.last_name}`
                                            );
                                        }}
                                    >
                                        <i className="fas fa-archive me-1"></i>
                                        Archive
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default NotApplied;
