const ViewApplicantReadOnlyForm = ({ applicant }) => {
    if (!applicant) return <p>Loading...</p>;

    return (
        <form>
            <h5 className="mb-3">Personal Information</h5>

            <div className="row">
                <div className="col-md-4 mb-3">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control form-control-sm"
                           value={`${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name} ${applicant.name_extension || ''}`} readOnly />
                </div>
                <div className="col-md-2 mb-3">
                    <label className="form-label">Student ID</label>
                    <input type="text" className="form-control form-control-sm" value={applicant["students.student_id"]} readOnly />
                </div>

                <div className="col-md-2 mb-3">
                    <label className="form-label">Birth Date</label>
                    <input type="text" className="form-control form-control-sm" value={new Date(applicant.birth_date).toLocaleDateString()} readOnly />
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Gender</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.gender || 'N/A'} readOnly />
                </div>

                <div className="col-md-2 mb-3">
                    <label className="form-label">Citizenship</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.citizenship || 'N/A'} readOnly />
                </div>

                <div className="col-md-2 mb-3">
                    <label className="form-label">Civil Status</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.civil_status || 'N/A'} readOnly />
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Contact Number</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.contact_number || 'N/A'} readOnly />
                </div>

                 <div className="col-md-4 mb-3">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control form-control-sm" value={applicant.email || 'N/A'} readOnly />
                </div>
            </div>

            <h5 className="mb-3 mt-4">Address</h5>

            <div className="mb-3">
                <label className="form-label">Complete Address</label>
                <input
                    type="text"
                    className="form-control form-control-sm"
                    value={
                        `${applicant.street}, ${applicant.barangay_name}, ${applicant.municipality_name}, ` +
                        `${applicant.province_name} ${applicant.zip_code || 'N/A'}`
                    }
                    readOnly
                />
            </div>


            <h5 className="mb-3 mt-4">Educational Information</h5>

            <div className="row">
                <div className="col-md-3 mb-3">
                    <label className="form-label">Campus</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.campus} readOnly />
                </div>

                <div className="col-md-3 mb-3">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.department} readOnly />
                </div>

                <div className="col-md-3 mb-3">
                    <label className="form-label">Course</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.course} readOnly />
                </div>

                <div className="col-md-3 mb-3">
                    <label className="form-label">Year Level</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.year_level} readOnly />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Enrollment Status</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.enrollment_status} readOnly />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Total Units</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.total_units} readOnly />
                </div>
            </div>

            <h5 className="mb-3 mt-4">Family Background</h5>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Father's Name</label>
                    <input type="text" className="form-control form-control-sm"
                           value={`${applicant.father_first_name} ${applicant.father_middle_name} ${applicant.father_last_name}`} readOnly />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Father's Occupation</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.father_occupation} readOnly />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Father's Income</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.father_income} readOnly />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Mother's Name</label>
                    <input type="text" className="form-control form-control-sm"
                           value={`${applicant.mother_first_name} ${applicant.mother_middle_name} ${applicant.mother_last_name}`} readOnly />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Mother's Occupation</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.mother_occupation} readOnly />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Mother's Income</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.mother_income} readOnly />
                </div>
            </div>

            <h5 className="mb-3 mt-4">Other Information</h5>

            <div className="row">
                <div className="col-md-3 mb-3">
                    <label className="form-label">IP Affiliation</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.ip_affiliation} readOnly />
                </div>

                <div className="col-md-2 mb-3">
                    <label className="form-label">4Ps Member</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.is_4ps_member ? "Yes" : "No"} readOnly />
                </div>

                <div className="col-md-2 mb-3">
                    <label className="form-label">Household Number</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.household_number} readOnly />
                </div>

                <div className="col-md-2 mb-3">
                    <label className="form-label">Siblings</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.siblings} readOnly />
                </div>

                <div className="col-md-2 mb-3">
                    <label className="form-label">Siblings Studying</label>
                    <input type="text" className="form-control form-control-sm" value={applicant.sublings_studying} readOnly />
                </div>
            </div>
        </form>
    );
};

export default ViewApplicantReadOnlyForm;
