import React from 'react';
import { LogIn, FileText, Grid, Sparkles, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Type definitions
interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
  btnText: string;
  path: string;
  color: string;
  bgGradient: string;
}

interface NavigationHandler {
  (path: string): void;
}

// Floating particles component
const FloatingParticles: React.FC = () => {
  return (
    <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{
      pointerEvents: 'none',
      zIndex: 1
    }}>
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
  );
};

const LandingPage: React.FC = () => {

  const navigate = useNavigate();

  const handleNavigation: NavigationHandler = (path: string): void => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features: Feature[] = [
    {
      icon: <LogIn size={48} />,
      title: 'Login',
      description: 'Access your account securely to manage your scholar profile and application status with advanced security features.',
      btnText: 'LOGIN',
      path: '/applicant/',
      color: '#3B82F6',
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
    },
    {
      icon: <FileText size={48} />,
      title: 'Apply',
      description: 'Submit your scholarship prequalification application quickly and easily with our streamlined process.',
      btnText: 'APPLY',
      path: '/applicant/apply',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    {
      icon: <Grid size={48} />,
      title: 'Scholarship Programs',
      description: 'Explore available scholarships, eligibility criteria, and benefits tailored to your academic journey.',
      btnText: 'EXPLORE',
      path: '/programs',
      color: '#F59E0B',
      bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    }
  ];

  return (
    <>
      {/* Bootstrap 5 CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div className="min-vh-100 position-relative overflow-hidden bg-light">
        <FloatingParticles />
        
        {/* Header Section */}
        <section className="py-5 position-relative bg-white shadow-sm" style={{ zIndex: 2 }}>
          <div className="container-fluid px-4">
            {/* Logo */}
            <div 
              className="position-absolute rounded-4 d-flex align-items-center justify-content-center shadow-sm bg-white border"
              style={{
                top: '2rem',
                left: '2rem',
                width: '80px',
                height: '80px',
                transition: 'all 0.3s ease'
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

            {/* Hero Content */}
            <div className="row justify-content-center mt-5">
              <div className="col-12 col-lg-10 col-xl-8">
                <div className="text-center p-5 rounded-3 bg-white shadow-lg mt-4">
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                    <GraduationCap size={48} className="text-primary" />
                    <Sparkles size={32} className="text-warning" style={{ animation: 'pulse 2s infinite' }} />
                  </div>
                  
                  <h1 className="display-1 fw-bold mb-4 text-primary">
                    iScholar
                  </h1>
                  
                  <h2 className="h3 fw-semibold mb-3 text-secondary">
                    An Intelligent Scholarship Prequalification System
                  </h2>
                  
                  <p className="h5 fw-semibold mb-4 text-muted">
                    ILOCOS SUR POLYTECHNIC STATE COLLEGE
                  </p>
                  
                  <p className="lead mb-5 mx-auto text-muted" style={{ 
                    maxWidth: '700px',
                    lineHeight: '1.7'
                  }}>
                    Welcome to iScholar — an intelligent platform designed to revolutionize and streamline the scholarship prequalification process for students and administrators with cutting-edge technology.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-5 position-relative" style={{ zIndex: 2 }}>
          <div className="container-fluid px-4">
            <div className="row g-4 justify-content-center">
              {features.map(({ icon, title, description, btnText, path, color, bgGradient }: Feature, idx: number) => (
                <div key={idx} className="col-12 col-md-6 col-lg-4">
                  <div
                    className="card h-100 border-0 shadow-lg position-relative overflow-hidden"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: 'translateY(0)'
                    }}
                    onClick={() => handleNavigation(path)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = `0 20px 40px ${color}30`;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
                    }}
                  >
                    <div className="card-body p-4 text-center">
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-4 mb-4 mx-auto text-white"
                        style={{
                          width: '80px',
                          height: '80px',
                          background: bgGradient,
                          boxShadow: `0 8px 24px ${color}40`
                        }}
                      >
                        {icon}
                      </div>
                      
                      <h3 className="card-title h4 fw-bold mb-3">
                        {title}
                      </h3>
                      
                      <p className="card-text mb-4 text-muted lh-base">
                        {description}
                      </p>
                      
                      <button
                        type="button"
                        className="btn btn-lg fw-semibold border-0 rounded-3 text-white"
                        style={{
                          background: bgGradient,
                          padding: '0.75rem 2rem',
                          transition: 'all 0.3s ease',
                          letterSpacing: '0.05em',
                          boxShadow: `0 4px 12px ${color}40`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation(path);
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = `0 8px 20px ${color}60`;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
                        }}
                      >
                        {btnText}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="py-4 bg-white border-top mt-5">
          <div className="container-fluid px-4">
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="mb-0 text-muted">
                  © 2025 iScholar - Ilocos Sur Polytechnic State College
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <small className="text-muted">
                  Intelligent Scholarship Management System
                </small>
              </div>
            </div>
          </div>
        </footer>

        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.1); }
            }
            @keyframes twinkle {
              0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
              50% { opacity: 0.5; transform: scale(0.8) rotate(180deg); }
            }
            @keyframes float0 {
              0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
              50% { transform: translateY(-15px) rotate(180deg); opacity: 0.6; }
            }
            @keyframes float1 {
              0%, 100% { transform: translateX(0px) scale(1); opacity: 0.2; }
              50% { transform: translateX(15px) scale(1.1); opacity: 0.5; }
            }
            @keyframes float2 {
              0%, 100% { transform: translate(0px, 0px) rotate(0deg); opacity: 0.3; }
              33% { transform: translate(8px, -8px) rotate(120deg); opacity: 0.6; }
              66% { transform: translate(-8px, 8px) rotate(240deg); opacity: 0.4; }
            }
            
            body {
              margin: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            .container-fluid {
              max-width: 1400px;
            }

            .card {
              border-radius: 1rem !important;
            }

            .shadow-lg {
              box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
            }

            @media (max-width: 768px) {
              .display-1 {
                font-size: 3rem !important;
              }
              
              .position-absolute {
                position: relative !important;
                top: auto !important;
                left: auto !important;
                margin: 0 auto 2rem auto !important;
              }
            }
          `}
        </style>
      </div>
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  return <LandingPage />;
};

export default App;