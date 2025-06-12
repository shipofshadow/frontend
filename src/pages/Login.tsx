import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { saveAuthToken } from '../utils/auth';
import { notyf } from '../utils/utils'; 
import 'notyf/notyf.min.css'; // for React, Vue and Svelte


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setErrors('Email and password are required.');
      return;
    }

    try {
      setErrors(null);
      const data = await loginUser(email, password);
      
      // Handle remember me functionality
      if (remember) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      saveAuthToken(data.token, data.expires_in);

      notyf.success('Login successful!');

      setTimeout(() => {
        navigate('/applicant/profile');
      }
      , 3000);

    } catch (err) {
      setErrors(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRemember(isChecked);
    
    if (!isChecked) {
      localStorage.removeItem('rememberedEmail');
    }
  };
  
  return (
    <>
    

      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
        <div
          className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden"
          style={{ pointerEvents: 'none', zIndex: 1 }}
        >
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="position-absolute rounded-circle"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `float${i % 3} ${8 + Math.random() * 4}s infinite ease-in-out`,
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
        </div>

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
                      <label htmlFor="email" className="form-label text-muted">Email</label>
                      <input
                        id="email"
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
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
                      />
                    </div>

                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="remember"
                        checked={remember}
                        onChange={handleRememberChange}
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Remember me
                      </label>
                    </div>

                    <div className="d-grid mb-3">
                      <button type="submit" className="btn btn-primary btn-lg shadow-sm">
                        Login
                      </button>
                    </div>

                    <div className="text-center small">
                      <a href="/forgot-password" className="text-muted">Forgot password?</a>
                    </div>
                  </form>
                </div>

                <div className="card-footer text-center border-0 bg-white py-3">
                  <span className="text-muted small">Don't have an account?</span>{' '}
                  <a href="/register" className="text-primary fw-semibold">Create one</a>
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
    </>
  );
};

export default Login;