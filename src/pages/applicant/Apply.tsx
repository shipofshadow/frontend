import React, {useEffect, useState} from "react";
import psgc from "@dropdowns/psgc";
import DepartmentSelect from "../../components/selects/DepartmentSelect.tsx";
import CampusSelect from "../../components/selects/CampusSelect.tsx";
import CourseSelect from "../../components/selects/CourseSelect.tsx";
import { useAcademicTerm } from "../../hooks/useAcademicTerm.ts";
import type {ApplicationForm} from "../../interfaces/ApplicationForm.ts";
import {useAuth} from "../../context/AuthContext.tsx";
import {API_BASE_URL} from "../../config.ts";
import { citizenship, civilStatus } from '../../data/data.ts';

const Apply = () => {
  const [step, setStep] = useState("step1");
  const { term } = useAcademicTerm();
  const { user, token } = useAuth();

  interface Region {
    reg_code: string;
    name: string;
  }

  interface Province {
    prv_code: string;
    name: string;
    reg_code: string;
  }

  interface Municipality {
    mun_code: string;
    name: string;
    prv_code: string;
  }

  interface Barangay {
    bgy_code: string;
    name: string;
    mun_code: string;
  }

  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

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

  const [formData, setFormData] = useState<ApplicationForm>({
    firstName: user?.profile?.first_name || '',
    middleName: user?.profile?.middle_name || '',
    lastName: user?.profile?.last_name || '',
    nameExtension: user?.profile?.extension_name || '',
    email: user?.profile?.email || '',
    phone: user?.profile?.contact_number || '',
    birthDate: user?.profile?.birth_date || '',
    civilStatus: '',
    citizenship: 'Filipino',
    street: '',
    regionCode: '',
    regionName: '',
    provinceCode: '',
    provinceName: '',
    municipalityCode: '',
    municipalityName: '',
    barangayCode: '',
    barangayName: '',
    father: {
      lastName: '',
      firstName: '',
      middleName: '',
      extension: '',
      occupation: '',
      income: 0,
    },
    mother: {
      lastName: '',
      firstName: '',
      middleName: '',
      occupation: '',
      income: 0,
    },
    emergencyContactName: '',
    emergencyContactNumber: '',
    householdNumber: 0,
    siblings: 0,
    siblingsStudying: 0,
    ipAffiliation: '',
    dswdProgram: '',
    studentId: user?.profile?.student_id || '',
    year_level: '',
    campus: 0,
    department: 0,
    course: 0,
    academicYearId: term?.academic_year_id || 0,
    semesterId: term?.semester_id || 0,
    enrollmentStatus: '',
    total_units: 0,
    scholarshipName: '',
    otherScholarship: '',
    scholarshipAmount: 0,
    itr: null,
    grades: null,
  });

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedRegionObj = regions.find((r) => r.reg_code === selectedCode);

    if (selectedRegionObj) {
      setSelectedRegion(selectedCode);
      setFormData((prev) => ({
        ...prev,
        regionCode: selectedRegionObj.reg_code,
        regionName: selectedRegionObj.name,
      }));
    } else {
      setSelectedRegion('');
      setFormData((prev) => ({
        ...prev,
        regionCode: '',
        regionName: '',
      }));
    }

    setProvinces(psgc.getProvincesByRegion(selectedCode));
    setMunicipalities([]);
    setBarangays([]);
    setSelectedProvince('');
    setSelectedMunicipality('');
    setSelectedBarangay('');
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selectedProvinceObj = provinces.find((p) => p.prv_code === code);

    setSelectedProvince(code);
    setFormData((prev) => ({
      ...prev,
      provinceCode: code,
      provinceName: selectedProvinceObj?.name || '',
    }));

    setMunicipalities(psgc.getMunicipalitiesByProvince(code));
    setBarangays([]);
    setSelectedMunicipality('');
    setSelectedBarangay('');
  };

  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selectedMunicipalityObj = municipalities.find((m) => m.mun_code === code);

    setSelectedMunicipality(code);
    setFormData((prev) => ({
      ...prev,
      municipalityCode: code,
      municipalityName: selectedMunicipalityObj?.name || '',
    }));

    setBarangays(psgc.getBarangaysByMunicipality(code));
    setSelectedBarangay('');
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selectedBarangayObj = barangays.find((b) => b.bgy_code === code);

    setSelectedBarangay(code);
    setFormData((prev) => ({
      ...prev,
      barangayCode: code,
      barangayName: selectedBarangayObj?.name || '',
    }));
  };

  const handleInputChange = (field: keyof ApplicationForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
      parent: 'father' | 'mother',
      field: string,
      value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (field: 'itr' | 'grades', file: File | undefined) => {
    if (file && file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: file || null,
    }));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      campus: parseInt(campusId) || 0,
      department: parseInt(departmentId) || 0,
      course: parseInt(courseId) || 0,
    }));
  }, [campusId, departmentId, courseId]);


  const handleSubmit = async () => {
    const data = new FormData();

    // Append all simple fields
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value !== 'object' || value instanceof File || value === null) {
        data.append(key, value ?? '');
      }
    });

    // Append nested fields manually
    Object.entries(formData.father).forEach(([key, value]) => {
      data.append(`father[${key}]`, value ?? '');
    });

    Object.entries(formData.mother).forEach(([key, value]) => {
      data.append(`mother[${key}]`, value ?? '');
    });

    // Files
    if (formData.itr) data.append('itr', formData.itr);
    if (formData.grades) data.append('grades', formData.grades);

    try {
      const res = await fetch(`${API_BASE_URL}/api/application/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) throw new Error('Failed to submit application');

      const result = await res.json();
      alert('Application submitted successfully!');
      console.log(result);
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your application.');
    }
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
                            onChange={(e)=> handleInputChange('firstName', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-3">
                        <label>Middle Name</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Enter your middle name"
                            value={formData.middleName || ''}
                            onChange={(e)=> handleInputChange('middleName', e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-3">
                        <label>Last Name *</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={(e)=> handleInputChange('lastName', e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-2">
                        <label>Ext. Name</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Jr., Sr., etc."
                            value={formData.nameExtension || ''}
                            onChange={(e)=> handleInputChange('nameExtension', e.target.value)}
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
                          onChange={(e)=> handleInputChange('email', e.target.value)}
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
                            onChange={(e)=> handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Date of Birth *</label>
                        <input
                            className="form-control"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e)=> handleInputChange('birthDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="street">Street, House No., etc.</label>
                      <input type="text" className="form-control mb-3" value={formData.street}
                             onChange={(e)=> handleInputChange('street', e.target.value)}
                             placeholder="Enter street, house number, etc." />

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


                      <div className="row">
                        <div className="col-md-6">
                          <label>Citizenship</label>
                          <select name="citizenship" className="form-control" value={formData.citizenship}
                                  onChange={(e) => setFormData({...formData, citizenship: e.target.value})}>
                            <option value="">Select citizenship</option>
                            {citizenship.map(c => (
                                <option key={c} value={c} selected={c === "Filipino"}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label>Civil Status</label>
                          <select
                              className="form-control"
                              name="civilStatus"
                              value={formData.civilStatus}
                              onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                          >
                            <option value="">Select civil status</option>
                            {civilStatus.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
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
                               value={formData.father.lastName}
                               onChange={(e)=> handleNestedInputChange('father', 'lastName', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-3">
                        <label>First Name</label>
                        <input className="form-control" type="text" placeholder="First Name"
                               value={formData.father.firstName}
                               onChange={(e)=> handleNestedInputChange('father', 'firstName', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-3">
                        <label>Middle Name</label>
                        <input className="form-control" type="text" placeholder="Middle Name"
                               value={formData.father.middleName || ''}
                               onChange={(e)=> handleNestedInputChange('father', 'middleName', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-3">
                        <label>Extension</label>
                        <input className="form-control" type="text" placeholder="e.g., Jr."
                               value={formData.father.extension || ''}
                               onChange={(e)=> handleNestedInputChange('father', 'extension', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Occupation</label>
                        <input className="form-control" type="text" placeholder="Occupation"
                               value={formData.father.occupation}
                               onChange={(e)=> handleNestedInputChange('father', 'occupation', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Monthly Income</label>
                        <input className="form-control" type="number" placeholder="₱"
                               value={formData.father.income}
                               onChange={(e)=> handleNestedInputChange('father', 'income', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      {/* Mother's Info */}
                      <div className="col-12">
                        <h5>Mother's Information</h5>
                      </div>

                      <div className="mb-3 col-md-4">
                        <label>Mother's Maiden Last Name</label>
                        <input className="form-control" type="text"
                               value={formData.mother.lastName}
                               onChange={(e)=> handleNestedInputChange('mother', 'lastName', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label>Mother's First Name</label>
                        <input className="form-control" type="text"
                               value={formData.mother.firstName}
                               onChange={(e)=> handleNestedInputChange('mother', 'firstName', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label>Mother's Maiden Middle Name</label>
                        <input className="form-control" type="text"
                               value={formData.mother.middleName || ''}
                               onChange={(e)=> handleNestedInputChange('mother', 'middleName', e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-6">
                        <label>Occupation</label>
                        <input className="form-control" type="text"
                               value={formData.mother.occupation}
                               onChange={(e)=> handleNestedInputChange('mother', 'occupation', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Monthly Income</label>
                        <input className="form-control" type="number" placeholder="₱"
                               value={formData.mother.income}
                               onChange={(e)=> handleNestedInputChange('mother', 'income', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="col-12">
                        <h5>Emergency Information</h5>
                      </div>

                      <div className="mb-3 col-md-6">
                        <label>Emergency Contact Name</label>
                        <input className="form-control" type="text"
                               value={formData.emergencyContactName}
                               onChange={(e)=> handleInputChange('emergencyContactName', e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-6">
                        <label>Emergency Contact Number</label>
                        <input className="form-control" type="tel"
                               value={formData.emergencyContactNumber}
                               onChange={(e)=> handleInputChange('emergencyContactNumber', e.target.value)}
                        />
                      </div>

                      {/* Household Info */}
                      <div className="col-12">
                        <h5>Household & Socioeconomic</h5>
                      </div>

                      <div className="mb-3 col-md-4">
                        <label>Household Members</label>
                        <input className="form-control" type="number"
                               value={formData.householdNumber}
                               onChange={(e)=> handleInputChange('householdNumber', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label>Number of Siblings</label>
                        <input className="form-control" type="number"
                               value={formData.siblings}
                               onChange={(e)=> handleInputChange('siblings', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label>Siblings Currently Studying</label>
                        <input className="form-control" type="number"
                               value={formData.siblingsStudying}
                               onChange={(e)=> handleInputChange('siblingsStudying', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>IP Affiliation</label>
                        <input className="form-control" type="text"
                               value={formData.ipAffiliation || ''}
                               onChange={(e)=> handleInputChange('ipAffiliation', e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label>Are you a recipient of any DSWD Program?</label>
                        <select className="form-control"
                                value={formData.dswdProgram || ''}
                                onChange={(e)=> handleInputChange('dswdProgram', e.target.value)}
                        >
                          <option value="">Select DSWD Program</option>
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
                        <input
                            type="text"
                            name="student_id"
                            value={formData.studentId}
                            className="form-control"
                            onChange={(e)=> handleInputChange('studentId', e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-4">
                        <label htmlFor="year_level" className="form-label">Year Level</label>
                        <select className="form-select">
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                      </div>

                      <div className="mb-3 col-md-4">
                        <label htmlFor="campus" className="form-label">Campus</label>
                        <CampusSelect
                            value={campusId}
                            onChange={(e)=> setCampusId(e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-4">
                        <label htmlFor="department" className="form-label">Department</label>
                        <DepartmentSelect
                            campusId={campusId}
                            value={departmentId}
                            onChange={(e)=> setDepartmentId(e.target.value)}
                        />
                      </div>

                      <div className="mb-3 col-md-4">
                        <label htmlFor="course" className="form-label">Course</label>
                        <CourseSelect
                            departmentId={departmentId}
                            value={courseId}
                            onChange={(e)=> setCourseId(e.target.value)}
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

                      <div className="mb-3 col-md-4">
                        <label className="form-label">Enrollment Status</label>
                        <select className="form-control"
                                value={formData.enrollmentStatus}
                                onChange={(e)=> handleInputChange('enrollmentStatus', e.target.value)}>
                          <option value="">Select Enrollment Status</option>
                          <option value="Enrolled">Enrolled</option>
                          <option value="Not Enrolled">Not Enrolled</option>
                          <option value="Dropped">Dropped</option>
                        </select>
                      </div>

                      <div className="mb-3 col-md-4">
                        <label className="form-label">Total Units Enrolled</label>
                        <input className="form-control"
                                value={formData.total_units}
                                onChange={(e)=> handleInputChange('total_units', e.target.value)} />
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
                            onChange={(e)=> handleInputChange('scholarshipName', e.target.value)}
                            required
                        >
                          <option value="">Select Scholarship</option>
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
                          <option value="ONE TIME EDUC ATIONAL ASSISTANCE PROGRAM (OTAP)">ONE TIME EDUCATIONAL ASSISTANCE PROGRAM (OTAP)  </option>
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
                            <label htmlFor="other_scholarship" className="form-label">Other Scholarship(s)</label>
                            <input
                                type="text"
                                id="other_scholarship"
                                name="other_scholarship"
                                className="form-control"
                                placeholder="e.g., DOST, CHED"
                                value={formData.otherScholarship}
                                onChange={(e)=> handleInputChange('scholarshipName', e.target.value)}
                            />
                          </div>
                      )}


                      <div className="col-md-4">
                        <label htmlFor="scholarshipAmount" className="form-label">Amount (₱)</label>
                        <input
                            type="number"
                            id="scholarshipAmount"
                            name="scholarshipAmount"
                            className="form-control"
                            placeholder="e.g., 15000"
                            min="0"
                            step="0.01"
                            value={formData.scholarshipAmount}
                            onChange={(e)=> handleInputChange('scholarshipAmount', e.target.value)}
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

                  <div className="mb-4">
                    <label>Latest ITR (Income Tax Return) *</label>
                    <input
                        className="form-control"
                        type="file"
                        accept=".pdf"
                        onChange={(e)=> handleFileUpload('itr', e.target.files?.[0])}
                    />
                    <small className="form-text text-muted">Upload parent or guardian's ITR in PDF format (max 5MB)</small>
                  </div>

                  <div className="mb-4">
                    <label>Recent Grades / Transcript *</label>
                    <input
                        className="form-control"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e)=> handleFileUpload('grades', e.target.files?.[0])}
                    />
                    <small className="form-text text-muted">Upload official transcript or report card (PDF, JPEG, JPG, PNG)</small>
                  </div>

                  <div className="alert alert-info">
                    <strong>Document Requirements:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Accepted formats: PDF, JPEG, JPG, PNG</li>
                      <li>Maximum file size: 5MB per document</li>
                      <li>Ensure clarity and readability</li>
                    </ul>
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button className="btn btn-light" type="button" onClick={() => setStep("step2")}>Previous</button>
                    <button className="btn btn-primary" type="button" onClick={() => setStep("step4")}>Next</button>
                  </div>
                </div>

            )}

            {step === "step4" && (
                <div>
                  <h3 className="text-primary">Step 4: Review & Submit</h3>
                  <h5 className="card-title mb-4">Review your application details</h5>

                  {/* Applicant Info */}
                  <div className="card mb-4">
                    <div className="card-header"><h6 className="mb-0">Applicant Details</h6></div>
                    <div className="card-body">
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Full Name:</div>
                        <div className="col">{formData.firstName} {formData.middleName} {formData.lastName} {formData.nameExtension}</div>
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
                        <div className="col">{formData.birthDate}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Address:</div>
                        <div className="col">
                          {formData.street}, {formData.barangayName}, {formData.municipalityName}, {formData.provinceName}, {formData.regionName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="card mb-4">
                    <div className="card-header"><h6 className="mb-0">Academic Details</h6></div>
                    <div className="card-body">
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Student ID:</div>
                        <div className="col">{formData.studentId}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Campus/Department/Course:</div>
                        <div className="col">{formData.campus} / {formData.department} / {formData.course}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Academic Year & Semester:</div>
                        <div className="col">{formData.academicYearId} - Semester {formData.semesterId}</div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Enrollment Status:</div>
                        <div className="col">{formData.enrollmentStatus}</div>
                      </div>
                    </div>
                  </div>

                  {/* Scholarship Info */}
                  <div className="card mb-4">
                    <div className="card-header"><h6 className="mb-0">Scholarship</h6></div>
                    <div className="card-body">
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Scholarship Type:</div>
                        <div className="col">
                          {formData.scholarshipName === 'others' ? formData.otherScholarship : formData.scholarshipName}
                        </div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Scholarship Amount:</div>
                        <div className="col">₱{formData.scholarshipAmount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="card mb-4">
                    <div className="card-header"><h6 className="mb-0">Documents & Preferences</h6></div>
                    <div className="card-body">
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">ITR (Income Tax Return):</div>
                        <div className="col">
                          {formData.itr ? <span className="badge bg-success">Uploaded</span> : <span className="badge bg-danger">Not Uploaded</span>}
                        </div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Grades / Transcript:</div>
                        <div className="col">
                          {formData.grades ? <span className="badge bg-success">Uploaded</span> : <span className="badge bg-danger">Not Uploaded</span>}
                        </div>
                      </div>
                      <div className="row small mb-2">
                        <div className="col-sm-3 text-muted">Notifications:</div>
                        <div className="col">
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-warning">
                    <strong>Important:</strong> Please review all information carefully before submitting. Once submitted, changes may not be possible without contacting support.
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button className="btn btn-light" type="button" onClick={() => setStep("step3")}>Previous</button>
                    <button className="btn btn-primary" type="submit" onClick={handleSubmit}>Submit Application</button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Apply;