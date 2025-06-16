import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notyf } from '../utils/utils';
import CampusSelect from '../components/selects/CampusSelect';
import DepartmentSelect from '../components/selects/DepartmentSelect';
import CourseSelect from '../components/selects/CourseSelect';
import type {RegisterForm} from '../types/registerForm';
import { sha256 } from 'js-sha256';
import {registerUser} from "../services/authService";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    student_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    extension_name: '',
    gender: '',
    email: '',
    contact_number: '',
    password: '',
    campus: '',
    department: '',
    course: '',
    year: '',
  });

  const [errors, setErrors] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.student_id.match(/^E\d{2}-\d{5}$/)) {
      setErrors('Student ID must be in the format E25-00123');
      return;
    }

    try {
      setErrors(null);

      const hashedPassword = sha256(form.password);
      await registerUser({
        ...form,
        password: hashedPassword
      })

    } catch (err) {
      setErrors(err instanceof Error ? err.message : 'Registration failed');
    }

    notyf.success('Registration successful!');
    setTimeout(() => navigate('/applicant/profile'), 3000);
  };

  return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container" style={{ zIndex: 2 }}>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-7 col-xl-6">
              <div className="text-center mb-4">
                <img src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png" alt="ISPSC Logo" width={80} height={80} />
              </div>

              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-body p-4">
                  <h1 className="fs-3 fw-bold text-primary mb-4 text-center">Create your iScholar account</h1>

                  {errors && <div className="alert alert-danger">{errors}</div>}

                  <form onSubmit={handleSubmit} noValidate autoComplete="off">
                    <div className="mb-3">
                      <label className="form-label">Student ID</label>
                      <input type="text" name="studentId" className="form-control" placeholder="E25-00123" value={form.student_id} onChange={handleChange} required />
                    </div>

                    <div className="row mb-3">
                      <div className="col">
                        <label className="form-label">First Name</label>
                        <input type="text" name="firstName" className="form-control" value={form.first_name} onChange={handleChange} required />
                      </div>
                      <div className="col">
                        <label className="form-label">Middle Name</label>
                        <input type="text" name="middleName" className="form-control" value={form.middle_name} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col">
                        <label className="form-label">Last Name</label>
                        <input type="text" name="lastName" className="form-control" value={form.last_name} onChange={handleChange} required />
                      </div>
                      <div className="col">
                        <label className="form-label">Extension</label>
                        <input type="text" name="extensionName" className="form-control" placeholder="Jr., III, etc." value={form.extension_name} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Gender</label>
                      <select name="gender" className="form-select" value={form.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Contact Number</label>
                      <input type="text" name="contactNumber" className="form-control" value={form.contact_number} onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input type="text" name="password" className="form-control" value={form.password} onChange={handleChange} required />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Campus</label>
                        <CampusSelect value={form.campus} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Department</label>
                        <DepartmentSelect campusId={form.campus} value={form.department} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Course</label>
                        <CourseSelect departmentId={form.department} value={form.course} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Year</label>
                        <select className="form-control" name="year" value={form.year} onChange={handleChange} required>
                          <option value="" disabled>Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                    </div>

                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary btn-lg shadow-sm">
                        Register
                      </button>
                    </div>
                  </form>
                </div>

                <div className="card-footer text-center border-0 bg-white py-3">
                  <span className="text-muted small">Already have an account?</span>{' '}
                  <Link to="/applicant/login" className="text-primary fw-semibold">Login here</Link>
                </div>
              </div>

              <div className="text-center mt-4 text-muted small">
                &copy; {new Date().getFullYear()} iScholar — Ilocos Sur Polytechnic State College
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Register;
