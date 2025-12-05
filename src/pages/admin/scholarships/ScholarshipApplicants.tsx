import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    Clock,
    CheckCircle,
    Award,
    Star,
    Search,
    Download,
    AlertCircle,
    Eye,
    FileText,
    XCircle,
    Filter,
    ChevronDown
} from "lucide-react";
import { API_BASE_URL } from "../../../config.ts";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext.tsx";
import ViewApplicantReadOnlyForm from "../../../components/admin/modals/ViewApplicantReadOnlyForm.tsx";
import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";
import type { Applicant } from "../../../interfaces/applicant.ts";
import type { Course } from "../../../interfaces/meta.ts";

export interface GradeEntry {
    grade: number;
    subject_name: string;
    units: number;
}

export interface ApplicantData {
    application_id: number;
    campus_id: number;
    course_id: number;
    department_id: number;
    family_income: string;
    grades: GradeEntry[];
    id: number;
    is_farmers_child: boolean;
    is_ip: boolean;
    is_ofw: boolean;
    is_pwd?: boolean;
    name: string;
    status: 'pending' | 'approved' | 'denied' | 'evaluated' | string;
    user_id: number;
    year_level: string;
}

interface EvaluationResult {
    gwa: number;
    score: number;
    classification: string;
}

interface Recommendation {
    scholarship_id: number;
    name: string;
    description: string;
    amount: number;
    score: number;
    classification: string;
    reasons: string[];
}

interface Selection {
    scholarship_name?: string;
    awarded_amount?: string | number;
    final_score?: number;
    selected_date?: string;
    selection_reason?: string;
}

type StatusFilter = 'all' | 'pending' | 'evaluated' | 'approved' | 'denied';

const ScholarshipApplicants: React.FC = () => {
    const { token, isFaculty, userCampusId } = useAuth();
    const tableRef = useRef<HTMLTableElement>(null);
    const [datatable, setDatatable] = useState<DataTable | null>(null);

    // State
    const [applications, setApplications] = useState<ApplicantData[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [evaluationResults, setEvaluationResults] = useState<Record<number, EvaluationResult>>({});
    const [recommendations, setRecommendations] = useState<Record<number, Recommendation[]>>({});
    const [selections, setSelections] = useState<Record<number, Selection>>({});
    const [courses, setCourses] = useState<Record<number, Course>>({});
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<number | null>(null);

    // Filter state
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [showRecommendationModal, setShowRecommendationModal] = useState(false);
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [currentApplicant, setCurrentApplicant] = useState<ApplicantData | null>(null);

    // Selection modal state
    const [selectedScholarshipId, setSelectedScholarshipId] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [selectionReason, setSelectionReason] = useState<string>('');

    // Fetch applicants
    const fetchEvaluatees = async () => {
        try {
            setLoading(true);
            const response = await axios.get<ApplicantData[]>(`${API_BASE_URL}/api/evaluations/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter by campus for faculty users
            let data = response.data;
            if (isFaculty && userCampusId) {
                data = data.filter(app => app.campus_id === userCampusId);
            }
            setApplications(data);
        } catch (error) {
            console.error("Error fetching evaluatees:", error);
            await Swal.fire('Error', 'Failed to load applicants.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch courses for display
    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/courses`);
            const data: Course[] = await response.json();
            const mapped: Record<number, Course> = {};
            data.forEach((course) => {
                mapped[course.id] = course;
            });
            setCourses(mapped);
        } catch (err) {
            console.error("Failed to fetch courses", err);
        }
    };

    // Fetch evaluation results for an application
    const fetchEvaluationResults = async (applicationId: number): Promise<EvaluationResult | null> => {
        try {
            const response = await axios.get<EvaluationResult>(
                `${API_BASE_URL}/api/evaluations/${applicationId}/results`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEvaluationResults(prev => ({ ...prev, [applicationId]: response.data }));
            return response.data;
        } catch (error) {
            console.error("Error fetching evaluation results:", error);
            return null;
        }
    };

    // Fetch recommendations for an application
    const fetchRecommendations = async (applicationId: number): Promise<Recommendation[]> => {
        try {
            const response = await axios.get<Recommendation[]>(
                `${API_BASE_URL}/api/evaluations/${applicationId}/recommendations`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRecommendations(prev => ({ ...prev, [applicationId]: response.data }));
            return response.data;
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            return [];
        }
    };

    // Fetch selections for an application
    const fetchSelections = async (applicationId: number): Promise<Selection | null> => {
        try {
            const response = await axios.get<Selection>(
                `${API_BASE_URL}/api/evaluations/${applicationId}/selection`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data) {
                setSelections(prev => ({ ...prev, [applicationId]: response.data }));
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching selections:", error);
            return null;
        }
    };

    // Load all data for applicants
    const loadApplicantData = async () => {
        if (!applications || applications.length === 0) return;
        await Promise.all(applications.map(async (app) => {
            await fetchEvaluationResults(app.id);
            await fetchRecommendations(app.id);
            await fetchSelections(app.id);
        }));
    };

    // Helper functions
    const calculateGWA = (grades: GradeEntry[]): number => {
        if (!grades || grades.length === 0) return 0;
        let totalGradePoints = 0;
        let totalUnits = 0;
        grades.forEach(grade => {
            totalGradePoints += grade.grade * grade.units;
            totalUnits += grade.units;
        });
        return totalUnits > 0 ? totalGradePoints / totalUnits : 0;
    };

    const getTotalUnits = (grades: GradeEntry[]): number => {
        if (!grades || grades.length === 0) return 0;
        return grades.reduce((sum, grade) => sum + grade.units, 0);
    };

    const getCourseInfo = (courseId: number) => {
        return courses[courseId] || { name: "Unknown Course" };
    };

    const formatCurrency = (value: string | number): string => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return `₱${num.toLocaleString()}`;
    };

    // Status badge
    const getStatusBadge = (status: string) => {
        const variants: Record<string, { class: string; text: string }> = {
            pending: { class: 'bg-warning text-dark', text: 'Pending' },
            approved: { class: 'bg-success', text: 'Approved' },
            denied: { class: 'bg-danger', text: 'Denied' },
            evaluated: { class: 'bg-primary', text: 'Evaluated' }
        };
        const config = variants[status] || variants.pending;
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    };

    // Classification badge
    const getClassificationBadge = (classification: string) => {
        const badgeClasses: Record<string, string> = {
            'Eligible': 'bg-success',
            'Conditionally Eligible': 'bg-warning text-dark',
            'Somewhat Eligible': 'bg-info',
            'Barely Eligible': 'bg-secondary',
            'Low Eligibility': 'bg-danger',
            'Not Eligible': 'bg-dark'
        };
        return (
            <span className={`badge ${badgeClasses[classification] || 'bg-secondary'}`}>
                {classification || 'N/A'}
            </span>
        );
    };

    // Filter applications
    const filteredApplications = applications.filter(app => {
        const courseInfo = getCourseInfo(app.course_id);
        const matchesSearch = 
            app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            courseInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        fetchEvaluatees();
        fetchCourses();
    }, []);

    useEffect(() => {
        loadApplicantData();
    }, [applications.length]);

    // Initialize DataTable
    useEffect(() => {
        if (tableRef.current && filteredApplications.length > 0 && !datatable) {
            const dt = new DataTable(tableRef.current, {
                searchable: false, // We use custom search
                perPageSelect: [10, 25, 50, 100],
                perPage: 10,
                labels: {
                    placeholder: "Search applicants...",
                    noRows: "No applicants found",
                }
            });
            setDatatable(dt);
        }
        return () => {
            if (datatable) {
                datatable.destroy();
                setDatatable(null);
            }
        };
    }, [filteredApplications.length]);

    // View applicant details
    const handleView = async (app: ApplicantData) => {
        setCurrentApplicant(app);
        try {
            const response = await axios.get<Applicant>(
                `${API_BASE_URL}/api/applicants/${app.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedApplicant(response.data);
            setShowViewModal(true);
        } catch (error) {
            console.error('Error viewing applicant:', error);
            await Swal.fire('Error', 'Failed to load applicant details.', 'error');
        }
    };

    // Open evaluation modal
    const handleOpenEvaluation = (app: ApplicantData) => {
        setCurrentApplicant(app);
        setShowEvaluationModal(true);
    };

    // Evaluate applicant
    const handleEvaluate = async () => {
        if (!currentApplicant) return;

        const confirm = await Swal.fire({
            title: 'Evaluate Applicant',
            text: `Evaluate ${currentApplicant.name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, evaluate',
            cancelButtonText: 'Cancel'
        });

        if (!confirm.isConfirmed) return;

        try {
            setLoadingId(currentApplicant.id);
            const gwa = calculateGWA(currentApplicant.grades);
            const income = parseFloat(currentApplicant.family_income || '0');
            const total_units = getTotalUnits(currentApplicant.grades);

            // Call backend to evaluate
            const evaluationResponse = await axios.post<EvaluationResult>(
                `${API_BASE_URL}/api/evaluations/${currentApplicant.id}/evaluate`,
                { gwa, income, total_units },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEvaluationResults(prev => ({
                ...prev,
                [currentApplicant.id]: evaluationResponse.data
            }));

            // Generate recommendations
            const recommendationsResponse = await axios.post<Recommendation[]>(
                `${API_BASE_URL}/api/evaluations/${currentApplicant.id}/recommend`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRecommendations(prev => ({
                ...prev,
                [currentApplicant.id]: recommendationsResponse.data
            }));

            // Update status
            setApplications(prev => prev.map(app =>
                app.id === currentApplicant.id ? { ...app, status: 'evaluated' } : app
            ));

            await Swal.fire({
                title: 'Success!',
                text: 'Application evaluated and recommendations generated successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error evaluating application:", error);
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to evaluate application. Please try again.',
                icon: 'error'
            });
        } finally {
            setLoadingId(null);
        }
    };

    // Open recommendation modal
    const handleOpenRecommendation = async (app: ApplicantData) => {
        setCurrentApplicant(app);
        // Ensure we have latest recommendations
        await fetchRecommendations(app.id);
        setShowRecommendationModal(true);
    };

    // Open selection modal
    const handleOpenSelection = async (app: ApplicantData) => {
        setCurrentApplicant(app);
        setSelectedScholarshipId(null);
        setCustomAmount('');
        setSelectionReason('');
        // Ensure we have latest recommendations
        await fetchRecommendations(app.id);
        setShowSelectionModal(true);
    };

    // Award scholarship
    const handleAwardScholarship = async () => {
        if (!currentApplicant || !selectedScholarshipId) {
            await Swal.fire('Error', 'Please select a scholarship.', 'error');
            return;
        }

        const appRecommendations = recommendations[currentApplicant.id] || [];
        const selectedRec = appRecommendations.find(r => r.scholarship_id === selectedScholarshipId);

        if (!selectedRec) {
            await Swal.fire('Error', 'Selected scholarship not found.', 'error');
            return;
        }

        const amount = customAmount ? parseFloat(customAmount) : selectedRec.amount;

        const confirm = await Swal.fire({
            title: 'Award Scholarship',
            html: `
                <div class="text-start">
                    <p><strong>Applicant:</strong> ${currentApplicant.name}</p>
                    <p><strong>Scholarship:</strong> ${selectedRec.name}</p>
                    <p><strong>Amount:</strong> ₱${amount.toLocaleString()}</p>
                    <p class="text-muted mt-3">This action will award the scholarship to the applicant.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, award scholarship',
            confirmButtonColor: '#198754',
            cancelButtonText: 'Cancel'
        });

        if (!confirm.isConfirmed) return;

        try {
            setLoadingId(currentApplicant.id);

            const response = await axios.post<Selection>(
                `${API_BASE_URL}/api/evaluations/${currentApplicant.id}/select`,
                {
                    scholarship_id: selectedScholarshipId,
                    awarded_amount: amount,
                    selection_reason: selectionReason || `Selected based on evaluation score: ${selectedRec.score.toFixed(3)} - ${selectedRec.classification}`
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const selectionData = {
                ...response.data,
                scholarship_name: selectedRec.name,
                final_score: selectedRec.score,
                selected_date: new Date().toISOString()
            };

            setSelections(prev => ({
                ...prev,
                [currentApplicant.id]: selectionData
            }));

            setApplications(prev => prev.map(app =>
                app.id === currentApplicant.id ? { ...app, status: 'approved' } : app
            ));

            setShowSelectionModal(false);

            await Swal.fire({
                title: 'Success!',
                text: `Scholarship "${selectedRec.name}" awarded successfully!`,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error selecting scholarship:", error);
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to award scholarship. Please try again.',
                icon: 'error'
            });
        } finally {
            setLoadingId(null);
        }
    };

    // Deny application
    const handleDeny = async (app: ApplicantData) => {
        const { value: reason } = await Swal.fire({
            title: 'Deny Application',
            text: 'Please provide a reason for denying this application:',
            input: 'textarea',
            inputPlaceholder: 'Enter reason for denial...',
            inputAttributes: { 'rows': '4' },
            showCancelButton: true,
            confirmButtonText: 'Deny Application',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            icon: 'warning',
            inputValidator: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Please provide a reason for denial';
                }
                if (value.trim().length < 10) {
                    return 'Reason must be at least 10 characters long';
                }
            }
        });

        if (reason) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/applicants/${app.id}/deny`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ reason: reason.trim() })
                });

                if (!response.ok) throw new Error('Failed to deny application');

                setApplications(prev => prev.map(a =>
                    a.id === app.id ? { ...a, status: 'denied' } : a
                ));

                await Swal.fire(
                    'Application Denied',
                    'The application has been denied and the applicant will be notified.',
                    'success'
                );

            } catch (error) {
                await Swal.fire('Error', (error as Error).message || 'Something went wrong', 'error');
            }
        }
    };

    // Export to CSV
    const handleExport = () => {
        const headers = ['#', 'Name', 'Course', 'Year Level', 'GWA', 'Family Income', 'Status', 'Score', 'Classification'];
        const rows = filteredApplications.map((app, index) => {
            const evaluation = evaluationResults[app.id];
            const gwa = evaluation?.gwa || calculateGWA(app.grades);
            return [
                index + 1,
                app.name,
                getCourseInfo(app.course_id).name,
                app.year_level,
                gwa.toFixed(2),
                app.family_income,
                app.status,
                evaluation ? (evaluation.score * 100).toFixed(1) + '%' : 'N/A',
                evaluation?.classification || 'N/A'
            ];
        });

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `scholarship_applicants_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Stats
    const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        evaluated: applications.filter(app => app.status === 'evaluated').length,
        approved: applications.filter(app => app.status === 'approved').length,
        denied: applications.filter(app => app.status === 'denied').length
    };

    return (
        <>
            {/* Header */}
            <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container-fluid px-4">
                    <div className="py-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-primary bg-opacity-10 rounded">
                                    <Award className="text-primary" size={32} />
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold">Scholarship Applicants</h1>
                                    <p className="text-muted mb-0 small">Manage applicant evaluations, recommendations, and selections</p>
                                </div>
                            </div>
                            <button
                                className="btn btn-outline-success d-flex align-items-center"
                                onClick={handleExport}
                            >
                                <Download size={18} className="me-2" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3 col-lg">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="text-muted small fw-medium mb-1">Total</div>
                                        <div className="h4 fw-bold text-primary mb-0">{stats.total}</div>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 p-2 rounded">
                                        <Users className="text-primary" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 col-lg">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="text-muted small fw-medium mb-1">Pending</div>
                                        <div className="h4 fw-bold text-warning mb-0">{stats.pending}</div>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 p-2 rounded">
                                        <Clock className="text-warning" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 col-lg">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="text-muted small fw-medium mb-1">Evaluated</div>
                                        <div className="h4 fw-bold text-info mb-0">{stats.evaluated}</div>
                                    </div>
                                    <div className="bg-info bg-opacity-10 p-2 rounded">
                                        <Star className="text-info" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 col-lg">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="text-muted small fw-medium mb-1">Approved</div>
                                        <div className="h4 fw-bold text-success mb-0">{stats.approved}</div>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-2 rounded">
                                        <CheckCircle className="text-success" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 col-lg">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="text-muted small fw-medium mb-1">Denied</div>
                                        <div className="h4 fw-bold text-danger mb-0">{stats.denied}</div>
                                    </div>
                                    <div className="bg-danger bg-opacity-10 p-2 rounded">
                                        <XCircle className="text-danger" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3">
                        <div className="row g-3 align-items-center">
                            <div className="col-lg-6">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <Search size={16} className="text-muted" />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search by name or course..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-light">
                                        <Filter size={16} className="text-muted" />
                                    </span>
                                    <select
                                        className="form-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="evaluated">Evaluated</option>
                                        <option value="approved">Approved</option>
                                        <option value="denied">Denied</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-lg-2 text-end">
                                <small className="text-muted">
                                    Showing {filteredApplications.length} of {applications.length}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom py-3">
                        <h5 className="mb-0 fw-semibold">
                            <Users className="me-2 text-primary" size={20} />
                            Applicants List
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : filteredApplications.length > 0 ? (
                            <div className="table-responsive">
                                <table ref={tableRef} className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '50px' }}>#</th>
                                            <th>Applicant Name</th>
                                            <th>Course</th>
                                            <th style={{ width: '80px' }}>Year</th>
                                            <th style={{ width: '80px' }}>GWA</th>
                                            <th style={{ width: '120px' }}>Family Income</th>
                                            <th style={{ width: '100px' }}>Status</th>
                                            <th style={{ width: '100px' }}>Score</th>
                                            <th style={{ width: '140px' }}>Classification</th>
                                            <th style={{ width: '180px' }} className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApplications.map((app, index) => {
                                            const evaluation = evaluationResults[app.id];
                                            const gwa = evaluation?.gwa || calculateGWA(app.grades);
                                            const hasSelection = !!selections[app.id];

                                            return (
                                                <tr key={app.id}>
                                                    <td className="text-muted">{index + 1}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                                                                style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                                                                <span className="fw-bold text-primary small">
                                                                    {app.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="fw-semibold">{app.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="small">{getCourseInfo(app.course_id).name}</td>
                                                    <td className="text-center">{app.year_level}</td>
                                                    <td className="text-center fw-semibold">{gwa.toFixed(2)}</td>
                                                    <td className="small">{formatCurrency(app.family_income)}</td>
                                                    <td>{getStatusBadge(app.status)}</td>
                                                    <td className="text-center">
                                                        {evaluation ? (
                                                            <span className="badge bg-info bg-opacity-10 text-info border border-info">
                                                                {(evaluation.score * 100).toFixed(1)}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted">—</span>
                                                        )}
                                                    </td>
                                                    <td>{evaluation ? getClassificationBadge(evaluation.classification) : <span className="text-muted">—</span>}</td>
                                                    <td>
                                                        <div className="d-flex justify-content-center gap-1">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                title="View Details"
                                                                onClick={() => handleView(app)}
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-warning"
                                                                title="Evaluate"
                                                                onClick={() => handleOpenEvaluation(app)}
                                                                disabled={app.status === 'approved' || app.status === 'denied'}
                                                            >
                                                                <Star size={14} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-info"
                                                                title="Recommendations"
                                                                onClick={() => handleOpenRecommendation(app)}
                                                                disabled={!evaluation}
                                                            >
                                                                <FileText size={14} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-success"
                                                                title="Select/Award"
                                                                onClick={() => handleOpenSelection(app)}
                                                                disabled={!evaluation || hasSelection || app.status === 'denied'}
                                                            >
                                                                <Award size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <AlertCircle className="text-muted mb-3" size={48} />
                                <h5 className="text-muted">No applicants found</h5>
                                <p className="text-muted small mb-0">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'There are no scholarship applicants yet'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Applicant Modal */}
            {showViewModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <Eye className="me-2" size={20} />
                                    Applicant Details
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
                            </div>
                            <div className="modal-body p-0">
                                {selectedApplicant && (
                                    <ViewApplicantReadOnlyForm applicant={selectedApplicant} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Evaluation Modal */}
            {showEvaluationModal && currentApplicant && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-warning bg-opacity-10">
                                <h5 className="modal-title">
                                    <Star className="me-2 text-warning" size={20} />
                                    Evaluate Applicant
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowEvaluationModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {/* Applicant Summary */}
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3">Applicant Summary</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                                                        style={{ width: '48px', height: '48px' }}>
                                                        <span className="fw-bold text-primary">
                                                            {currentApplicant.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{currentApplicant.name}</div>
                                                        <div className="text-muted small">{getCourseInfo(currentApplicant.course_id).name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 text-md-end">
                                                {getStatusBadge(currentApplicant.status)}
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="row g-3">
                                            <div className="col-6 col-md-3">
                                                <div className="text-muted small">GWA</div>
                                                <div className="fw-bold text-primary">{calculateGWA(currentApplicant.grades).toFixed(2)}</div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="text-muted small">Family Income</div>
                                                <div className="fw-bold text-success">{formatCurrency(currentApplicant.family_income)}</div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="text-muted small">Total Units</div>
                                                <div className="fw-bold">{getTotalUnits(currentApplicant.grades)}</div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="text-muted small">Year Level</div>
                                                <div className="fw-bold">{currentApplicant.year_level}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Evaluation Results */}
                                {evaluationResults[currentApplicant.id] && (
                                    <div className="alert alert-success">
                                        <h6 className="alert-heading fw-bold">
                                            <CheckCircle className="me-2" size={18} />
                                            Evaluation Complete
                                        </h6>
                                        <hr />
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="text-muted small">Score</div>
                                                <div className="h4 mb-0">{(evaluationResults[currentApplicant.id].score * 100).toFixed(1)}%</div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="text-muted small">GWA</div>
                                                <div className="h4 mb-0">{evaluationResults[currentApplicant.id].gwa.toFixed(2)}</div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="text-muted small">Classification</div>
                                                <div className="mt-1">{getClassificationBadge(evaluationResults[currentApplicant.id].classification)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Special Categories */}
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {currentApplicant.is_ofw && <span className="badge bg-info">OFW Dependent</span>}
                                    {currentApplicant.is_farmers_child && <span className="badge bg-success">Farmer's Child</span>}
                                    {currentApplicant.is_ip && <span className="badge bg-warning text-dark">Indigenous Person</span>}
                                    {currentApplicant.is_pwd && <span className="badge bg-secondary">PWD</span>}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEvaluationModal(false)}>
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={handleEvaluate}
                                    disabled={loadingId === currentApplicant.id || currentApplicant.status === 'approved' || currentApplicant.status === 'denied'}
                                >
                                    {loadingId === currentApplicant.id ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Evaluating...
                                        </>
                                    ) : (
                                        <>
                                            <Star className="me-2" size={16} />
                                            {evaluationResults[currentApplicant.id] ? 'Re-evaluate' : 'Evaluate Application'}
                                        </>
                                    )}
                                </button>
                                {evaluationResults[currentApplicant.id] && currentApplicant.status !== 'denied' && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => {
                                            setShowEvaluationModal(false);
                                            handleDeny(currentApplicant);
                                        }}
                                    >
                                        <XCircle className="me-2" size={16} />
                                        Deny Application
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendation Modal */}
            {showRecommendationModal && currentApplicant && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-info bg-opacity-10">
                                <h5 className="modal-title">
                                    <FileText className="me-2 text-info" size={20} />
                                    Scholarship Recommendations
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowRecommendationModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <strong>{currentApplicant.name}</strong>
                                    <span className="text-muted ms-2">• {getCourseInfo(currentApplicant.course_id).name}</span>
                                </div>

                                {recommendations[currentApplicant.id]?.length > 0 ? (
                                    <div className="row g-3">
                                        {recommendations[currentApplicant.id].map((rec, index) => (
                                            <div key={index} className="col-12">
                                                <div className="card border">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <h6 className="fw-bold mb-1">{rec.name}</h6>
                                                                <p className="text-muted small mb-2">{rec.description}</p>
                                                            </div>
                                                            <span className="badge bg-success fs-6">
                                                                {formatCurrency(rec.amount)}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex gap-2 mb-3">
                                                            <span className="badge bg-primary">
                                                                Score: {(rec.score * 100).toFixed(1)}%
                                                            </span>
                                                            {getClassificationBadge(rec.classification)}
                                                        </div>

                                                        {/* Eligibility Reasons Accordion */}
                                                        <div className="accordion accordion-flush" id={`accordion-${currentApplicant.id}-${index}`}>
                                                            <div className="accordion-item border-0">
                                                                <h6 className="accordion-header">
                                                                    <button
                                                                        className="accordion-button collapsed p-0 bg-transparent shadow-none text-primary small fw-semibold"
                                                                        type="button"
                                                                        data-bs-toggle="collapse"
                                                                        data-bs-target={`#collapse-rec-${currentApplicant.id}-${index}`}
                                                                    >
                                                                        <ChevronDown size={16} className="me-1" />
                                                                        View Eligibility Details ({rec.reasons?.length || 0} criteria)
                                                                    </button>
                                                                </h6>
                                                                <div id={`collapse-rec-${currentApplicant.id}-${index}`} className="accordion-collapse collapse">
                                                                    <div className="accordion-body p-3 bg-light rounded mt-2">
                                                                        {rec.reasons?.length > 0 ? (
                                                                            <ul className="list-unstyled mb-0">
                                                                                {rec.reasons.map((reason, idx) => (
                                                                                    <li key={idx} className="mb-2 d-flex align-items-start">
                                                                                        {reason.startsWith('✓') ? (
                                                                                            <CheckCircle size={14} className="text-success me-2 mt-1 flex-shrink-0" />
                                                                                        ) : (
                                                                                            <XCircle size={14} className="text-danger me-2 mt-1 flex-shrink-0" />
                                                                                        )}
                                                                                        <span className="small">{reason}</span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        ) : (
                                                                            <p className="text-muted small mb-0">No detailed reasons available.</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <AlertCircle className="text-warning mb-3" size={48} />
                                        <h5 className="text-muted">No Recommendations Available</h5>
                                        <p className="text-muted small">
                                            This applicant doesn't match the criteria for any available scholarships.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRecommendationModal(false)}>
                                    Close
                                </button>
                                {recommendations[currentApplicant.id]?.length > 0 && !selections[currentApplicant.id] && currentApplicant.status !== 'denied' && (
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={() => {
                                            setShowRecommendationModal(false);
                                            handleOpenSelection(currentApplicant);
                                        }}
                                    >
                                        <Award className="me-2" size={16} />
                                        Proceed to Selection
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Selection Modal */}
            {showSelectionModal && currentApplicant && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-success bg-opacity-10">
                                <h5 className="modal-title">
                                    <Award className="me-2 text-success" size={20} />
                                    Award Scholarship
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowSelectionModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-4">
                                    <strong>{currentApplicant.name}</strong>
                                    <span className="text-muted ms-2">• {getCourseInfo(currentApplicant.course_id).name}</span>
                                </div>

                                {/* Scholarship Selection */}
                                {recommendations[currentApplicant.id]?.length > 0 ? (
                                    <>
                                        <h6 className="fw-bold mb-3">Select Scholarship to Award</h6>
                                        <div className="row g-3 mb-4">
                                            {recommendations[currentApplicant.id].map((rec) => (
                                                <div key={rec.scholarship_id} className="col-12">
                                                    <div
                                                        className={`card border-2 cursor-pointer ${selectedScholarshipId === rec.scholarship_id ? 'border-success bg-success bg-opacity-10' : ''}`}
                                                        onClick={() => {
                                                            setSelectedScholarshipId(rec.scholarship_id);
                                                            setCustomAmount(rec.amount.toString());
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="card-body">
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="scholarshipSelection"
                                                                    id={`scholarship-${rec.scholarship_id}`}
                                                                    checked={selectedScholarshipId === rec.scholarship_id}
                                                                    onChange={() => {
                                                                        setSelectedScholarshipId(rec.scholarship_id);
                                                                        setCustomAmount(rec.amount.toString());
                                                                    }}
                                                                />
                                                                <label className="form-check-label w-100" htmlFor={`scholarship-${rec.scholarship_id}`}>
                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <div>
                                                                            <div className="fw-bold">{rec.name}</div>
                                                                            <div className="text-muted small">{rec.description}</div>
                                                                        </div>
                                                                        <div className="text-end">
                                                                            <div className="fw-bold text-success">{formatCurrency(rec.amount)}</div>
                                                                            <div className="small">
                                                                                <span className="badge bg-primary bg-opacity-10 text-primary me-1">
                                                                                    {(rec.score * 100).toFixed(1)}%
                                                                                </span>
                                                                                {getClassificationBadge(rec.classification)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Custom Amount */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold">Awarded Amount (Optional)</label>
                                            <div className="input-group">
                                                <span className="input-group-text">₱</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={customAmount}
                                                    onChange={(e) => setCustomAmount(e.target.value)}
                                                    placeholder="Enter custom amount or use default"
                                                />
                                            </div>
                                            <div className="form-text">Leave as is to use the scholarship's default amount.</div>
                                        </div>

                                        {/* Selection Reason */}
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Selection Reason (Optional)</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={selectionReason}
                                                onChange={(e) => setSelectionReason(e.target.value)}
                                                placeholder="Provide a reason for selecting this scholarship..."
                                            ></textarea>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-5">
                                        <AlertCircle className="text-warning mb-3" size={48} />
                                        <h5 className="text-muted">No Scholarships Available</h5>
                                        <p className="text-muted small">
                                            There are no recommended scholarships to award to this applicant.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowSelectionModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleAwardScholarship}
                                    disabled={!selectedScholarshipId || loadingId === currentApplicant.id}
                                >
                                    {loadingId === currentApplicant.id ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Awarding...
                                        </>
                                    ) : (
                                        <>
                                            <Award className="me-2" size={16} />
                                            Award Scholarship
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ScholarshipApplicants;
