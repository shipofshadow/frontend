import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, Award, Star, Filter, Search, Download, AlertCircle, Eye, FileText } from "lucide-react";
import {API_BASE_URL} from "../../../config.ts";
import axios from "axios";
import {useAuth} from "../../../context/AuthContext.tsx";
import ViewApplicantReadOnlyForm from "../../../components/admin/modals/ViewApplicantReadOnlyForm.tsx";
import Swal from "sweetalert2";
import type {Applicant} from "../../../interfaces/applicant.ts";

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
    name: string;
    status: 'pending' | 'approved' | 'denied' | string;
    user_id: number;
    year_level: string;
}

const ScholarshipDashboard = () => {
    const [activeTab, setActiveTab] = useState('evaluate');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const {token} = useAuth();
    const [applications, setApplications] = useState([]);
    const [scholarships, setScholarships] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState();
    const [evaluationResults, setEvaluationResults] = useState({});
    const [recommendations, setRecommendations] = useState({});
    const [selections, setSelections] = useState({});
    const [loadingId, setLoadingId] = useState(null);

    const fetchEvaluatees = () => {
        axios.get<ApplicantData>(`${API_BASE_URL}/api/evaluations/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setApplications(response.data)
            })
            .catch(error => {
                console.error("Error fetching evaluatees:", error);
            });
    };

    const fetchScholarships = () => {
        axios.get(`${API_BASE_URL}/api/scholarships/`, {
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
    const fetchEvaluationResults = async (applicationId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/evaluations/${applicationId}/results`, {
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
    const fetchRecommendations = async (applicationId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/evaluations/${applicationId}/recommendations`, {
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
    const fetchSelections = async (applicationId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/evaluations/${applicationId}/selection`, {
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
    const calculateGWA = (grades) => {
        if (!grades || grades.length === 0) return 0;

        let totalGradePoints = 0;
        let totalUnits = 0;

        grades.forEach(grade => {
            totalGradePoints += grade.grade * grade.units;
            totalUnits += grade.units;
        });

        return totalUnits > 0 ? totalGradePoints / totalUnits : 0;
    };

    const getTotalUnits = (grades) => {
        if (!grades || grades.length === 0) return 0;

        return grades.reduce((sum, grade) => sum + grade.units, 0);
    };


    // Helper function to get course name from IDs (mock data)
    const getCourseInfo = (courseId) => {
        const courses = {
            1: { name: "Computer Science", email_domain: "cs" },
            2: { name: "Information Technology", email_domain: "it" },
            3: { name: "Engineering", email_domain: "eng" }
        };
        return courses[courseId] || { name: "Unknown Course", email_domain: "student" };
    };

    // API call to evaluate and generate recommendations
    const handleEvaluate = async (applicationId) => {
        const applicant = applications.find(a => a.id === applicationId);

        setLoadingId(applicationId);

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
            const evaluationResponse = await axios.post(
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
            const recommendationsResponse = await axios.post(
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
    const handleSelectScholarship = async (applicationId, scholarshipId) => {
        const applicant = applications.find(a => a.id === applicationId);
        const recommendation = recommendations[applicationId]?.find(r => r.scholarship_id === scholarshipId);

        if (!recommendation) {
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
            const response = await axios.post(
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

            let errorMessage = 'Failed to award scholarship. Please try again.';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            await Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error'
            });
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
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

    const getClassificationBadge = (classification) => {
        const variants = {
            'High Eligibility': { class: 'text-bg-success', icon: '⭐⭐⭐' },
            'Medium Eligibility': { class: 'text-bg-warning', icon: '⭐⭐' },
            'Low Eligibility': { class: 'text-bg-danger', icon: '⭐' },
            'Somewhat Eligible': { class: 'text-bg-info', icon: '⭐' }
        };

        const config = variants[classification] || { class: 'text-bg-secondary', icon: '' };

        return (
            <span className={`badge rounded-pill ${config.class} px-3 py-2`}>
                {config.icon} {classification}
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
                                        <h1 className="h3 mb-1 fw-bold">Scholarship Management System</h1>
                                        <p className="text-muted mb-0">Evaluate, recommend, and select scholarship recipients</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-fluid px-4 py-4">
                    {/* Statistics Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100 card-hover">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted fw-medium mb-1">Total Applications</div>
                                            <div className="h2 fw-bold text-primary mb-0">{stats.total}</div>
                                            <div className="small text-success">
                                                <i className="bi bi-arrow-up"></i> Active applications
                                            </div>
                                        </div>
                                        <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                                            <Users className="text-primary" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100 card-hover">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted fw-medium mb-1">Pending Review</div>
                                            <div className="h2 fw-bold text-warning mb-0">{stats.pending}</div>
                                            <div className="small text-muted">Awaiting evaluation</div>
                                        </div>
                                        <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                                            <Clock className="text-warning" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100 card-hover">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted fw-medium mb-1">Approved</div>
                                            <div className="h2 fw-bold text-success mb-0">{stats.approved}</div>
                                            <div className="small text-success">Successfully awarded</div>
                                        </div>
                                        <div className="bg-success bg-opacity-10 p-3 rounded-3">
                                            <CheckCircle className="text-success" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100 card-hover">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-muted fw-medium mb-1">Available Scholarships</div>
                                            <div className="h2 fw-bold text-info mb-0">{stats.scholarships}</div>
                                            <div className="small text-muted">Active programs</div>
                                        </div>
                                        <div className="bg-info bg-opacity-10 p-3 rounded-3">
                                            <Award className="text-info" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-9">
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

                                <div className="col-md-3">
                                    <div className="text-muted small">
                                        Showing {filteredApplications.length} of {applications.length} applications
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-0">
                            <ul className="nav nav-pills nav-fill bg-light m-3 rounded-3 p-1">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link rounded-3 fw-medium d-flex align-items-center justify-content-center gap-2 ${
                                            activeTab === 'evaluate' ? 'active' : ''
                                        }`}
                                        onClick={() => setActiveTab('evaluate')}
                                    >
                                        <div className="bg-primary bg-opacity-20 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                             style={{width: '24px', height: '24px', fontSize: '12px', fontWeight: 'bold'}}>
                                            1
                                        </div>
                                        Evaluate Applications
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link rounded-3 fw-medium d-flex align-items-center justify-content-center gap-2 ${
                                            activeTab === 'recommend' ? 'active' : ''
                                        }`}
                                        onClick={() => setActiveTab('recommend')}
                                    >
                                        <div className="bg-success bg-opacity-20 text-success rounded-circle d-flex align-items-center justify-content-center"
                                             style={{width: '24px', height: '24px', fontSize: '12px', fontWeight: 'bold'}}>
                                            2
                                        </div>
                                        Review Recommendations
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link rounded-3 fw-medium d-flex align-items-center justify-content-center gap-2 ${
                                            activeTab === 'select' ? 'active' : ''
                                        }`}
                                        onClick={() => setActiveTab('select')}
                                    >
                                        <div className="bg-warning bg-opacity-20 text-warning rounded-circle d-flex align-items-center justify-content-center"
                                             style={{width: '24px', height: '24px', fontSize: '12px', fontWeight: 'bold'}}>
                                            3
                                        </div>
                                        Final Selection
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {/* PHASE 1: EVALUATION */}
                        {activeTab === 'evaluate' && (
                            <div className="row g-4">
                                {filteredApplications.map((app) => {
                                    const evaluation = evaluationResults[app.id];
                                    const hasBeenEvaluated = !!evaluation;
                                    const courseInfo = getCourseInfo(app.course_id);
                                    const gwa = evaluation?.gwa || calculateGWA(app.grades);
                                    const income = parseFloat(app.family_income);
                                    const totalUnits = app.grades?.reduce((sum, grade) => sum + grade.units, 0) || 0;

                                    return (
                                        <div key={app.id} className="col-12">
                                            <div className="card border-0 shadow-sm hover-shadow">
                                                <div className="card-body p-4">
                                                    <div className="row align-items-center">
                                                        <div className="col-lg-8">
                                                            <div className="d-flex align-items-start gap-3 mb-3">
                                                                <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                                                                    <Users className="text-primary" size={20} />
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <h5 className="card-title mb-1 fw-bold">{app.name}</h5>
                                                                    <div className="text-muted small mb-2">{courseInfo.name} • Year {app.year_level}</div>
                                                                    <div className="text-muted small">{app.name.toLowerCase().replace(' ', '.')}.{courseInfo.email_domain}@university.edu</div>
                                                                </div>
                                                            </div>

                                                            <div className="row g-3 mb-3">
                                                                <div className="col-sm-6 col-lg-3">
                                                                    <div className="bg-light rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-primary h5 mb-1">{gwa.toFixed(2)}</div>
                                                                        <div className="small text-muted">GWA</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-lg-3">
                                                                    <div className="bg-light rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-success h5 mb-1">₱{income.toLocaleString()}</div>
                                                                        <div className="small text-muted">Family Income</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-lg-3">
                                                                    <div className="bg-light rounded-3 p-3 text-center">
                                                                        {hasBeenEvaluated ? (
                                                                            <>
                                                                                <div className="fw-bold text-info h5 mb-1">{evaluation.score.toFixed(3)}</div>
                                                                                <div className="small text-muted">Eligibility Score</div>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div className="fw-bold text-muted h5 mb-1">---</div>
                                                                                <div className="small text-muted">Not Evaluated</div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-lg-3">
                                                                    <div className="bg-light rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-warning h5 mb-1">{totalUnits}</div>
                                                                        <div className="small text-muted">Total Units</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {hasBeenEvaluated && (
                                                                <div className="mt-2">
                                                                    <div className="small text-muted">
                                                                        <strong>Grades:</strong>
                                                                        {app.grades.map((grade, idx) => (
                                                                            <span key={idx} className="ms-1">
                                                                                {grade.subject_name}: {grade.grade} ({grade.units}u)
                                                                                {idx < app.grades.length - 1 ? ', ' : ''}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                                {app.is_ofw && <span className="badge bg-info bg-opacity-10 text-info px-3 py-2">OFW Dependent</span>}
                                                                {app.is_farmers_child && <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">Farmer's Child</span>}
                                                                {app.is_ip && <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2">Indigenous Person</span>}
                                                                {app.is_pwd && <span className="badge bg-purple bg-opacity-10 text-purple px-3 py-2">Person with Disability</span>}
                                                            </div>
                                                        </div>

                                                        <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                                                            <div className="d-flex flex-column align-items-lg-end gap-3">

                                                                {getStatusBadge(app.status)}

                                                                <button
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => viewApplicant(app.id)}
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#viewModal"
                                                                    title="View Details"
                                                                >
                                                                    <i className="fa-regular fa-eye"></i> View Applicant Details
                                                                </button>

                                                                {hasBeenEvaluated && getClassificationBadge(evaluation.classification)}

                                                                <button
                                                                    className={`btn d-flex align-items-center gap-2 px-4 py-2 ${
                                                                        hasBeenEvaluated ? 'btn-outline-primary' : 'btn-primary'
                                                                    }`}
                                                                    onClick={() => handleEvaluate(app.id)}
                                                                    disabled={loadingId === app.id}
                                                                >
                                                                    {loadingId === app.id ? (
                                                                        <>
                                                                            <div className="spinner-border spinner-border-sm" role="status"></div>
                                                                            Evaluating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Star size={16} />
                                                                            {hasBeenEvaluated ? 'Re-evaluate' : 'Evaluate & Recommend'}
                                                                        </>
                                                                    )}
                                                                </button>
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
                            <div className="row g-4">
                                {filteredApplications.map((app) => {
                                    const appRecommendations = recommendations[app.id] || [];
                                    const evaluation = evaluationResults[app.id];
                                    const courseInfo = getCourseInfo(app.course_id);
                                    const gwa = evaluation?.gwa || calculateGWA(app.grades);
                                    const income = parseFloat(app.family_income);

                                    return (
                                        <div key={app.id} className="col-12">
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-header bg-light border-0 py-3">
                                                    <div className="row align-items-center">
                                                        <div className="col">
                                                            <h6 className="fw-bold mb-1">{app.name}</h6>
                                                            <div className="text-muted small">
                                                                {courseInfo.name} • GWA: {gwa.toFixed(2)} • Income: ₱{income.toLocaleString()}
                                                                {evaluation && (
                                                                    <>
                                                                        • Score: {evaluation.score.toFixed(3)} • {evaluation.classification}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-auto">
                                                            {getStatusBadge(app.status)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card-body p-4">
                                                    {appRecommendations.length > 0 ? (
                                                        <div>
                                                            <div className="d-flex align-items-center gap-2 mb-4">
                                                                <CheckCircle className="text-success" size={20} />
                                                                <h6 className="text-success mb-0 fw-bold">
                                                                    Recommended Scholarships ({appRecommendations.length})
                                                                </h6>
                                                            </div>

                                                            <div className="row g-3">
                                                                {appRecommendations.map((rec, index) => (
                                                                    <div key={index} className="col-lg-6">
                                                                        <div className="card border border-success border-opacity-25 bg-success bg-opacity-5 h-100">
                                                                            <div className="card-body p-4">
                                                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                                                    <div className="flex-grow-1">
                                                                                        <h6 className="card-title fw-bold mb-2">{rec.name}</h6>
                                                                                        <p className="text-muted small mb-3">{rec.description}</p>
                                                                                    </div>
                                                                                    <div className="text-end ms-3">
                                                                                        <div className="badge bg-primary rounded-pill px-3 py-2 mb-2">
                                                                                            Score: {rec.score.toFixed(3)}
                                                                                        </div>
                                                                                        <div className="fw-bold text-success">₱{rec.amount.toLocaleString()}</div>
                                                                                    </div>
                                                                                </div>

                                                                                {getClassificationBadge(rec.classification)}

                                                                                <div className="mt-3">
                                                                                    <div className="small text-muted fw-medium mb-2">Eligibility Assessment:</div>
                                                                                    <ul className="list-unstyled mb-0">
                                                                                        {rec.reasons.map((reason, idx) => (
                                                                                            <li key={idx} className="small text-muted mb-1 d-flex align-items-center gap-2">
                                                                                                {reason.startsWith('✓') ?
                                                                                                    <span className="text-success">{reason}</span> :
                                                                                                    <span className="text-danger">{reason}</span>
                                                                                                }
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : evaluation ? (
                                                        <div className="text-center py-5">
                                                            <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                                                 style={{width: '80px', height: '80px'}}>
                                                                <AlertCircle className="text-warning" size={32} />
                                                            </div>
                                                            <h6 className="text-warning mb-2">No Eligible Scholarships Found</h6>
                                                            <p className="text-muted small mb-3">
                                                                This applicant has been evaluated but doesn't meet the criteria for any available scholarships.
                                                            </p>
                                                            <div className="row g-2 justify-content-center">
                                                                <div className="col-auto">
                                                                    <div className="badge bg-info bg-opacity-10 text-info px-3 py-2">
                                                                        Score: {evaluation.score.toFixed(3)}
                                                                    </div>
                                                                </div>
                                                                <div className="col-auto">
                                                                    {getClassificationBadge(evaluation.classification)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-5">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                                                 style={{width: '80px', height: '80px'}}>
                                                                <Award className="text-muted" size={32} />
                                                            </div>
                                                            <h6 className="text-muted mb-2">No recommendations generated yet</h6>
                                                            <p className="text-muted small mb-3">Click "Evaluate & Recommend" in Phase 1 to generate recommendations</p>
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                onClick={() => setActiveTab('evaluate')}
                                                            >
                                                                Go to Evaluation
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* PHASE 3: SELECTION */}
                        {activeTab === 'select' && (
                            <div className="row g-4">
                                {filteredApplications.map((app) => {
                                    const appRecommendations = recommendations[app.id] || [];
                                    const appSelection = selections[app.id]; // This is now a single object or null/undefined

                                    return (
                                        <div key={app.id} className="col-12">
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-header bg-light border-0 py-3">
                                                    <div className="row align-items-center">
                                                        <div className="col">
                                                            <h6 className="fw-bold mb-1">{app.name}</h6>
                                                            <div className="text-muted small">
                                                                {getCourseInfo(app.course_id).name} • GWA: {calculateGWA(app.grades).toFixed(2)} • Income: ₱{parseFloat(app.family_income).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="col-auto">
                                                            {getStatusBadge(app.status)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card-body p-4">
                                                    {appSelection ? (
                                                        // Selection has been made - show success state
                                                        <div className="alert alert-success border-0 shadow-sm">
                                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                                <div className="bg-success bg-opacity-20 p-2 rounded-3">
                                                                    <CheckCircle className="text-success" size={24} />
                                                                </div>
                                                                <div>
                                                                    <h6 className="alert-heading mb-1 fw-bold">Scholarship Successfully Awarded!</h6>
                                                                    <div className="text-muted small">Final selection completed</div>
                                                                </div>
                                                            </div>

                                                            <div className="row g-3">
                                                                <div className="col-md-3">
                                                                    <div className="bg-white rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-success mb-1">
                                                                            {appSelection.scholarship_name || 'Selected Scholarship'}
                                                                        </div>
                                                                        <div className="small text-muted">Selected Scholarship</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-3">
                                                                    <div className="bg-white rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-primary mb-1">
                                                                            ₱{appSelection.awarded_amount ? parseFloat(appSelection.awarded_amount).toLocaleString() : 'N/A'}
                                                                        </div>
                                                                        <div className="small text-muted">Award Amount</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-3">
                                                                    <div className="bg-white rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-info mb-1">
                                                                            {appSelection.final_score ? parseFloat(appSelection.final_score).toFixed(3) : 'N/A'}
                                                                        </div>
                                                                        <div className="small text-muted">Final Score</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-3">
                                                                    <div className="bg-white rounded-3 p-3 text-center">
                                                                        <div className="fw-bold text-secondary mb-1">
                                                                            {appSelection.selected_date ? new Date(appSelection.selected_date).toLocaleDateString() : 'N/A'}
                                                                        </div>
                                                                        <div className="small text-muted">Selection Date</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {appSelection.selection_reason && (
                                                                <div className="mt-3">
                                                                    <div className="small text-muted">
                                                                        <strong>Selection Reason:</strong> {appSelection.selection_reason}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="mt-3 d-flex gap-2">
                                                                <button className="btn btn-outline-success btn-sm d-flex align-items-center gap-2">
                                                                    <Download size={14} />
                                                                    Download Award Letter
                                                                </button>
                                                                <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
                                                                    <FileText size={14} />
                                                                    Send Notification
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : appRecommendations.length > 0 ? (
                                                        // Show recommendations for selection
                                                        <div>
                                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <Award className="text-warning" size={20} />
                                                                    <h6 className="text-warning mb-0 fw-bold">Select Final Scholarship Award</h6>
                                                                </div>
                                                                <div className="small text-muted">
                                                                    {appRecommendations.length} recommendation{appRecommendations.length !== 1 ? 's' : ''} available
                                                                </div>
                                                            </div>

                                                            <div className="row g-3">
                                                                {appRecommendations.map((rec, index) => (
                                                                    <div key={index} className="col-12">
                                                                        <div className="card border hover-shadow h-100">
                                                                            <div className="card-body p-4">
                                                                                <div className="row align-items-center">
                                                                                    <div className="col-lg-8">
                                                                                        <div className="d-flex align-items-start gap-3">
                                                                                            <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                                                                                                <Star className="text-warning" size={20} />
                                                                                            </div>
                                                                                            <div className="flex-grow-1">
                                                                                                <h6 className="fw-bold mb-2">{rec.name}</h6>
                                                                                                <p className="text-muted mb-3">{rec.description}</p>

                                                                                                <div className="row g-2 mb-3">
                                                                                                    <div className="col-auto">
                                                                                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                                                                                    Score: {rec.score ? parseFloat(rec.score).toFixed(3) : 'N/A'}
                                                                                </span>
                                                                                                    </div>
                                                                                                    <div className="col-auto">
                                                                                                        {getClassificationBadge(rec.classification)}
                                                                                                    </div>
                                                                                                    <div className="col-auto">
                                                                                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                                                                                    ₱{rec.amount ? parseFloat(rec.amount).toLocaleString() : 'N/A'}
                                                                                </span>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="collapse" id={`reasons-${app.id}-${index}`}>
                                                                                                    <div className="small text-muted">
                                                                                                        <strong>Eligibility Details:</strong>
                                                                                                        {rec.reasons && rec.reasons.length > 0 ? (
                                                                                                            <ul className="mt-2 mb-0">
                                                                                                                {rec.reasons.map((reason, idx) => (
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
                            <ViewApplicantReadOnlyForm
                                applicant={selectedApplicant}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ScholarshipDashboard;