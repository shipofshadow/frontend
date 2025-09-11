import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const profile = user?.profile;

    if (!profile) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="alert alert-warning border-0 rounded-4 shadow-sm">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                                <div>
                                    <h6 className="alert-heading mb-1">No Profile Data</h6>
                                    <p className="mb-0 small">Profile information could not be loaded.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-xl-8 col-lg-10">
                    {/* Header Card */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4 p-md-5">
                            <div className="d-flex flex-column flex-sm-row align-items-center text-center text-sm-start">
                                <div className="mb-3 mb-sm-0 me-sm-4">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                                         style={{ width: '80px', height: '80px' }}>
                                        <i className="bi bi-person-fill fs-1 text-primary"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <h2 className="mb-2 fw-bold">
                                        {profile.first_name} {profile.middle_name && profile.middle_name + ' '}{profile.last_name}
                                    </h2>
                                    <div className="d-flex flex-column flex-sm-row gap-3">
                                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                                            <i className="bi bi-person-badge me-1"></i>
                                            ID: {profile.student_id || 'Not Available'}
                                        </span>
                                        <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                                            <i className="bi bi-check-circle me-1"></i>
                                            Active Student
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information Card */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-transparent border-0 pb-0 pt-4 px-4 px-md-5">
                            <h5 className="mb-0 fw-bold d-flex align-items-center">
                                <i className="bi bi-person-lines-fill me-2 text-primary"></i>
                                Personal Information
                            </h5>
                        </div>
                        <div className="card-body p-4 p-md-5 pt-3">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="info-item">
                                        <label className="form-label text-muted mb-1 small fw-medium">
                                            <i className="bi bi-envelope me-1"></i>
                                            Email Address
                                        </label>
                                        <div className="fw-semibold text-dark">
                                            {user.email || <span className="text-muted">Not provided</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="info-item">
                                        <label className="form-label text-muted mb-1 small fw-medium">
                                            <i className="bi bi-telephone me-1"></i>
                                            Phone Number
                                        </label>
                                        <div className="fw-semibold text-dark">
                                            {profile.contact_number || <span className="text-muted">Not provided</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="info-item">
                                        <label className="form-label text-muted mb-1 small fw-medium">
                                            <i className="bi bi-calendar-event me-1"></i>
                                            Date of Birth
                                        </label>
                                        <div className="fw-semibold text-dark">
                                            {profile.birth_date || <span className="text-muted">Not provided</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="info-item">
                                        <label className="form-label text-muted mb-1 small fw-medium">
                                            <i className="bi bi-flag me-1"></i>
                                            Citizenship
                                        </label>
                                        <div className="fw-semibold text-dark">
                                            {profile.citizenship || <span className="text-muted">Not provided</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="info-item">
                                        <label className="form-label text-muted mb-1 small fw-medium">
                                            <i className="bi bi-heart me-1"></i>
                                            Civil Status
                                        </label>
                                        <div className="fw-semibold text-dark">
                                            {profile.civil_status || <span className="text-muted">Not provided</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact Card */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-transparent border-0 pb-0 pt-4 px-4 px-md-5">
                            <h5 className="mb-0 fw-bold d-flex align-items-center">
                                <i className="bi bi-shield-exclamation me-2 text-danger"></i>
                                Emergency Contact
                            </h5>
                        </div>
                        <div className="card-body p-4 p-md-5 pt-3">
                            <div className="info-item">
                                <label className="form-label text-muted mb-1 small fw-medium">
                                    <i className="bi bi-person-plus me-1"></i>
                                    Contact Person & Phone
                                </label>
                                <div className="fw-semibold text-dark">
                                    {profile.emergency_contact_name && profile.emergency_contact_number ? (
                                        <div className="d-flex flex-column flex-sm-row gap-2">
                                            <span>{profile.emergency_contact_name}</span>
                                            <span className="text-muted">•</span>
                                            <a href={`tel:${profile.emergency_contact_number}`}
                                               className="text-decoration-none">
                                                {profile.emergency_contact_number}
                                            </a>
                                        </div>
                                    ) : (
                                        <span className="text-muted">Emergency contact not provided</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex flex-column flex-sm-row gap-3 justify-content-end">
                        <button className="btn btn-outline-secondary">
                            <i className="bi bi-download me-2"></i>
                            Download Profile
                        </button>
                        <button className="btn btn-primary">
                            <i className="bi bi-pencil-square me-2"></i>
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;