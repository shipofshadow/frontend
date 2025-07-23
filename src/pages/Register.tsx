// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useState } from 'react';
import {notyf} from "../utils/utils.ts";
import {registerUser} from "../services/authService.tsx";
import {sha256} from "js-sha256";
import type {RegisterForm} from "../interfaces/registerForm.ts";
import {useNavigate} from "react-router-dom";

const Register = () => {

  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    student_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    extension_name: '',
    gender: '',
    username: '',
    email: '',
    contact_number: '',
    password: '',
    birth_date: '',
  });

  const isFormValid = () => {
    const requiredFields = [
      'student_id', 'first_name', 'last_name', 'gender', 'username',
      'email', 'contact_number', 'password', 'birth_date'
    ];

    for (const field of requiredFields) {
      if (!form[field as keyof typeof form]) {
        return false;
      }
    }

    return true;
  };


  const [showPassword, setShowPassword] = useState(false);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      notyf.error('Please fill in all required fields.');
      return;
    }

    if (!form.student_id.match(/^E\d{2}-\d{5}$/)) {
      notyf.error('Student ID must be in the format E25-00123');
      return;
    }

    try {

      const hashedPassword = sha256(form.password);
      await registerUser({
        ...form,
        password: hashedPassword
      })

      console.log('Registration data:', form);
      notyf.success('Registration successful!');

      navigate('/login');


    } catch (err) {
      notyf.error(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
      <div className="min-vh-100  d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              {/* Header Section */}
              <div className="text-center mb-5">
                <div className="mb-4">
                  <img
                      src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                      alt="ISPSC Logo"
                      width={100}
                      height={100}
                      className="rounded-circle shadow-lg bg-white p-2"
                  />
                </div>
                <h1 className="display-6 fw-bold  mb-2">iScholar Registration</h1>
                <p className="lead">Create your account to get started</p>
              </div>

              {/* Main Form Card */}
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">


                <div className="card-body p-4 p-md-5">
                  <h3 className="h5 fw-bold text-primary mb-4">Personal Information</h3>
                  <div onSubmit={handleSubmit}>
                    {/* Student ID */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-card-text me-2 text-primary"></i>
                        Student ID <span className="text-danger">*</span>
                      </label>
                      <input
                          type="text"
                          name="student_id"
                          className="form-control form-control-lg border-2 rounded-3"
                          placeholder="E25-00123"
                          value={form.student_id}
                          onChange={handleChange}
                          required
                      />
                      <div className="form-text">Format: E25-00123</div>
                    </div>

                    {/* Name Section */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={form.first_name}
                            onChange={handleChange}
                            required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Middle Name</label>
                        <input
                            type="text"
                            name="middle_name"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={form.middle_name}
                            onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={form.last_name}
                            onChange={handleChange}
                            required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Extension</label>
                        <input
                            type="text"
                            name="extension_name"
                            className="form-control form-control-lg border-2 rounded-3"
                            placeholder="Jr., III, etc."
                            value={form.extension_name}
                            onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Birth Date <span className="text-danger">*</span>
                        </label>
                        <input
                            type="date"
                            name="birth_date"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={form.birth_date}
                            onChange={handleChange}
                            required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Gender <span className="text-danger">*</span>
                        </label>
                        <select
                            name="gender"
                            className="form-select form-select-lg border-2 rounded-3"
                            value={form.gender}
                            onChange={handleChange}
                            required
                        >
                          <option value="">Choose gender...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    {/* Account Information */}
                    <hr className="my-5 border-2 opacity-25" />
                    <h3 className="h5 fw-bold text-primary mb-4">Account Information</h3>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="far fa-user me-2 text-primary"></i>
                          Username <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Choose your username"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="far fa-envelope me-2 text-primary"></i>
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Please enter your email"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="far fa-phone me-2 text-primary"></i>
                          Contact Number <span className="text-danger">*</span>
                        </label>
                        <input
                            type="tel"
                            name="contact_number"
                            className="form-control form-control-lg border-2 rounded-3"
                            placeholder="+63 912 345 6789"
                            value={form.contact_number}
                            onChange={handleChange}
                            required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="far fa-lock me-2 text-primary"></i>
                          Password <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              placeholder="Choose your password"
                              className="form-control form-control-lg border-2 rounded-start-3"
                              value={form.password}
                              onChange={handleChange}
                              required
                          />
                          <button
                              className="btn btn-outline-secondary border-2 rounded-end-3"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>


                    {/* Submit Button */}
                    <div className="d-grid">
                      <button
                          type="button"
                          onClick={handleSubmit}
                          className="btn btn-primary btn-lg py-3 rounded-3 shadow-sm fw-semibold"
                          style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none'}}
                      >
                        <i className="bi bi-person-plus me-2"></i>
                        Create Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="card border-0 shadow-sm mt-4 rounded-3">
                <div className="card-body text-center py-4">
                  <p className="mb-0 text-muted">
                    Already have an account?{' '}
                    <a
                        href="/login"
                        className="text-decoration-none fw-semibold"
                        style={{color: '#667eea'}}
                    >
                      Sign in here <i className="bi bi-arrow-right ms-1"></i>
                    </a>
                  </p>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="small mb-0">
                  &copy; {new Date().getFullYear()} iScholar — Ilocos Sur Polytechnic State College
                </p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
        }
        
        .card {
          backdrop-filter: blur(10px);
        }
        
        .btn:hover {
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        
        .form-control,
        .form-select {
          transition: all 0.3s ease;
        }
        
        .form-control:hover:not(:focus),
        .form-select:hover:not(:focus) {
          border-color: #9ca3af;
        }
      `}</style>
      </div>
  );
};

export default Register;