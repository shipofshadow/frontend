import React, { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import type {Profile} from "../../interfaces/profile";
// Import the PSGC library same as Apply.tsx
import psgc from "@dropdowns/psgc";

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, token, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");

    // PSGC Data States
    interface Region { reg_code: string; name: string; }
    interface Province { prv_code: string; name: string; reg_code: string; }
    interface Municipality { mun_code: string; name: string; prv_code: string; }
    interface Barangay { bgy_code: string; name: string; mun_code: string; }

    const [regions, setRegions] = useState<Region[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [barangays, setBarangays] = useState<Barangay[]>([]);

    // Extended Form Data to include Codes
    interface ExtendedProfile extends Partial<Profile> {
        region_code?: string;
        province_code?: string;
        municipality_code?: string;
        barangay_code?: string;
    }

    const [formData, setFormData] = useState<ExtendedProfile>({
        first_name: "",
        middle_name: "",
        last_name: "",
        extension_name: "",
        email: "",
        contact_number: "",
        birth_date: "",
        citizenship: "",
        civil_status: "",
        gender: "",

        street: "",
        // Names
        barangay_name: "",
        municipality_name: "",
        province_name: "",
        region_name: "",
        // Codes
        region_code: "",
        province_code: "",
        municipality_code: "",
        barangay_code: "",

        zip_code: "",

        emergency_contact_name: "",
        emergency_contact_number: "",

        father_first_name: "",
        father_middle_name: "",
        father_last_name: "",
        father_extension: "",
        father_occupation: "",
        father_income: "",

        mother_first_name: "",
        mother_middle_name: "",
        mother_last_name: "",
        mother_occupation: "",
        mother_income: "",

        household_number: 0,
        siblings: 0,
        siblings_studying: 0,
        is_4ps_member: 0,
        ip_affiliation: "",
    });

    // 1. Load Regions on Mount
    useEffect(() => {
        setRegions(psgc.getAllRegions());
    }, []);

    // 2. Load User Data & Pre-fill Address
    useEffect(() => {
        if (user?.profile) {
            const p = user.profile;
            setFormData({
                ...p,
                birth_date: p.birth_date ? new Date(p.birth_date).toISOString().split('T')[0] : "",
                middle_name: p.middle_name || "",
                extension_name: p.extension_name || "",

                // Address Names
                barangay_name: p.barangay_name || "",
                municipality_name: p.municipality_name || "",
                province_name: p.province_name || "",
                region_name: p.region_name || "",
                // Address Codes (Ensure your backend sends these in user.profile)
                region_code: p.region_code || "",
                province_code: p.province_code || "",
                municipality_code: p.municipality_code || "",
                barangay_code: p.barangay_code || "",

                zip_code: p.zip_code || "",

                father_first_name: p.father_first_name || "",
                father_middle_name: p.father_middle_name || "",
                father_last_name: p.father_last_name || "",
                father_extension: p.father_extension || "",
                father_occupation: p.father_occupation || "",
                father_income: p.father_income || "",
                mother_first_name: p.mother_first_name || "",
                mother_middle_name: p.mother_middle_name || "",
                mother_last_name: p.mother_last_name || "",
                mother_occupation: p.mother_occupation || "",
                mother_income: p.mother_income || "",
                ip_affiliation: p.ip_affiliation || "",
                emergency_contact_name: p.emergency_contact_name || "",
                emergency_contact_number: p.emergency_contact_number || "",
            });
        }
    }, [user]);

    // 3. Cascading Effects for Address
    // Load Provinces when Region Code exists
    useEffect(() => {
        if (formData.region_code) {
            setProvinces(psgc.getProvincesByRegion(formData.region_code));
        } else {
            setProvinces([]);
        }
    }, [formData.region_code]);

    // Load Municipalities when Province Code exists
    useEffect(() => {
        if (formData.province_code) {
            setMunicipalities(psgc.getMunicipalitiesByProvince(formData.province_code));
        } else {
            setMunicipalities([]);
        }
    }, [formData.province_code]);

    // Load Barangays when Municipality Code exists
    useEffect(() => {
        if (formData.municipality_code) {
            setBarangays(psgc.getBarangaysByMunicipality(formData.municipality_code));
        } else {
            setBarangays([]);
        }
    }, [formData.municipality_code]);


    // Handlers for Address Changes
    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const regionObj = regions.find(r => r.reg_code === code);

        setFormData(prev => ({
            ...prev,
            region_code: code,
            region_name: regionObj?.name || "",
            // Reset children
            province_code: "", province_name: "",
            municipality_code: "", municipality_name: "",
            barangay_code: "", barangay_name: ""
        }));
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const provObj = provinces.find(p => p.prv_code === code);

        setFormData(prev => ({
            ...prev,
            province_code: code,
            province_name: provObj?.name || "",
            // Reset children
            municipality_code: "", municipality_name: "",
            barangay_code: "", barangay_name: ""
        }));
    };

    const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const munObj = municipalities.find(m => m.mun_code === code);

        setFormData(prev => ({
            ...prev,
            municipality_code: code,
            municipality_name: munObj?.name || "",
            // Reset children
            barangay_code: "", barangay_name: ""
        }));
    };

    const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const bgyObj = barangays.find(b => b.bgy_code === code);

        setFormData(prev => ({
            ...prev,
            barangay_code: code,
            barangay_name: bgyObj?.name || ""
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleNext = () => {
        const form = document.getElementById('edit-profile-form') as HTMLFormElement;
        if (form.reportValidity()) {
            setActiveTab('family');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (!form.checkValidity()) {
            e.stopPropagation();
            // Basic logic to detect if error is in personal tab (simplified)
            // Ideally, you check specific fields.
            // For now, if invalid, we can just report validity.
            form.reportValidity();
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/profile/update`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                await refreshUser();
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your profile information has been successfully updated.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/applicant/profile');
                });
            }
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'An error occurred while updating your profile.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-vh-100 bg-light">
            <div className="bg-white shadow-sm border-bottom">
                <div className="container py-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/applicant/dashboard" className="text-decoration-none">Dashboard</Link></li>
                            <li className="breadcrumb-item"><Link to="/applicant/profile" className="text-decoration-none">Profile</Link></li>
                            <li className="breadcrumb-item active">Edit</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                                <h3 className="fw-bold mb-0">Edit Profile</h3>
                            </div>

                            <div className="card-body p-4">
                                <ul className="nav nav-pills nav-fill mb-4 bg-light rounded-3 p-1">
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link rounded-3 ${activeTab === 'personal' ? 'active bg-white shadow-sm text-primary' : 'text-muted'}`}
                                            onClick={() => setActiveTab('personal')}
                                        >
                                            Personal & Address
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link rounded-3 ${activeTab === 'family' ? 'active bg-white shadow-sm text-primary' : 'text-muted'}`}
                                            onClick={() => setActiveTab('family')}
                                        >
                                            Family Background
                                        </button>
                                    </li>
                                </ul>

                                <form id="edit-profile-form" onSubmit={handleSubmit} noValidate>
                                    <div className={activeTab === 'personal' ? 'd-block' : 'd-none'}>
                                        <h5 className="text-primary mb-3"><i className="fal fa-user me-2"></i>Personal Information</h5>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">First Name</label>
                                                <input type="text" className="form-control" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold text-muted">Middle Name</label>
                                                <input type="text" className="form-control" name="middle_name" value={formData.middle_name} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">Last Name</label>
                                                <input type="text" className="form-control" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-1">
                                                <label className="form-label small fw-bold text-muted">Ext</label>
                                                <input type="text" className="form-control" name="extension_name" value={formData.extension_name} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">Date of Birth</label>
                                                <input type="date" className="form-control" name="birth_date" value={formData.birth_date} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">Civil Status</label>
                                                <select className="form-select" name="civil_status" value={formData.civil_status} onChange={handleChange} required>
                                                    <option value="">Select...</option>
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                    <option value="Widowed">Widowed</option>
                                                    <option value="Separated">Separated</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">Citizenship</label>
                                                <input type="text" className="form-control" name="citizenship" value={formData.citizenship} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Email Address</label>
                                                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} readOnly />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Mobile Number</label>
                                                <input type="text" className="form-control" name="contact_number" value={formData.contact_number} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        <h5 className="text-info mb-3 border-top pt-3"><i className="fal fa-map-marked-alt me-2"></i>Address Information</h5>
                                        <div className="row g-3 mb-4">
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-muted">Street Address</label>
                                                <input type="text" className="form-control" name="street" value={formData.street} onChange={handleChange} required />
                                            </div>

                                            {/* DROPDOWNS */}
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Region</label>
                                                <select className="form-select" name="region_code" value={formData.region_code} onChange={handleRegionChange} required>
                                                    <option value="">Select Region</option>
                                                    {regions.map(r => (
                                                        <option key={r.reg_code} value={r.reg_code}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Province</label>
                                                <select className="form-select" name="province_code" value={formData.province_code} onChange={handleProvinceChange} required disabled={!provinces.length}>
                                                    <option value="">Select Province</option>
                                                    {provinces.map(p => (
                                                        <option key={p.prv_code} value={p.prv_code}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Municipality/City</label>
                                                <select className="form-select" name="municipality_code" value={formData.municipality_code} onChange={handleMunicipalityChange} required disabled={!municipalities.length}>
                                                    <option value="">Select Municipality</option>
                                                    {municipalities.map(m => (
                                                        <option key={m.mun_code} value={m.mun_code}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Barangay</label>
                                                <select className="form-select" name="barangay_code" value={formData.barangay_code} onChange={handleBarangayChange} required disabled={!barangays.length}>
                                                    <option value="">Select Barangay</option>
                                                    {barangays.map(b => (
                                                        <option key={b.bgy_code} value={b.bgy_code}>{b.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Zip Code</label>
                                                <input type="text" className="form-control" name="zip_code" value={formData.zip_code} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <h5 className="text-danger mb-3 border-top pt-3"><i className="fal fa-shield-exclamation me-2"></i>Emergency Contact</h5>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Contact Person Name</label>
                                                <input type="text" className="form-control" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Contact Number</label>
                                                <input type="text" className="form-control" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        <div className="mt-4 text-end">
                                            <button type="button" className="btn btn-primary px-4 rounded-pill" onClick={handleNext}>
                                                Next: Family Background <i className="fal fa-arrow-right ms-2"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Family Tab (Kept SAME as before) */}
                                    <div className={activeTab === 'family' ? 'd-block' : 'd-none'}>
                                        <h5 className="text-primary mb-3"><i className="fal fa-male me-2"></i>Father's Information</h5>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">First Name</label>
                                                <input type="text" className="form-control" name="father_first_name" value={formData.father_first_name} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold text-muted">Middle Name</label>
                                                <input type="text" className="form-control" name="father_middle_name" value={formData.father_middle_name} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">Last Name</label>
                                                <input type="text" className="form-control" name="father_last_name" value={formData.father_last_name} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-1">
                                                <label className="form-label small fw-bold text-muted">Ext</label>
                                                <input type="text" className="form-control" name="father_extension" value={formData.father_extension} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Occupation</label>
                                                <input type="text" className="form-control" name="father_occupation" value={formData.father_occupation} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Monthly Income</label>
                                                <input type="number" className="form-control" name="father_income" value={formData.father_income} onChange={handleChange} placeholder="0.00" />
                                            </div>
                                        </div>

                                        <h5 className="text-danger mb-3 border-top pt-3"><i className="fal fa-female me-2"></i>Mother's Information</h5>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">First Name</label>
                                                <input type="text" className="form-control" name="mother_first_name" value={formData.mother_first_name} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold text-muted">Middle Name</label>
                                                <input type="text" className="form-control" name="mother_middle_name" value={formData.mother_middle_name} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">Last Name</label>
                                                <input type="text" className="form-control" name="mother_last_name" value={formData.mother_last_name} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Occupation</label>
                                                <input type="text" className="form-control" name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Monthly Income</label>
                                                <input type="number" className="form-control" name="mother_income" value={formData.mother_income} onChange={handleChange} placeholder="0.00" />
                                            </div>
                                        </div>

                                        <h5 className="text-success mb-3 border-top pt-3"><i className="fal fa-home me-2"></i>Household & Others</h5>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">Household Members</label>
                                                <input type="number" className="form-control" name="household_number" value={formData.household_number} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">No. of Siblings</label>
                                                <input type="number" className="form-control" name="siblings" value={formData.siblings} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">Siblings Studying</label>
                                                <input type="number" className="form-control" name="siblings_studying" value={formData.siblings_studying} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">IP Affiliation (if any)</label>
                                                <input type="text" className="form-control" name="ip_affiliation" value={formData.ip_affiliation} onChange={handleChange} placeholder="Not applicable" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">4Ps Beneficiary?</label>
                                                <select className="form-select" name="is_4ps_member" value={formData.is_4ps_member} onChange={(e) => setFormData({...formData, is_4ps_member: Number(e.target.value)})}>
                                                    <option value={0}>No</option>
                                                    <option value={1}>Yes</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-5 d-flex gap-2 justify-content-end">
                                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => navigate('/applicant/profile')}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setActiveTab('personal')}>
                                                Back
                                            </button>
                                            <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isLoading}>
                                                {isLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default EditProfile;