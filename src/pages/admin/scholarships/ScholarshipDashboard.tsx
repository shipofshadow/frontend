import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, Award, Star, Search, Download, AlertCircle, Eye, FileText } from "lucide-react";
import {API_BASE_URL} from "../../../config.ts";
import axios from "axios";
import {useAuth} from "../../../context/AuthContext.tsx";
import ViewApplicantReadOnlyForm from "../../../components/admin/modals/ViewApplicantReadOnlyForm.tsx";
import Swal from "sweetalert2";
import type {Applicant} from "../../../interfaces/applicant.ts";
import type {Scholarship} from "../../../interfaces/scholarship.ts";
import type {Course} from "../../../interfaces/meta.ts";

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
    status: 'pending' | 'approved' | 'denied' | string;
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


const ScholarshipDashboard = () => {
    const [activeTab, setActiveTab] = useState('evaluate');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus] = useState('all');
    const {token} = useAuth();
    const [applications, setApplications] = useState<ApplicantData[]>([]);
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [evaluationResults, setEvaluationResults] = useState<Record<number, EvaluationResult>>({});
    const [recommendations, setRecommendations] = useState<Record<number, Recommendation[]>>({});
    const [selections, setSelections] = useState<Record<number, Selection>>({});
    const [loadingId, setLoadingId] = useState(null);
    const [courses, setCourses] = useState<Record<number, Course>>({});


    const fetchEvaluatees = () => {
        axios.get<ApplicantData[]>(`${API_BASE_URL}/api/evaluations/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setApplications(response.data)
                console.log("lol", response.data)
            })
            .catch(error => {
                console.error("Error fetching evaluatees:", error);
            });
    };

    const fetchScholarships = () => {
        axios.get<Scholarship[]>(`${API_BASE_URL}/api/scholarships/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setScholarships(response.data)
            })
            .catch(error => {
                console.error("Error fetching scholarships:", error);
            });
    };

    // Fetch evaluation results for an application
    const fetchEvaluationResults = async (applicationId: number): Promise<EvaluationResult | null> => {
        try {
            const response = await axios.get<EvaluationResult>(`${API_BASE_URL}/api/evaluations/${applicationId}/results`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setEvaluationResults(prev => ({
                ...prev,
                [applicationId]: response.data
            }));

            return response.data;
        } catch (error) {
            console.error("Error fetching evaluation results:", error);
            return null;
        }
    };

    // Fetch recommendations for an application
    const fetchRecommendations = async (applicationId: number): Promise<Recommendation[]> => {
        try {
            const response = await axios.get<Recommendation[]>(`${API_BASE_URL}/api/evaluations/${applicationId}/recommendations`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log(response.data);

            setRecommendations(prev => ({
                ...prev,
                [applicationId]: response.data
            }));


            return response.data;
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            return [];
        }
    };

    // Fixed fetchSelections function
    const fetchSelections = async (applicationId: number): Promise<Selection | null> => {
        try {
            const response = await axios.get<Selection>(`${API_BASE_URL}/api/evaluations/${applicationId}/selection`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Handle both null response and actual selection data
            const selectionData = response.data;

            if (selectionData) {
                setSelections(prev => ({
                    ...prev,
                    [applicationId]: selectionData
                }));
            } else {
                // No selection found - remove from selections if exists
                setSelections(prev => {
                    const updated = { ...prev };
                    delete updated[applicationId];
                    return updated;
                });
            }

            return selectionData;
        } catch (error) {
            console.error("Error fetching selections:", error);
            // Don't set selection data on error
            return null;
        }
    };


    useEffect(() => {
        fetchEvaluatees();
        fetchScholarships();
    }, []);

    useEffect(() => {
        if (!applications || applications.length === 0) return;

        applications.forEach(app => {
            fetchEvaluationResults(app.id);
            fetchRecommendations(app.id);
            fetchSelections(app.id);
        });
    }, [applications]);


    useEffect(() => {
        fetch(`${API_BASE_URL}/api/courses`)
            .then((res) => res.json())
            .then((data: Course[]) => {
                const mapped: Record<number, Course> = {};
                data.forEach((course) => {
                    mapped[course.id] = {
                        ...course,
                    };
                });
                setCourses(mapped);
            })
            .catch((err) => console.error("Failed to fetch courses", err));
    }, []);



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

    // Helper function to calculate GWA from grades array
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
        console.log(courseId);
        return courses[courseId] || { name: "Unknown Course", email_domain: "student" };
    };

    // API call to evaluate and generate recommendations
    const handleEvaluate = async (applicationId: number): Promise<void> => {
        const applicant = applications.find(a => a.id === applicationId);
        if (!applicant) return;

        const confirm = await Swal.fire({
            title: 'Evaluate Applicant',
            text: `Evaluate ${applicant.name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, evaluate',
            cancelButtonText: 'Cancel'
        });

        if (!confirm.isConfirmed) return;

        try {

            const gwa = calculateGWA(applicant.grades);
            const income = parseFloat(applicant.family_income || '0');
            const total_units = getTotalUnits(applicant.grades);
            // Call backend to evaluate the application
            const evaluationResponse = await axios.post<EvaluationResult>(
                `${API_BASE_URL}/api/evaluations/${applicationId}/evaluate`,
                {
                    gwa,
                    income,
                    total_units,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Update evaluation results
            setEvaluationResults(prev => ({
                ...prev,
                [applicationId]: evaluationResponse.data
            }));

            // Call backend to generate recommendations
            const recommendationsResponse = await axios.post<Recommendation[]>(
                `${API_BASE_URL}/api/evaluations/${applicationId}/recommend`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Update recommendations
            setRecommendations(prev => ({
                ...prev,
                [applicationId]: recommendationsResponse.data
            }));

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

    // API call to select final scholarship
    const handleSelectScholarship = async (applicationId: number, scholarshipId: number): Promise<void> => {

        const applicant = applications.find(a => a.id === applicationId);
        const recommendation = recommendations[applicationId]?.find(r => r.scholarship_id === scholarshipId);

        if (!recommendation || !applicant) {
            await Swal.fire({
                title: 'Error!',
                text: 'Could not find scholarship recommendation details.',
                icon: 'error'
            });
            return;
        }

        const confirm = await Swal.fire({
            title: 'Award Scholarship',
            html: `
            <div class="text-start">
                <p><strong>Applicant:</strong> ${applicant.name}</p>
                <p><strong>Scholarship:</strong> ${recommendation.name}</p>
                <p><strong>Amount:</strong> ₱${recommendation.amount.toLocaleString()}</p>
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
            const response = await axios.post<Selection>(
                `${API_BASE_URL}/api/evaluations/${applicationId}/select`,
                {
                    scholarship_id: scholarshipId,
                    awarded_amount: recommendation.amount,
                    selection_reason: `Selected based on evaluation score: ${recommendation.score.toFixed(3)} - ${recommendation.classification}`
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Update selections with the response data
            const selectionData = {
                ...response.data,
                scholarship_name: recommendation.name,
                final_score: recommendation.score,
                selected_date: new Date().toISOString()
            };

            setSelections(prev => ({
                ...prev,
                [applicationId]: selectionData
            }));

            // Update application status
            setApplications(prev => prev.map(app =>
                app.id === applicationId
                    ? { ...app, status: 'approved' }
                    : app
            ));

            await Swal.fire({
                title: 'Success!',
                text: `Scholarship "${recommendation.name}" awarded successfully to ${applicant.name}!`,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error selecting scholarship:", error);
            const errorMessage = 'Failed to award scholarship. Please try again.';
            await Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error'
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { class: string; text: string; icon: React.ComponentType<any> }> = {
            pending: { class: 'text-bg-warning', text: 'Pending', icon: Clock },
            approved: { class: 'text-bg-success', text: 'Approved', icon: CheckCircle },
            rejected: { class: 'text-bg-danger', text: 'Rejected', icon: AlertCircle }
        };

        const config = variants[status] || variants.pending;
        const IconComponent = config.icon;

        return (
            <span className={`badge ${config.class} d-flex align-items-center gap-1 px-3 py-2 rounded-pill`}>
                <IconComponent size={14} />
                {config.text}
            </span>
        );
    };


    const getClassificationBadge = (classification: string) => {
        const badgeClasses: Record<string, string> = {
            'Eligible': 'text-bg-success',
            'Conditionally Eligible': 'text-bg-warning',
            'Somewhat Eligible': 'text-bg-warning text-dark',
            'Barely Eligible': 'text-bg-info',
            'Low Eligibility': 'text-bg-danger',
            'Not Eligible': 'text-bg-secondary'
        };

        return (
            <span className={`badge rounded-pill ${badgeClasses[classification] || 'text-bg-light text-dark'} px-3 py-2`}>
            {classification}
        </span>
        );
    };



    const filteredApplications = applications.filter(app => {
        const courseInfo = getCourseInfo(app.course_id);
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            courseInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        approved: applications.filter(app => app.status === 'approved').length,
        scholarships: scholarships.length
    };

    return (
        <>
            <div className="min-vh-100 bg-light">
                {/* Header */}
                <div className="bg-white shadow-sm border-bottom">
                    <div className="container-fluid px-4 py-4">
                        <div className="row align-items-center">
                            <div className="col">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                                        <Award className="text-primary" size={32} />
                                    </div>
                                    <div>
                                        <h1 className="h3 mb-1 fw-bold text-primary">iScholar Management</h1>
                                        <p className="text-muted mb-0 small">Evaluate, recommend, and select scholarship recipients intelligently</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-fluid px-4 py-4">
                    {/* Statistics Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small fw-medium mb-1">Total Applications</div>
                                            <div className="h4 fw-bold text-primary mb-0">{stats.total}</div>
                                            <div className="small text-success mt-1">
                                                <i className="bi bi-arrow-up me-1"></i>Active
                                            </div>
                                        </div>
                                        <div className="bg-primary bg-opacity-15 p-2 rounded-3">
                                            <Users className="text-primary" size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small fw-medium mb-1">Pending Review</div>
                                            <div className="h4 fw-bold text-warning mb-0">{stats.pending}</div>
                                            <div className="small text-muted mt-1">Awaiting evaluation</div>
                                        </div>
                                        <div className="bg-warning bg-opacity-15 p-2 rounded-3">
                                            <Clock className="text-warning" size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small fw-medium mb-1">Approved</div>
                                            <div className="h4 fw-bold text-success mb-0">{stats.approved}</div>
                                            <div className="small text-success mt-1">Successfully awarded</div>
                                        </div>
                                        <div className="bg-success bg-opacity-15 p-2 rounded-3">
                                            <CheckCircle className="text-success" size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted small fw-medium mb-1">Active Scholarships</div>
                                            <div className="h4 fw-bold text-info mb-0">{stats.scholarships}</div>
                                            <div className="small text-muted mt-1">Available programs</div>
                                        </div>
                                        <div className="bg-info bg-opacity-15 p-2 rounded-3">
                                            <Award className="text-info" size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-3">
                            <div className="row g-3 align-items-center">
                                <div className="col-lg-9">
                                    <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <Search size={16} className="text-muted" />
                                </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0"
                                            placeholder="Search by student name or course..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-3 text-end">
                                    <small className="text-muted">
                                        Showing {filteredApplications.length} of {applications.length} applications
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Process Tabs */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-2">
                            <div className="nav nav-pills nav-fill bg-light rounded-3 p-1" role="tablist">
                                <button
                                    className={`nav-link rounded-3 fw-medium px-3 py-2 ${
                                        activeTab === 'evaluate' ? 'active' : ''
                                    }`}
                                    onClick={() => setActiveTab('evaluate')}
                                    type="button"
                                    role="tab"
                                >
                                    <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                        <span className="badge bg-primary bg-opacity-25 text-primary rounded-pill px-2 py-1 small">1</span>
                                        <span className="d-none d-sm-inline">Evaluate Applications</span>
                                        <span className="d-sm-none">Evaluate</span>
                                    </div>
                                </button>
                                <button
                                    className={`nav-link rounded-3 fw-medium px-3 py-2 ${
                                        activeTab === 'recommend' ? 'active' : ''
                                    }`}
                                    onClick={() => setActiveTab('recommend')}
                                    type="button"
                                    role="tab"
                                >
                                    <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                        <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-2 py-1 small">2</span>
                                        <span className="d-none d-sm-inline">Review Recommendations</span>
                                        <span className="d-sm-none">Recommend</span>
                                    </div>
                                </button>
                                <button
                                    className={`nav-link rounded-3 fw-medium px-3 py-2 ${
                                        activeTab === 'select' ? 'active' : ''
                                    }`}
                                    onClick={() => setActiveTab('select')}
                                    type="button"
                                    role="tab"
                                >
                                    <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                        <span className="badge bg-warning bg-opacity-25 text-warning rounded-pill px-2 py-1 small">3</span>
                                        <span className="d-none d-sm-inline">Final Selection</span>
                                        <span className="d-sm-none">Select</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {/* PHASE 1: EVALUATION */}
                        {activeTab === 'evaluate' && (
                            <div className="row g-3">
                                {filteredApplications.map((app) => {
                                    const evaluation = evaluationResults[app.id];
                                    const hasBeenEvaluated = !!evaluation;
                                    const courseInfo = getCourseInfo(app.course_id);
                                    const gwa = evaluation?.gwa || calculateGWA(app.grades);
                                    const income = parseFloat(app.family_income);
                                    const totalUnits = app.grades?.reduce((sum, grade) => sum + grade.units, 0) || 0;

                                    return (
                                        <div key={app.id} className="col-12">
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-body p-4">
                                                    <div className="row">
                                                        <div className="col-lg-8">
                                                            {/* Student Header */}
                                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                                <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                                                                    <Users className="text-primary" size={20} />
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <h5 className="fw-bold mb-1">{app.name}</h5>
                                                                    <div className="text-muted small mb-1">{courseInfo.name} • Year {app.year_level}</div>
                                                                </div>
                                                                <div className="d-flex d-lg-none">
                                                                    {getStatusBadge(app.status)}
                                                                </div>
                                                            </div>

                                                            {/* Academic Metrics */}
                                                            <div className="row g-2 mb-3">
                                                                <div className="col-6 col-sm-3">
                                                                    <div className="bg-light rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-primary h6 mb-1">{gwa.toFixed(2)}</div>
                                                                        <div className="small text-muted">GWA</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-6 col-sm-3">
                                                                    <div className="bg-light rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-success h6 mb-1">₱{income.toLocaleString()}</div>
                                                                        <div className="small text-muted">Family Income</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-6 col-sm-3">
                                                                    <div className="bg-light rounded-3 p-3 text-center">
                                                                        {hasBeenEvaluated ? (
                                                                            <>
                                                                                <div className="fw-bold text-info h6 mb-1">{(evaluation.score * 100).toFixed(1)}%</div>
                                                                                <div className="small text-muted">Score</div>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div className="fw-bold text-muted h6 mb-1">---</div>
                                                                                <div className="small text-muted">Not Evaluated</div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-6 col-sm-3">
                                                                    <div className="bg-light rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-warning h6 mb-1">{totalUnits}</div>
                                                                        <div className="small text-muted">Units</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Grades Detail */}
                                                            {hasBeenEvaluated && (
                                                                <div className="mb-3">
                                                                    <div className="small text-muted">
                                                                        <strong>Subjects:</strong>
                                                                        <div className="mt-1">
                                                                            {app.grades.map((grade, idx) => (
                                                                                <span key={idx} className="badge bg-secondary bg-opacity-10 text-dark me-1 mb-1">
                                                                            {grade.subject_name}: {grade.grade} ({grade.units}u)
                                                                        </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Special Categories */}
                                                            <div className="d-flex flex-wrap gap-2 mb-lg-0 mb-3">
                                                                {app.is_ofw && <span className="badge bg-info text-dark px-2 py-1">OFW Dependent</span>}
                                                                {app.is_farmers_child && <span className="badge bg-success text-dark px-2 py-1">Farmer's Child</span>}
                                                                {app.is_ip && <span className="badge bg-warning text-dark px-2 py-1">Indigenous Person</span>}
                                                                {app.is_pwd && <span className="badge bg-purple text-dark px-2 py-1">PWD</span>}
                                                            </div>
                                                        </div>

                                                        <div className="col-lg-4">
                                                            <div className="d-flex flex-column gap-2 h-100 justify-content-between">
                                                                <div className="d-none d-lg-block">
                                                                    {getStatusBadge(app.status)}
                                                                </div>

                                                                {hasBeenEvaluated && (
                                                                    <div className="text-center">
                                                                        {getClassificationBadge(evaluation.classification)}
                                                                    </div>
                                                                )}

                                                                <div className="d-flex flex-column gap-2">
                                                                    <button
                                                                        className="btn btn-outline-primary btn-sm"
                                                                        onClick={() => viewApplicant(app.id)}
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#viewModal"
                                                                    >
                                                                        <Eye size={14} className="me-2" />
                                                                        View Details
                                                                    </button>

                                                                    <button
                                                                        className={`btn d-flex align-items-center justify-content-center gap-2 ${
                                                                            hasBeenEvaluated ? 'btn-outline-primary' : 'btn-primary'
                                                                        }`}
                                                                        onClick={() => handleEvaluate(app.id)}
                                                                        disabled={loadingId === app.id}
                                                                    >
                                                                        {loadingId === app.id ? (
                                                                            <>
                                                                                <div className="spinner-border spinner-border-sm" role="status"></div>
                                                                                <span>Evaluating...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Star size={16} />
                                                                                <span>{hasBeenEvaluated ? 'Re-evaluate' : 'Evaluate'}</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* PHASE 2: RECOMMENDATIONS */}
                        {activeTab === 'recommend' && (
                            <div className="container-fluid px-0">
                                <div className="row g-4">
                                    {filteredApplications.map((app) => {
                                        const appRecommendations = recommendations[app.id] || [];
                                        const evaluation = evaluationResults[app.id];
                                        const courseInfo = getCourseInfo(app.course_id);
                                        const gwa = evaluation?.gwa || calculateGWA(app.grades);
                                        const income = parseFloat(app.family_income);

                                        return (
                                            <div key={app.id} className="col-12">
                                                <div className="card border-0 shadow-lg hover-shadow transition-all">
                                                    {/* Enhanced Card Header */}
                                                    <div className="card-header bg-gradient bg-primary bg-opacity-20 border-0 py-4">
                                                        <div className="row align-items-center g-3">
                                                            <div className="col-12 col-lg-8">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div className="bg-primary bg-opacity-16 rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                                                                        <i className="far fa-user fs-4 text-white"></i>
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="fw-bold text-white mb-1">{app.name}</h5>
                                                                        <div className="d-flex flex-wrap gap-3 align-items-center">
                                                    <span className="badge bg-info bg-opacity-15 text-dark px-3 py-2 rounded-pill">
                                                        <i className="far fa-mortar-board"></i>
                                                        {courseInfo.name}
                                                    </span>
                                                                            <span className="badge bg-success bg-opacity-15 text-dark px-3 py-2 rounded-pill">
                                                        <i className="far fa-up-to-line me-1"></i>
                                                        GWA: {gwa.toFixed(2)}
                                                    </span>
                                                                            <span className="badge bg-warning bg-opacity-15 text-dark px-3 py-2 rounded-pill">
                                                        <i className="far fa-dollar-sign me-1"></i>
                                                        ₱{income.toLocaleString()}
                                                    </span>
                                                                            {evaluation && (
                                                                                <span className="badge bg-secondary bg-opacity-15 text-white px-3 py-2 rounded-pill">
                                                            <i className="far fa-star-circle me-1"></i>
                                                                                    {(evaluation.score * 100).toFixed(1)}%
                                                        </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-lg-4 text-lg-end">
                                                                <div className="d-flex flex-wrap gap-2 justify-content-lg-end text-dark">

                                                                    {getStatusBadge(app.status)}
                                                                    {evaluation && getClassificationBadge(evaluation.classification)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="card-body p-4">
                                                        {appRecommendations.length > 0 ? (
                                                            <div>
                                                                {/* Success Alert */}
                                                                <div className="alert alert-success border-0 bg-success bg-opacity-10 mb-4">
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                                                            <CheckCircle className="text-dark" size={20} />
                                                                        </div>
                                                                        <div>
                                                                            <h6 className="text-success mb-1 fw-bold">
                                                                                {appRecommendations.length} Scholarship{appRecommendations.length !== 1 ? 's' : ''} Recommended
                                                                            </h6>
                                                                            <p className="text-success mb-0 small opacity-75">
                                                                                Based on academic performance and eligibility criteria
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Scholarship Recommendations Grid */}
                                                                <div className="row g-4">
                                                                    {appRecommendations.map((rec, index) => (
                                                                        <div key={index} className="col-12 col-xl-6">
                                                                            <div className="card h-100 border-2 border-primary border-opacity-25 hover-border-primary transition-all">
                                                                                <div className="card-body p-4">
                                                                                    {/* Scholarship Header */}
                                                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                                                        <div className="flex-grow-1 me-3">
                                                                                            <h6 className="card-title fw-bold text-dark mb-2 lh-base">
                                                                                                {rec.name}
                                                                                            </h6>
                                                                                        </div>
                                                                                        <div className="text-end">
                                                                    <span className="badge bg-success text-dark px-3 py-2 rounded-pill fs-6">
                                                                        <i className="bi bi-currency-dollar me-1"></i>
                                                                        {rec.amount.toLocaleString()}
                                                                    </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Description */}
                                                                                    <p className="text-muted mb-3 lh-base">{rec.description}</p>

                                                                                    {/* Classification Badge */}
                                                                                    <div className="mb-4">
                                                                                        {getClassificationBadge(rec.classification)}
                                                                                    </div>

                                                                                    {/* Eligibility Details Accordion */}
                                                                                    <div className="accordion accordion-flush" id={`accordion-${app.id}-${index}`}>
                                                                                        <div className="accordion-item border-0">
                                                                                            <h6 className="accordion-header">
                                                                                                <button
                                                                                                    className="accordion-button collapsed p-0 bg-transparent border-0 shadow-none text-primary fw-semibold d-flex align-items-center gap-2"
                                                                                                    type="button"
                                                                                                    data-bs-toggle="collapse"
                                                                                                    data-bs-target={`#collapse-${app.id}-${index}`}
                                                                                                    aria-expanded="false"
                                                                                                    aria-controls={`collapse-${app.id}-${index}`}
                                                                                                >
                                                                                                    <i className="bi bi-list-check"></i>
                                                                                                    View Eligibility Details
                                                                                                </button>
                                                                                            </h6>
                                                                                            <div
                                                                                                id={`collapse-${app.id}-${index}`}
                                                                                                className="accordion-collapse collapse"
                                                                                                data-bs-parent={`#accordion-${app.id}-${index}`}
                                                                                            >
                                                                                                <div className="accordion-body p-0 pt-3">
                                                                                                    <div className="bg-light bg-opacity-50 rounded-3 p-3">
                                                                                                        <ul className="list-unstyled mb-0">
                                                                                                            {rec.reasons.map((reason, idx) => (
                                                                                                                <li key={idx} className="mb-2 d-flex align-items-start gap-3">
                                                                                                                    <div className="flex-shrink-0 mt-1">
                                                                                                                        {reason.startsWith('✓') ? (
                                                                                                                            <div className="bg-success bg-opacity-15 rounded-circle d-flex align-items-center justify-content-center" style={{width: '24px', height: '24px'}}>
                                                                                                                                <i className="bi bi-check-circle-fill text-success"></i>
                                                                                                                            </div>
                                                                                                                        ) : (
                                                                                                                            <div className="bg-danger bg-opacity-15 rounded-circle d-flex align-items-center justify-content-center" style={{width: '24px', height: '24px'}}>
                                                                                                                                <i className="bi bi-x-circle-fill text-danger"></i>
                                                                                                                            </div>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                    <span className={`lh-base ${reason.startsWith('✓') ? 'text-success' : 'text-danger'}`}>
                                                                                                {reason.substring(2)}
                                                                                            </span>
                                                                                                                </li>
                                                                                                            ))}
                                                                                                        </ul>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : evaluation ? (
                                                            /* No Eligible Scholarships State */
                                                            <div className="text-center py-5">
                                                                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '100px', height: '100px'}}>
                                                                    <AlertCircle className="text-warning" size={40} />
                                                                </div>
                                                                <h5 className="text-warning fw-bold mb-3">No Eligible Scholarships Found</h5>
                                                                <p className="text-muted mb-4 px-lg-5">
                                                                    This applicant has been evaluated but doesn't meet the criteria for currently available scholarships.
                                                                    Consider reviewing scholarship requirements or waiting for new opportunities.
                                                                </p>
                                                                <div className="d-flex gap-3 justify-content-center flex-wrap mb-3">
                                                                    <div className="bg-info bg-opacity-10 rounded-pill px-4 py-3 d-flex align-items-center gap-2">
                                                                        <i className="bi bi-graph-up text-info"></i>
                                                                        <span className="fw-semibold text-info">
                                                    Evaluation Score: {(evaluation.score * 100).toFixed(1)}%
                                                </span>
                                                                    </div>
                                                                    <div className="d-flex align-items-center">
                                                                        {getClassificationBadge(evaluation.classification)}
                                                                    </div>
                                                                </div>
                                                                <div className="alert alert-info bg-info bg-opacity-5 border-0 d-inline-block">
                                                                    <small className="text-info">
                                                                        <i className="bi bi-info-circle me-1"></i>
                                                                        Student may be eligible for future scholarship opportunities
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* No Evaluation State */
                                                            <div className="text-center py-5">
                                                                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '100px', height: '100px'}}>
                                                                    <Award className="text-muted" size={40} />
                                                                </div>
                                                                <h5 className="text-muted fw-bold mb-3">No Recommendations Available</h5>
                                                                <p className="text-muted mb-4 px-lg-5">
                                                                    Complete the evaluation process in Phase 1 to generate personalized scholarship recommendations for this applicant.
                                                                </p>
                                                                <button
                                                                    className="btn btn-primary btn-lg px-4 py-3 d-inline-flex align-items-center gap-2"
                                                                    onClick={() => setActiveTab('evaluate')}
                                                                >
                                                                    <i className="bi bi-arrow-left"></i>
                                                                    Go to Evaluation Phase
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* PHASE 3: SELECTION */}
                        {activeTab === 'select' && (
                            <div className="row g-4">
                                {filteredApplications.map((app) => {
                                    const appRecommendations = recommendations[app.id] || [];
                                    const appSelection = selections[app.id];

                                    return (
                                        <div key={app.id} className="col-12">
                                            <div className="card border-0 shadow-lg hover-shadow">
                                                <div className="card-header bg-gradient bg-primary bg-opacity-10 border-0 py-4">
                                                    <div className="row align-items-center">
                                                        <div className="col">
                                                            <h6 className="fw-bold mb-2 text-dark">{app.name}</h6>
                                                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                        <span className="badge bg-white text-info border border-info px-3 py-2 rounded-pill">
                                            <i className="bi bi-mortarboard me-1"></i>
                                            {getCourseInfo(app.course_id).name}
                                        </span>
                                                                <span className="badge bg-white text-success border border-success px-3 py-2 rounded-pill">
                                            GWA: {calculateGWA(app.grades).toFixed(2)}
                                        </span>
                                                                <span className="badge bg-white text-warning border border-warning px-3 py-2 rounded-pill">
                                            Income: ₱{parseFloat(app.family_income).toLocaleString()}
                                        </span>
                                                            </div>
                                                        </div>
                                                        <div className="col-auto">
                                                            {getStatusBadge(app.status)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card-body p-4">
                                                    {appSelection ? (
                                                        /* Selection Complete */
                                                        <div className="alert alert-success border-0 bg-success bg-opacity-10">
                                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                                <div className="bg-success bg-opacity-20 p-3 rounded-3">
                                                                    <CheckCircle className="text-success" size={24} />
                                                                </div>
                                                                <div>
                                                                    <h6 className="fw-bold mb-1 text-success">Scholarship Successfully Awarded!</h6>
                                                                    <div className="text-success opacity-75 small">Selection completed on {appSelection.selected_date ? new Date(appSelection.selected_date).toLocaleDateString() : 'N/A'}</div>
                                                                </div>
                                                            </div>

                                                            <div className="row g-3 mb-3">
                                                                <div className="col-sm-6 col-lg-3">
                                                                    <div className="bg-white rounded-3 p-3 text-center shadow-sm">
                                                                        <div className="fw-bold text-success mb-1">
                                                                            {appSelection.scholarship_name || 'Selected Scholarship'}
                                                                        </div>
                                                                        <div className="small text-muted">Scholarship</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-lg-3">
                                                                    <div className="bg-white rounded-3 p-3 text-center shadow-sm">
                                                                        <div className="fw-bold text-primary mb-1">
                                                                            ₱{appSelection.awarded_amount ? parseFloat(appSelection.awarded_amount as string).toLocaleString() : 'N/A'}
                                                                        </div>
                                                                        <div className="small text-muted">Amount</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-lg-3">
                                                                    <div className="bg-white rounded-3 p-3 text-center shadow-sm">
                                                                        <div className="fw-bold text-dark mb-1">
                                                                            {appSelection.final_score ? (appSelection.final_score * 100).toFixed(1) + '%' : 'N/A'}
                                                                        </div>
                                                                        <div className="small text-muted">Final Score</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-lg-3">
                                                                    <div className="bg-white rounded-3 p-3 text-center shadow-sm">
                                                                        <div className="fw-bold text-success mb-1">Awarded</div>
                                                                        <div className="small text-muted">Status</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {appSelection.selection_reason && (
                                                                <div className="mb-3">
                                                                    <div className="small">
                                                                        <strong>Reason:</strong> {appSelection.selection_reason}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="d-flex gap-2 flex-wrap">
                                                                <button className="btn btn-outline-success btn-sm d-flex align-items-center gap-2">
                                                                    <Download size={14} />
                                                                    Award Letter
                                                                </button>
                                                                <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
                                                                    <FileText size={14} />
                                                                    Send Notification
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : appRecommendations.length > 0 ? (
                                                        /* Show Recommendations for Selection */
                                                        <div>
                                                            <div className="alert alert-warning bg-warning bg-opacity-10 border-0 mb-4">
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <Award className="text-warning" size={20} />
                                                                        <h6 className="text-warning mb-0 fw-bold">Select Final Scholarship Award</h6>
                                                                    </div>
                                                                    <div className="small text-dark">
                                                                        {appRecommendations.length} option{appRecommendations.length !== 1 ? 's' : ''} available
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="row g-3">
                                                                {appRecommendations.map((rec, index) => (
                                                                    <div key={index} className="col-12">
                                                                        <div className="card border shadow-sm">
                                                                            <div className="card-body p-4">
                                                                                <div className="row align-items-center">
                                                                                    <div className="col-lg-8">
                                                                                        <div className="d-flex align-items-start gap-3">
                                                                                            <div className="bg-warning bg-opacity-15 p-2 rounded-3">
                                                                                                <Star className="text-warning" size={20} />
                                                                                            </div>
                                                                                            <div className="flex-grow-1">
                                                                                                <h6 className="fw-bold mb-2">{rec.name}</h6>
                                                                                                <p className="text-muted mb-3">{rec.description}</p>

                                                                                                <div className="row g-2 mb-3">
                                                                                                    <div className="col-auto">
                                                                                <span className="badge bg-white text-primary border border-primary px-3 py-2">
                                                                                    Score: {rec.score ? parseFloat(String(rec.score * 100)).toFixed(2) + '%' : 'N/A'}
                                                                                </span>
                                                                                                    </div>
                                                                                                    <div className="col-auto">
                                                                                                        {getClassificationBadge(rec.classification)}
                                                                                                    </div>
                                                                                                    <div className="col-auto">
                                                                                <span className="badge bg-white text-success border border-success px-3 py-2">
                                                                                    ₱{rec.amount ? parseFloat(String(rec.amount)).toLocaleString() : 'N/A'}
                                                                                </span>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="collapse" id={`reasons-${app.id}-${index}`}>
                                                                                                    <div className="small text-muted">
                                                                                                        <strong>Eligibility Details:</strong>
                                                                                                        {rec.reasons && rec.reasons.length > 0 ? (
                                                                                                            <ul className="mt-2 mb-0">
                                                                                                                {rec.reasons.map((reason: string, idx: number) => (
                                                                                                                    <li key={idx} className="mb-1">
                                                                                                                        {reason.startsWith('✓') ?
                                                                                                                            <span className="text-success">{reason}</span> :
                                                                                                                            <span className="text-danger">{reason}</span>
                                                                                                                        }
                                                                                                                    </li>
                                                                                                                ))}
                                                                                                            </ul>
                                                                                                        ) : (
                                                                                                            <p className="mt-2 mb-0">No detailed reasons available.</p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                                                                                        <div className="d-flex flex-column gap-2">
                                                                                            <button
                                                                                                className="btn btn-success d-flex align-items-center justify-content-center gap-2 px-4 py-2"
                                                                                                onClick={() => handleSelectScholarship(app.id, rec.scholarship_id)}
                                                                                                disabled={loadingId === `${app.id}-${rec.scholarship_id}`}
                                                                                            >
                                                                                                {loadingId === `${app.id}-${rec.scholarship_id}` ? (
                                                                                                    <>
                                                                                                        <div className="spinner-border spinner-border-sm" role="status"></div>
                                                                                                        Awarding...
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <CheckCircle size={16} />
                                                                                                        Award This Scholarship
                                                                                                    </>
                                                                                                )}
                                                                                            </button>

                                                                                            <button
                                                                                                className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-2"
                                                                                                type="button"
                                                                                                data-bs-toggle="collapse"
                                                                                                data-bs-target={`#reasons-${app.id}-${index}`}
                                                                                            >
                                                                                                <Eye size={14} />
                                                                                                View Details
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // No recommendations available
                                                        <div className="text-center py-5">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                                                 style={{width: '80px', height: '80px'}}>
                                                                <Award className="text-muted" size={32} />
                                                            </div>
                                                            <h6 className="text-muted mb-2">No recommendations available</h6>
                                                            <p className="text-muted small mb-3">Complete Phase 1 & 2 to generate recommendations first</p>
                                                            <div className="d-flex gap-2 justify-content-center">
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => setActiveTab('evaluate')}
                                                                >
                                                                    Go to Evaluation
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-success btn-sm"
                                                                    onClick={() => setActiveTab('recommend')}
                                                                >
                                                                    Review Recommendations
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                            {selectedApplicant && (
                                <ViewApplicantReadOnlyForm
                                    applicant={selectedApplicant}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ScholarshipDashboard;