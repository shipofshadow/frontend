import { LogIn, GraduationCap, BookOpen, Award, DollarSign, Users, Target, TrendingUp } from 'lucide-react';
import {useNavigate} from "react-router-dom";

const Hero = () => {

    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        console.log('Navigate to:', path);
        navigate(path);
    };

    return (
        <section className="bg-primary text-white py-5 position-relative overflow-hidden">
            <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                    background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                    zIndex: 1
                }}
            />

            <div className="container position-relative mt-5" style={{ zIndex: 2 }}>
                <div className="row align-items-center" style={{ minHeight: '75vh' }}>
                    <div className="col-lg-6 mb-5 mb-lg-0">
                        <div className="d-flex align-items-center mb-4">
                            <img
                                src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                                alt="ISPSC Logo"
                                className="me-3"
                                style={{ width: '80px', height: '80px' }}
                            />
                            <div>
                                <h1 className="display-4 fw-bold mb-0">iScholar</h1>
                                <p className="lead mb-0">Your Gateway to Scholarship Opportunities</p>
                            </div>
                        </div>

                        <h2 className="h3 fw-semibold mb-4">
                            An Intelligent Scholarship Prequalification System
                        </h2>

                        <p className="lead mb-4">
                            Streamline your scholarship journey with AI-powered matching, transparent tracking,
                            and comprehensive support from Ilocos Sur Polytechnic State College.
                        </p>

                        <div className="d-flex flex-wrap gap-3">
                            <button
                                className="btn btn-light btn-lg px-4"
                                onClick={() => handleNavigation('/login')}
                            >
                                <LogIn size={20} className="me-2" />
                                Get Started
                            </button>
                        </div>
                    </div>

                    <div className="col-lg-6 d-flex justify-content-center align-items-center d-none d-lg-flex">
                        <div className="orbit-system">
                            {/* Center Icon */}
                            <div className="orbit-center">
                                <GraduationCap size={80} className="text-white" />
                            </div>

                            {/* Orbit 1 - Inner */}
                            <div className="orbit orbit-1">
                                <div className="orbit-icon orbit-icon-1">
                                    <BookOpen size={24} className="text-white" />
                                </div>
                                <div className="orbit-icon orbit-icon-2">
                                    <Award size={24} className="text-warning" />
                                </div>
                            </div>

                            {/* Orbit 2 - Middle */}
                            <div className="orbit orbit-2">
                                <div className="orbit-icon orbit-icon-3">
                                    <DollarSign size={24} className="text-success" />
                                </div>
                                <div className="orbit-icon orbit-icon-4">
                                    <Users size={24} className="text-info" />
                                </div>
                            </div>

                            {/* Orbit 3 - Outer */}
                            <div className="orbit orbit-3">
                                <div className="orbit-icon orbit-icon-5">
                                    <Target size={24} className="text-danger" />
                                </div>
                                <div className="orbit-icon orbit-icon-6">
                                    <TrendingUp size={24} className="text-warning" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .orbit-system {
          position: relative;
          width: 400px;
          height: 400px;
        }

        .orbit-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .orbit {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .orbit-1 {
          width: 180px;
          height: 180px;
          animation: rotate 20s linear infinite;
        }

        .orbit-2 {
          width: 280px;
          height: 280px;
          animation: rotate 30s linear infinite reverse;
        }

        .orbit-3 {
          width: 380px;
          height: 380px;
          animation: rotate 40s linear infinite;
        }

        .orbit-icon {
          position: absolute;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          padding: 12px;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: counterRotate 20s linear infinite;
        }

        /* Position icons on each orbit */
        .orbit-icon-1 {
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          animation-duration: 20s;
        }

        .orbit-icon-2 {
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          animation-duration: 20s;
        }

        .orbit-icon-3 {
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          animation-duration: 30s;
          animation-direction: reverse;
        }

        .orbit-icon-4 {
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          animation-duration: 30s;
          animation-direction: reverse;
        }

        .orbit-icon-5 {
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          animation-duration: 40s;
        }

        .orbit-icon-6 {
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          animation-duration: 40s;
        }

        @keyframes rotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes counterRotate {
          from {
            transform: translateX(-50%) rotate(0deg);
          }
          to {
            transform: translateX(-50%) rotate(-360deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 992px) {
          .orbit-system {
            width: 300px;
            height: 300px;
          }

          .orbit-1 {
            width: 140px;
            height: 140px;
          }

          .orbit-2 {
            width: 220px;
            height: 220px;
          }

          .orbit-3 {
            width: 300px;
            height: 300px;
          }

          .orbit-center svg {
            width: 60px;
            height: 60px;
          }

          .orbit-icon svg {
            width: 24px;
            height: 24px;
          }

          .orbit-icon {
            padding: 8px;
          }
        }

        @media (max-width: 576px) {
          .orbit-system {
            width: 250px;
            height: 250px;
          }

          .orbit-1 {
            width: 120px;
            height: 120px;
          }

          .orbit-2 {
            width: 180px;
            height: 180px;
          }

          .orbit-3 {
            width: 250px;
            height: 250px;
          }
        }
      `}</style>
        </section>
    );
};

export default Hero;