import {useEffect, useState} from "react";
import psgc from "@dropdowns/psgc";
import DepartmentSelect from "../../components/selects/DepartmentSelect.tsx";
import CampusSelect from "../../components/selects/CampusSelect.tsx";
import CourseSelect from "../../components/selects/CourseSelect.tsx";
 import { useAcademicTerm } from "../../hooks/useAcademicTerm.ts";
import type {ApplicationForm} from "../../interfaces/ApplicationForm.ts";
import {useAuth} from "../../context/AuthContext.tsx";

const Apply = () => {
  const [step, setStep] = useState("step1");
  const { term } = useAcademicTerm();
  const { user } = useAuth();

  const [formData, setFormData] = useState<ApplicationForm>({
    // Applicant Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    nationality: "",
    guardianName: "",
    guardianContact: "",
    householdIncome: "",

    // Academic Details
    currentInstitution: "",
    program: "",
    yearLevel: "",
    currentGPA: "",
    expectedGraduation: "",
    academicAchievements: "",

    // Scholarship Information
    scholarshipName: "",
    financialNeed: "",
    careerGoals: "",

    // Notifications
    applicationUpdates: true,
    deadlineReminders: true,
    scholarshipNews: true,
    generalNotifications: false
  });

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  const [campusId, setCampusId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");



  useEffect(() => {
    setRegions(psgc.getAllRegions());
  }, []);

  // @ts-ignore
  const handleRegionChange = (e) => {
    const code = e.target.value;
    setSelectedRegion(code);
    setProvinces(psgc.getProvincesByRegion(code));
    setMunicipalities([]);
    setBarangays([]);
    setSelectedProvince('');
    setSelectedMunicipality('');
    setSelectedBarangay('');
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvince(code);
    setMunicipalities(psgc.getMunicipalitiesByProvince(code));
    setBarangays([]);
    setSelectedMunicipality('');
    setSelectedBarangay('');
  };

  const handleMunicipalityChange = (e) => {
    const code = e.target.value;
    setSelectedMunicipality(code);
    setBarangays(psgc.getBarangaysByMunicipality(code));
    setSelectedBarangay('');
  };

  const handleBarangayChange = (e) => {
    setSelectedBarangay(e.target.value);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
      <div className="container p-2">
        <div className="card">
          <div className="card-header border-bottom">
            <div className="nav nav-pills nav-justified flex-column flex-xl-row nav-wizard">
              <a
                  className={`nav-item nav-link ${step === "step1" ? "active" : ""}`}
                  onClick={() => setStep("step1")}
              >
                <div className="wizard-step-icon">1</div>
                <div className="wizard-step-text">
                  <div className="wizard-step-text-name">Applicant Details</div>
                  <div className="wizard-step-text-details">Personal and family information</div>
                </div>
              </a>
              <a
                  className={`nav-item nav-link ${step === "step2" ? "active" : ""}`}
                  onClick={() => setStep("step2")}
              >
                <div className="wizard-step-icon">2</div>
                <div className="wizard-step-text">
                  <div className="wizard-step-text-name">Academic Details</div>
                  <div className="wizard-step-text-details">Academic performance and achievements</div>
                </div>
              </a>
              <a
                  className={`nav-item nav-link ${step === "step3" ? "active" : ""}`}
                  onClick={() => setStep("step3")}
              >
                <div className="wizard-step-icon">3</div>
                <div className="wizard-step-text">
                  <div className="wizard-step-text-name">Supporting Documents</div>
                  <div className="wizard-step-text-details">Supporting documents</div>
                </div>
              </a>
              <a
                  className={`nav-item nav-link ${step === "step4" ? "active" : ""}`}
                  onClick={() => setStep("step4")}
              >
                <div className="wizard-step-icon">4</div>
                <div className="wizard-step-text">
                  <div className="wizard-step-text-name">Review & Submit</div>
                  <div className="wizard-step-text-details">Review and submit scholarship application</div>
                </div>
              </a>
            </div>
          </div>
          <div className="card-body">
            {step === "step1" && (
                <div>
                  <h3 className="text-primary">Step 1: Applicant Details</h3>
                  <h5 className="card-title mb-4">Personal and Family Information</h5>
                  <div>
                    <div className="row gx-3">
                      <div className="mb-3 col-md-4">
                        <label>First Name *</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-3">
                        <label>Middle Name *</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-3">
                        <label>Last Name *</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-2">
                        <label>Ext. Name *</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label>Email Address *</label>
                      <input
                          className="form-control"
                          type="email"
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="row gx-3">
                      <div className="mb-3 col-md-6">
                        <label>Phone Number *</label>
                        <input
                            className="form-control"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Date of Birth *</label>
                        <input
                            className="form-control"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="street">Street, House No., etc.</label>
                      <input type="text" className="form-control mb-3" id="street" placeholder="Enter street, house number, etc." />

                      <div className="row">
                        <div className="col-md-3">
                          <label>Region</label>
                          <select className="form-control" value={selectedRegion} onChange={handleRegionChange}>
                            <option value="">Select Region</option>
                            {regions.map(r => (
                                <option key={r.reg_code} value={r.reg_code}>{r.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label>Province</label>
                          <select className="form-control" value={selectedProvince} onChange={handleProvinceChange} disabled={!provinces.length}>
                            <option value="">Select Province</option>
                            {provinces.map(p => (
                                <option key={p.prv_code} value={p.prv_code}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label>Municipality</label>
                          <select className="form-control" value={selectedMunicipality} onChange={handleMunicipalityChange} disabled={!municipalities.length}>
                            <option value="">Select Municipality</option>
                            {municipalities.map(m => (
                                <option key={m.mun_code} value={m.mun_code}>{m.name}</option>
                            ))}
                          </select>
                      </div>

                        <div className="col-md-3">
                          <label>Barangay</label>
                          <select className="form-control" value={selectedBarangay} onChange={handleBarangayChange} disabled={!barangays.length}>
                            <option value="">Select Barangay</option>
                            {barangays.map(b => (
                                <option key={b.bgy_code} value={b.bgy_code}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                    </div>
                    </div>

                    <h6 className="mt-4 mb-3 text-secondary">Family Information</h6>
                    <div className="row gx-3">

                      {/* Father's Info */}
                      <div className="col-12">
                        <h5>Father's Information</h5>
                      </div>

                      <div className="mb-3 col-md-3">
                        <label>Last Name</label>
                        <input className="form-control" type="text" placeholder="Last Name"
                               value={formData.father_last_name}
                               onChange={(e) => handleInputChange('father_last_name', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-3">
                        <label>First Name</label>
                        <input className="form-control" type="text" placeholder="First Name"
                               value={formData.father_first_name}
                               onChange={(e) => handleInputChange('father_first_name', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-3">
                        <label>Middle Name</label>
                        <input className="form-control" type="text" placeholder="Middle Name"
                               value={formData.father_middle_name}
                               onChange={(e) => handleInputChange('father_middle_name', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-3">
                        <label>Extension</label>
                        <input className="form-control" type="text" placeholder="e.g., Jr."
                               value={formData.father_extension}
                               onChange={(e) => handleInputChange('father_extension', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Occupation</label>
                        <input className="form-control" type="text" placeholder="Occupation"
                               value={formData.father_occupation}
                               onChange={(e) => handleInputChange('father_occupation', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Monthly Income</label>
                        <input className="form-control" type="number" placeholder="₱"
                               value={formData.father_income}
                               onChange={(e) => handleInputChange('father_income', e.target.value)}
                        />
                      </div>

                      {/* Mother's Info */}
                      <div className="col-12">
                        <h5>Mother's Information</h5>
                      </div>

                      <div className="mb-3 col-md-4">
                        <label>Mother's Maiden Last Name</label>
                        <input className="form-control" type="text"
                               value={formData.mother_last_name}
                               onChange={(e) => handleInputChange('mother_last_name', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label>Mother's First Name</label>
                        <input className="form-control" type="text"
                               value={formData.mother_first_name}
                               onChange={(e) => handleInputChange('mother_first_name', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label>Mother's Maiden Middle Name</label>
                        <input className="form-control" type="text"
                               value={formData.mother_middle_name}
                               onChange={(e) => handleInputChange('mother_middle_name', e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-6">
                        <label>Occupation</label>
                        <input className="form-control" type="text"
                               value={formData.mother_occupation}
                               onChange={(e) => handleInputChange('mother_occupation', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Monthly Income</label>
                        <input className="form-control" type="number" placeholder="₱"
                               value={formData.mother_income}
                               onChange={(e) => handleInputChange('mother_income', e.target.value)}
                        />
                      </div>



                      <div className="col-12">
                        <h5>Emergency Information</h5>
                      </div>

                      <div className="mb-3 col-md-6">
                        <label>Emergency Contact Name</label>
                        <input className="form-control" type="number"
                               value={formData.siblings_studying}
                               onChange={(e) => handleInputChange('siblings_studying', e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-6">
                        <label>Emergency Contact Number</label>
                        <input className="form-control" type="number"
                               value={formData.siblings_studying}
                               onChange={(e) => handleInputChange('siblings_studying', e.target.value)}
                        />
                      </div>


                      {/* Household Info */}
                      <div className="col-12">
                        <h5>Household & Socioeconomic</h5>
                      </div>

                      <div className="mb-3 col-md-4">
                        <label>Household Members</label>
                        <input className="form-control" type="number"
                               value={formData.household_number}
                               onChange={(e) => handleInputChange('household_number', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label>Number of Siblings</label>
                        <input className="form-control" type="number"
                               value={formData.siblings}
                               onChange={(e) => handleInputChange('siblings', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label>Siblings Currently Studying</label>
                        <input className="form-control" type="number"
                               value={formData.siblings_studying}
                               onChange={(e) => handleInputChange('siblings_studying', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>IP Affiliation</label>
                        <input className="form-control" type="text"
                               value={formData.ip_affiliation}
                               onChange={(e) => handleInputChange('ip_affiliation', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Are you a recipient of any DSWD Program?</label>
                        <select className="form-control"
                                value={formData.is_4ps_member}
                                onChange={(e) => handleInputChange('is_4ps_member', e.target.value)}
                        >
                          <option disabled selected>Select DSWD Program</option>
                          <option value="Listahan">Listahan</option>
                          <option value="4Ps">4Ps</option>
                        </select>
                      </div>


                    </div>


                    <div className="d-flex justify-content-between mt-4">
                      <button className="btn btn-light disabled" disabled>Previous</button>
                      <button className="btn btn-primary" type="button" onClick={() => setStep("step2")}>Next</button>
                    </div>
                  </div>
                </div>
            )}

            {step === "step2" && (
                <div>
                  <h3 className="text-primary">Step 2: Academic Details</h3>
                  <h5 className="card-title mb-4">Educational Background and Achievements</h5>
                  <div>
                    <div className="row gx-3">

                      <div className="mb-3 col-md-4">
                        <label htmlFor="student_id" className="form-label">Student ID</label>
                        <input type="text" name="student_id" value={user.profile.student_id} className="form-control"/>
                      </div>

                      <div className="mb-3 col-md-4">
                        <label htmlFor="campus" className="form-label">Campus</label>
                        <CampusSelect
                            value={campusId}
                            onChange={(e) => setCampusId(e.target.value)}
                        />

                      </div>

                      <div className="mb-3 col-md-4">
                        <label htmlFor="department" className="form-label">Department</label>
                        <DepartmentSelect
                            campusId={campusId}
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                        />

                      </div>

                      <div className="mb-3 col-md-4">
                        <label htmlFor="course" className="form-label">Course</label>
                        <CourseSelect
                            departmentId={departmentId}
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-4">
                      <label className="form-label">Academic Term</label>
                      <input
                          type="text"
                          className="form-control"
                          value={term?.formatted || ''}
                          readOnly
                      />
                    </div>

                    {/* Hidden fields to submit IDs */}
                    <input type="hidden" name="academic_year_id" value={term?.academic_year_id} />
                    <input type="hidden" name="semester_id" value={term?.semester_id} />

                    <div className="mb-3 col-md-4">
                      <label className="form-label">Total Units Enrolled</label>
                        <input type="number" className="form-control" placeholder="Enter the total units"/>
                      </div>

                      <div className="mb-3 col-md-4">
                        <label className="form-label">Enrollment Status</label>
                        <select className="form-control">
                          <option selected disabled>Select Enrollment Status</option>
                          <option value="Enrolled">Enrolled</option>
                          <option value="Not Enrolled">Not Enrolled</option>
                          <option value="Dropped">Dropped</option>
                        </select>
                      </div>

                    </div>


                    <h6 className="mt-4 mb-3 text-secondary">Scholarship Information</h6>

                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label htmlFor="scholarshipName" className="form-label">Scholarship Name</label>
                        <select
                            id="scholarshipName"
                            name="scholarshipName"
                            className="form-select"
                            value={formData.scholarshipName}
                            onChange={(e) => handleInputChange('scholarshipName', e.target.value)}
                            required
                        >
                          <option selected disabled>Select Scholarship</option>
                          <option value="NONE">NONE</option>
                          <option value="ATI-CAR EDUCATIONAL ASSISTANCE FOR THE YOUTH IN AGRICULTURE (EASY-AGRI)">ATI-CAR EDUCATIONAL ASSISTANCE FOR THE YOUTH IN AGRICULTURE (EASY-AGRI)</option>
                          <option value="ANSWERING THE CRY OF THE P0OR (ANCOP)">ANSWERING THE CRY OF THE P0OR (ANCOP)</option>
                          <option value="ASA PHILIPPINES">ASA PHILIPPINES</option>
                          <option value="BACNOTAN COMPREHENSIVE EDUCATIONAL ASSISTANCE PROGRAM">BACNOTAN COMPREHENSIVE EDUCATIONAL ASSISTANCE PROGRAM </option>
                          <option value="BUREAU OF FISHERIES AND AQUATIC RESOURCES">BUREAU OF FISHERIES AND AQUATIC RESOURCES</option>
                          <option value="CANDON CITY SCHOLARSHIP">CANDON CITY SCHOLARSHIP</option>
                          <option value="CANDONIANS OF SOUTHERN CALIFORNIA">CANDONIANS OF SOUTHERN CALIFORNIA</option>
                          <option value="CARITAS NUEVA SEGOVIA">CARITAS NUEVA SEGOVIA</option>
                          <option value="CERVANTES EDUCATIONAL ASSISTANCE PROGRAM">CERVANTES EDUCATIONAL ASSISTANCE PROGRAM</option>
                          <option value="COLLEGE EDUCATIONAL ASSISTANCE PROGRAM (CEAP)">COLLEGE EDUCATIONAL ASSISTANCE PROGRAM (CEAP)</option>
                          <option value="CONGRESMAN ERIC D. SINGSON SCHOLARSHIP GRANT (CEDSSG)">CONGRESMAN ERIC D. SINGSON SCHOLARSHIP GRANT (CEDSSG)</option>
                          <option value="CHAVIT SINGSON SCHOLARSHIP">CHAVIT SINGSON SCHOLARSHIP</option>
                          <option value="CHED-FULL">CHED-FULL</option>
                          <option value="CHED-HALF">CHED-HALF</option>
                          <option value="CHED-SMART">CHED-SMART</option>
                          <option value="CHED-TULONG AGRI PROGRAM (CHED-TAP)">CHED-TULONG AGRI PROGRAM (CHED-TAP)</option>
                          <option value="CHED-TULONG DUNONG PROGRAM (CHED-TDP)">CHED-TULONG DUNONG PROGRAM (CHED-TDP)</option>
                          <option value="CHED-TERTIARY EDUCATION SUBSIDY (CHED-TES)">CHED-TERTIARY EDUCATION SUBSIDY (CHED-TES)</option>
                          <option value="CITIZEN'S BATTLE AGAINST CORRUPTION (CIBAC) SCHOLARSHIP">CITIZEN'S BATTLE AGAINST CORRUPTION (CIBAC) SCHOLARSHIP</option>
                          <option value="DA-AGRICULTURAL COMPETITIVENESS ENHANCEMENT FUND (DA-ACEF)">DA-AGRICULTURAL COMPETITIVENESS ENHANCEMENT FUND (DA-ACEF)</option>
                          <option value="DEPARTMENT OF HEALTH SCHOLARSHIP">DEPARTMENT OF HEALTH SCHOLARSHIP</option>
                          <option value="DEPARTMENT OF SCIENCE AND TECHNOLOGY (DOST)">DEPARTMENT OF SCIENCE AND TECHNOLOGY (DOST)</option>
                          <option value="DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT (DSWD)">DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT (DSWD)</option>
                          <option value="EDUCATIONAL ASSISTANCE AND SCHOLARSHIP EMERGENCIES (EASE-AGRI)">EDUCATIONAL ASSISTANCE AND SCHOLARSHIP EMERGENCIES (EASE-AGRI)</option>
                          <option value="EVA AND EDUARDSON FOUNDATION INC.">EVA AND EDUARDSON FOUNDATION INC.</option>
                          <option value="ILOCOS SUR AGRICULTURE COLLEGE BATCH 1971 (ISAC BATCH'71)">ILOCOS SUR AGRICULTURE COLLEGE BATCH 1971 (ISAC BATCH'71)</option>
                          <option value="ILOCOS SUR EDUCATIONAL ASSISTANCE AND SCHOLARSHIP PROGRAM (ISEASP)">ILOCOS SUR EDUCATIONAL ASSISTANCE AND SCHOLARSHIP PROGRAM (ISEASP)</option>
                          <option value="ILOCOS SUR ELECTRIC COOPERATIVE (ISECO)">ILOCOS SUR ELECTRIC COOPERATIVE (ISECO)</option>
                          <option value="LA UNION EDUCATIONAL ASSISTANCE">LA UNION EDUCATIONAL ASSISTANCE</option>
                          <option value="LEPANTO EDUCATIONAL ASSISTANCE PROGRAM (LEAP)">LEPANTO EDUCATIONAL ASSISTANCE PROGRAM (LEAP)</option>
                          <option value="MANILA TEACHERS MUTUAL AIDE SYSTEM (MTMAS)">MANILA TEACHERS MUTUAL AIDE SYSTEM (MTMAS)</option>
                          <option value="MSJAB SCHOLARSHIP">MSJAB SCHOLARSHIP</option>
                          <option value="MUNICIPAL SCHOLARS">MUNICIPAL SCHOLARS</option>
                          <option value="NATIONAL COMMISSION IN INDIGENOUS PEOPLE (NCIP)">NATIONAL COMMISSION IN INDIGENOUS PEOPLE (NCIP)</option>
                          <option value="NATIONAL TOBACCO ADMINISTRATION (NTA)">NATIONAL TOBACCO ADMINISTRATION (NTA)</option>
                          <option value="ONE TIME EDUC ATIONAL ASSISTANCE PROGRAM (OTAP)">ONE TIME EDUCATIONAL ASSISTANCE PROGRAM (OTAP)</option>
                          <option value="OVERSEAS WORKERS WELFARE ADMINISTRATION (OWWA)">OVERSEAS WORKERS WELFARE ADMINISTRATION (OWWA)</option>
                          <option value="PHILIPPINE CHARITY SWEEPSTAKE OFFICE STUDENT PROGRAM">PHILIPPINE CHARITY SWEEPSTAKE OFFICE STUDENT PROGRAM</option>
                          <option value="PRIVATE/INDIVIDUAL SCHOLARSHIP">PRIVATE/INDIVIDUAL SCHOLARSHIP</option>
                          <option value="PROVINCIAL GOVERNMENT OF LA UNION (PGLU)">PROVINCIAL GOVERNMENT OF LA UNION (PGLU)</option>
                          <option value="RANIAG SCHOLARSHIP PROGRAM">RANIAG SCHOLARSHIP PROGRAM</option>
                          <option value="SCHOLARSHIP PROGRAM FOR COCONUT FARMERS AND FAMILIES (CoScho)">SCHOLARSHIP PROGRAM FOR COCONUT FARMERS AND FAMILIES (CoScho)</option>
                          <option value="SONS AND DAUGHTERS OF NAGBUKEL">SONS AND DAUGHTERS OF NAGBUKEL</option>
                          <option value="TECHNICAL EDUCATIONAL SKILL DEVELOPMENT AUTHORITY (TESDA)">TECHNICAL EDUCATIONAL SKILL DEVELOPMENT AUTHORITY (TESDA)</option>
                          <option value="UNIVERSAL LEAF PHILIPPINES INC. (ULPI)">UNIVERSAL LEAF PHILIPPINES INC. (ULPI)</option>
                          <option value="U-GO SCHOLARSHIP">U-GO SCHOLARSHIP</option>
                          <option value="VIGAN CITY SCHOLARSHIP">VIGAN CITY SCHOLARSHIP</option>
                          <option value="OTHERS">OTHERS</option>
                        </select>
                      </div>

                      {formData.scholarshipName === 'OTHERS' && (
                          <div className="col-md-4">
                            <label htmlFor="otherScholarship" className="form-label">Other Scholarship(s)</label>
                            <input
                                type="text"
                                id="otherScholarship"
                                name="otherScholarship"
                                className="form-control"
                                placeholder="e.g., DOST, CHED"
                                value={formData.otherScholarship}
                                onChange={(e) => handleInputChange('otherScholarship', e.target.value)}
                            />
                          </div>
                      )}


                      <div className="col-md-4">
                        <label htmlFor="otherScholarshipAmount" className="form-label">Amount (₱)</label>
                        <input
                            type="number"
                            id="otherScholarshipAmount"
                            name="otherScholarshipAmount"
                            className="form-control"
                            placeholder="e.g., 15000"
                            min="0"
                            step="0.01"
                            value={formData.otherScholarshipAmount}
                            onChange={(e) => handleInputChange('otherScholarshipAmount', e.target.value)}
                        />
                      </div>
                    </div>


                    <div className="d-flex justify-content-between mt-4">
                      <button className="btn btn-light" type="button" onClick={() => setStep("step1")}>Previous</button>
                      <button className="btn btn-primary" type="button" onClick={() => setStep("step3")}>Next</button>
                    </div>
                  </div>
                </div>
            )}

            {step === "step3" && (
                <div>
                  <h3 className="text-primary">Step 3: Supporting Documents</h3>
                  <h5 className="card-title mb-4">Upload required documents</h5>
                  <div>
                    <div className="mb-4">
                      <label>Resume/CV *</label>
                      <input className="form-control" type="file" accept=".pdf,.doc,.docx" />
                      <small className="form-text text-muted">Upload your current resume or CV (PDF, DOC, or DOCX)</small>
                    </div>
                    <div className="mb-4">
                      <label>Academic Transcript *</label>
                      <input className="form-control" type="file" accept=".pdf" />
                      <small className="form-text text-muted">Upload official academic transcript (PDF only)</small>
                    </div>
                    <div className="mb-4">
                      <label>Letter of Recommendation</label>
                      <input className="form-control" type="file" accept=".pdf,.doc,.docx" />
                      <small className="form-text text-muted">Upload letter of recommendation (optional)</small>
                    </div>
                    <div className="mb-4">
                      <label>Personal Statement</label>
                      <input className="form-control" type="file" accept=".pdf,.doc,.docx" />
                      <small className="form-text text-muted">Upload your personal statement or cover letter (optional)</small>
                    </div>
                    <div className="alert alert-info">
                      <strong>Document Requirements:</strong>
                      <ul className="mb-0 mt-2">
                        <li>All documents must be in PDF, DOC, or DOCX format</li>
                        <li>Maximum file size: 5MB per document</li>
                        <li>Documents must be clearly readable and in English</li>
                      </ul>
                    </div>
                    <h6 className="mt-4 mb-3">Notification Preferences</h6>
                    <div className="form-check mb-2">
                      <input
                          className="form-check-input"
                          type="checkbox"
                          id="accountChanges"
                          checked={formData.accountChanges}
                          onChange={(e) => handleInputChange('accountChanges', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="accountChanges">Account changes and updates</label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                          className="form-check-input"
                          type="checkbox"
                          id="applicationUpdates"
                          checked={formData.applicationUpdates}
                          onChange={(e) => handleInputChange('applicationUpdates', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="applicationUpdates">Application status updates</label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                          className="form-check-input"
                          type="checkbox"
                          id="deadlineReminders"
                          checked={formData.deadlineReminders}
                          onChange={(e) => handleInputChange('deadlineReminders', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="deadlineReminders">Deadline reminders</label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                          className="form-check-input"
                          type="checkbox"
                          id="generalNotifications"
                          checked={formData.generalNotifications}
                          onChange={(e) => handleInputChange('generalNotifications', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="generalNotifications">General notifications and news</label>
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                      <button className="btn btn-light" type="button" onClick={() => setStep("step2")}>Previous</button>
                      <button className="btn btn-primary" type="button" onClick={() => setStep("step4")}>Next</button>
                    </div>
                  </div>
                </div>
            )}

            {step === "step4" && (
                <div>
                  <h3 className="text-primary">Step 4: Review & Submit</h3>
                  <h5 className="card-title mb-4">Review your application details</h5>

                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Applicant Details</h6>
                    </div>
                    <div className="card-body">
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Name:</div>
                        <div className="col">{formData.firstName} {formData.lastName}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Email:</div>
                        <div className="col">{formData.email}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Phone:</div>
                        <div className="col">{formData.phone}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Date of Birth:</div>
                        <div className="col">{formData.dateOfBirth}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Address:</div>
                        <div className="col">{formData.address}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Nationality:</div>
                        <div className="col">{formData.nationality}</div>
                      </div>
                    </div>
                  </div>

                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Academic Details</h6>
                    </div>
                    <div className="card-body">
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Institution:</div>
                        <div className="col">{formData.institution}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Degree:</div>
                        <div className="col">{formData.degree}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Field of Study:</div>
                        <div className="col">{formData.fieldOfStudy}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Graduation Year:</div>
                        <div className="col">{formData.graduationYear}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">GPA:</div>
                        <div className="col">{formData.gpa}</div>
                      </div>
                    </div>
                  </div>

                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Documents & Preferences</h6>
                    </div>
                    <div className="card-body">
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Resume/CV:</div>
                        <div className="col">
                          <span className="badge bg-success">Uploaded</span>
                        </div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Academic Transcript:</div>
                        <div className="col">
                          <span className="badge bg-success">Uploaded</span>
                        </div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Notifications:</div>
                        <div className="col">
                          {formData.accountChanges && <span className="badge bg-info me-1">Account Updates</span>}
                          {formData.applicationUpdates && <span className="badge bg-info me-1">Application Status</span>}
                          {formData.deadlineReminders && <span className="badge bg-info me-1">Deadlines</span>}
                          {formData.generalNotifications && <span className="badge bg-info me-1">General</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-warning">
                    <strong>Important:</strong> Please review all information carefully before submitting. Once submitted, changes may not be possible without contacting support.
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button className="btn btn-light" type="button" onClick={() => setStep("step3")}>Previous</button>
                    <button className="btn btn-primary" type="submit">Submit Application</button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Apply;