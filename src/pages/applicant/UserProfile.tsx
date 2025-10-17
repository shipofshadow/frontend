import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import type { Profile as ProfileType } from "../../interfaces/profile";

const UserProfile = () => {
    const { user } = useAuth();

    const profile: ProfileType | undefined = user?.profile;


    const avatar = user?.profile?.avatar;
        const path = avatar
    ? avatar.startsWith("http")
        ? avatar
        : `${API_BASE_URL}/api/profile/avatar/${encodeURIComponent(
              avatar.replace(/^.*[\\/]/, "") // strip folders + normalize slashes
          )}`
    : "/default.png";


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
                                <div
                                    className="bg-white bg-opacity-20 rounded-circle me-4"
                                    style={{
                                    width: "80px",
                                    height: "80px",
                                    overflow: "hidden",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    }}
                                >
                                    <img
                                    src={path} // your image path
                                    alt="Profile"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover", // fills the container without distortion
                                    }}
                                    />
                                </div>

                                <div>
                                    <h1 className="h2 fw-bold mb-2">
                                    {profile?.first_name} {profile?.middle_name && profile?.middle_name + " "}{profile?.last_name}
                                    {profile?.extension_name && " " + profile?.extension_name}
                                    </h1>
                                    <div className="d-flex flex-wrap gap-3 align-items-center">
                                    <span className="bg-white bg-opacity-20 rounded-pill px-3 py-2">
                                        <i className="fal fa-address-card me-2"></i>
                                        <strong>{profile?.student_id || "ID not provided"}</strong>
                                    </span>
                                    <span className="bg-white bg-opacity-20 rounded-pill px-3 py-2">
                                        <i className="fal fa-check-circle me-2"></i>
                                        Active Student
                                    </span>
                                    </div>
                                </div>
                                </div>
                            </div>

                            <div className="col-lg-4 text-end">
                                <div className="d-flex gap-2 justify-content-end">
                                    <button className="btn btn-light btn-sm d-flex align-items-center gap-2 rounded-pill">
                                        <i className="fal fa-download"></i>
                                        Download
                                    </button>
                                    <button className="btn btn-warning btn-sm d-flex align-items-center gap-2 rounded-pill">
                                        <i className="fal fa-pencil"></i>
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
                                        <i className="fal fa-users-line text-white fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Personal Information</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-envelope text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Email Address</label>
                                        </div>
                                        <div className="fw-semibold text-break">
                                            { profile?.email || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-phone text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Phone Number</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.contact_number || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-calendar text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Date of Birth</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.birth_date ? new Date(profile?.birth_date).toLocaleDateString() : "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-flag text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Citizenship</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.citizenship || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-heart text-primary me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Civil Status</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.civil_status || "Not provided"}
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
                                            <i className="fal fa-house text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Street Address</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.street || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-map-pin text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Barangay</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.barangay_name || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-building text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Municipality</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.municipality_name || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-map text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Province</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.province_name || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-globe text-info me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">Region</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.region_name || "Not provided"}
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
                                        <i className="fal fa-shield-exclamation text-white fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Emergency Contact</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                {profile?.emergency_contact_name && profile?.emergency_contact_number ? (
                                    <div className="row g-3">
                                        <div className="col-md-8">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="fal fa-user-plus text-danger me-2"></i>
                                                <label className="form-label text-muted small fw-semibold mb-0">Contact Person</label>
                                            </div>
                                            <div className="fw-semibold">
                                                {profile?.emergency_contact_name}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-telephone text-danger me-2"></i>
                                                <label className="form-label text-muted small fw-semibold mb-0">Phone Number</label>
                                            </div>
                                            <div className="fw-semibold">
                                                <a href={`tel:${profile?.emergency_contact_number}`} className="text-decoration-none">
                                                    {profile?.emergency_contact_number}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="fal fa-exclamation-triangle text-warning fs-1 mb-3"></i>
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
                                        <i className="fal fa-users text-white fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Family Background</h5>
                                </div>
                            </div>
                            <div className="card-body">
    {/* Father's Information */}
    <div className="mb-5">
        <div className="d-flex align-items-center mb-4">
            <div className="me-3 p-2 rounded-circle" style={{
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <i className="fal fa-person text-white" style={{ fontSize: '16px' }}></i>
            </div>
            <h6 className="fw-bold mb-0 text-dark">Father's Information</h6>
        </div>

        <div className="card border-0 shadow-sm rounded-4" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(30, 64, 175, 0.03))'
        }}>
            <div className="card-body p-4">
                <div className="row g-4">
                    <div className="col-12">
                        <div className="d-flex align-items-start">
                            <div className="me-3 mt-1">
                                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                                     style={{ width: '32px', height: '32px' }}>
                                    <i className="fal fa-user text-primary" style={{ fontSize: '14px' }}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <small className="text-muted text-uppercase fw-medium mb-1 d-block">Full Name</small>
                                <div className="fw-semibold fs-6 text-dark">
                                    {profile?.father_first_name || profile?.father_last_name ?
                                        `${profile?.father_first_name || ''} ${profile?.father_middle_name ? profile?.father_middle_name + ' ' : ''}${profile?.father_last_name || ''} ${profile?.father_extension || ''}`.trim()
                                        : <span className="text-muted fst-italic">Not provided</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="d-flex align-items-start">
                            <div className="me-3 mt-1">
                                <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                                     style={{ width: '32px', height: '32px' }}>
                                    <i className="fal fa-briefcase text-success" style={{ fontSize: '14px' }}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <small className="text-muted text-uppercase fw-medium mb-1 d-block">Occupation</small>
                                <div className="fw-semibold fs-6 text-dark">
                                    {profile?.father_occupation || <span className="text-muted fst-italic">Not provided</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="d-flex align-items-start">
                            <div className="me-3 mt-1">
                                <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center"
                                     style={{ width: '32px', height: '32px' }}>
                                    <i className="fal fa-coins text-warning" style={{ fontSize: '14px' }}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <small className="text-muted text-uppercase fw-medium mb-1 d-block">Monthly Income</small>
                                <div className="fw-semibold fs-6 text-dark">
                                    {profile?.father_income ?
                                        `₱${parseFloat(profile?.father_income).toLocaleString('en-US', { minimumFractionDigits: 2 })}` :
                                        <span className="text-muted fst-italic">Not provided</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Mother's Information */}
    <div className="mb-5">
        <div className="d-flex align-items-center mb-4">
            <div className="me-3 p-2 rounded-circle" style={{
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <i className="fal fa-person text-white" style={{ fontSize: '16px' }}></i>
            </div>
            <h6 className="fw-bold mb-0 text-dark">Mother's Information</h6>
        </div>

        <div className="card border-0 shadow-sm rounded-4" style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(190, 24, 93, 0.03))'
        }}>
            <div className="card-body p-4">
                <div className="row g-4">
                    <div className="col-12">
                        <div className="d-flex align-items-start">
                            <div className="me-3 mt-1">
                                <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center"
                                     style={{ width: '32px', height: '32px' }}>
                                    <i className="fal fa-user text-danger" style={{ fontSize: '14px' }}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <small className="text-muted text-uppercase fw-medium mb-1 d-block">Full Name</small>
                                <div className="fw-semibold fs-6 text-dark">
                                    {profile?.mother_first_name || profile?.mother_last_name ?
                                        `${profile?.mother_first_name || ''} ${profile?.mother_middle_name ? profile?.mother_middle_name + ' ' : ''}${profile?.mother_last_name || ''}`.trim()
                                        : <span className="text-muted fst-italic">Not provided</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="d-flex align-items-start">
                            <div className="me-3 mt-1">
                                <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                                     style={{ width: '32px', height: '32px' }}>
                                    <i className="fal fa-briefcase text-success" style={{ fontSize: '14px' }}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <small className="text-muted text-uppercase fw-medium mb-1 d-block">Occupation</small>
                                <div className="fw-semibold fs-6 text-dark">
                                    {profile?.mother_occupation || <span className="text-muted fst-italic">Not provided</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="d-flex align-items-start">
                            <div className="me-3 mt-1">
                                <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center"
                                     style={{ width: '32px', height: '32px' }}>
                                    <i className="fal fa-coins text-warning" style={{ fontSize: '14px' }}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <small className="text-muted text-uppercase fw-medium mb-1 d-block">Monthly Income</small>
                                <div className="fw-semibold fs-6 text-dark">
                                    {profile?.mother_income ?
                                        `₱${parseFloat(profile?.mother_income).toLocaleString('en-US', { minimumFractionDigits: 2 })}` :
                                        <span className="text-muted fst-italic">Not provided</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Household Information */}
    <div>
        <div className="d-flex align-items-center mb-4">
            <div className="me-3 p-2 rounded-circle" style={{
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <i className="fal fa-house text-white" style={{ fontSize: '16px' }}></i>
            </div>
            <h6 className="fw-bold mb-0 text-dark">Household Information</h6>
        </div>

        <div className="card border-0 shadow-sm rounded-4" style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(8, 145, 178, 0.03))'
        }}>
            <div className="card-body p-4">
                <div className="row g-4">
                    <div className="col-lg-4 col-md-6">
                        <div className="text-center p-4 rounded-3" style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(30, 64, 175, 0.05))',
                            border: '1px solid rgba(59, 130, 246, 0.1)'
                        }}>
                            <div className="mb-2">
                                <i className="fal fa-users text-primary" style={{ fontSize: '24px' }}></i>
                            </div>
                            <div className="fw-bold text-primary display-6 mb-1">
                                {profile?.household_number || "0"}
                            </div>
                            <small className="text-muted text-uppercase fw-medium">Family Members</small>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <div className="text-center p-4 rounded-3" style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
                            border: '1px solid rgba(245, 158, 11, 0.1)'
                        }}>
                            <div className="mb-2">
                                <i className="fal fa-child text-warning" style={{ fontSize: '24px' }}></i>
                            </div>
                            <div className="fw-bold text-warning display-6 mb-1">
                                {profile?.siblings || "0"}
                            </div>
                            <small className="text-muted text-uppercase fw-medium">Siblings</small>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-12">
                        <div className="text-center p-4 rounded-3" style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.05))',
                            border: '1px solid rgba(34, 197, 94, 0.1)'
                        }}>
                            <div className="mb-2">
                                <i className="fal fa-graduation-cap text-success" style={{ fontSize: '24px' }}></i>
                            </div>
                            <div className="fw-bold text-success display-6 mb-1">
                                {profile?.siblings_studying || "0"}
                            </div>
                            <small className="text-muted text-uppercase fw-medium">Currently Studying</small>
                        </div>
                    </div>
                </div>

                {/* Additional Family Info */}
                {(profile?.is_4ps_member || profile?.ip_affiliation) && (
                    <div className="mt-4 pt-4 border-top">
                        <div className="row g-3">
                            {profile?.is_4ps_member && (
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center p-3 rounded-3" style={{
                                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.05))',
                                        border: '1px solid rgba(34, 197, 94, 0.2)'
                                    }}>
                                        <i className="fal fa-check-circle text-success me-3" style={{ fontSize: '20px' }}></i>
                                        <div>
                                            <div className="fw-semibold text-dark">4Ps Member</div>
                                            <small className="text-muted">Pantawid Pamilyang Pilipino Program</small>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {profile?.ip_affiliation && (
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center p-3 rounded-3" style={{
                                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(124, 58, 237, 0.05))',
                                        border: '1px solid rgba(168, 85, 247, 0.2)'
                                    }}>
                                        <i className="fal fa-leaf text-purple me-3" style={{ fontSize: '20px' }}></i>
                                        <div>
                                            <div className="fw-semibold text-dark">IP Affiliation</div>
                                            <small className="text-muted">{profile?.ip_affiliation}</small>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
                                        <i className="fal fa-memo-circle-info text-white fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Additional Information</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-award text-warning me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">4Ps Beneficiary</label>
                                        </div>
                                        <div className="fw-semibold">
                      <span className={`badge ${profile?.is_4ps_member ? 'bg-success' : 'bg-secondary'} px-3 py-2 rounded-pill`}>
                        <i className={`bi ${profile?.is_4ps_member ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                          {profile?.is_4ps_member ? "Yes" : "No"}
                      </span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fal fa-people text-warning me-2"></i>
                                            <label className="form-label text-muted small fw-semibold mb-0">IP Affiliation</label>
                                        </div>
                                        <div className="fw-semibold">
                                            {profile?.ip_affiliation || "Not applicable"}
                                        </div>
                                    </div>
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

export default UserProfile;