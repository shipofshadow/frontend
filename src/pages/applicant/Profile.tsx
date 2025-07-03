import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const profile = user?.profile;

    if (!profile) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning">No profile data found.</div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 shadow rounded-4">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="me-3">
                                    <i className="bi bi-person-circle fs-1 text-primary"></i>
                                </div>
                                <div>
                                    <h4 className="mb-0">
                                        {profile.first_name} {profile.middle_name || ''} {profile.last_name}
                                    </h4>
                                    <small className="text-muted">Student ID: {profile.student_id || '—'}</small>
                                </div>
                            </div>

                            <hr />

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="text-muted small">Email</label>
                                    <div className="fw-medium">{user.email || '—'}</div>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted small">Phone Number</label>
                                    <div className="fw-medium">{profile.phone || '—'}</div>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted small">Date of Birth</label>
                                    <div className="fw-medium">{profile.birth_date || '—'}</div>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted small">Citizenship</label>
                                    <div className="fw-medium">{profile.citizenship || '—'}</div>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted small">Civil Status</label>
                                    <div className="fw-medium">{profile.civil_status || '—'}</div>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted small">Emergency Contact</label>
                                    <div className="fw-medium">
                                        {profile.emergency_contact_name || '—'} ({profile.emergency_contact_number || '—'})
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-end">
                                <button className="btn btn-outline-primary btn-sm">
                                    <i className="bi bi-pencil-square me-1"></i> Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
