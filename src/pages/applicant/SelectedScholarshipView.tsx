import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  School, 
  Mail, 
  Phone,
  Download,
  Eye,
  ArrowLeft,
  Star,
  TrendingUp,
  Shield
} from 'lucide-react';

// Fixed mock data structure
const mockScholarshipDataOptions = {
  pending: {
    id: 1,
    name: "Academic Excellence Scholarship",
    description: "Awarded to students with outstanding academic performance and demonstrated financial need. This scholarship supports undergraduate students pursuing their education with a focus on maintaining high academic standards.",
    grant_amount: 25000.00,
    status: "pending",
    selection_reason: "Application is currently under review by the scholarship committee. Please wait for further updates."
  },
  selected: {
    id: 1,
    name: "Academic Excellence Scholarship", 
    description: "Awarded to students with outstanding academic performance and demonstrated financial need. This scholarship supports undergraduate students pursuing their education with a focus on maintaining high academic standards.",
    grant_amount: 25000.00,
    status: "selected",
    selection_reason: "Outstanding academic performance with GWA of 1.25 and demonstrated financial need. Student shows excellent potential for academic success.",
    selected_date: "2024-09-15T10:30:00Z",
    submitted_date: "2024-09-01T09:00:00Z"
  },
  awarded: {
    id: 1,
    name: "Academic Excellence Scholarship",
    description: "Awarded to students with outstanding academic performance and demonstrated financial need. This scholarship supports undergraduate students pursuing their education with a focus on maintaining high academic standards.",
    grant_amount: 25000.00,
    status: "awarded",
    awarded_amount: 25000.00,
    selection_reason: "Outstanding academic performance with GWA of 1.25 and demonstrated financial need. Student shows excellent potential for academic success.",
    selected_date: "2024-09-15T10:30:00Z",
    awarded_date: "2024-09-20T14:15:00Z",
    submitted_date: "2024-09-01T09:00:00Z"
  },
  denied: {
    id: 1,
    name: "Academic Excellence Scholarship",
    description: "Awarded to students with outstanding academic performance and demonstrated financial need. This scholarship supports undergraduate students pursuing their education with a focus on maintaining high academic standards.",
    grant_amount: 25000.00,
    status: "denied",
    denial_reason: "Unfortunately, your application did not meet the minimum GWA requirement of 1.5. We encourage you to reapply next semester after improving your academic performance.",
    reviewed_date: "2024-09-10T14:30:00Z",
    submitted_date: "2024-09-01T09:00:00Z"
  },
  common: {
    selected_by_admin: {
      name: "Dr. Maria Santos",
      title: "Scholarship Committee Chair",
      email: "m.santos@university.edu",
      phone: "+63 912 345 6789"
    },
    application: {
      id: 123,
      submitted_at: "2024-09-01T09:00:00Z",
      student: {
        name: "Juan Carlos Dela Cruz",
        student_id: "2021-00123",
        course: "Bachelor of Science in Computer Science",
        year_level: "3rd Year",
        campus: "Main Campus",
        email: "juan.delacruz@student.university.edu"
      }
    },
    evaluation: {
      gwa: 1.25,
      classification: "Highly Eligible",
      score: 92.5,
      total_units: 21
    },
    requirements: [
      {
        type: "grades",
        file_name: "Grades_S1_2024.pdf",
        uploaded_at: "2024-09-01T09:30:00Z",
        status: "verified"
      },
      {
        type: "itr",
        file_name: "Family_ITR_2023.pdf",
        uploaded_at: "2024-09-01T09:45:00Z",
        status: "verified"
      }
    ],
    scholarship_rules: {
      min_gwa: 1.5,
      max_income: 50000,
      preferred_courses: ["Computer Science", "Engineering", "Mathematics"],
      min_units: 18
    }
  }
};

const SelectedScholarshipView = () => {
  // Demo status selector - remove in production
  const [demoStatus, setDemoStatus] = useState('awarded');
  const [scholarship, setScholarship] = useState({
    ...mockScholarshipDataOptions[demoStatus],
    ...mockScholarshipDataOptions.common
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Update scholarship data when demo status changes
  useEffect(() => {
    setScholarship({
      ...mockScholarshipDataOptions[demoStatus],
      ...mockScholarshipDataOptions.common
    });
  }, [demoStatus]);

  // Status configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          badge: 'bg-warning',
          cardBorder: 'border-warning',
          icon: <Clock size={18} />,
          text: 'Under Review',
          bgGradient: 'bg-gradient',
          heroGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        };
      case 'selected':
        return {
          badge: 'bg-info',
          cardBorder: 'border-info',
          icon: <CheckCircle size={18} />,
          text: 'Selected for Award',
          bgGradient: 'bg-gradient',
          heroGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
      case 'awarded':
        return {
          badge: 'bg-success',
          cardBorder: 'border-success',
          icon: <CheckCircle size={18} />,
          text: 'Scholarship Awarded',
          bgGradient: 'bg-gradient',
          heroGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
        };
      case 'denied':
        return {
          badge: 'bg-danger',
          cardBorder: 'border-danger',
          icon: <AlertCircle size={18} />,
          text: 'Application Denied',
          bgGradient: 'bg-gradient',
          heroGradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)'
        };
      default:
        return {
          badge: 'bg-secondary',
          cardBorder: 'border-secondary',
          icon: <Clock size={18} />,
          text: 'Pending',
          bgGradient: 'bg-gradient',
          heroGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const statusConfig = getStatusConfig(scholarship.status);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Demo Status Selector - Remove in production */}
      <div className="container pt-3">
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body p-3">
            <div className="row align-items-center">
              <div className="col-auto">
                <small className="text-muted fw-bold">DEMO MODE - Select Status:</small>
              </div>
              <div className="col-auto">
                <div className="btn-group" role="group">
                  {['pending', 'selected', 'awarded', 'denied'].map(status => (
                    <button
                      key={status}
                      type="button"
                      className={`btn btn-sm ${demoStatus === status ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setDemoStatus(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Dynamic Gradient */}
      <div className="position-relative overflow-hidden" style={{ 
        background: statusConfig.heroGradient,
        paddingTop: '2rem',
        paddingBottom: '4rem'
      }}>
        <div className="container">
          {/* Back Button */}
          <div className="mb-4">
            <button className="btn btn-light btn-sm shadow-sm d-flex align-items-center">
              <ArrowLeft size={16} className="me-2" />
              Back to Applications
            </button>
          </div>

          {/* Main Header Card */}
          <div className="card border-0 shadow-lg">
            <div className="card-body p-4 p-lg-5">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <div className="d-flex align-items-start mb-3">
                    <div className="p-3 bg-warning bg-gradient rounded-circle me-4 shadow">
                      <Award size={32} className="text-white" />
                    </div>
                    <div className="flex-grow-1">
                      <h1 className="display-6 fw-bold mb-2">{scholarship.name}</h1>
                      <span className={`badge ${statusConfig.badge} ${statusConfig.bgGradient} px-3 py-2 fs-6 shadow-sm`}>
                        {statusConfig.icon}
                        <span className="ms-2">{statusConfig.text}</span>
                      </span>
                    </div>
                  </div>
                  <p className="lead text-muted mb-4">{scholarship.description}</p>
                  
                  <div className="row g-4">
                    <div className="col-auto">
                      <div className="d-flex align-items-center">
                        <div className="p-2 bg-success bg-gradient rounded me-3">
                          <DollarSign size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="text-muted small">Grant Amount</div>
                          <div className="h4 fw-bold mb-0 text-success">
                            {formatCurrency(scholarship.grant_amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-auto">
                      <div className="d-flex align-items-center">
                        <div className="p-2 bg-primary bg-gradient rounded me-3">
                          <TrendingUp size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="text-muted small">Eligibility Score</div>
                          <div className="h4 fw-bold mb-0 text-primary">
                            {scholarship.evaluation?.score}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status-specific cards */}
                {(scholarship.status === 'awarded' || scholarship.status === 'selected') && (
                  <div className="col-lg-4 mt-4 mt-lg-0">
                    {scholarship.status === 'awarded' ? (
                      <div className="card bg-success bg-gradient text-white border-0 shadow">
                        <div className="card-body text-center">
                          <Shield size={40} className="mb-3" />
                          <h5 className="card-title">Congratulations!</h5>
                          <p className="card-text">You have been awarded</p>
                          <div className="display-6 fw-bold">
                            {formatCurrency(scholarship.awarded_amount)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="card bg-info bg-gradient text-white border-0 shadow">
                        <div className="card-body text-center">
                          <Clock size={40} className="mb-3" />
                          <h5 className="card-title">Great News!</h5>
                          <p className="card-text">You have been selected for</p>
                          <div className="display-6 fw-bold">
                            {formatCurrency(scholarship.grant_amount)}
                          </div>
                          <small className="opacity-75">Awaiting final approval</small>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {scholarship.status === 'pending' && (
                  <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="card bg-warning bg-gradient text-white border-0 shadow">
                      <div className="card-body text-center">
                        <Clock size={40} className="mb-3" />
                        <h5 className="card-title">Under Review</h5>
                        <p className="card-text">Your application is being evaluated</p>
                        <div className="display-6 fw-bold">
                          {formatCurrency(scholarship.grant_amount)}
                        </div>
                        <small className="opacity-75">Please wait for updates</small>
                      </div>
                    </div>
                  </div>
                )}

                {scholarship.status === 'denied' && (
                  <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="card bg-danger bg-gradient text-white border-0 shadow">
                      <div className="card-body text-center">
                        <AlertCircle size={40} className="mb-3" />
                        <h5 className="card-title">Application Status</h5>
                        <p className="card-text">Unfortunately not selected</p>
                        <div className="fs-5 fw-bold">
                          Please try again next semester
                        </div>
                        <small className="opacity-75">See details below</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-2rem', paddingBottom: '3rem' }}>
        {/* Enhanced Navigation */}
        <div className="card border-0 shadow-lg mb-4">
          <div className="card-body p-0">
            <ul className="nav nav-pills nav-fill border-0 p-3" role="tablist">
              {[
                { id: 'overview', name: 'Overview', icon: Eye, color: 'primary' },
                { id: 'details', name: 'Selection Details', icon: FileText, color: 'info' },
                { id: 'requirements', name: 'Requirements', icon: CheckCircle, color: 'success' },
                { id: 'contact', name: 'Contact Info', icon: Mail, color: 'warning' }
              ].map(({ id, name, icon: Icon, color }) => (
                <li className="nav-item" key={id}>
                  <button
                    className={`nav-link d-flex align-items-center justify-content-center py-3 rounded-pill fw-semibold transition-all ${
                      activeTab === id 
                        ? `active bg-${color} text-white shadow` 
                        : 'text-muted hover-bg-light'
                    }`}
                    onClick={() => setActiveTab(id)}
                    type="button"
                  >
                    <Icon size={18} className="me-2" />
                    <span className="d-none d-sm-inline">{name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enhanced Tab Content */}
        <div className="card border-0 shadow-lg">
          <div className="card-body p-4 p-lg-5">
            {activeTab === 'overview' && (
              <div>
                <div className="row g-4 mb-5">
                  {/* Student Information Card */}
                  <div className="col-lg-6">
                    <div className="card h-100 border-0 bg-light bg-gradient">
                      <div className="card-header bg-transparent border-0 pb-0">
                        <h5 className="d-flex align-items-center mb-0">
                          <div className="p-2 bg-primary bg-gradient rounded me-3">
                            <User size={18} className="text-white" />
                          </div>
                          Student Information
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          {[
                            { label: 'Full Name', value: scholarship.application?.student?.name },
                            { label: 'Student ID', value: scholarship.application?.student?.student_id },
                            { label: 'Course', value: scholarship.application?.student?.course },
                            { label: 'Year Level', value: scholarship.application?.student?.year_level },
                            { label: 'Campus', value: scholarship.application?.student?.campus }
                          ].map(({ label, value }) => (
                            <div key={label} className="col-12">
                              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                                <span className="text-muted fw-medium">{label}:</span>
                                <span className="fw-semibold">{value || 'N/A'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Performance Card */}
                  <div className="col-lg-6">
                    <div className="card h-100 border-0 bg-light bg-gradient">
                      <div className="card-header bg-transparent border-0 pb-0">
                        <h5 className="d-flex align-items-center mb-0">
                          <div className="p-2 bg-success bg-gradient rounded me-3">
                            <School size={18} className="text-white" />
                          </div>
                          Academic Performance
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row g-4">
                          <div className="col-6">
                            <div className="text-center p-3 bg-white rounded shadow-sm">
                              <Star size={24} className="text-warning mb-2" />
                              <div className="h3 fw-bold text-success mb-1">{scholarship.evaluation?.gwa || 'N/A'}</div>
                              <div className="small text-muted">GWA</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 bg-white rounded shadow-sm">
                              <TrendingUp size={24} className="text-primary mb-2" />
                              <div className="h3 fw-bold text-primary mb-1">{scholarship.evaluation?.score || 'N/A'}%</div>
                              <div className="small text-muted">Score</div>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                              <span className="text-muted fw-medium">Total Units:</span>
                              <span className="fw-semibold">{scholarship.evaluation?.total_units || 'N/A'}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center py-2">
                              <span className="text-muted fw-medium">Classification:</span>
                              <span className="badge bg-success bg-gradient">{scholarship.evaluation?.classification || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Timeline */}
                <div className="card border-0 bg-gradient" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <div className="card-body p-4">
                    <h5 className="text-white mb-4 d-flex align-items-center">
                      <Calendar size={20} className="me-2" />
                      Application Timeline
                    </h5>
                    <div className="row g-4">
                      {[
                        { 
                          title: 'Application Submitted', 
                          date: scholarship.application?.submitted_at,
                          icon: FileText,
                          color: 'primary',
                          completed: true
                        },
                        ...(scholarship.status === 'selected' ? [{
                          title: 'Selected for Scholarship', 
                          date: scholarship.selected_date,
                          icon: CheckCircle,
                          color: 'info',
                          completed: true
                        }] : []),
                        ...(scholarship.status === 'awarded' ? [
                          {
                            title: 'Selected for Scholarship', 
                            date: scholarship.selected_date,
                            icon: CheckCircle,
                            color: 'warning',
                            completed: true
                          },
                          {
                            title: 'Scholarship Awarded', 
                            date: scholarship.awarded_date,
                            icon: Award,
                            color: 'success',
                            completed: true
                          }
                        ] : []),
                        ...(scholarship.status === 'denied' ? [{
                          title: 'Application Reviewed', 
                          date: scholarship.reviewed_date,
                          icon: AlertCircle,
                          color: 'danger',
                          completed: true
                        }] : []),
                        ...(scholarship.status === 'pending' ? [{
                          title: 'Under Committee Review', 
                          date: new Date().toISOString(),
                          icon: Clock,
                          color: 'warning',
                          completed: false
                        }] : [])
                      ].map(({ title, date, icon: Icon, color, completed }, index) => (
                        <div key={index} className="col-md-4">
                          <div className="card bg-white border-0 shadow-sm h-100">
                            <div className="card-body text-center p-4">
                              <div className={`p-3 bg-${color} bg-gradient rounded-circle d-inline-flex mb-3 shadow`}>
                                <Icon size={24} className="text-white" />
                              </div>
                              <h6 className="fw-bold mb-2">{title}</h6>
                              <p className="text-muted small mb-0">{formatDate(date)}</p>
                              {completed && <CheckCircle size={16} className="text-success mt-2" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div>
                <h4 className="mb-4 fw-bold">
                  {scholarship.status === 'pending' ? 'Application Status' : 
                   scholarship.status === 'denied' ? 'Review Results' : 
                   'Selection Details & Criteria'}
                </h4>
                
                {/* Status-specific content */}
                {scholarship.status === 'pending' && (
                  <div className="alert alert-warning border-0 shadow-sm mb-4">
                    <div className="d-flex align-items-start">
                      <div className="p-2 bg-warning bg-gradient rounded me-3">
                        <Clock size={20} className="text-white" />
                      </div>
                      <div>
                        <h6 className="alert-heading fw-bold">Application Under Review</h6>
                        <p className="mb-0 lead">Your scholarship application is currently being evaluated by our committee. We will notify you once a decision has been made.</p>
                      </div>
                    </div>
                  </div>
                )}

                {scholarship.status === 'denied' && (
                  <div className="alert alert-danger border-0 shadow-sm mb-4">
                    <div className="d-flex align-items-start">
                      <div className="p-2 bg-danger bg-gradient rounded me-3">
                        <AlertCircle size={20} className="text-white" />
                      </div>
                      <div>
                        <h6 className="alert-heading fw-bold">Application Review Results</h6>
                        <p className="mb-0 lead">{scholarship.denial_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(scholarship.status === 'selected' || scholarship.status === 'awarded') && (
                  <div className="alert alert-success border-0 shadow-sm mb-4">
                    <div className="d-flex align-items-start">
                      <div className="p-2 bg-success bg-gradient rounded me-3">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                      <div>
                        <h6 className="alert-heading fw-bold">Selection Reason</h6>
                        <p className="mb-0 lead">{scholarship.selection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show criteria comparison only for selected/awarded/denied */}
                {scholarship.status !== 'pending' && (
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="card border-warning border-2">
                        <div className="card-header bg-warning bg-gradient text-white">
                          <h6 className="mb-0 fw-bold">
                            <Shield size={18} className="me-2" />
                            Scholarship Requirements
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="list-group list-group-flush">
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                              <span>Minimum GWA</span>
                              <span className="badge bg-warning rounded-pill">{scholarship.scholarship_rules?.min_gwa}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                              <span>Max Family Income</span>
                              <span className="badge bg-warning rounded-pill">{formatCurrency(scholarship.scholarship_rules?.max_income)}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                              <span>Minimum Units</span>
                              <span className="badge bg-warning rounded-pill">{scholarship.scholarship_rules?.min_units}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className={`card border-2 ${
                        scholarship.status === 'denied' ? 'border-danger' : 'border-success'
                      }`}>
                        <div className={`card-header bg-gradient text-white ${
                          scholarship.status === 'denied' ? 'bg-danger' : 'bg-success'
                        }`}>
                          <h6 className="mb-0 fw-bold">
                            {scholarship.status === 'denied' ? (
                              <>
                                <AlertCircle size={18} className="me-2" />
                                Your Application Results
                              </>
                            ) : (
                              <>
                                <CheckCircle size={18} className="me-2" />
                                Your Qualifications
                              </>
                            )}
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="list-group list-group-flush">
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                              <span>Your GWA</span>
                              <span className={`badge rounded-pill ${
                                scholarship.evaluation?.gwa <= scholarship.scholarship_rules?.min_gwa 
                                  ? 'bg-success' : 'bg-danger'
                              }`}>
                                {scholarship.evaluation?.gwa} {scholarship.evaluation?.gwa <= scholarship.scholarship_rules?.min_gwa ? '✓' : '✗'}
                              </span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                              <span>Eligibility Score</span>
                              <span className={`badge rounded-pill ${
                                scholarship.status === 'denied' ? 'bg-danger' : 'bg-success'
                              }`}>
                                {scholarship.evaluation?.score}% {scholarship.status === 'denied' ? '✗' : '✓'}
                              </span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                              <span>Units Enrolled</span>
                              <span className={`badge rounded-pill ${
                                scholarship.evaluation?.total_units >= scholarship.scholarship_rules?.min_units 
                                  ? 'bg-success' : 'bg-danger'
                              }`}>
                                {scholarship.evaluation?.total_units} {scholarship.evaluation?.total_units >= scholarship.scholarship_rules?.min_units ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Improvement suggestions for denied applications */}
                {scholarship.status === 'denied' && (
                  <div className="mt-4">
                    <div className="card border-info border-2">
                      <div className="card-header bg-info bg-gradient text-white">
                        <h6 className="mb-0 fw-bold">
                          <TrendingUp size={18} className="me-2" />
                          Suggestions for Next Application
                        </h6>
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <CheckCircle size={16} className="text-success me-2" />
                            Focus on improving your GWA to meet the minimum requirement
                          </li>
                          <li className="mb-2">
                            <CheckCircle size={16} className="text-success me-2" />
                            Consider taking additional units to strengthen your academic load
                          </li>
                          <li className="mb-2">
                            <CheckCircle size={16} className="text-success me-2" />
                            Ensure all required documents are properly submitted
                          </li>
                          <li>
                            <CheckCircle size={16} className="text-success me-2" />
                            Apply early in the next application period
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requirements' && (
              <div>
                <h4 className="mb-4 fw-bold">Submitted Requirements</h4>
                
                <div className="row g-4">
                  {scholarship.requirements?.map((req, index) => (
                    <div key={index} className="col-lg-6">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start">
                            <div className="p-3 bg-primary bg-gradient rounded me-3">
                              <FileText size={24} className="text-white" />
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="fw-bold mb-2">{req.file_name}</h6>
                              <p className="text-muted mb-2">
                                {req.type === 'grades' ? 'Academic Records' : 'Income Tax Return'}
                              </p>
                              <p className="small text-muted mb-3">
                                <Calendar size={14} className="me-1" />
                                Uploaded: {formatDate(req.uploaded_at)}
                              </p>
                              
                              <div className="d-flex justify-content-between align-items-center">
                                <span className={`badge ${
                                  req.status === 'verified' 
                                    ? 'bg-success bg-gradient' 
                                    : 'bg-warning bg-gradient'
                                } px-3 py-2`}>
                                  {req.status === 'verified' ? (
                                    <>
                                      <CheckCircle size={14} className="me-1" />
                                      Verified
                                    </>
                                  ) : (
                                    <>
                                      <Clock size={14} className="me-1" />
                                      Pending
                                    </>
                                  )}
                                </span>
                                
                                <button className="btn btn-outline-primary btn-sm">
                                  <Download size={16} className="me-1" />
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="col-12">
                      <div className="alert alert-info">
                        <p className="mb-0">No requirements data available.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div>
                <h4 className="mb-4 fw-bold">Get in Touch</h4>
                
                <div className="row">
                  <div className="col-lg-8">
                    <div className="card border-0 shadow-lg" style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    }}>
                      <div className="card-body p-5 text-white">
                        <div className="d-flex align-items-start">
                          <div className="p-3 bg-white bg-opacity-25 rounded-circle me-4">
                            <User size={32} />
                          </div>
                          <div className="flex-grow-1">
                            <h4 className="fw-bold mb-2">{scholarship.selected_by_admin?.name}</h4>
                            <p className="mb-4 fs-5 opacity-75">{scholarship.selected_by_admin?.title}</p>
                            
                            <div className="row g-3">
                              <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                  <div className="p-2 bg-white bg-opacity-25 rounded me-3">
                                    <Mail size={18} />
                                  </div>
                                  <div>
                                    <div className="small opacity-75">Email</div>
                                    <a href={`mailto:${scholarship.selected_by_admin?.email}`} 
                                       className="text-white text-decoration-none fw-semibold">
                                      {scholarship.selected_by_admin?.email}
                                    </a>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                  <div className="p-2 bg-white bg-opacity-25 rounded me-3">
                                    <Phone size={18} />
                                  </div>
                                  <div>
                                    <div className="small opacity-75">Phone</div>
                                    <a href={`tel:${scholarship.selected_by_admin?.phone}`} 
                                       className="text-white text-decoration-none fw-semibold">
                                      {scholarship.selected_by_admin?.phone}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="card border-primary border-2 h-100">
                      <div className="card-body p-4">
                        <div className="text-center mb-3">
                          <div className="p-3 bg-primary bg-gradient rounded-circle d-inline-flex">
                            <Mail size={24} className="text-white" />
                          </div>
                        </div>
                        <h6 className="text-center fw-bold mb-3">Need Help?</h6>
                        <p className="text-muted text-center small mb-4">
                          For any questions regarding your scholarship selection, award details, 
                          or next steps, don't hesitate to reach out to our scholarship committee.
                        </p>
                        <div className="d-grid">
                          <button className="btn btn-primary btn-lg">
                            <Mail size={18} className="me-2" />
                            Send Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Action Section */}
        {scholarship.status === 'awarded' && (
          <div className="text-center mt-5">
            <div className="card border-0 shadow-lg bg-gradient" style={{ 
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' 
            }}>
              <div className="card-body p-5">
                <Award size={48} className="text-white mb-3" />
                <h4 className="text-white fw-bold mb-3">Congratulations on Your Achievement!</h4>
                <p className="text-white opacity-75 mb-4 lead">
                  Your hard work has paid off. Download your official scholarship certificate below.
                </p>
                <button className="btn btn-light btn-lg shadow">
                  <Download size={20} className="me-2" />
                  Download Award Certificate
                </button>
              </div>
            </div>
          </div>
        )}

        {scholarship.status === 'selected' && (
          <div className="text-center mt-5">
            <div className="card border-0 shadow-lg bg-gradient" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            }}>
              <div className="card-body p-5">
                <CheckCircle size={48} className="text-white mb-3" />
                <h4 className="text-white fw-bold mb-3">You've Been Selected!</h4>
                <p className="text-white opacity-75 mb-4 lead">
                  Great news! Your application has been approved. Final award processing is underway.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-light btn-lg shadow">
                    <Mail size={20} className="me-2" />
                    Contact Committee
                  </button>
                  <button className="btn btn-outline-light btn-lg">
                    <Eye size={20} className="me-2" />
                    Track Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {scholarship.status === 'pending' && (
          <div className="text-center mt-5">
            <div className="card border-0 shadow-lg bg-gradient" style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
            }}>
              <div className="card-body p-5">
                <Clock size={48} className="text-white mb-3" />
                <h4 className="text-white fw-bold mb-3">Application Under Review</h4>
                <p className="text-white opacity-75 mb-4 lead">
                  Your application is being carefully evaluated. We'll notify you as soon as a decision is made.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-light btn-lg shadow">
                    <Mail size={20} className="me-2" />
                    Check Status
                  </button>
                  <button className="btn btn-outline-light btn-lg">
                    <Phone size={20} className="me-2" />
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {scholarship.status === 'denied' && (
          <div className="text-center mt-5">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card border-0 shadow-lg bg-gradient" style={{ 
                  background: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)' 
                }}>
                  <div className="card-body p-5">
                    <TrendingUp size={48} className="text-white mb-3" />
                    <h4 className="text-white fw-bold mb-3">Don't Give Up - Try Again!</h4>
                    <p className="text-white opacity-75 mb-4 lead">
                      While you weren't selected this time, there are always new opportunities. 
                      Use this experience to strengthen your next application.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <button className="btn btn-light btn-lg shadow">
                        <TrendingUp size={20} className="me-2" />
                        View Improvement Tips
                      </button>
                      <button className="btn btn-outline-light btn-lg">
                        <Mail size={20} className="me-2" />
                        Get Guidance
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedScholarshipView;
