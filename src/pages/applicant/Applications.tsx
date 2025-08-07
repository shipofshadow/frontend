import React, {useEffect, useState} from 'react';
import { CheckCircle, XCircle, Hourglass, Award, Calendar, Eye, Download, Filter, Search } from 'lucide-react';
import {API_BASE_URL} from "../../config.ts";
import axios from "axios";
import {useAuth} from "../../context/AuthContext.tsx";
const sampleApplications = [
    {
        id: 1,
        scholarship: 'CHED-TES',
        status: 'Under Evaluation',
        submittedAt: '2025-06-25',
        amount: '$5,000',
        deadline: '2025-07-15',
        progress: 65,
        applicationData: {
            personalInfo: {
                fullName: 'Juan Carlos Dela Cruz',
                email: 'juan.delacruz@email.com',
                phone: '+63 912 345 6789',
                address: '123 Main St, Quezon City, Philippines',
                birthDate: '2000-05-15',
                gender: 'Male'
            },
            academicInfo: {
                school: 'University of the Philippines',
                course: 'Computer Science',
                yearLevel: '3rd Year',
                gpa: '3.8',
                expectedGraduation: '2026'
            },
            requirements: {
                transcript: 'transcript_juan.pdf',
                essay: 'personal_essay.pdf',
                recommendation: 'recommendation_letter.pdf',
                financialAid: 'financial_documents.pdf'
            },
            essay: 'I am passionate about technology and its potential to solve real-world problems. Growing up in a low-income family, I understand the importance of education in breaking the cycle of poverty. This scholarship would enable me to continue my studies in Computer Science and contribute to the development of innovative solutions that can help communities like mine...'
        },
        evaluationResult: {
            overallScore: 85,
            criteria: [
                { name: 'Academic Performance', score: 90, weight: 40 },
                { name: 'Financial Need', score: 85, weight: 30 },
                { name: 'Essay Quality', score: 80, weight: 20 },
                { name: 'Community Involvement', score: 75, weight: 10 }
            ],
            feedback: 'Strong academic performance with excellent GPA. Essay demonstrates clear goals and motivation. Financial need is well documented. Consider improving community involvement activities.',
            evaluator: 'Dr. Maria Santos',
            evaluatedAt: '2025-06-28'
        }
    },
    {
        id: 2,
        scholarship: 'DOST',
        status: 'Qualified',
        submittedAt: '2025-05-12',
        amount: '$7,500',
        deadline: '2025-06-30',
        progress: 100,
        applicationData: {
            personalInfo: {
                fullName: 'Maria Isabella Rodriguez',
                email: 'maria.rodriguez@email.com',
                phone: '+63 917 123 4567',
                address: '456 Science Ave, Makati City, Philippines',
                birthDate: '1999-09-22',
                gender: 'Female'
            },
            academicInfo: {
                school: 'Ateneo de Manila University',
                course: 'Chemical Engineering',
                yearLevel: '4th Year',
                gpa: '3.9',
                expectedGraduation: '2025'
            },
            requirements: {
                transcript: 'transcript_maria.pdf',
                essay: 'research_proposal.pdf',
                recommendation: 'prof_recommendation.pdf',
                financialAid: 'income_certificate.pdf'
            },
            essay: 'My research interests lie in sustainable chemical processes and environmental protection. I believe that through innovative engineering solutions, we can address climate change while promoting economic growth...'
        },
        evaluationResult: {
            overallScore: 95,
            criteria: [
                { name: 'Academic Performance', score: 98, weight: 40 },
                { name: 'Research Potential', score: 95, weight: 30 },
                { name: 'Essay Quality', score: 92, weight: 20 },
                { name: 'Leadership Skills', score: 90, weight: 10 }
            ],
            feedback: 'Outstanding academic record with exceptional research potential. Essay demonstrates deep understanding of field and clear research direction. Strong leadership qualities evident from extracurricular activities.',
            evaluator: 'Dr. Roberto Chen',
            evaluatedAt: '2025-05-20',
            awardAmount: '$7,500',
            awardDetails: 'Full tuition coverage plus monthly stipend of $300 for research activities.'
        }
    },
    {
        id: 3,
        scholarship: 'UNIFAST',
        status: 'Rejected',
        submittedAt: '2025-04-20',
        amount: '$3,000',
        deadline: '2025-05-10',
        progress: 100,
        applicationData: {
            personalInfo: {
                fullName: 'Jose Miguel Santos',
                email: 'jose.santos@email.com',
                phone: '+63 905 987 6543',
                address: '789 University St, Diliman, Quezon City',
                birthDate: '2001-03-10',
                gender: 'Male'
            },
            academicInfo: {
                school: 'University of Santo Tomas',
                course: 'Business Administration',
                yearLevel: '2nd Year',
                gpa: '3.2',
                expectedGraduation: '2027'
            },
            requirements: {
                transcript: 'transcript_jose.pdf',
                essay: 'business_essay.pdf',
                recommendation: 'dean_recommendation.pdf',
                financialAid: 'family_income.pdf'
            },
            essay: 'I aspire to become a successful entrepreneur and contribute to the Philippine economy through innovative business solutions...'
        },
        evaluationResult: {
            overallScore: 65,
            criteria: [
                { name: 'Academic Performance', score: 70, weight: 40 },
                { name: 'Financial Need', score: 75, weight: 30 },
                { name: 'Essay Quality', score: 55, weight: 20 },
                { name: 'Extracurricular Activities', score: 50, weight: 10 }
            ],
            feedback: 'Academic performance meets minimum requirements but falls below competitive threshold. Essay lacks depth and specific examples. Limited extracurricular involvement. Consider improving academic standing and gaining more leadership experience before reapplying.',
            evaluator: 'Prof. Ana Mercado',
            evaluatedAt: '2025-04-25',
            rejectionReason: 'Did not meet minimum GPA requirement of 3.5 and essay quality was below standards.'
        }
    },
    {
        id: 4,
        scholarship: 'Merit Scholarship',
        status: 'Under Evaluation',
        submittedAt: '2025-06-30',
        amount: '$4,500',
        deadline: '2025-08-01',
        progress: 45,
        applicationData: {
            personalInfo: {
                fullName: 'Sofia Marie Lim',
                email: 'sofia.lim@email.com',
                phone: '+63 920 456 7890',
                address: '321 Academic Blvd, Taguig City, Philippines',
                birthDate: '2000-11-18',
                gender: 'Female'
            },
            academicInfo: {
                school: 'De La Salle University',
                course: 'Information Technology',
                yearLevel: '3rd Year',
                gpa: '3.7',
                expectedGraduation: '2026'
            },
            requirements: {
                transcript: 'transcript_sofia.pdf',
                essay: 'tech_innovation_essay.pdf',
                recommendation: 'advisor_recommendation.pdf',
                financialAid: 'financial_statement.pdf'
            },
            essay: 'Technology has the power to transform lives and communities. As an IT student, I am committed to developing solutions that address social issues and bridge the digital divide in the Philippines...'
        },
        evaluationResult: {
            overallScore: null,
            criteria: [],
            feedback: 'Application is currently under review by the scholarship committee. Initial screening has been completed.',
            evaluator: null,
            evaluatedAt: null
        }
    }
];

// Custom CSS styles
const customStyles = `
    .applications-bg {
        background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 50%, #f3e5f5 100%);
        min-height: 100vh;
    }
    
    .card-hover {
        transition: all 0.3s ease;
    }
    
    .card-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
    }
    
    .gradient-primary {
        background: linear-gradient(135deg, #007bff 0%, #6f42c1 100%);
    }
    
    .gradient-success {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }
    
    .gradient-warning {
        background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }
    
    .gradient-danger {
        background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
    }
    
    .glass-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
    }
    
    .status-animation {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .progress-bar-animated {
        background: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
        background-size: 1rem 1rem;
        animation: progress-bar-stripes 1s linear infinite;
    }
    
    @keyframes progress-bar-stripes {
        0% { background-position: 1rem 0; }
        100% { background-position: 0 0; }
    }
    
    .application-row {
        transition: all 0.3s ease;
    }
    
    .application-row:hover {
        background-color: rgba(0,123,255,0.05) !important;
        transform: translateX(5px);
    }
    
    .btn-action {
        transition: all 0.3s ease;
    }
    
    .btn-action:hover {
        transform: translateY(-1px);
    }
    
    .stats-card {
        position: relative;
        overflow: hidden;
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #007bff, #6f42c1);
    }
`;

const statusBadge = (status) => {
    switch (status) {
        case 'Qualified':
            return (
                <span className="badge d-flex align-items-center gap-2 px-3 py-2 gradient-success text-white fw-semibold">
                    <CheckCircle size={16} /> {status}
                </span>
            );
        case 'Rejected':
            return (
                <span className="badge d-flex align-items-center gap-2 px-3 py-2 gradient-danger text-white fw-semibold">
                    <XCircle size={16} /> {status}
                </span>
            );
        default:
            return (
                <span className="badge d-flex align-items-center gap-2 px-3 py-2 gradient-warning text-white fw-semibold status-animation">
                    <Hourglass size={16} /> {status}
                </span>
            );
    }
};

const StatsCard = ({ icon, title, value, subtitle, gradientClass }) => (
    <div className="col-md-3">
        <div className="card border-0 shadow-lg card-hover stats-card h-100">
            <div className="card-body p-4 text-center">
                <div className={`rounded-3 d-inline-flex justify-content-center align-items-center mb-3 ${gradientClass}`}
                     style={{ width: 60, height: 60 }}>
                    {React.cloneElement(icon, { size: 28, className: 'text-white' })}
                </div>
                <h3 className="fw-bold text-dark mb-1">{value}</h3>
                <h6 className="fw-semibold text-muted mb-2">{title}</h6>
                <small className="text-muted">{subtitle}</small>
            </div>
        </div>
    </div>
);

const Applications = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('view');
    const [editData, setEditData] = useState({});
    const {token} = useAuth();
    const filteredApplications = sampleApplications.filter(app => {
        const matchesSearch = app.scholarship.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: sampleApplications.length,
        qualified: sampleApplications.filter(app => app.status === 'Qualified').length,
        pending: sampleApplications.filter(app => app.status === 'Under Evaluation').length,
        rejected: sampleApplications.filter(app => app.status === 'Rejected').length
    };

    const fetchApplications = () => {
        axios.get(`${API_BASE_URL}/api/profile/applications`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error("Error fetching applications:", error);
            });
    };

    useEffect(()=>{
        fetchApplications();
    },[])


    const handleViewApplication = (app) => {
        setSelectedApplication(app);
        setEditData(app.applicationData);
        setActiveTab('view');
        setShowModal(true);
    };

    const handleEditSave = () => {
        // Update the application data
        const updatedApplications = sampleApplications.map(app =>
            app.id === selectedApplication.id
                ? { ...app, applicationData: editData }
                : app
        );
        console.log('Updated application:', updatedApplications);
        alert('Application updated successfully!');
    };

    const renderTabContent = () => {
        if (!selectedApplication) return null;

        switch (activeTab) {
            case 'view':
                return (
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-primary bg-opacity-10 border-0">
                                    <h6 className="fw-bold text-primary mb-0">Personal Information</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold text-muted small">Full Name</label>
                                            <div className="fw-bold">{selectedApplication.applicationData.personalInfo.fullName}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-muted small">Email</label>
                                            <div>{selectedApplication.applicationData.personalInfo.email}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-muted small">Phone</label>
                                            <div>{selectedApplication.applicationData.personalInfo.phone}</div>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold text-muted small">Address</label>
                                            <div>{selectedApplication.applicationData.personalInfo.address}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-muted small">Birth Date</label>
                                            <div>{selectedApplication.applicationData.personalInfo.birthDate}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-muted small">Gender</label>
                                            <div>{selectedApplication.applicationData.personalInfo.gender}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-success bg-opacity-10 border-0">
                                    <h6 className="fw-bold text-success mb-0">Academic Information</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold text-muted small">School</label>
                                            <div className="fw-bold">{selectedApplication.applicationData.academicInfo.school}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-muted small">Course</label>
                                            <div>{selectedApplication.applicationData.academicInfo.course}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-muted small">Year Level</label>
                                            <div>{selectedApplication.applicationData.academicInfo.yearLevel}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-muted small">GPA</label>
                                            <div className="fw-bold text-primary">{selectedApplication.applicationData.academicInfo.gpa}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-muted small">Expected Graduation</label>
                                            <div>{selectedApplication.applicationData.academicInfo.expectedGraduation}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-info bg-opacity-10 border-0">
                                    <h6 className="fw-bold text-info mb-0">Personal Essay</h6>
                                </div>
                                <div className="card-body">
                                    <p className="mb-0" style={{ textAlign: 'justify', lineHeight: '1.6' }}>
                                        {selectedApplication.applicationData.essay}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-warning bg-opacity-10 border-0">
                                    <h6 className="fw-bold text-warning mb-0">Submitted Requirements</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        {Object.entries(selectedApplication.applicationData.requirements).map(([key, value]) => (
                                            <div key={key} className="col-md-6">
                                                <div className="d-flex align-items-center">
                                                    <CheckCircle size={16} className="text-success me-2" />
                                                    <div>
                                                        <div className="fw-semibold">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</div>
                                                        <small className="text-muted">{value}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'edit':
                return (
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-primary bg-opacity-10 border-0">
                                    <h6 className="fw-bold text-primary mb-0">Edit Personal Information</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editData.personalInfo?.fullName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalInfo: { ...editData.personalInfo, fullName: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={editData.personalInfo?.email || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalInfo: { ...editData.personalInfo, email: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={editData.personalInfo?.phone || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalInfo: { ...editData.personalInfo, phone: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Address</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={editData.personalInfo?.address || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalInfo: { ...editData.personalInfo, address: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-success bg-opacity-10 border-0">
                                    <h6 className="fw-bold text-success mb-0">Edit Academic Information</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">School</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editData.academicInfo?.school || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    academicInfo: { ...editData.academicInfo, school: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Course</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editData.academicInfo?.course || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    academicInfo: { ...editData.academicInfo, course: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Year Level</label>
                                            <select
                                                className="form-select"
                                                value={editData.academicInfo?.yearLevel || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    academicInfo: { ...editData.academicInfo, yearLevel: e.target.value }
                                                })}
                                            >
                                                <option value="">Select Year Level</option>
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                                <option value="5th Year">5th Year</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">GPA</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="1.0"
                                                max="4.0"
                                                className="form-control"
                                                value={editData.academicInfo?.gpa || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    academicInfo: { ...editData.academicInfo, gpa: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Expected Graduation</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editData.academicInfo?.expectedGraduation || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    academicInfo: { ...editData.academicInfo, expectedGraduation: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-info bg-opacity-10 border-0">
                                    <h6 className="fw-bold text-info mb-0">Edit Personal Essay</h6>
                                </div>
                                <div className="card-body">
                                    <textarea
                                        className="form-control"
                                        rows="6"
                                        placeholder="Write your personal essay here..."
                                        value={editData.essay || ''}
                                        onChange={(e) => setEditData({
                                            ...editData,
                                            essay: e.target.value
                                        })}
                                    />
                                    <div className="mt-2">
                                        <small className="text-muted">
                                            Character count: {(editData.essay || '').length}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="d-flex gap-3 justify-content-end">
                                <button className="btn btn-outline-secondary" onClick={() => setActiveTab('view')}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleEditSave}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'result':
                return (
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-dark bg-opacity-10 border-0">
                                    <h6 className="fw-bold text-dark mb-0">Evaluation Results</h6>
                                </div>
                                <div className="card-body">
                                    {selectedApplication.evaluationResult.overallScore ? (
                                        <>
                                            <div className="row g-4 mb-4">
                                                <div className="col-md-4">
                                                    <div className="text-center">
                                                        <div className="display-4 fw-bold text-primary mb-2">
                                                            {selectedApplication.evaluationResult.overallScore}
                                                        </div>
                                                        <h6 className="text-muted">Overall Score</h6>
                                                        <div className="progress" style={{ height: '8px' }}>
                                                            <div
                                                                className="progress-bar bg-primary"
                                                                style={{ width: `${selectedApplication.evaluationResult.overallScore}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-8">
                                                    <h6 className="fw-bold mb-3">Criteria Breakdown</h6>
                                                    {selectedApplication.evaluationResult.criteria.map((criterion, index) => (
                                                        <div key={index} className="mb-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="fw-semibold">{criterion.name}</span>
                                                                <div>
                                                                    <span className="fw-bold text-primary me-2">{criterion.score}</span>
                                                                    <small className="text-muted">({criterion.weight}% weight)</small>
                                                                </div>
                                                            </div>
                                                            <div className="progress" style={{ height: '6px' }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        width: `${criterion.score}%`,
                                                                        backgroundColor: criterion.score >= 90 ? '#28a745' :
                                                                            criterion.score >= 80 ? '#17a2b8' :
                                                                                criterion.score >= 70 ? '#ffc107' : '#dc3545'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="alert alert-light border">
                                                <h6 className="fw-bold mb-2">Evaluator Feedback</h6>
                                                <p className="mb-2">{selectedApplication.evaluationResult.feedback}</p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        <strong>Evaluated by:</strong> {selectedApplication.evaluationResult.evaluator}
                                                    </small>
                                                    <small className="text-muted">
                                                        <strong>Date:</strong> {selectedApplication.evaluationResult.evaluatedAt}
                                                    </small>
                                                </div>
                                            </div>

                                            {selectedApplication.status === 'Qualified' && selectedApplication.evaluationResult.awardAmount && (
                                                <div className="alert alert-success">
                                                    <h6 className="fw-bold text-success mb-2">🎉 Congratulations! You've been awarded:</h6>
                                                    <div className="fw-bold fs-4 text-success mb-2">{selectedApplication.evaluationResult.awardAmount}</div>
                                                    <p className="mb-0">{selectedApplication.evaluationResult.awardDetails}</p>
                                                </div>
                                            )}

                                            {selectedApplication.status === 'Rejected' && selectedApplication.evaluationResult.rejectionReason && (
                                                <div className="alert alert-danger">
                                                    <h6 className="fw-bold text-danger mb-2">Application Status: Not Approved</h6>
                                                    <p className="mb-0">{selectedApplication.evaluationResult.rejectionReason}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary mb-3" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <h6 className="text-muted">Evaluation in Progress</h6>
                                            <p className="text-muted mb-0">Your application is currently being reviewed by our evaluation committee.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <style>{customStyles}</style>
            <div className="applications-bg">
                <div className="container py-5">
                    {/* Header Section */}
                    <div className="row align-items-center mb-5">
                        <div className="col">
                            <div className="d-flex align-items-center mb-3">
                                <div className="gradient-primary rounded-3 d-flex justify-content-center align-items-center me-3"
                                     style={{ width: 60, height: 60 }}>
                                    <Award size={30} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="display-6 fw-bold text-dark mb-1">My Applications</h1>
                                    <p className="text-muted mb-0">Track and manage your scholarship applications</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="row g-4 mb-5">
                        <StatsCard
                            icon={<Award />}
                            title="Total Applications"
                            value={stats.total}
                            subtitle="All submissions"
                            gradientClass="gradient-primary"
                        />
                        <StatsCard
                            icon={<CheckCircle />}
                            title="Qualified"
                            value={stats.qualified}
                            subtitle="Approved applications"
                            gradientClass="gradient-success"
                        />
                        <StatsCard
                            icon={<Hourglass />}
                            title="Under Review"
                            value={stats.pending}
                            subtitle="Pending evaluation"
                            gradientClass="gradient-warning"
                        />
                        <StatsCard
                            icon={<XCircle />}
                            title="Rejected"
                            value={stats.rejected}
                            subtitle="Not approved"
                            gradientClass="gradient-danger"
                        />
                    </div>

                    {/* Filters and Search */}
                    <div className="card border-0 shadow-lg glass-card mb-4">
                        <div className="card-body p-4">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold text-dark">
                                        <Search size={16} className="me-2" />
                                        Search Applications
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="Search by scholarship name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold text-dark">
                                        <Filter size={16} className="me-2" />
                                        Filter by Status
                                    </label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Under Evaluation">Under Evaluation</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <button className="btn btn-outline-secondary btn-lg w-100">
                                        <Download size={16} className="me-2" />
                                        Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="card border-0 shadow-lg glass-card">
                        <div className="card-header bg-transparent border-0 p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold text-dark mb-0">Applications Overview</h5>
                                <span className="badge bg-primary bg-opacity-25 text-primary px-3 py-2">
                                    {filteredApplications.length} result{filteredApplications.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {filteredApplications.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th className="border-0 px-4 py-3 fw-bold text-dark">#</th>
                                            <th className="border-0 px-4 py-3 fw-bold text-dark">Scholarship Program</th>
                                            <th className="border-0 px-4 py-3 fw-bold text-dark">Amount</th>
                                            <th className="border-0 px-4 py-3 fw-bold text-dark">Status</th>
                                            <th className="border-0 px-4 py-3 fw-bold text-dark">Progress</th>
                                            <th className="border-0 px-4 py-3 fw-bold text-dark">Submitted</th>
                                            <th className="border-0 px-4 py-3 fw-bold text-dark">Deadline</th>
                                            <th className="border-0 px-4 py-3 fw-bold text-dark">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredApplications.map((app, index) => (
                                            <tr key={app.id} className="application-row">
                                                <td className="px-4 py-4">
                                                    <span className="fw-bold text-primary">{index + 1}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="gradient-primary rounded-2 d-flex justify-content-center align-items-center me-3"
                                                             style={{ width: 40, height: 40 }}>
                                                            <Award size={20} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{app.scholarship}</div>
                                                            <small className="text-muted">Government Scholarship</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="fw-bold text-success fs-5">{app.amount}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {statusBadge(app.status)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="progress me-2" style={{ width: '100px', height: '8px' }}>
                                                            <div
                                                                className={`progress-bar ${app.progress < 100 ? 'progress-bar-animated' : ''}`}
                                                                style={{
                                                                    width: `${app.progress}%`,
                                                                    background: app.status === 'Qualified'
                                                                        ? 'linear-gradient(135deg, #28a745, #20c997)'
                                                                        : app.status === 'Rejected'
                                                                            ? 'linear-gradient(135deg, #dc3545, #fd7e14)'
                                                                            : 'linear-gradient(135deg, #ffc107, #fd7e14)'
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <small className="text-muted fw-semibold">{app.progress}%</small>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="d-flex align-items-center text-muted">
                                                        <Calendar size={16} className="me-2" />
                                                        <span>{app.submittedAt}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="d-flex align-items-center text-muted">
                                                        <Calendar size={16} className="me-2" />
                                                        <span>{app.deadline}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="d-flex gap-2">
                                                        <button className="btn btn-outline-primary btn-sm btn-action">
                                                            <Eye size={14} />
                                                        </button>
                                                        <button className="btn btn-outline-secondary btn-sm btn-action">
                                                            <Download size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="gradient-primary rounded-circle d-inline-flex justify-content-center align-items-center mb-4"
                                         style={{ width: 80, height: 80 }}>
                                        <Award size={40} className="text-white" />
                                    </div>
                                    <h5 className="text-muted mb-3">No applications found</h5>
                                    <p className="text-muted mb-4">
                                        {searchTerm || statusFilter !== 'All'
                                            ? 'Try adjusting your search or filter criteria.'
                                            : 'You haven\'t submitted any scholarship applications yet.'}
                                    </p>
                                    <button className="btn btn-primary btn-lg">
                                        <Award size={20} className="me-2" />
                                        Apply for Scholarship
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Applications;