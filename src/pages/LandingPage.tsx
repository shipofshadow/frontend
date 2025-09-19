  import React, { useState, useEffect } from 'react';
  import {
    LogIn,
    FileText,
    Users,
    Award,
    CheckCircle,
    Upload,
    Brain,
    TrendingUp,
    Calendar,
    GraduationCap,
    Sparkles,
    ChevronRight,
    Star,
    Quote
  } from 'lucide-react';
  import { useNavigate } from 'react-router-dom';

  // Type definitions
  interface Scholarship {
    id: number;
    name: string;
    description: string;
    grantamount: number;
    isactive: boolean;
  }

  interface EligibilityResult {
    score: number;
    classification: string;
    message: string;  
  }

  interface FAQ {
    question: string;
    answer: string;
  }

  interface Testimonial {
    name: string;
    course: string;
    scholarship: string;
    message: string;
    rating: number;
  }

  const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeScholarships, setActiveScholarships] = useState<Scholarship[]>([]);
    const [statistics, setStatistics] = useState({
      totalScholarships: 0,
      totalApplications: 0,
      approvedStudents: 0
    });
    const [eligibilityForm, setEligibilityForm] = useState({
      gwa: '',
      income: ''
    });
    const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Sample data (replace with API calls)
    const sampleScholarships: Scholarship[] = [
      {
        id: 1,
        name: 'Academic Excellence Scholarship',
        description: 'For students with outstanding academic performance and demonstrated leadership potential.',
        grantamount: 25000,
        isactive: true
      },
      {
        id: 2,
        name: 'STEM Innovators Grant',
        description: 'Supporting students in science, technology, engineering, and mathematics fields.',
        grantamount: 30000,
        isactive: true
      },
      {
        id: 3,
        name: 'Community Service Award',
        description: 'Recognizing students who have made significant contributions to their communities.',
        grantamount: 15000,
        isactive: true
      }
    ];

    const testimonials: Testimonial[] = [
      {
        name: 'Maria Santos',
        course: 'BS Computer Science',
        scholarship: 'STEM Innovators Grant',
        message: 'iScholar made the application process so simple. The intelligent matching helped me find scholarships I never knew existed!',
        rating: 5
      },
      {
        name: 'Juan Dela Cruz',
        course: 'BS Education',
        scholarship: 'Academic Excellence Scholarship',
        message: 'Thanks to iScholar\'s transparent tracking system, I always knew the status of my application. The support was exceptional.',
        rating: 5
      },
      {
        name: 'Anna Reyes',
        course: 'BS Nursing',
        scholarship: 'Community Service Award',
        message: 'The fuzzy logic evaluation system is amazing - it accurately matched me with scholarships based on my background.',
        rating: 4
      }
    ];

    const faqs: FAQ[] = [
      {
        question: 'Who can apply for scholarships through iScholar?',
        answer: 'All enrolled students at Ilocos Sur Polytechnic State College can apply. Eligibility varies by scholarship, but generally includes academic performance, family income, and other criteria evaluated by our intelligent system.'
      },
      {
        question: 'What documents do I need to upload?',
        answer: 'Required documents typically include: Income Tax Return (ITR), academic transcripts/grades, birth certificate, and other supporting documents depending on the specific scholarship requirements.'
      },
      {
        question: 'How are students evaluated for scholarships?',
        answer: 'iScholar uses an advanced fuzzy logic evaluation system that considers multiple factors including GWA, family income, parent occupation, number of siblings, and other socio-economic indicators to provide fair and intelligent matching.'
      },
      {
        question: 'How long does the evaluation process take?',
        answer: 'Initial eligibility assessment is instant through our AI system. Full application review typically takes 2-3 weeks, and you can track your status in real-time through your dashboard.'
      },
      {
        question: 'Can I apply for multiple scholarships?',
        answer: 'Yes! Our intelligent system will automatically recommend multiple scholarships you\'re eligible for. You can apply to as many as you qualify for to maximize your chances.'
      },
      {
        question: 'Is there an application fee?',
        answer: 'No, the iScholar application process is completely free for all students.'
      }
    ];

    useEffect(() => {
      // Simulate API calls
      setActiveScholarships(sampleScholarships);
      setStatistics({
        totalScholarships: 12,
        totalApplications: 847,
        approvedStudents: 324
      });
    }, []);

    const handleNavigation = (path: string) => {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEligibilityCheck = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!eligibilityForm.gwa || !eligibilityForm.income) return;

      setLoading(true);

      // Simulate fuzzy logic evaluation
      setTimeout(() => {
        const gwa = parseFloat(eligibilityForm.gwa);
        const income = parseFloat(eligibilityForm.income);

        let score = 0;
        let classification = '';
        let message = '';

        // Simple fuzzy logic simulation
        if (gwa >= 1.0 && gwa <= 1.5 && income <= 50000) {
          score = 95;
          classification = 'Highly Eligible';
          message = 'Excellent! You qualify for most scholarships. Register now to see your full recommendations.';
        } else if (gwa >= 1.5 && gwa <= 2.0 && income <= 100000) {
          score = 75;
          classification = 'Eligible';
          message = 'Good! You qualify for several scholarships. Create your profile to explore options.';
        } else if (gwa >= 2.0 && gwa <= 3.0 && income <= 200000) {
          score = 50;
          classification = 'Moderately Eligible';
          message = 'You may qualify for some scholarships. Complete your application to see available opportunities.';
        } else {
          score = 25;
          classification = 'Limited Eligibility';
          message = 'Limited options available, but don\'t give up! Some scholarships have different criteria.';
        }

        setEligibilityResult({ score, classification, message });
        setLoading(false);
      }, 1500);
    };

    const toggleFAQ = (index: number) => {
      setOpenFAQ(openFAQ === index ? null : index);
    };

    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }, (_, i) => (
          <Star
              key={i}
              size={16}
              className={i < rating ? 'text-warning' : 'text-muted'}
              fill={i < rating ? 'currentColor' : 'none'}
          />
      ));
    };

    return (
        <div className="min-vh-100 bg-light">
          {/* Hero Section */}
          <section className="bg-primary text-white py-5 position-relative overflow-hidden">
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{
              background: 'linear-gradient(135deg, #0066cc 0%, #004499 50%, #003377 100%)',
              opacity: 0.9
            }}></div>

            <div className="container position-relative" style={{ zIndex: 2 }}>
              <div className="row align-items-center min-vh-75">
                <div className="col-lg-6">
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
                      Login
                    </button>
                    <button
                        className="btn btn-outline-light btn-lg px-4"
                        onClick={() => handleNavigation('/register')}
                    >
                      <FileText size={20} className="me-2" />
                      Register & Apply
                    </button>
                  </div>
                </div>

                <div className="col-lg-6 text-center">
                  <div className="position-relative">
                    <GraduationCap size={200} className="text-white" style={{ opacity: 0.3 }} />
                    <Sparkles
                        size={60}
                        className="position-absolute top-0 end-0 text-warning"
                        style={{ animation: 'pulse 2s infinite' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="py-4 bg-white shadow-sm">
            <div className="container">
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Award className="text-primary me-2" size={24} />
                    <h3 className="h2 fw-bold text-primary mb-0">{statistics.totalScholarships}</h3>
                  </div>
                  <p className="text-muted mb-0">Active Scholarships</p>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Users className="text-success me-2" size={24} />
                    <h3 className="h2 fw-bold text-success mb-0">{statistics.totalApplications}</h3>
                  </div>
                  <p className="text-muted mb-0">Total Applications</p>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <CheckCircle className="text-warning me-2" size={24} />
                    <h3 className="h2 fw-bold text-warning mb-0">{statistics.approvedStudents}</h3>
                  </div>
                  <p className="text-muted mb-0">Approved Students</p>
                </div>
              </div>
            </div>
          </section>

          {/* Scholarship Highlights */}
          <section className="py-5">
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="display-6 fw-bold">Featured Scholarships</h2>
                <p className="lead text-muted">Discover opportunities that match your profile</p>
              </div>

              <div className="row g-4">
                {activeScholarships.map((scholarship) => (
                    <div key={scholarship.id} className="col-lg-4">
                      <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                          <div className="d-flex align-items-start justify-content-between mb-3">
                            <Award className="text-primary" size={32} />
                            <span className="badge bg-success">Active</span>
                          </div>
                          <h5 className="card-title fw-bold">{scholarship.name}</h5>
                          <p className="card-text text-muted">{scholarship.description}</p>
                          <div className="d-flex align-items-center justify-content-between mt-3">
                            <div>
                              <small className="text-muted">Grant Amount</small>
                              <div className="fw-bold text-success h5">
                                ₱{scholarship.grantamount.toLocaleString()}
                              </div>
                            </div>
                            <button className="btn btn-outline-primary">
                              Learn More
                              <ChevronRight size={16} className="ms-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>

              <div className="text-center mt-4">
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => handleNavigation('/scholarships')}
                >
                  See All Scholarships
                </button>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-5 bg-light">
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="display-6 fw-bold">How iScholar Works</h2>
                <p className="lead text-muted">Your journey to scholarship success in 4 simple steps</p>
              </div>

              <div className="row g-4">
                <div className="col-lg-3 col-md-6">
                  <div className="card text-center h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                        <Users size={28} />
                      </div>
                      <h5 className="fw-bold">1. Register</h5>
                      <p className="text-muted">Create your account and set up your student profile with basic information.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="card text-center h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                        <FileText size={28} />
                      </div>
                      <h5 className="fw-bold">2. Complete Profile</h5>
                      <p className="text-muted">Fill in your academic, family, and financial information for accurate matching.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="card text-center h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                        <Upload size={28} />
                      </div>
                      <h5 className="fw-bold">3. Upload Documents</h5>
                      <p className="text-muted">Submit required documents: ITR, grades, birth certificate, and other files.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="card text-center h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                        <Brain size={28} />
                      </div>
                      <h5 className="fw-bold">4. Get Matched</h5>
                      <p className="text-muted">Our AI system evaluates and recommends the best scholarships for you.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Use iScholar */}
          <section className="py-5">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-6">
                  <h2 className="display-6 fw-bold mb-4">Why Choose iScholar?</h2>

                  <div className="mb-4">
                    <div className="d-flex align-items-start mb-3">
                      <Brain className="text-primary me-3 mt-1" size={24} />
                      <div>
                        <h5 className="fw-bold">Intelligent Matching</h5>
                        <p className="text-muted">Our advanced fuzzy logic system analyzes multiple criteria to find scholarships perfectly suited to your profile.</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                      <TrendingUp className="text-success me-3 mt-1" size={24} />
                      <div>
                        <h5 className="fw-bold">Transparent Tracking</h5>
                        <p className="text-muted">Real-time status updates keep you informed throughout the entire application process.</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                      <CheckCircle className="text-warning me-3 mt-1" size={24} />
                      <div>
                        <h5 className="fw-bold">Time-Saving</h5>
                        <p className="text-muted">No more manual searching - we automatically identify all scholarships you qualify for.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="bg-primary text-white p-4 rounded-3">
                    <h4 className="fw-bold mb-3">Quick Statistics</h4>
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="text-center">
                          <div className="h2 fw-bold">98%</div>
                          <small>Accuracy Rate</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-center">
                          <div className="h2 fw-bold">45%</div>
                          <small>Success Rate</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-center">
                          <div className="h2 fw-bold">24/7</div>
                          <small>System Access</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-center">
                          <div className="h2 fw-bold">FREE</div>
                          <small>Application Cost</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Announcements */}
          <section className="py-5 bg-light">
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="display-6 fw-bold">Latest Announcements</h2>
                <p className="lead text-muted">Stay updated with important deadlines and new programs</p>
              </div>

              <div className="row g-4">
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <Calendar className="text-danger me-2" size={20} />
                        <span className="badge bg-danger">Deadline</span>
                      </div>
                      <h5 className="fw-bold">1st Semester Applications</h5>
                      <p className="text-muted">Application deadline for 1st Semester scholarships: September 30, 2025</p>
                      <small className="text-muted">Posted: September 1, 2025</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <Award className="text-success me-2" size={20} />
                        <span className="badge bg-success">New Program</span>
                      </div>
                      <h5 className="fw-bold">STEM Excellence Program</h5>
                      <p className="text-muted">New scholarship program launched for Science and Technology students.</p>
                      <small className="text-muted">Posted: August 28, 2025</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <CheckCircle className="text-primary me-2" size={20} />
                        <span className="badge bg-primary">Update</span>
                      </div>
                      <h5 className="fw-bold">System Enhancement</h5>
                      <p className="text-muted">New features added to improve application tracking and document management.</p>
                      <small className="text-muted">Posted: August 25, 2025</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Eligibility Checker */}
          <section className="py-5">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-lg">
                    <div className="card-body p-5">
                      <div className="text-center mb-4">
                        <Brain className="text-primary mb-3" size={48} />
                        <h3 className="fw-bold">Quick Eligibility Check</h3>
                        <p className="text-muted">Get an instant assessment of your scholarship eligibility</p>
                      </div>

                      <form onSubmit={handleEligibilityCheck}>
                        <div className="row g-3 mb-4">
                          <div className="col-md-6">
                            <label htmlFor="gwa" className="form-label fw-semibold">
                              General Weighted Average (GWA)
                            </label>
                            <input
                                type="number"
                                className="form-control form-control-lg"
                                id="gwa"
                                step="0.01"
                                min="1.00"
                                max="5.00"
                                placeholder="e.g., 1.75"
                                value={eligibilityForm.gwa}
                                onChange={(e) => setEligibilityForm({...eligibilityForm, gwa: e.target.value})}
                                required
                            />
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="income" className="form-label fw-semibold">
                              Annual Family Income (₱)
                            </label>
                            <input
                                type="number"
                                className="form-control form-control-lg"
                                id="income"
                                placeholder="e.g., 150000"
                                value={eligibilityForm.income}
                                onChange={(e) => setEligibilityForm({...eligibilityForm, income: e.target.value})}
                                required
                            />
                          </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100"
                            disabled={loading}
                        >
                          {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Analyzing...
                              </>
                          ) : (
                              'Check Eligibility'
                          )}
                        </button>
                      </form>

                      {eligibilityResult && (
                          <div className="mt-4">
                            <div className={`alert ${
                                eligibilityResult.score >= 80 ? 'alert-success' :
                                    eligibilityResult.score >= 60 ? 'alert-warning' : 'alert-info'
                            } border-0`}>
                              <div className="d-flex align-items-center mb-2">
                                <div className="flex-grow-1">
                                  <h5 className="mb-0">{eligibilityResult.classification}</h5>
                                  <small>Eligibility Score: {eligibilityResult.score}/100</small>
                                </div>
                                <div className="text-end">
                                  <div
                                      className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold"
                                      style={{ width: '40px', height: '40px' }}
                                  >
                                    {eligibilityResult.score}
                                  </div>
                                </div>
                              </div>
                              <p className="mb-0">{eligibilityResult.message}</p>
                            </div>
                            <div className="text-center">
                              <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleNavigation('/register')}
                              >
                                Register Now to See Full Recommendations
                              </button>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-5 bg-light">
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="display-6 fw-bold">Student Success Stories</h2>
                <p className="lead text-muted">Hear from students who found their perfect scholarships through iScholar</p>
              </div>

              <div className="row g-4">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="col-lg-4">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <Quote className="text-primary me-2" size={24} />
                            <div className="d-flex">
                              {renderStars(testimonial.rating)}
                            </div>
                          </div>
                          <p className="text-muted mb-4">"{testimonial.message}"</p>
                          <div className="border-top pt-3">
                            <h6 className="fw-bold mb-1">{testimonial.name}</h6>
                            <small className="text-muted">{testimonial.course}</small>
                            <div className="mt-2">
                              <span className="badge bg-success">{testimonial.scholarship}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-5">
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="display-6 fw-bold">Frequently Asked Questions</h2>
                <p className="lead text-muted">Find answers to common questions about iScholar</p>
              </div>

              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div className="accordion" id="faqAccordion">
                    {faqs.map((faq, index) => (
                        <div key={index} className="accordion-item border-0 shadow-sm mb-3">
                          <h2 className="accordion-header">
                            <button
                                className={`accordion-button ${openFAQ !== index ? 'collapsed' : ''} fw-semibold`}
                                type="button"
                                onClick={() => toggleFAQ(index)}
                                style={{ backgroundColor: openFAQ === index ? '#f8f9fa' : 'white' }}
                            >
                              {faq.question}

                            </button>
                          </h2>
                          <div className={`accordion-collapse ${openFAQ === index ? 'show' : 'collapse'}`}>
                            <div className="accordion-body text-muted">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support & Footer */}

          {/* Custom Styles */}
          <style>{`
          .min-vh-75 {
            min-height: 75vh;
          }
          
          .accordion-button:not(.collapsed) {
            color: #0d6efd;
            box-shadow: none;
          }
          
          .accordion-button:focus {
            box-shadow: none;
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.05);
            }
          }
          
          .card {
            transition: transform 0.2s ease-in-out;
          }
          
          .card:hover {
            transform: translateY(-2px);
          }
          
          @media (max-width: 768px) {
            .display-4 {
              font-size: 2.5rem;
            }
            
            .display-6 {
              font-size: 2rem;
            }
          }
        `}</style>
        </div>
    );
  };

  const App: React.FC = () => {
    return <LandingPage />;
  };

  export default App;