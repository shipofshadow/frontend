
const AlreadyApplied = () => {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-5 text-center">
                                {/* Icon */}
                                <div className="mb-4">
                                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center"
                                         style={{ width: '90px', height: '90px' }}>
                                        <i className="bi bi-file-earmark-check-fill fs-1"></i>
                                    </div>
                                </div>

                                {/* Heading */}
                                <h2 className="fw-bold text-dark mb-3">Application Submitted</h2>

                                {/* Description */}
                                <p className="text-muted mb-4">
                                    You have already submitted an application for this semester.
                                    You cannot submit another one at this time.
                                </p>

                                {/* Action Buttons */}
                                <div className="d-grid gap-2">
                                    <a href="/applicant/dashboard" className="btn btn-primary py-2 fw-semibold">
                                        <i className="bi bi-speedometer2 me-2"></i>
                                        Go to Dashboard
                                    </a>
                                    <a href="/applicant/profile" className="btn btn-light text-muted py-2">
                                        View Profile
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlreadyApplied;