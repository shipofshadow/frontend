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
    <main className="container py-5">
      <div className="row justify-content-center gx-5">
        {/* Left Column: Photo & Basic Info */}
        <aside className="col-lg-4 mb-4 mb-lg-0">
          <div className="card rounded-4 shadow-sm text-center p-4">
            <div
              className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4"
              style={{ width: 120, height: 120 }}
            >
              <i className="bi bi-person-fill fs-1 text-primary"></i>
            </div>
            <h3 className="mb-1 fw-bold">
              {profile.first_name} {profile.middle_name && profile.middle_name + " "}{profile.last_name}
            </h3>
            <small className="text-muted d-block mb-2">{profile.student_id ?? "ID not provided"}</small>
            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fs-6 d-inline-flex align-items-center gap-2">
              <i className="bi bi-check-circle"></i> Active Student
            </span>
          </div>
        </aside>

        {/* Right Column: Details & Actions */}
        <section className="col-lg-8 d-flex flex-column">
          {/* Personal Information */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 flex-grow-1">
            <header className="card-header bg-transparent border-0 px-4 px-md-5 pt-4 pb-2">
              <h4 className="fw-bold d-flex align-items-center gap-2 text-primary mb-0">
                <i className="bi bi-person-lines-fill fs-4"></i> Personal Information
              </h4>
            </header>
            <div className="card-body px-4 px-md-5 pt-2 pb-4">
              <div className="row g-4">
                {[
                  { label: "Email Address", icon: "bi-envelope", value: user.email },
                  { label: "Phone Number", icon: "bi-telephone", value: profile.contact_number },
                  { label: "Date of Birth", icon: "bi-calendar-event", value: profile.birth_date },
                  { label: "Citizenship", icon: "bi-flag", value: profile.citizenship },
                  { label: "Civil Status", icon: "bi-heart", value: profile.civil_status },
                ].map(({ label, icon, value }) => (
                  <div key={label} className="col-md-6">
                    <label className="form-label text-muted small fw-semibold d-flex align-items-center gap-2 mb-1">
                      <i className={`bi ${icon} fs-5`}></i> {label}
                    </label>
                    <div className={`fw-semibold ${value ? "text-dark" : "text-muted fst-italic"}`}>
                      {value ?? "Not provided"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 flex-grow-0">
            <header className="card-header bg-transparent border-0 px-4 px-md-5 pt-4 pb-2">
              <h4 className="fw-bold d-flex align-items-center gap-2 text-danger mb-0">
                <i className="bi bi-shield-exclamation fs-4"></i> Emergency Contact
              </h4>
            </header>
            <div className="card-body px-4 px-md-5 pt-2 pb-4">
              <label className="form-label text-muted small fw-semibold d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-person-plus fs-5"></i> Contact Person & Phone
              </label>
              {profile.emergency_contact_name && profile.emergency_contact_number ? (
                <div className="d-flex flex-column flex-sm-row gap-3 align-items-center">
                  <span className="fw-semibold">{profile.emergency_contact_name}</span>
                  <span className="text-muted fs-5">•</span>
                  <a href={`tel:${profile.emergency_contact_number}`} className="text-decoration-none fw-semibold">
                    {profile.emergency_contact_number}
                  </a>
                </div>
              ) : (
                <span className="text-muted fst-italic">Emergency contact not provided</span>
              )}
            </div>
          </div>

          {/* Action Buttons - fixed bottom on large screens */}
          <div className="d-flex gap-3 justify-content-end mt-auto pt-3 sticky-lg-top bg-light pb-3">
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold">
              <i className="bi bi-download fs-5"></i> Download Profile
            </button>
            <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold">
              <i className="bi bi-pencil-square fs-5"></i> Edit Profile
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Profile;
