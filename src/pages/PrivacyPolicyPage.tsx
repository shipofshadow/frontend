import React, { useState } from 'react';

const PrivacyPolicyPage: React.FC = () => {
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [hasAccepted, setHasAccepted] = useState(false);

    // Institution details - Replace with actual information
    const institutionInfo = {
        name: "Sample University",
        address: "123 Education Street, Academic City, Philippines 1234",
        dpoName: "Dr. Jane Smith",
        dpoEmail: "dpo@sampleuniv.edu.ph",
        phone: "+63-2-123-4567",
        generalEmail: "info@sampleuniv.edu.ph",
        supportEmail: "support@ischolar.sampleuniv.edu.ph",
        effectiveDate: "January 1, 2024",
        lastUpdated: "January 1, 2024"
    };

    const handleAccept = () => {
        setHasAccepted(true);
        setShowAcceptModal(false);
        // Here you would save acceptance to your backend
        console.log('Privacy Policy accepted');
    };

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h2 className="mb-0">
                                <i className="bi bi-shield-check text-primary me-2"></i>
                                Privacy Policy
                            </h2>
                            <div className="d-flex gap-2">
                <span className={`badge ${hasAccepted ? 'bg-success' : 'bg-secondary'}`}>
                  {hasAccepted ? 'Accepted' : 'Pending'}
                </span>
                                <button className="btn btn-outline-primary btn-sm">
                                    <i className="bi bi-download me-1"></i>
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        <div className="card-body">
                            {/* Document Info */}
                            <div className="alert alert-info mb-4">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="mb-1"><strong>Effective Date:</strong> {institutionInfo.effectiveDate}</p>
                                        <p className="mb-0"><strong>Last Updated:</strong> {institutionInfo.lastUpdated}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="mb-1"><strong>Version:</strong> 1.0</p>
                                        <p className="mb-0"><strong>Compliance:</strong> Data Privacy Act of 2012</p>
                                    </div>
                                </div>
                            </div>

                            {/* Table of Contents */}
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5 className="mb-0">Table of Contents</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <ul className="list-unstyled">
                                                <li><a href="#section1" className="text-decoration-none">1. Introduction</a></li>
                                                <li><a href="#section2" className="text-decoration-none">2. Data Controller Information</a></li>
                                                <li><a href="#section3" className="text-decoration-none">3. Legal Basis for Processing</a></li>
                                                <li><a href="#section4" className="text-decoration-none">4. Types of Personal Data</a></li>
                                                <li><a href="#section5" className="text-decoration-none">5. Data Collection Methods</a></li>
                                                <li><a href="#section6" className="text-decoration-none">6. Purposes of Processing</a></li>
                                                <li><a href="#section7" className="text-decoration-none">7. Data Sharing</a></li>
                                                <li><a href="#section8" className="text-decoration-none">8. Security Measures</a></li>
                                                <li><a href="#section9" className="text-decoration-none">9. Data Retention</a></li>
                                                <li><a href="#section10" className="text-decoration-none">10. Your Rights</a></li>
                                            </ul>
                                        </div>
                                        <div className="col-md-6">
                                            <ul className="list-unstyled">
                                                <li><a href="#section11" className="text-decoration-none">11. Exercising Your Rights</a></li>
                                                <li><a href="#section12" className="text-decoration-none">12. Cookies and Tracking</a></li>
                                                <li><a href="#section13" className="text-decoration-none">13. Children's Privacy</a></li>
                                                <li><a href="#section14" className="text-decoration-none">14. Data Transfers</a></li>
                                                <li><a href="#section15" className="text-decoration-none">15. Data Breach Notification</a></li>
                                                <li><a href="#section16" className="text-decoration-none">16. Policy Updates</a></li>
                                                <li><a href="#section17" className="text-decoration-none">17. Complaints</a></li>
                                                <li><a href="#section18" className="text-decoration-none">18. Contact Information</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Policy Content */}
                            <div className="privacy-content">

                                <section id="section1" className="mb-5">
                                    <h3 className="text-primary mb-3">1. Introduction</h3>
                                    <p>
                                        iScholar ("<strong>we</strong>," "<strong>our</strong>," or "<strong>us</strong>") is committed to protecting your privacy and personal data in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its implementing rules and regulations. This Privacy Policy explains how we collect, use, process, store, and protect your personal information when you use our Intelligent Scholarship Prequalification and Management System.
                                    </p>
                                </section>

                                <section id="section2" className="mb-5">
                                    <h3 className="text-primary mb-3">2. Data Controller Information</h3>
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="table-responsive">
                                                <table className="table table-borderless">
                                                    <tbody>
                                                    <tr>
                                                        <td width="200"><strong>Data Controller:</strong></td>
                                                        <td>{institutionInfo.name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Address:</strong></td>
                                                        <td>{institutionInfo.address}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Data Protection Officer:</strong></td>
                                                        <td>{institutionInfo.dpoName}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Email:</strong></td>
                                                        <td><a href={`mailto:${institutionInfo.dpoEmail}`}>{institutionInfo.dpoEmail}</a></td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Phone:</strong></td>
                                                        <td>{institutionInfo.phone}</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section id="section3" className="mb-5">
                                    <h3 className="text-primary mb-3">3. Legal Basis for Processing</h3>
                                    <p>We process your personal data based on the following legal grounds:</p>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h6 className="card-title text-success">
                                                        <i className="bi bi-check-circle me-2"></i>Consent
                                                    </h6>
                                                    <p className="card-text">You have given clear consent for us to process your personal data for scholarship application purposes</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h6 className="card-title text-info">
                                                        <i className="bi bi-building me-2"></i>Legitimate Interest
                                                    </h6>
                                                    <p className="card-text">Processing is necessary for our legitimate interests in managing scholarship programs</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-md-6">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h6 className="card-title text-warning">
                                                        <i className="bi bi-scales me-2"></i>Legal Obligation
                                                    </h6>
                                                    <p className="card-text">Processing is required to comply with educational regulations and scholarship requirements</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h6 className="card-title text-primary">
                                                        <i className="bi bi-people me-2"></i>Public Interest
                                                    </h6>
                                                    <p className="card-text">Processing serves the public interest in providing educational assistance</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section id="section4" className="mb-5">
                                    <h3 className="text-primary mb-3">4. Types of Personal Data We Collect</h3>

                                    <div className="accordion" id="dataTypesAccordion">
                                        <div className="accordion-item">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#studentInfo">
                                                    4.1 Student Information
                                                </button>
                                            </h2>
                                            <div id="studentInfo" className="accordion-collapse collapse show" data-bs-parent="#dataTypesAccordion">
                                                <div className="accordion-body">
                                                    <ul>
                                                        <li><strong>Personal Details:</strong> Full name, gender, birth date, citizenship, civil status</li>
                                                        <li><strong>Contact Information:</strong> Email address, phone number, complete address (region, province, municipality, barangay, street, ZIP code)</li>
                                                        <li><strong>Identification:</strong> Student ID number</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="accordion-item">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#educationInfo">
                                                    4.2 Educational Information
                                                </button>
                                            </h2>
                                            <div id="educationInfo" className="accordion-collapse collapse" data-bs-parent="#dataTypesAccordion">
                                                <div className="accordion-body">
                                                    <ul>
                                                        <li>Campus, department, course, year level</li>
                                                        <li>Enrollment status and total units</li>
                                                        <li>Academic performance (GWA, grades by subject)</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="accordion-item">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#familyInfo">
                                                    4.3 Family Background
                                                </button>
                                            </h2>
                                            <div id="familyInfo" className="accordion-collapse collapse" data-bs-parent="#dataTypesAccordion">
                                                <div className="accordion-body">
                                                    <ul>
                                                        <li>Parents' names, occupations, and income information</li>
                                                        <li>Household composition and size</li>
                                                        <li>4Ps membership status</li>
                                                        <li>Indigenous People (IP) affiliation</li>
                                                        <li>Sibling information and educational status</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="accordion-item">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#financialInfo">
                                                    4.4 Financial Information
                                                </button>
                                            </h2>
                                            <div id="financialInfo" className="accordion-collapse collapse" data-bs-parent="#dataTypesAccordion">
                                                <div className="accordion-body">
                                                    <ul>
                                                        <li>Family income details</li>
                                                        <li>Income Tax Return (ITR) documents</li>
                                                        <li>Proof of income documents</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section id="section10" className="mb-5">
                                    <h3 className="text-primary mb-3">10. Your Rights as a Data Subject</h3>
                                    <p>Under the Data Privacy Act of 2012, you have the following rights:</p>

                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="list-group">
                                                <div className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h6 className="mb-1 text-info">Right to Information</h6>
                                                    </div>
                                                    <p className="mb-1">Right to be informed about data processing activities and access this Privacy Policy</p>
                                                </div>
                                                <div className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h6 className="mb-1 text-success">Right to Access</h6>
                                                    </div>
                                                    <p className="mb-1">Request copies of your personal data we hold and information about processing</p>
                                                </div>
                                                <div className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h6 className="mb-1 text-warning">Right to Object</h6>
                                                    </div>
                                                    <p className="mb-1">Object to processing based on legitimate interests or opt-out of direct marketing</p>
                                                </div>
                                                <div className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h6 className="mb-1 text-primary">Right to Rectification</h6>
                                                    </div>
                                                    <p className="mb-1">Request correction of inaccurate or incomplete data</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="list-group">
                                                <div className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h6 className="mb-1 text-danger">Right to Erasure</h6>
                                                    </div>
                                                    <p className="mb-1">Request deletion of your data when no longer necessary</p>
                                                </div>
                                                <div className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h6 className="mb-1 text-info">Right to Data Portability</h6>
                                                    </div>
                                                    <p className="mb-1">Request transfer of your data to another controller in machine-readable format</p>
                                                </div>
                                                <div className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h6 className="mb-1 text-secondary">Right to Damages</h6>
                                                    </div>
                                                    <p className="mb-1">Seek compensation for damages due to unlawful processing</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section id="section18" className="mb-5">
                                    <h3 className="text-primary mb-3">18. Contact Information</h3>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="card">
                                                <div className="card-header bg-primary text-white">
                                                    <h6 className="mb-0">Data Protection Officer</h6>
                                                </div>
                                                <div className="card-body">
                                                    <p className="card-text">
                                                        <strong>{institutionInfo.dpoName}</strong><br/>
                                                        Data Protection Officer<br/>
                                                        {institutionInfo.name}<br/>
                                                        {institutionInfo.address}
                                                    </p>
                                                    <p className="card-text">
                                                        <strong>Email:</strong> <a href={`mailto:${institutionInfo.dpoEmail}`}>{institutionInfo.dpoEmail}</a><br/>
                                                        <strong>Phone:</strong> {institutionInfo.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card">
                                                <div className="card-header bg-info text-white">
                                                    <h6 className="mb-0">General Inquiries</h6>
                                                </div>
                                                <div className="card-body">
                                                    <p className="card-text">
                                                        <strong>Email:</strong> <a href={`mailto:${institutionInfo.generalEmail}`}>{institutionInfo.generalEmail}</a><br/>
                                                        <strong>Support Email:</strong> <a href={`mailto:${institutionInfo.supportEmail}`}>{institutionInfo.supportEmail}</a><br/>
                                                        <strong>Phone:</strong> {institutionInfo.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Acceptance Section */}
                            {!hasAccepted && (
                                <div className="alert alert-warning border-warning">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-exclamation-triangle-fill me-3 text-warning" style={{fontSize: '1.5rem'}}></i>
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1">Action Required</h6>
                                            <p className="mb-0">Please review and accept this Privacy Policy to continue using the iScholar system.</p>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowAcceptModal(true)}
                                        >
                                            <i className="bi bi-check-circle me-2"></i>
                                            Accept Policy
                                        </button>
                                    </div>
                                </div>
                            )}

                            {hasAccepted && (
                                <div className="alert alert-success">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill me-3 text-success" style={{fontSize: '1.5rem'}}></i>
                                        <div>
                                            <h6 className="mb-1">Privacy Policy Accepted</h6>
                                            <p className="mb-0">You have successfully accepted our Privacy Policy. Thank you for your compliance.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Acceptance Modal */}
            {showAcceptModal && (
                <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Privacy Policy Acceptance</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAcceptModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <strong>Important:</strong> By clicking "I Accept," you confirm that you have read, understood, and agree to be bound by this Privacy Policy.
                                </div>
                                <p>This action will be recorded with a timestamp for compliance purposes.</p>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="confirmReading" />
                                    <label className="form-check-label" htmlFor="confirmReading">
                                        I confirm that I have read and understood the Privacy Policy in its entirety.
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAcceptModal(false)}
                                >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAccept}
                                >
                                    <i className="bi bi-check-circle me-2"></i>
                                    I Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrivacyPolicyPage;