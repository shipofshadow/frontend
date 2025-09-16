import React from "react";
import { useAuth } from "../../context/AuthContext";

const Profile: React.FC = () => {
    const { user } = useAuth();
    const profile = user?.profile;

    if (!profile) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="alert alert-warning border-0 rounded-4 shadow-sm d-flex align-items-center gap-3">
                            <i className="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
                            <div>
                                <h6 className="alert-heading mb-1">No Profile Data</h6>
                                <p className="mb-0 small">Profile information could not be loaded.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-vh-100 bg-light">
            {/* Enhanced Header with Breadcrumb */}
            <div className="bg-white shadow-sm border-bottom">
                <div className="container py-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <i className="bi bi-house me-1"></i>
                                Dashboard
                            </li>
                            <li className="breadcrumb-item active">Profile</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container py-4">
                {/* Profile Header */}
                <section className="mb-4">
                    <div
                        className="rounded-4  p-4 shadow-sm position-relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                    >
                        <div
                            className="position-absolute top-0 end-0 opacity-10"
                            style={{
                                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                                width: "100%",
                                height: "100%"
                            }}
                        />

                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <div className="d-flex align-items-center">
                                    <div className="bg-white bg-opacity-20 rounded-circle p-4 me-4">
                                        <i className="bi bi-person-fill" style={{fontSize: "3rem"}}></i>
                                    </div>
                                    <div>
                                        <h1 className="h2 fw-bold mb-2">
                                            {profile.first_name} {profile.middle_name && profile.middle_name + " "}{profile.last_name}
                                            {profile.extension_name && " " + profile.extension_name}
                                        </h1>
                                        <div className="d-flex flex-wrap gap-3 align-items-center">
                      <span className="bg-white bg-opacity-20 rounded-pill px-3 py-2">
                        <i className="bi bi-card-text me-2"></i>
                        <strong>{profile.student_id || "ID not provided"}</strong>
                      </span>
                                            <span className="bg-white bg-opacity-20 rounded-pill px-3 py-2">
                        <i className="bi bi-check-circle me-2"></i>
                        Active Student
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 text-end">
                                <div className="d-flex gap-2 justify-content-end">
                                    <button className="btn btn-light btn-sm d-flex align-items-center gap-2 rounded-pill">
                                        <i className="bi bi-download"></i>
                                        Download
                                    </button>
                                    <button className="btn btn-warning btn-sm d-flex align-items-center gap-2 rounded-pill">
                                        <i className="bi bi-pencil-square"></i>
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Profile Content Grid */}
                <div className="row g-4">
                    {/* Left Column */}
                    <div className="col-lg-6">
                        {/* Personal Information */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-15 rounded-3 p-2 me-3">
                                        <i className="bi bi-person-lines-fill text-primary fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Personal Information</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-envelope text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Email Address</label>
                                        </div>
                                        <div className="fw-semibold text-break">
                                            {user.email || profile.email || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-telephone text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Phone Number</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.contact_number || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-calendar-event text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Date of Birth</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-flag text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Citizenship</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.citizenship || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-heart text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Civil Status</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.civil_status || "Not provided"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-info bg-opacity-15 rounded-3 p-2 me-3">
                                        <i className="bi bi-geo-alt-fill text-info fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Address Information</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-house text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Street Address</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.street || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-pin-map text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Barangay</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.barangay_name || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-building text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Municipality</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.municipality_name || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-map text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Province</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.province_name || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-globe text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Region</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.region_name || "Not provided"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-danger bg-opacity-15 rounded-3 p-2 me-3">
                                        <i className="bi bi-shield-exclamation text-danger fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Emergency Contact</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                {profile.emergency_contact_name && profile.emergency_contact_number ? (
                                    <div className="row g-3">
                                        <div className="col-md-8">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-person-plus text-danger me-2"></i>
                                                <label className="form-label text-muted small fw-semibold mb-0">Contact Person</label>
                                            </div>
                                            <div className="fw-semibold">
                                                {profile.emergency_contact_name}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-telephone text-danger me-2"></i>
                                                <label className="form-label text-muted small fw-semibold mb-0">Phone Number</label>
                                            </div>
                                            <div className="fw-semibold">
                                                <a href={`tel:${profile.emergency_contact_number}`} className="text-decoration-none">
                                                    {profile.emergency_contact_number}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                                        <h6 className="text-muted">No Emergency Contact</h6>
                                        <p className="text-muted small mb-3">Emergency contact information has not been provided.</p>
                                        <button className="btn btn-outline-warning btn-sm">
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Add Emergency Contact
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-6">
                        {/* Family Background */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-success bg-opacity-15 rounded-3 p-2 me-3">
                                        <i className="bi bi-people-fill text-success fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Family Background</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                {/* Father's Information */}
                                <div className="mb-4">
                                    <h6 className="text-muted fw-bold mb-3 d-flex align-items-center">
                                        <i className="bi bi-person text-primary me-2"></i>
                                        Father's Information
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="fw-semibold">
                                                {profile.father_first_name || profile.father_last_name ?
                                                    `${profile.father_first_name || ''} ${profile.father_middle_name ? profile.father_middle_name + ' ' : ''}${profile.father_last_name || ''} ${profile.father_extension || ''}`.trim()
                                                    : "Not provided"
                                                }
                                            </div>
                                            <small className="text-muted">Full Name</small>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="fw-semibold">
                                                {profile.father_occupation || "Not provided"}
                                            </div>
                                            <small className="text-muted">Occupation</small>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="fw-semibold">
                                                {profile.father_income || "Not provided"}
                                            </div>
                                            <small className="text-muted">Monthly Income</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Mother's Information */}
                                <div className="mb-4">
                                    <h6 className="text-muted fw-bold mb-3 d-flex align-items-center">
                                        <i className="bi bi-person text-danger me-2"></i>
                                        Mother's Information
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="fw-semibold">
                                                {profile.mother_first_name || profile.mother_last_name ?
                                                    `${profile.mother_first_name || ''} ${profile.mother_middle_name ? profile.mother_middle_name + ' ' : ''}${profile.mother_last_name || ''}`.trim()
                                                    : "Not provided"
                                                }
                                            </div>
                                            <small className="text-muted">Full Name</small>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="fw-semibold">
                                                {profile.mother_occupation || "Not provided"}
                                            </div>
                                            <small className="text-muted">Occupation</small>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="fw-semibold">
                                                {profile.mother_income || "Not provided"}
                                            </div>
                                            <small className="text-muted">Monthly Income</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Household Information */}
                                <div className="bg-light rounded-3 p-3">
                                    <h6 className="text-muted fw-bold mb-3 d-flex align-items-center">
                                        <i className="bi bi-house-fill text-info me-2"></i>
                                        Household Information
                                    </h6>
                                    <div className="row g-3 text-center">
                                        <div className="col-4">
                                            <div className="fw-bold text-primary fs-4">
                                                {profile.household_number || "0"}
                                            </div>
                                            <small className="text-muted">Family Members</small>
                                        </div>
                                        <div className="col-4">
                                            <div className="fw-bold text-warning fs-4">
                                                {profile.siblings || "0"}
                                            </div>
                                            <small className="text-muted">Siblings</small>
                                        </div>
                                        <div className="col-4">
                                            <div className="fw-bold text-success fs-4">
                                                {profile.siblings_studying || "0"}
                                            </div>
                                            <small className="text-muted">In School</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-warning bg-opacity-15 rounded-3 p-2 me-3">
                                        <i className="bi bi-info-circle-fill text-warning fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Additional Information</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-award text-warning me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">4Ps Beneficiary</label>
                                        </div>
                                        <div className="fw-semibold">
                      <span className={`badge ${profile.is_4ps_member ? 'bg-success' : 'bg-secondary'} px-3 py-2 rounded-pill`}>
                        <i className={`bi ${profile.is_4ps_member ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                          {profile.is_4ps_member ? "Yes" : "No"}
                      </span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-people text-warning me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">IP Affiliation</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile.ip_affiliation || "Not applicable"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Actions */}
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-secondary bg-opacity-15 rounded-3 p-2 me-3">
                                        <i className="bi bi-gear-fill text-secondary fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Profile Actions</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-3">
                                    <button className="btn btn-primary d-flex align-items-center justify-content-between rounded-3 py-3">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-pencil-square fs-5 me-3"></i>
                                            <span className="fw-semibold">Edit Profile Information</span>
                                        </div>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                    <button className="btn btn-outline-success d-flex align-items-center justify-content-between rounded-3 py-3">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-download fs-5 me-3"></i>
                                            <span className="fw-semibold">Download Profile PDF</span>
                                        </div>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                    <button className="btn btn-outline-info d-flex align-items-center justify-content-between rounded-3 py-3">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-eye fs-5 me-3"></i>
                                            <span className="fw-semibold">View Application History</span>
                                        </div>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                    <button className="btn btn-outline-warning d-flex align-items-center justify-content-between rounded-3 py-3">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-shield-lock fs-5 me-3"></i>
                                            <span className="fw-semibold">Privacy Settings</span>
                                        </div>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Custom Styles */}
            <style>{`
        .bg-gradient {
          background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .card {
          border-radius: 1rem !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        
        .card-header {
          background: transparent;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .btn {
          border-radius: 0.6rem !important;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .badge {
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        
        .breadcrumb {
          background: transparent;
        }
        
        .breadcrumb-item + .breadcrumb-item::before {
          content: "›";
          color: #6c757d;
        }
        
        .text-break {
          word-break: break-word;
        }
        
        @media (max-width: 768px) {
          .card-body {
            padding: 1rem;
          }
          
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        
        .fw-semibold:empty::before,
        .fw-semibold:not(:empty) {
          min-height: 1.2em;
          display: inline-block;
        }
        
        .fw-semibold:empty::before {
          content: "Not provided";
          color: #6c757d;
          font-style: italic;
          font-weight: normal;
        }
      `}</style>
        </main>
    );
};

export default Profile;