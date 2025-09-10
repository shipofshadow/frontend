import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { notyf } from '../utils/utils';
import { User, Lock, Eye, EyeOff, LogIn, GraduationCap } from 'lucide-react';
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
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5 col-xl-4">

              {/* Header with logo - matching landing page style */}
              <div className="text-center mb-4">
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

              {/* Login Card - matching landing page card style */}
              <div className="card border-0 shadow-lg rounded-3 bg-white">
                <div className="card-body p-4">
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
                      <div>
                        <h2 className="h4 fw-bold mb-0">Student Login</h2>
                        <small className="text-muted">Access your dashboard</small>
                      </div>
                    </div>
                  </div>

                  {errors && (
                      <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
                        {errors}
                      </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate autoComplete="off">
                    {/* Username Field */}
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label fw-semibold text-secondary">
                        Username
                      </label>
                      <div className="position-relative">
                        <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                          <User size={18} className="text-muted" />
                        </div>
                        <input
                            id="username"
                            type="text"
                            className="form-control form-control-lg ps-5"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username or student ID"
                            required
                            autoFocus
                            disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label fw-semibold text-secondary">
                        Password
                      </label>
                      <div className="position-relative">
                        <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                          <Lock size={18} className="text-muted" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="form-control form-control-lg ps-5 pe-5"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0"
                            onClick={togglePasswordVisibility}
                            disabled={isLoading}
                        >
                          {showPassword ? (
                              <EyeOff size={18} className="text-muted" />
                          ) : (
                              <Eye size={18} className="text-muted" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="form-check mb-4">
                      <input
                          className="form-check-input"
                          type="checkbox"
                          id="remember"
                          checked={remember}
                          onChange={handleRememberChange}
                          disabled={isLoading}
                      />
                      <label className="form-check-label text-muted" htmlFor="remember">
                        Remember me
                      </label>
                    </div>

                    {/* Login Button - matching landing page button style */}
                    <div className="d-grid mb-3">
                      <button
                          type="submit"
                          className="btn btn-primary btn-lg fw-semibold border-0 rounded-3 text-white"
                          style={{
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                            padding: '0.75rem 2rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                          }}
                          disabled={isLoading}
                          onMouseOver={(e) => {
                            if (!isLoading) {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.6)';
                            }
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                          }}
                      >
                        {isLoading ? (
                            <>
                          <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                          ></span>
                              Logging in...
                            </>
                        ) : (
                            'LOGIN'
                        )}
                      </button>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-center">
                      <Link
                          to="/forgot-password"
                          className="text-decoration-none text-muted small"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </form>
                </div>

                {/* Register Link - matching landing page footer style */}
                <div className="card-footer text-center border-0 bg-white py-3">
                  <span className="text-muted small">Don't have an account?</span>
                  <br />
                  <Link
                      to="/register"
                      className="text-primary fw-semibold text-decoration-none mt-1 d-inline-block"
                  >
                    <GraduationCap size={16} className="me-1" />
                    Create Student Account
                  </Link>
                </div>
              </div>

              {/* Footer - matching landing page footer */}
              <div className="text-center mt-4">
                <div className="text-muted small">
                  <p className="mb-0">© {new Date().getFullYear()} iScholar - Ilocos Sur Polytechnic State College</p>
                  <p className="mb-0">Intelligent Scholarship Management System</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .card {
          border-radius: 1rem !important;
        }
        
        .shadow-lg {
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }
        
        .form-control:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
        }
        
        @media (max-width: 768px) {
          .card {
            margin: 1rem;
          }
        }
      `}</style>
      </div>
  );
};

export default Login;
