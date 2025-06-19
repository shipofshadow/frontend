import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { notyf } from '../utils/utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import "notyf/notyf.min.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/applicant/home');
    }
  }, [isAuthenticated, navigate]);

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
      console.log('Login response:', response);

      if (remember) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      login(user, token, refresh_token);
      console.log("Is Authenticated After Login?", isAuthenticated);

      notyf.success('Login successful!');

      // Navigate immediately since we're now authenticated
      navigate('/applicant/home');

    } catch (err) {
      setErrors(err instanceof Error ? err.message : 'Login failed');
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

  return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
        <div className="container" style={{ zIndex: 2 }}>
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5 col-xl-4">
              <div className="text-center mb-4">
                <img
                    src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                    alt="ISPSC Logo"
                    width={80}
                    height={80}
                />
              </div>

              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-body p-4">
                  <h1 className="fs-3 fw-bold text-primary mb-4 text-center">Login to iScholar</h1>

                  {errors && <div className="alert alert-danger">{errors}</div>}

                  <form onSubmit={handleSubmit} noValidate autoComplete="off">
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label text-muted">Username</label>
                      <input
                          id="username"
                          type="text"
                          className="form-control"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          autoFocus
                          disabled={isLoading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label text-muted">Password</label>
                      <input
                          id="password"
                          type="password"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                      />
                    </div>

                    <div className="form-check mb-3">
                      <input
                          className="form-check-input"
                          type="checkbox"
                          id="remember"
                          checked={remember}
                          onChange={handleRememberChange}
                          disabled={isLoading}
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Remember me
                      </label>
                    </div>

                    <div className="d-grid mb-3">
                      <button
                          type="submit"
                          className="btn btn-primary btn-lg shadow-sm"
                          disabled={isLoading}
                      >
                        {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                      </button>
                    </div>

                    <div className="text-center small">
                      <Link to="forgot-password" className="text-muted">Forgot password?</Link>
                    </div>
                  </form>
                </div>

                <div className="card-footer text-center border-0 bg-white py-3">
                  <span className="text-muted small">Don't have an account?</span>{' '}
                  <Link to="/applicant/register" className="text-primary fw-semibold">Create one</Link>
                </div>
              </div>

              <div className="text-center mt-4 text-muted small">
                &copy; {new Date().getFullYear()} iScholar — Ilocos Sur Polytechnic State College
              </div>
            </div>
          </div>
        </div>

        <style>
          {`
          @keyframes float0 {
            0%, 100% { transform: translateY(0); opacity: 0.3; }
            50% { transform: translateY(-10px); opacity: 0.6; }
          }
          @keyframes float1 {
            0%, 100% { transform: translateX(0); opacity: 0.2; }
            50% { transform: translateX(10px); opacity: 0.5; }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
            33% { transform: translate(5px, -5px) rotate(120deg); opacity: 0.6; }
            66% { transform: translate(-5px, 5px) rotate(240deg); opacity: 0.4; }
          }
        `}
        </style>
      </div>
  );
};

export default Login;