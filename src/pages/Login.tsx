import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { notyf } from '../utils/utils';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    GraduationCap,
    Smartphone,
    Clock,
    UserPlus,
    FileText,
    BarChart3, Shield, AlertCircle, HelpCircle, Search
} from 'lucide-react';
import "notyf/notyf.min.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'student') {
        navigate('/applicant/home');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      setErrors('Username and password are required.');
      return;
    }

    try {
      setIsLoading(true);
      setErrors(null);

      const response = await loginUser(username, password);
      const { user, token, refresh_token } = response;

      if (remember) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      login(user, token, refresh_token);

      notyf.success('Login successful!');

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'student') {
        navigate('/applicant/home');
      } else {
        navigate('/');
      }

    } catch (err) {
      setErrors(err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRemember(isChecked);

    if (!isChecked) {
      localStorage.removeItem('rememberedUsername');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
      <div className="min-vh-100 d-flex align-items-center bg-light position-relative overflow-hidden">
          {/* Background decorative elements */}
          <div
              className="position-absolute"
              style={{
                  top: '-10%',
                  left: '-10%',
                  width: '300px',
                  height: '300px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
                  borderRadius: '50%',
                  zIndex: 1
              }}
          />
          <div
              className="position-absolute"
              style={{
                  bottom: '-10%',
                  right: '-10%',
                  width: '400px',
                  height: '400px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  borderRadius: '50%',
                  zIndex: 1
              }}
          />

          <div className="container-fluid px-4 position-relative" style={{ zIndex: 2 }}>
              <div className="row min-vh-100 align-items-center">

                  {/* Left Content Section - 8 columns */}
                  <div className="col-lg-8 d-none d-lg-flex flex-column justify-content-center pe-lg-5">

                      {/* Main Hero Section */}
                      <div className="mb-5">
                          <div className="d-flex align-items-center mb-4">
                              <div
                                  className="rounded-4 d-flex align-items-center justify-content-center shadow-sm bg-white border me-4"
                                  style={{
                                      width: '100px',
                                      height: '100px'
                                  }}
                              >
                                  <img
                                      src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                                      alt="ISPSC Logo"
                                      className="img-fluid"
                                      style={{
                                          width: '75px',
                                          height: '75px',
                                          objectFit: 'contain'
                                      }}
                                  />
                              </div>
                              <div>
                                  <h1 className="display-4 fw-bold text-primary mb-2">
                                      Welcome to <span className="text-gradient">iScholar</span>
                                  </h1>
                                  <p className="lead text-muted mb-0">
                                      Intelligent Scholarship Prequalification System
                                  </p>
                              </div>
                          </div>

                          <p className="fs-5 text-muted mb-4 pe-lg-5">
                              Streamline your scholarship application process with our AI-powered
                              eligibility evaluation system. Apply, track, and manage your educational
                              funding opportunities all in one place.
                          </p>
                      </div>

                      {/* Features Grid */}
                      <div className="row g-4 mb-5">
                          <div className="col-md-6">
                              <div className="card border-0 bg-white shadow-sm h-100 rounded-4">
                                  <div className="card-body p-4">
                                      <div className="d-flex align-items-center mb-3">
                                          <div
                                              className="rounded-3 d-flex align-items-center justify-content-center text-white me-3"
                                              style={{
                                                  width: '48px',
                                                  height: '48px',
                                                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                                              }}
                                          >
                                              <GraduationCap size={24} />
                                          </div>
                                          <h5 className="fw-bold mb-0">Smart Eligibility</h5>
                                      </div>
                                      <p className="text-muted small mb-0">
                                          AI-powered evaluation system that analyzes your academic performance,
                                          family background, and financial need to determine scholarship eligibility.
                                      </p>
                                  </div>
                              </div>
                          </div>

                          <div className="col-md-6">
                              <div className="card border-0 bg-white shadow-sm h-100 rounded-4">
                                  <div className="card-body p-4">
                                      <div className="d-flex align-items-center mb-3">
                                          <div
                                              className="rounded-3 d-flex align-items-center justify-content-center text-white me-3"
                                              style={{
                                                  width: '48px',
                                                  height: '48px',
                                                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                              }}
                                          >
                                              <FileText size={24} />
                                          </div>
                                          <h5 className="fw-bold mb-0">Easy Application</h5>
                                      </div>
                                      <p className="text-muted small mb-0">
                                          Simple multi-step application process with document upload,
                                          progress tracking, and real-time status updates.
                                      </p>
                                  </div>
                              </div>
                          </div>

                          <div className="col-md-6">
                              <div className="card border-0 bg-white shadow-sm h-100 rounded-4">
                                  <div className="card-body p-4">
                                      <div className="d-flex align-items-center mb-3">
                                          <div
                                              className="rounded-3 d-flex align-items-center justify-content-center text-white me-3"
                                              style={{
                                                  width: '48px',
                                                  height: '48px',
                                                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                                              }}
                                          >
                                              <BarChart3 size={24} />
                                          </div>
                                          <h5 className="fw-bold mb-0">Real-time Analytics</h5>
                                      </div>
                                      <p className="text-muted small mb-0">
                                          Track your application progress, view analytics, and get insights
                                          into scholarship opportunities that match your profile.
                                      </p>
                                  </div>
                              </div>
                          </div>

                          <div className="col-md-6">
                              <div className="card border-0 bg-white shadow-sm h-100 rounded-4">
                                  <div className="card-body p-4">
                                      <div className="d-flex align-items-center mb-3">
                                          <div
                                              className="rounded-3 d-flex align-items-center justify-content-center text-white me-3"
                                              style={{
                                                  width: '48px',
                                                  height: '48px',
                                                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                                              }}
                                          >
                                              <Shield size={24} />
                                          </div>
                                          <h5 className="fw-bold mb-0">Secure Platform</h5>
                                      </div>
                                      <p className="text-muted small mb-0">
                                          Your personal and academic information is protected with
                                          enterprise-grade security and encryption.
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Statistics Section */}
                      <div className="card border-0 bg-primary rounded-4 text-white">
                          <div className="card-body p-4">
                              <div className="row text-center">
                                  <div className="col-4">
                                      <div className="display-6 fw-bold mb-2">500+</div>
                                      <div className="small opacity-75">Students Registered</div>
                                  </div>
                                  <div className="col-4">
                                      <div className="display-6 fw-bold mb-2">₱2M+</div>
                                      <div className="small opacity-75">Scholarships Awarded</div>
                                  </div>
                                  <div className="col-4">
                                      <div className="display-6 fw-bold mb-2">95%</div>
                                      <div className="small opacity-75">Success Rate</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right Login Section - 4 columns */}
                  <div className="col-lg-4">
                      <div className="px-lg-4">

                          {/* Mobile Header (visible only on small screens) */}
                          <div className="text-center mb-4 d-lg-none">
                              <div
                                  className="rounded-4 d-flex align-items-center justify-content-center shadow-sm bg-white border mx-auto mb-3"
                                  style={{
                                      width: '80px',
                                      height: '80px'
                                  }}
                              >
                                  <img
                                      src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                                      alt="ISPSC Logo"
                                      className="img-fluid"
                                      style={{
                                          width: '60px',
                                          height: '60px',
                                          objectFit: 'contain'
                                      }}
                                  />
                              </div>
                              <h1 className="h3 fw-bold text-primary mb-2">
                                  Welcome to iScholar
                              </h1>
                              <p className="text-muted mb-0">
                                  Intelligent Scholarship Prequalification System
                              </p>
                          </div>

                          {/* Login Card */}
                          <div className="card border-0 shadow-lg rounded-4 bg-white">
                              <div className="card-body p-4">

                                  {/* Login Header */}
                                  <div className="text-center mb-4">
                                      <div className="d-flex align-items-center justify-content-center mb-3">
                                          <div
                                              className="d-flex align-items-center justify-content-center rounded-4 me-3 text-white"
                                              style={{
                                                  width: '50px',
                                                  height: '50px',
                                                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                                              }}
                                          >
                                              <LogIn size={24} />
                                          </div>
                                          <div className="text-start">
                                              <h2 className="h4 fw-bold mb-0">Student Login</h2>
                                              <small className="text-muted">Access your dashboard</small>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Login Form */}
                                  {errors && (
                                      <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
                                          <div className="d-flex align-items-center">
                                              <AlertCircle size={18} className="me-2" />
                                              {errors}
                                          </div>
                                      </div>
                                  )}

                                  <form onSubmit={handleSubmit} noValidate autoComplete="off">

                                      {/* Username Field */}
                                      <div className="mb-3">
                                          <label htmlFor="username" className="form-label fw-semibold text-secondary d-flex align-items-center">
                                              <User size={16} className="me-2" />
                                              Username
                                          </label>
                                          <div className="position-relative">
                                              <input
                                                  id="username"
                                                  type="text"
                                                  className="form-control form-control-lg rounded-3"
                                                  value={username}
                                                  onChange={(e) => setUsername(e.target.value)}
                                                  placeholder="Enter your username or student ID"
                                                  required
                                                  autoFocus
                                                  disabled={isLoading}
                                                  style={{
                                                      paddingLeft: '3rem',
                                                      border: '2px solid #e5e7eb',
                                                      transition: 'all 0.3s ease'
                                                  }}
                                                  onFocus={(e) => {
                                                      e.target.style.borderColor = '#3B82F6';
                                                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                  }}
                                                  onBlur={(e) => {
                                                      e.target.style.borderColor = '#e5e7eb';
                                                      e.target.style.boxShadow = 'none';
                                                  }}
                                              />
                                              <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                                                  <User size={18} className="text-muted" />
                                              </div>
                                          </div>
                                      </div>

                                      {/* Password Field */}
                                      <div className="mb-3">
                                          <label htmlFor="password" className="form-label fw-semibold text-secondary d-flex align-items-center">
                                              <Lock size={16} className="me-2" />
                                              Password
                                          </label>
                                          <div className="position-relative">
                                              <input
                                                  id="password"
                                                  type={showPassword ? 'text' : 'password'}
                                                  className="form-control form-control-lg rounded-3"
                                                  value={password}
                                                  onChange={(e) => setPassword(e.target.value)}
                                                  placeholder="Enter your password"
                                                  required
                                                  disabled={isLoading}
                                                  style={{
                                                      paddingLeft: '3rem',
                                                      paddingRight: '3rem',
                                                      border: '2px solid #e5e7eb',
                                                      transition: 'all 0.3s ease'
                                                  }}
                                                  onFocus={(e) => {
                                                      e.target.style.borderColor = '#3B82F6';
                                                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                  }}
                                                  onBlur={(e) => {
                                                      e.target.style.borderColor = '#e5e7eb';
                                                      e.target.style.boxShadow = 'none';
                                                  }}
                                              />
                                              <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                                                  <Lock size={18} className="text-muted" />
                                              </div>
                                              <button
                                                  type="button"
                                                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0"
                                                  onClick={togglePasswordVisibility}
                                                  disabled={isLoading}
                                                  style={{ zIndex: 10 }}
                                              >
                                                  {showPassword ? (
                                                      <EyeOff size={18} className="text-muted" />
                                                  ) : (
                                                      <Eye size={18} className="text-muted" />
                                                  )}
                                              </button>
                                          </div>
                                      </div>

                                      {/* Remember Me & Forgot Password */}
                                      <div className="d-flex justify-content-between align-items-center mb-4">
                                          <div className="form-check">
                                              <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  id="remember"
                                                  checked={remember}
                                                  onChange={handleRememberChange}
                                                  disabled={isLoading}
                                              />
                                              <label className="form-check-label text-muted small" htmlFor="remember">
                                                  Remember me
                                              </label>
                                          </div>
                                          <Link
                                              to="/forgot-password"
                                              className="text-primary text-decoration-none small fw-medium"
                                          >
                                              Forgot password?
                                          </Link>
                                      </div>

                                      {/* Login Button */}
                                      <div className="d-grid mb-3">
                                          <button
                                              type="submit"
                                              className="btn btn-lg fw-semibold border-0 rounded-3 text-white position-relative overflow-hidden"
                                              style={{
                                                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                                  padding: '0.875rem 2rem',
                                                  transition: 'all 0.3s ease',
                                                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                                              }}
                                              disabled={isLoading}
                                              onMouseOver={(e) => {
                                                  if (!isLoading) {
                                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.6)';
                                                  }
                                              }}
                                              onMouseOut={(e) => {
                                                  e.currentTarget.style.transform = 'translateY(0)';
                                                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                                              }}
                                          >
                                              {isLoading ? (
                                                  <>
                        <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                        ></span>
                                                      Signing in...
                                                  </>
                                              ) : (
                                                  <>
                                                      <LogIn size={18} className="me-2" />
                                                      LOGIN TO DASHBOARD
                                                  </>
                                              )}
                                          </button>
                                      </div>

                                      {/* Social Login Divider */}
                                      <div className="position-relative text-center mb-3">
                                          <hr className="my-3" />
                                          <span
                                              className="position-absolute top-50 start-50 translate-middle px-3 small text-muted"
                                              style={{ transform: 'translate(-50%, -50%)' }}
                                          >
                    or continue with
                  </span>
                                      </div>

                                      {/* Quick Actions */}
                                      <div className="row g-2 mb-3">
                                          <div className="col-6">
                                              <button
                                                  type="button"
                                                  className="btn btn-outline-secondary btn-sm w-100 rounded-3"
                                                  disabled={isLoading}
                                              >
                                                  <HelpCircle size={16} className="me-1" />
                                                  Help
                                              </button>
                                          </div>
                                          <div className="col-6">
                                              <Link
                                                  to="/application-status"
                                                  className="btn btn-outline-primary btn-sm w-100 rounded-3 text-decoration-none"
                                              >
                                                  <Search size={16} className="me-1" />
                                                  Track App
                                              </Link>
                                          </div>
                                      </div>
                                  </form>
                              </div>

                              {/* Register Link */}
                              <div className="card-footer text-center border-0 bg-light rounded-bottom-4 py-4">
                                  <div className="mb-2">
                                      <span className="text-muted small">New to iScholar?</span>
                                  </div>
                                  <Link
                                      to="/register"
                                      className="btn btn-outline-primary btn-sm rounded-3 px-4 text-decoration-none"
                                  >
                                      <UserPlus size={16} className="me-2" />
                                      Create Student Account
                                  </Link>
                                  <div className="mt-3">
                                      <small className="text-muted">
                                          By logging in, you agree to our
                                          <Link to="/terms" className="text-primary text-decoration-none ms-1 me-1">Terms</Link>
                                          and
                                          <Link to="/privacy" className="text-primary text-decoration-none ms-1">Privacy Policy</Link>
                                      </small>
                                  </div>
                              </div>
                          </div>

                          {/* Additional Info */}
                          <div className="text-center mt-4">
                              <div className="row g-2">
                                  <div className="col-4">
                                      <div className="text-primary small">
                                          <Clock size={16} className="d-block mx-auto mb-1" />
                                          24/7 Access
                                      </div>
                                  </div>
                                  <div className="col-4">
                                      <div className="text-success small">
                                          <Shield size={16} className="d-block mx-auto mb-1" />
                                          Secure Login
                                      </div>
                                  </div>
                                  <div className="col-4">
                                      <div className="text-info small">
                                          <Smartphone size={16} className="d-block mx-auto mb-1" />
                                          Mobile Ready
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Footer */}
          <div className="position-absolute bottom-0 w-100 py-3 text-center" style={{ zIndex: 2 }}>
              <div className="text-muted small">
                  <p className="mb-1">© {new Date().getFullYear()} iScholar - Ilocos Sur Polytechnic State College</p>
                  <p className="mb-0">Intelligent Scholarship Management System v2.0</p>
              </div>
          </div>

          <style>{`
    .text-gradient {
      background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .card {
      transition: all 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-2px);
    }
    
    .shadow-lg {
      box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.15) !important;
    }
    
    .form-control:focus {
      border-color: #3B82F6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    .btn:hover {
      transform: translateY(-1px);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    @media (max-width: 992px) {
      .min-vh-100 {
        padding: 2rem 0;
      }
      
      .card {
        margin: 0 1rem;
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .card {
      animation: fadeInUp 0.6s ease-out;
    }
    
    .alert {
      animation: fadeInUp 0.4s ease-out;
    }
  `}</style>
      </div>

  );
};

export default Login;
