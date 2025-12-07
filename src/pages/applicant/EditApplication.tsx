import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import psgc from "@dropdowns/psgc";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext.tsx";
import { API_BASE_URL } from "../../config.ts";
import { citizenship, civilStatus } from '../../data/data.ts';
import DepartmentSelect from "../../components/selects/DepartmentSelect.tsx";
import CampusSelect from "../../components/selects/CampusSelect.tsx";
import CourseSelect from "../../components/selects/CourseSelect.tsx";
import { useAcademicTerm } from "../../hooks/useAcademicTerm.ts";
import type { ApplicationForm } from "../../interfaces/ApplicationForm.ts";

const EditApplication = () => {
    const { token } = useAuth();
    const { application_id } = useParams<{ application_id: string }>();
    const navigate = useNavigate();
    const { term } = useAcademicTerm();
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState("step1");

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

    const [grades, setGrades] = useState([{ subject: "", grade: "", units: "" }]);

    const numberFormatter = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    });

    function formatDate(dateStr?: string | number | Date): string {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        return Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
    }

    const [formData, setFormData] = useState<ApplicationForm>({
        zipCode: "",
        firstName: '',
        middleName: '',
        lastName: '',
        nameExtension: '',
        email: '',
        phone: '',
        birthDate: '',
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
        studentId: '',
        year_level: '',
        campus: 0,
        department: 0,
        course: 0,
        academicYearId: 0,
        semesterId: 0,
        enrollmentStatus: '',
        total_units: 0,
        scholarshipName: '',
        otherScholarship: '',
        scholarshipAmount: 0,
        itr: null,
        grades: null,
        gradesList: [{ subject: "", grade: "" }],
        formatted: '',
    });

    // Fetch application data
    useEffect(() => {
        const fetchApplication = async () => {
            if (!application_id) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Invalid application ID',
                }).then(() => navigate('/applicant/status'));
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/profile/applications/${application_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch application');

                const data = await res.json();
                console.log(data)

                // Populate form with existing data
                setFormData({
                    formatted: data.formatted || '',
                    zipCode: data.zip_code,
                    firstName: data.first_name || '',
                    middleName: data.middle_name || '',
                    lastName: data.last_name || '',
                    nameExtension: data.name_extension || '',
                    email: data.email || '',
                    phone: data.contact_number || '',
                    birthDate: data.birth_date || '',
                    civilStatus: data.civil_status || '',
                    citizenship: data.citizenship || 'Filipino',
                    street: data.street || '',
                    regionCode: data.region_code || '',
                    regionName: data.region_name || '',
                    provinceCode: data.province_code || '',
                    provinceName: data.province_name || '',
                    municipalityCode: data.municipality_code || '',
                    municipalityName: data.municipality_name || '',
                    barangayCode: data.barangay_code || '',
                    barangayName: data.barangay_name || '',
                    father: {
                        lastName: data.father_last_name || '',
                        firstName: data.father_first_name || '',
                        middleName: data.father_middle_name || '',
                        extension: data.father_extension || '',
                        occupation: data.father_occupation || '',
                        income: parseFloat(data.father_income) || 0,
                    },
                    mother: {
                        lastName: data.mother_last_name || '',
                        firstName: data.mother_first_name || '',
                        middleName: data.mother_middle_name || '',
                        occupation: data.mother_occupation || '',
                        income: parseFloat(data.mother_income) || 0,
                    },
                    emergencyContactName: data.emergency_contact_name || '',
                    emergencyContactNumber: data.emergency_contact_number || '',
                    householdNumber: data.household_number || 0,
                    siblings: data.siblings || 0,
                    siblingsStudying: data.siblings_studying || 0,
                    ipAffiliation: data.ip_affiliation || '',
                    dswdProgram: data.is_4ps_member === 1 ? '4Ps' : '',
                    studentId: data.uid || '',
                    year_level: data.year_level || '',
                    campus: data.campus_id || 0,
                    department: data.department_id || 0,
                    course: data.course_id || 0,
                    academicYearId: data.academic_year_id || 0,
                    semesterId: data.semester_id || 0,
                    enrollmentStatus: data.enrollment_status || '',
                    total_units: data.total_units || 0,
                    scholarshipName: '',
                    otherScholarship: '',
                    scholarshipAmount: 0,
                    itr: null,
                    grades: null,
                    gradesList: []
                });

                // Set location data
                setSelectedRegion(data.region_code || '');
                setSelectedProvince(data.province_code || '');
                setSelectedMunicipality(data.municipality_code || '');
                setSelectedBarangay(data.barangay_code || '');

                // Set academic data
                setCampusId(String(data.campus_id || ''));
                setDepartmentId(String(data.department_id || ''));
                setCourseId(String(data.course_id || ''));

                // Fetch and set grades
                if (data.grades && Array.isArray(data.grades)) {
                    const gradesData = data.grades.map((g: any) => ({
                        subject: g.subject_name || '',
                        grade: String(g.grade || ''),
                        units: String(g.units || ''),
                    }));
                    setGrades(gradesData.length > 0 ? gradesData : [{ subject: "", grade: "", units: "" }]);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching application:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load application data',
                }).then(() => console.log('no'));
            }
        };

        fetchApplication();
    }, [application_id, token, navigate]);

    useEffect(() => {
        setRegions(psgc.getAllRegions());
    }, []);

    useEffect(() => {
        const total = grades.reduce((acc, curr) => acc + Number(curr.units || 0), 0);
        setFormData(prev => ({ ...prev, total_units: total }));
    }, [grades]);

    useEffect(() => {
        if (selectedRegion) {
            setProvinces(psgc.getProvincesByRegion(selectedRegion));
        }
    }, [selectedRegion]);

    useEffect(() => {
        if (selectedProvince) {
            setMunicipalities(psgc.getMunicipalitiesByProvince(selectedProvince));
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedMunicipality) {
            setBarangays(psgc.getBarangaysByMunicipality(selectedMunicipality));
        }
    }, [selectedMunicipality]);

    const addGradeRow = () => {
        setGrades([...grades, { subject: "", grade: "", units: "" }]);
    };

    const removeGradeRow = (index: number) => {
        setGrades(grades.filter((_, i) => i !== index));
    };

    const handleGradeChange = (index: number, field: string, value: string) => {
        const updated = grades.map((g, i) =>
            i === index ? { ...g, [field]: value } : g
        );
        setGrades(updated);
    };

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

    const handleInputChange = (field: keyof ApplicationForm, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNestedInputChange = (
        parent: 'father' | 'mother',
        field: string,
        value: string | number
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

    const handleUpdate = async () => {
        const data = new FormData();

        // Append application ID
        data.append('application_id', application_id || '');

        // Append simple fields
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'father' && key !== 'mother' && key !== 'gradesList' && key !== 'itr' && key !== 'grades') {
                data.append(key, value as string);
            }
        });

        // Append Nested Fields
        Object.entries(formData.father).forEach(([key, value]) => {
            data.append(`father[${key}]`, String(value ?? ''));
        });

        Object.entries(formData.mother).forEach(([key, value]) => {
            data.append(`mother[${key}]`, String(value ?? ''));
        });

        // Append Files (Only if they exist)
        if (formData.itr) data.append('itr', formData.itr);
        if (formData.grades) data.append('grades', formData.grades);

        // FIX: Filter and Validate Grades before sending
        if (grades && grades.length > 0) {
            const validGrades = grades.filter(g =>
                g.subject.trim() !== "" &&
                g.grade.toString().trim() !== "" &&
                !isNaN(parseFloat(g.grade))
            );
            data.append('gradesList', JSON.stringify(validGrades));
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/application/update/${application_id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            });

            if (!res.ok) throw new Error('Failed to update application');

            const result = await res.json();

            Swal.fire({
                icon: 'success',
                title: 'Application Updated!',
                text: 'Your scholarship application has been updated successfully.',
                confirmButtonText: 'Go to Applications',
            }).then(() => {
                navigate('/applicant/status');
            });

            console.log(result);
        } catch (error) {
            console.error('Update error:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'There was an error updating your application. Please try again later.',
            });
        }
    };

    if (loading) {
        return (
            <div className="container-fluid p-2">
                <div className="card">
                    <div className="card-body text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading application data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-2">
            <div className="card">
                <div className="card-header border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Edit Application #{application_id}</h5>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate('/applicant/status')}
                        >
                            <i className="fas fa-arrow-left me-1"></i> Back to Applications
                        </button>
                    </div>
                </div>
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
                                <div className="wizard-step-text-name">Grades</div>
                                <div className="wizard-step-text-details">Enter your grades and upload transcript</div>
                            </div>
                        </a>

                        <a
                            className={`nav-item nav-link ${step === "step4" ? "active" : ""}`}
                            onClick={() => setStep("step4")}
                        >
                            <div className="wizard-step-icon">4</div>
                            <div className="wizard-step-text">
                                <div className="wizard-step-text-name">Supporting Documents</div>
                                <div className="wizard-step-text-details">Supporting documents</div>
                            </div>
                        </a>

                        <a
                            className={`nav-item nav-link ${step === "step5" ? "active" : ""}`}
                            onClick={() => setStep("step5")}
                        >
                            <div className="wizard-step-icon">5</div>
                            <div className="wizard-step-text">
                                <div className="wizard-step-text-name">Review & Submit</div>
                                <div className="wizard-step-text-details">Review and update scholarship application</div>
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
                                        <label>Middle Name</label>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter your middle name"
                                            value={formData.middleName || ''}
                                            onChange={(e) => handleInputChange('middleName', e.target.value)}
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
                                        <label>Ext. Name</label>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Jr., Sr., etc."
                                            value={formData.nameExtension || ''}
                                            onChange={(e) => handleInputChange('nameExtension', e.target.value)}
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
                                            value={formData.birthDate ? new Date(formData.birthDate).toISOString().slice(0, 10) : ''}
                                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="street">Street, House No., etc.</label>
                                    <input type="text" className="form-control mb-3" value={formData.street}
                                           onChange={(e) => handleInputChange('street', e.target.value)}
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

                                        <div className="col-md-2">
                                            <label>Municipality</label>
                                            <select className="form-control" value={selectedMunicipality} onChange={handleMunicipalityChange} disabled={!municipalities.length}>
                                                <option value="">Select Municipality</option>
                                                {municipalities.map(m => (
                                                    <option key={m.mun_code} value={m.mun_code}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-2">
                                            <label>Barangay</label>
                                            <select className="form-control" value={selectedBarangay} onChange={handleBarangayChange} disabled={!barangays.length}>
                                                <option value="">Select Barangay</option>
                                                {barangays.map(b => (
                                                    <option key={b.bgy_code} value={b.bgy_code}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-2">
                                            <label>Zip Code</label>
                                            <input type="number" className="form-control" value={formData.zipCode} onChange={(e => setFormData({...formData, zipCode: e.target.value}))}/>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <label>Citizenship</label>
                                                <select name="citizenship" className="form-control" value={formData.citizenship}
                                                        onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}>
                                                    <option value="">Select citizenship</option>
                                                    {citizenship.map(c => (
                                                        <option key={c} value={c}>{c}</option>
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
                                    <div className="col-12">
                                        <h5>Father's Information</h5>
                                    </div>

                                    <div className="mb-3 col-md-3">
                                        <label>Last Name</label>
                                        <input className="form-control" type="text" placeholder="Last Name"
                                               value={formData.father.lastName}
                                               onChange={(e) => handleNestedInputChange('father', 'lastName', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label>First Name</label>
                                        <input className="form-control" type="text" placeholder="First Name"
                                               value={formData.father.firstName}
                                               onChange={(e) => handleNestedInputChange('father', 'firstName', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label>Middle Name</label>
                                        <input className="form-control" type="text" placeholder="Middle Name"
                                               value={formData.father.middleName || ''}
                                               onChange={(e) => handleNestedInputChange('father', 'middleName', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label>Extension</label>
                                        <input className="form-control" type="text" placeholder="e.g., Jr."
                                               value={formData.father.extension || ''}
                                               onChange={(e) => handleNestedInputChange('father', 'extension', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-6">
                                        <label>Occupation</label>
                                        <input className="form-control" type="text" placeholder="Occupation"
                                               value={formData.father.occupation}
                                               onChange={(e) => handleNestedInputChange('father', 'occupation', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-6">
                                        <label>Monthly Income</label>
                                        <input className="form-control" type="number" placeholder="₱"
                                               value={formData.father.income}
                                               onChange={(e) => handleNestedInputChange('father', 'income', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <h5>Mother's Information</h5>
                                    </div>

                                    <div className="mb-3 col-md-4">
                                        <label>Mother's Maiden Last Name</label>
                                        <input className="form-control" type="text"
                                               value={formData.mother.lastName}
                                               onChange={(e) => handleNestedInputChange('mother', 'lastName', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-4">
                                        <label>Mother's First Name</label>
                                        <input className="form-control" type="text"
                                               value={formData.mother.firstName}
                                               onChange={(e) => handleNestedInputChange('mother', 'firstName', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-4">
                                        <label>Mother's Maiden Middle Name</label>
                                        <input className="form-control" type="text"
                                               value={formData.mother.middleName || ''}
                                               onChange={(e) => handleNestedInputChange('mother', 'middleName', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3 col-md-6">
                                        <label>Occupation</label>
                                        <input className="form-control" type="text"
                                               value={formData.mother.occupation}
                                               onChange={(e) => handleNestedInputChange('mother', 'occupation', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-6">
                                        <label>Monthly Income</label>
                                        <input className="form-control" type="number" placeholder="₱"
                                               value={formData.mother.income}
                                               onChange={(e) => handleNestedInputChange('mother', 'income', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <h5>Emergency Information</h5>
                                    </div>

                                    <div className="mb-3 col-md-6">
                                        <label>Emergency Contact Name</label>
                                        <input className="form-control" type="text"
                                               value={formData.emergencyContactName}
                                               onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3 col-md-6">
                                        <label>Emergency Contact Number</label>
                                        <input className="form-control" type="tel"
                                               value={formData.emergencyContactNumber}
                                               onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <h5>Household & Socioeconomic</h5>
                                    </div>

                                    <div className="mb-3 col-md-4">
                                        <label>Household Members</label>
                                        <input className="form-control" type="number"
                                               value={formData.householdNumber}
                                               onChange={(e) => handleInputChange('householdNumber', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-4">
                                        <label>Number of Siblings</label>
                                        <input className="form-control" type="number"
                                               value={formData.siblings}
                                               onChange={(e) => handleInputChange('siblings', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-4">
                                        <label>Siblings Currently Studying</label>
                                        <input className="form-control" type="number"
                                               value={formData.siblingsStudying}
                                               onChange={(e) => handleInputChange('siblingsStudying', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-6">
                                        <label>IP Affiliation</label>
                                        <input className="form-control" type="text"
                                               value={formData.ipAffiliation || ''}
                                               onChange={(e) => handleInputChange('ipAffiliation', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3 col-md-6">
                                        <label>Are you a recipient of any DSWD Program?</label>
                                        <select className="form-control"
                                                value={formData.dswdProgram || ''}
                                                onChange={(e) => handleInputChange('dswdProgram', e.target.value)}
                                        >
                                            <option value="">Select DSWD Program</option>
                                            <option value="None">None</option>
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
                                            onChange={(e) => handleInputChange('studentId', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3 col-md-4">
                                        <label htmlFor="year_level" className="form-label">Year Level</label>
                                        <select className="form-select"
                                                value={formData.year_level}
                                                onChange={(e) => handleInputChange('year_level', e.target.value)}
                                        >
                                            <option value="">Select Year Level</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
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
                            <h3 className="text-primary">Step 3: Grades Entry</h3>
                            <h5 className="card-title mb-4">Enter your grades and upload your transcript</h5>

                            {grades.map((grade, idx) => (
                                <div className="row g-2 align-items-center mb-3" key={idx}>
                                    <div className="col-md-4">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fas fa-book"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Subject"
                                                value={grade.subject}
                                                onChange={(e) => handleGradeChange(idx, "subject", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fas fa-graduation-cap"></i>
                                            </span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                placeholder="Grade"
                                                value={grade.grade}
                                                onChange={(e) => handleGradeChange(idx, "grade", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fas fa-layer-group"></i>
                                            </span>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Units"
                                                value={grade.units}
                                                onChange={(e) => handleGradeChange(idx, "units", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-2 text-end">
                                        {grades.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => removeGradeRow(idx)}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="text-end mb-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={addGradeRow}
                                >
                                    <i className="fas fa-plus me-1"></i>
                                    Add Subject
                                </button>
                            </div>

                            <div className="row">
                                <div className="mb-3 col-md-4">
                                    <label className="form-label">Academic Term</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.formatted || ''}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 col-md-4">
                                    <label className="form-label">Enrollment Status</label>
                                    <select className="form-control"
                                            value={formData.enrollmentStatus}
                                            onChange={(e) => handleInputChange('enrollmentStatus', e.target.value)}>
                                        <option value="">Select Enrollment Status</option>
                                        <option value="Enrolled">Enrolled</option>
                                        <option value="Not Enrolled">Not Enrolled</option>
                                        <option value="Dropped">Dropped</option>
                                    </select>
                                </div>

                                <div className="mb-3 col-md-4">
                                    <label className="form-label">Total Units Enrolled</label>
                                    <input
                                        className="form-control"
                                        value={formData.total_units}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label>Upload Transcript / Report Card</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    accept=".pdf, image/jpeg, image/jpg, image/png"
                                    onChange={(e) => handleFileUpload("grades", e.target.files?.[0])}
                                />
                                <small className="form-text text-muted">
                                    Upload new file only if you want to replace existing transcript
                                </small>
                            </div>

                            <div className="alert alert-info">
                                <strong>Document Requirements:</strong>
                                <ul className="mb-0 mt-2">
                                    <li>Accepted formats: PDF, JPEG, JPG, PNG</li>
                                    <li>Maximum file size: 5MB</li>
                                    <li>Leave empty to keep existing file</li>
                                </ul>
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <button className="btn btn-light" type="button" onClick={() => setStep("step2")}>
                                    Previous
                                </button>
                                <button className="btn btn-primary" type="button" onClick={() => setStep("step4")}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "step4" && (
                        <div>
                            <h3 className="text-primary">Step 4: Supporting Documents</h3>
                            <h5 className="card-title mb-4">Upload required documents</h5>

                            <div className="mb-4">
                                <label>Latest ITR (Income Tax Return)</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    accept=".pdf, image/jpeg, image/jpg, image/png"
                                    onChange={(e) => handleFileUpload("itr", e.target.files?.[0])}
                                />
                                <small className="form-text text-muted">
                                    Upload new file only if you want to replace existing ITR
                                </small>
                            </div>

                            <div className="alert alert-info">
                                <strong>Document Requirements:</strong>
                                <ul className="mb-0 mt-2">
                                    <li>Accepted formats: PDF, JPEG, JPG, PNG</li>
                                    <li>Maximum file size: 5MB</li>
                                    <li>Leave empty to keep existing file</li>
                                </ul>
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <button className="btn btn-light" type="button" onClick={() => setStep("step3")}>
                                    Previous
                                </button>
                                <button className="btn btn-primary" type="button" onClick={() => setStep("step5")}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "step5" && (
                        <div>
                            <h3 className="text-primary">Step 5: Review & Submit</h3>
                            <h5 className="card-title mb-4">Review your updated application details</h5>

                            <div className="card mb-4">
                                <div className="card-header">
                                    <h6 className="mb-0">Applicant Details</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Full Name:</div>
                                        <div className="col">
                                            {[
                                                formData.firstName,
                                                formData.middleName,
                                                formData.lastName,
                                                formData.nameExtension,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") || "N/A"}
                                        </div>
                                    </div>
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Email:</div>
                                        <div className="col">{formData.email || "N/A"}</div>
                                    </div>
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Phone:</div>
                                        <div className="col">{formData.phone || "N/A"}</div>
                                    </div>
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Date of Birth:</div>
                                        <div className="col">{formatDate(formData.birthDate)}</div>
                                    </div>
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Address:</div>
                                        <div className="col">
                                            {[formData.street, formData.barangayName, formData.municipalityName, formData.provinceName, formData.regionName]
                                                .filter(Boolean)
                                                .join(", ") || "N/A"}
                                        </div>
                                    </div>

                                    <div className="row small mt-3">
                                        <div className="col-sm-3 text-muted">Father's Name:</div>
                                        <div className="col">
                                            {[
                                                formData.father?.firstName,
                                                formData.father?.middleName,
                                                formData.father?.lastName,
                                                formData.father?.extension,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") || "N/A"}
                                        </div>
                                    </div>
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Father's Income:</div>
                                        <div className="col">
                                            {formData.father?.income
                                                ? numberFormatter.format(formData.father.income)
                                                : "N/A"}
                                        </div>
                                    </div>
                                    <div className="row small">
                                        <div className="col-sm-3 text-muted">Mother's Name:</div>
                                        <div className="col">
                                            {[
                                                formData.mother?.firstName,
                                                formData.mother?.middleName,
                                                formData.mother?.lastName,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") || "N/A"}
                                        </div>
                                    </div>
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Mother's Income:</div>
                                        <div className="col">
                                            {formData.mother?.income
                                                ? numberFormatter.format(formData.mother.income)
                                                : "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card mb-4">
                                <div className="card-header">
                                    <h6 className="mb-0">Academic Details</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Student ID:</div>
                                        <div className="col">{formData.studentId || "N/A"}</div>
                                    </div>
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Year Level:</div>
                                        <div className="col">{formData.year_level ? `${formData.year_level}${formData.year_level === '1' ? 'st' : formData.year_level === '2' ? 'nd' : formData.year_level === '3' ? 'rd' : 'th'} Year` : "N/A"}</div>
                                    </div>
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Academic Year & Semester:</div>
                                        <div className="col">
                                            {term?.formatted || "N/A"}
                                        </div>
                                    </div>
                                    <div className="row small mb-2">
                                        <div className="col-sm-3 text-muted">Enrollment Status:</div>
                                        <div className="col">{formData.enrollmentStatus || "N/A"}</div>
                                    </div>
                                    <div className="row small">
                                        <div className="col-sm-3 text-muted">Total Units:</div>
                                        <div className="col">{formData.total_units || "N/A"}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="card mb-4">
                                <div className="card-header">
                                    <h6 className="mb-0">Documents & Grades</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row small mb-2 align-items-center">
                                        <div className="col-sm-3 text-muted">ITR Upload:</div>
                                        <div className="col">
                                            {formData.itr ? (
                                                <span className="badge bg-success">New file uploaded</span>
                                            ) : (
                                                <span className="badge bg-info">Using existing file</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row small mb-1 align-items-center">
                                        <div className="col-sm-3 text-muted">Grades Upload:</div>
                                        <div className="col">
                                            {formData.grades ? (
                                                <span className="badge bg-success">New file uploaded</span>
                                            ) : (
                                                <span className="badge bg-info">Using existing file</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row small mb-3">
                                        <div className="col-sm-3 text-muted">Grades Details:</div>
                                        <div className="col">
                                            {Array.isArray(grades) && grades.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-sm table-bordered mb-0">
                                                        <thead className="table-light">
                                                        <tr>
                                                            <th>Subject</th>
                                                            <th>Grade</th>
                                                            <th>Units</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {grades.map((g, i) => (
                                                            <tr key={i}>
                                                                <td>{g.subject || "N/A"}</td>
                                                                <td>{g.grade || "N/A"}</td>
                                                                <td>{g.units || "N/A"}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <span className="badge bg-warning">No grades details available</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <strong>Important:</strong> Please review all information carefully before updating. This will replace your previous application data.
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <button className="btn btn-light" type="button" onClick={() => setStep("step4")}>
                                    Previous
                                </button>
                                <button className="btn btn-success" type="submit" onClick={handleUpdate}>
                                    <i className="fas fa-save me-1"></i>
                                    Update Application
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditApplication;