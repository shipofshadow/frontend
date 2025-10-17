import React, { useState, useEffect } from 'react';
import {
    FileText,
    Users,
    Award,
    CheckCircle,
    Upload,
    Brain,
    TrendingUp,
    Calendar,
    Star,
    Quote,
    ArrowRight,
    Shield,
    Clock,
    Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hero from "../components/Hero.tsx";
import { API_BASE_URL } from "../config.ts";

// Type definitions
interface Scholarship {
    id: number;
    name: string;
    description: string;
    grant_amount: number;
    is_active: boolean;
    rules: {
        min_gwa?: number | null;
        max_gwa?: number | null;
        min_income?: number | null;
        max_income?: number | null;
        priorities?: {
            must_be_ofw?: boolean;
            prefer_pwd?: boolean;
            require_ip?: boolean;
            prefer_farmers_child?: boolean;
        };
    };
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
        income: '',
        total_units: ''
    });
    const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchScholarships = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/scholarships/`);
                if (!res.ok) throw new Error("Failed to fetch scholarships");
                const data = await res.json();
                setActiveScholarships(data.filter((s: Scholarship) => s.is_active).slice(0, 6));

                const active_res = await fetch(`${API_BASE_URL}/api/dashboard/active-applicants`);
                if (!active_res.ok) throw new Error("Failed to fetch scholarships");
                const active_applicants = await active_res.json();

                const approved_res = await fetch(`${API_BASE_URL}/api/dashboard/approved-applicants`);
                if (!approved_res.ok) throw new Error("Failed to fetch scholarships");
                const approved_applicants = await approved_res.json();

                setStatistics({
                    totalScholarships: data.filter((s: Scholarship) => s.is_active).length,
                    totalApplications: active_applicants.active_applicants,
                    approvedStudents: approved_applicants.approved_applicants
                });
            } catch (error) {
                console.error("Error fetching scholarships:", error);
            }
        };
        fetchScholarships();
    }, []);

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

    const handleNavigation = (path: string) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEligibilityCheck = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!eligibilityForm.gwa || !eligibilityForm.income) return;

        setLoading(true);

        try {
            const gwa = parseFloat(eligibilityForm.gwa);
            const income = parseFloat(eligibilityForm.income);
            const total_units = parseInt(eligibilityForm.total_units);

            await new Promise((resolve) => setTimeout(resolve, 1500));

            const response = await fetch(`${API_BASE_URL}/api/prequalify/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gwa, income, total_units }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            const { score, classification } = data;

            let message = '';
            if (score >= 95) {
                message = 'Excellent! You qualify for most scholarships. Register now to see your full recommendations.';
            } else if (score >= 75) {
                message = 'Good! You qualify for several scholarships. Create your profile to explore options.';
            } else if (score >= 50) {
                message = 'You may qualify for some scholarships. Complete your application to see available opportunities.';
            } else {
                message = 'Limited options available, but dont give up! Some scholarships have different criteria.';
            }

            setEligibilityResult({ score, classification, message });
        } catch (error) {
            console.error('Eligibility check failed:', error);
        } finally {
            setLoading(false);
        }
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
        <div className="min-vh-100">
            {/* Hero Section */}
            <Hero />

            {/* Statistics Section - Enhanced Design */}
            <section className="py-5 bg-white">
                <div className="container py-4">
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="text-center p-4 rounded-4 border border-2 h-100 position-relative overflow-hidden" style={{ borderColor: '#e8eaf6' }}>
                                <div className="position-absolute top-0 end-0 opacity-10" style={{ fontSize: '120px', lineHeight: 1, color: '#5e72e4' }}>
                                    <Award size={80} />
                                </div>
                                <div className="position-relative">
                                    <div className="mb-3">
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                             style={{ width: '72px', height: '72px', backgroundColor: '#5e72e4' }}>
                                            <Award className="text-white" size={36} />
                                        </div>
                                    </div>
                                    <h2 className="display-4 fw-bold mb-2" style={{ color: '#5e72e4' }}>{statistics.totalScholarships}</h2>
                                    <p className="text-muted mb-0 fw-semibold fs-6">Active Scholarships</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-center p-4 rounded-4 border border-2 h-100 position-relative overflow-hidden" style={{ borderColor: '#e0f2f1' }}>
                                <div className="position-absolute top-0 end-0 opacity-10" style={{ fontSize: '120px', lineHeight: 1, color: '#11cdef' }}>
                                    <Users size={80} />
                                </div>
                                <div className="position-relative">
                                    <div className="mb-3">
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                             style={{ width: '72px', height: '72px', backgroundColor: '#11cdef' }}>
                                            <Users className="text-white" size={36} />
                                        </div>
                                    </div>
                                    <h2 className="display-4 fw-bold mb-2" style={{ color: '#11cdef' }}>{statistics.totalApplications}</h2>
                                    <p className="text-muted mb-0 fw-semibold fs-6">Total Applications</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-center p-4 rounded-4 border border-2 h-100 position-relative overflow-hidden" style={{ borderColor: '#e8f5e9' }}>
                                <div className="position-absolute top-0 end-0 opacity-10" style={{ fontSize: '120px', lineHeight: 1, color: '#2dce89' }}>
                                    <CheckCircle size={80} />
                                </div>
                                <div className="position-relative">
                                    <div className="mb-3">
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                             style={{ width: '72px', height: '72px', backgroundColor: '#2dce89' }}>
                                            <CheckCircle className="text-white" size={36} />
                                        </div>
                                    </div>
                                    <h2 className="display-4 fw-bold mb-2" style={{ color: '#2dce89' }}>{statistics.approvedStudents}</h2>
                                    <p className="text-muted mb-0 fw-semibold fs-6">Approved Students</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scholarship Highlights - Improved Cards */}
            <section className="py-5" style={{ backgroundColor: '#f8f9fe' }}>
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <span className="badge rounded-pill px-4 py-2 mb-3" style={{ backgroundColor: '#e8eaf6', color: '#5e72e4', fontSize: '0.875rem', fontWeight: 600 }}>
                            Featured Programs
                        </span>
                        <h2 className="display-5 fw-bold mb-3">Explore Available Scholarships</h2>
                        <p className="lead text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            Discover opportunities that match your profile and academic goals
                        </p>
                    </div>

                    <div className="row g-4 mb-5">
                        {activeScholarships.map((scholarship) => (
                            <div key={scholarship.id} className="col-lg-4 col-md-6">
                                <div className="card h-100 border-0 shadow-sm hover-lift rounded-4 overflow-hidden">
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="d-flex align-items-start justify-content-between mb-4">
                                            <div className="rounded-3 p-3" style={{ backgroundColor: '#e8eaf6' }}>
                                                <Award style={{ color: '#5e72e4' }} size={32} />
                                            </div>
                                            <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#d4edda', color: '#155724', fontSize: '0.75rem', fontWeight: 600 }}>
                                                Active
                                            </span>
                                        </div>
                                        <h5 className="card-title fw-bold mb-3" style={{ fontSize: '1.25rem', lineHeight: '1.4' }}>
                                            {scholarship.name}
                                        </h5>
                                        <p className="card-text text-muted mb-4 flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                            {scholarship.description}
                                        </p>
                                        <div className="border-top pt-4 mt-auto">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        Grant Amount
                                                    </small>
                                                    <div className="fw-bold h5 mb-0" style={{ color: '#2dce89' }}>
                                                        ₱{scholarship.grant_amount.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            className="btn btn-lg px-5 py-3 shadow-sm"
                            style={{ backgroundColor: '#5e72e4', color: 'white', borderRadius: '50px', fontWeight: 600, fontSize: '1rem' }}
                            onClick={() => handleNavigation('/scholarships')}
                        >
                            View All Scholarships
                            <ArrowRight size={20} className="ms-2" />
                        </button>
                    </div>
                </div>
            </section>

            {/* How It Works - Modern Process Flow */}
            <section className="py-5 bg-white">
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <span className="badge rounded-pill px-4 py-2 mb-3" style={{ backgroundColor: '#e8eaf6', color: '#5e72e4', fontSize: '0.875rem', fontWeight: 600 }}>
                            Simple Process
                        </span>
                        <h2 className="display-5 fw-bold mb-3">How iScholar Works</h2>
                        <p className="lead text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            Your journey to scholarship success in 4 simple steps
                        </p>
                    </div>

                    <div className="row g-5 position-relative">
                        <div className="col-lg-3 col-md-6">
                            <div className="text-center position-relative">
                                <div className="text-white rounded-4 d-inline-flex align-items-center justify-content-center mb-4 position-relative"
                                     style={{ width: '90px', height: '90px', backgroundColor: '#5e72e4' }}>
                                    <Users size={40} />
                                    <div className="position-absolute top-0 start-0 bg-white text-dark rounded-circle fw-bold d-flex align-items-center justify-content-center"
                                         style={{ width: '28px', height: '28px', fontSize: '0.875rem', marginTop: '-8px', marginLeft: '-8px', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                        1
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-3">Register Account</h5>
                                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    Create your account with basic information and verify your email address
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="text-center position-relative">
                                <div className="text-white rounded-4 d-inline-flex align-items-center justify-content-center mb-4 position-relative"
                                     style={{ width: '90px', height: '90px', backgroundColor: '#11cdef' }}>
                                    <FileText size={40} />
                                    <div className="position-absolute top-0 start-0 bg-white text-dark rounded-circle fw-bold d-flex align-items-center justify-content-center"
                                         style={{ width: '28px', height: '28px', fontSize: '0.875rem', marginTop: '-8px', marginLeft: '-8px', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                        2
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-3">Complete Profile</h5>
                                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    Fill in academic, family, and financial information for accurate evaluation
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="text-center position-relative">
                                <div className="text-white rounded-4 d-inline-flex align-items-center justify-content-center mb-4 position-relative"
                                     style={{ width: '90px', height: '90px', backgroundColor: '#fb6340' }}>
                                    <Upload size={40} />
                                    <div className="position-absolute top-0 start-0 bg-white text-dark rounded-circle fw-bold d-flex align-items-center justify-content-center"
                                         style={{ width: '28px', height: '28px', fontSize: '0.875rem', marginTop: '-8px', marginLeft: '-8px', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                        3
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-3">Submit Documents</h5>
                                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    Upload required documents including ITR, grades, and certificates
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="text-center">
                                <div className="text-white rounded-4 d-inline-flex align-items-center justify-content-center mb-4 position-relative"
                                     style={{ width: '90px', height: '90px', backgroundColor: '#2dce89' }}>
                                    <Brain size={40} />
                                    <div className="position-absolute top-0 start-0 bg-white text-dark rounded-circle fw-bold d-flex align-items-center justify-content-center"
                                         style={{ width: '28px', height: '28px', fontSize: '0.875rem', marginTop: '-8px', marginLeft: '-8px', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                        4
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-3">Get Matched</h5>
                                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    AI system evaluates and recommends best scholarships for you
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose iScholar - Feature Grid */}
            <section className="py-5" style={{ backgroundColor: '#f8f9fe' }}>
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <span className="badge rounded-pill px-4 py-2 mb-3" style={{ backgroundColor: '#e8eaf6', color: '#5e72e4', fontSize: '0.875rem', fontWeight: 600 }}>
                            Why Choose Us
                        </span>
                        <h2 className="display-5 fw-bold mb-3">Built for Student Success</h2>
                        <p className="lead text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            Advanced features designed to simplify your scholarship journey
                        </p>
                    </div>

                    <div className="row g-4 mb-5">
                        <div className="col-lg-6">
                            <div className="card border-0 h-100 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-start">
                                        <div className="rounded-3 p-3 me-4 flex-shrink-0" style={{ backgroundColor: '#e8eaf6' }}>
                                            <Brain style={{ color: '#5e72e4' }} size={36} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-3">Intelligent Matching System</h5>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                                                Advanced fuzzy logic evaluates multiple criteria to match you with the most suitable scholarships based on your unique profile and qualifications.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card border-0 h-100 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-start">
                                        <div className="rounded-3 p-3 me-4 flex-shrink-0" style={{ backgroundColor: '#d4edda' }}>
                                            <TrendingUp style={{ color: '#2dce89' }} size={36} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-3">Real-Time Tracking</h5>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                                                Stay informed with instant updates on your application status. Track every step from submission to approval with complete transparency.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card border-0 h-100 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-start">
                                        <div className="rounded-3 p-3 me-4 flex-shrink-0" style={{ backgroundColor: '#fff3cd' }}>
                                            <Clock style={{ color: '#fb6340' }} size={36} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-3">Save Time & Effort</h5>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                                                No more manual searching through countless programs. Our system automatically identifies all scholarships you qualify for in seconds.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card border-0 h-100 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-start">
                                        <div className="rounded-3 p-3 me-4 flex-shrink-0" style={{ backgroundColor: '#d1ecf1' }}>
                                            <Shield style={{ color: '#11cdef' }} size={36} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-3">Secure & Reliable</h5>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                                                Your data is protected with enterprise-grade security. All documents and personal information are encrypted and safely stored.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="row g-4">
                        <div className="col-6 col-lg-3">
                            <div className="text-center p-4 bg-white rounded-4 shadow-sm">
                                <div className="display-5 fw-bold mb-2" style={{ color: '#5e72e4' }}>98%</div>
                                <small className="text-muted fw-semibold" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Accuracy Rate</small>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="text-center p-4 bg-white rounded-4 shadow-sm">
                                <div className="display-5 fw-bold mb-2" style={{ color: '#2dce89' }}>45%</div>
                                <small className="text-muted fw-semibold" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Success Rate</small>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="text-center p-4 bg-white rounded-4 shadow-sm">
                                <div className="display-5 fw-bold mb-2" style={{ color: '#fb6340' }}>24/7</div>
                                <small className="text-muted fw-semibold" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>System Access</small>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="text-center p-4 bg-white rounded-4 shadow-sm">
                                <div className="display-5 fw-bold mb-2" style={{ color: '#11cdef' }}>FREE</div>
                                <small className="text-muted fw-semibold" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Application Cost</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Announcements - Modern Card Design */}
            <section className="py-5 bg-white">
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <span className="badge rounded-pill px-4 py-2 mb-3" style={{ backgroundColor: '#e8eaf6', color: '#5e72e4', fontSize: '0.875rem', fontWeight: 600 }}>
                            Latest Updates
                        </span>
                        <h2 className="display-5 fw-bold mb-3">Announcements</h2>
                        <p className="lead text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            Stay updated with important deadlines and new programs
                        </p>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="card border-0 h-100 hover-lift rounded-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="rounded-3 p-2 me-3" style={{ backgroundColor: '#f8d7da' }}>
                                            <Calendar style={{ color: '#dc3545' }} size={24} />
                                        </div>
                                        <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#f8d7da', color: '#721c24', fontSize: '0.75rem', fontWeight: 600 }}>
                                            Deadline
                                        </span>
                                    </div>
                                    <h5 className="fw-bold mb-3">1st Semester Applications</h5>
                                    <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                        Application deadline for 1st Semester scholarships: September 30, 2025
                                    </p>
                                    <div className="d-flex align-items-center text-muted small">
                                        <Clock size={14} className="me-2" />
                                        <span>Posted: September 1, 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card border-0 h-100 hover-lift rounded-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="rounded-3 p-2 me-3" style={{ backgroundColor: '#d4edda' }}>
                                            <Award style={{ color: '#28a745' }} size={24} />
                                        </div>
                                        <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#d4edda', color: '#155724', fontSize: '0.75rem', fontWeight: 600 }}>
                                            New Program
                                        </span>
                                    </div>
                                    <h5 className="fw-bold mb-3">STEM Excellence Program</h5>
                                    <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                        New scholarship program launched for Science and Technology students.
                                    </p>
                                    <div className="d-flex align-items-center text-muted small">
                                        <Clock size={14} className="me-2" />
                                        <span>Posted: August 28, 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card border-0 h-100 hover-lift rounded-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="rounded-3 p-2 me-3" style={{ backgroundColor: '#e8eaf6' }}>
                                            <CheckCircle style={{ color: '#5e72e4' }} size={24} />
                                        </div>
                                        <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#e8eaf6', color: '#5e72e4', fontSize: '0.75rem', fontWeight: 600 }}>
                                            Update
                                        </span>
                                    </div>
                                    <h5 className="fw-bold mb-3">System Enhancement</h5>
                                    <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                        New features added to improve application tracking and document management.
                                    </p>
                                    <div className="d-flex align-items-center text-muted small">
                                        <Clock size={14} className="me-2" />
                                        <span>Posted: August 25, 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Eligibility Checker - Enhanced Form */}
            <section className="py-5" style={{ backgroundColor: '#f8f9fe' }}>
                <div className="container py-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card border-0 rounded-4" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                                <div className="card-body p-5">
                                    <div className="text-center mb-5">
                                        <div className="rounded-4 d-inline-flex align-items-center justify-content-center mb-4"
                                             style={{ width: '90px', height: '90px', backgroundColor: '#e8eaf6' }}>
                                            <Brain style={{ color: '#5e72e4' }} size={44} />
                                        </div>
                                        <h2 className="fw-bold mb-3">Quick Eligibility Check</h2>
                                        <p className="text-muted mb-0" style={{ maxWidth: '500px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                                            Get an instant assessment of your scholarship eligibility using our AI-powered system
                                        </p>
                                    </div>

                                    <form onSubmit={handleEligibilityCheck}>
                                        <div className="row g-4 mb-4">
                                            <div className="col-md-4">
                                                <label htmlFor="gwa" className="form-label fw-semibold mb-2" style={{ fontSize: '0.95rem' }}>
                                                    <Target size={16} className="me-2" style={{ marginTop: '-2px' }} />
                                                    General Weighted Average
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg rounded-3"
                                                    id="gwa"
                                                    step="0.01"
                                                    min="1.00"
                                                    max="5.00"
                                                    placeholder="e.g., 1.75"
                                                    value={eligibilityForm.gwa}
                                                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, gwa: e.target.value })}
                                                    required
                                                    style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                />
                                                <small className="text-muted d-block mt-2">Your cumulative GWA</small>
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="income" className="form-label fw-semibold mb-2" style={{ fontSize: '0.95rem' }}>
                                                    <TrendingUp size={16} className="me-2" style={{ marginTop: '-2px' }} />
                                                    Annual Family Income
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg rounded-3"
                                                    id="income"
                                                    placeholder="e.g., 150000"
                                                    value={eligibilityForm.income}
                                                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, income: e.target.value })}
                                                    required
                                                    style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                />
                                                <small className="text-muted d-block mt-2">In Philippine Peso (₱)</small>
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="total_units" className="form-label fw-semibold mb-2" style={{ fontSize: '0.95rem' }}>
                                                    <FileText size={16} className="me-2" style={{ marginTop: '-2px' }} />
                                                    Total Units Enrolled
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg rounded-3"
                                                    id="total_units"
                                                    placeholder="e.g., 20"
                                                    value={eligibilityForm.total_units}
                                                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, total_units: e.target.value })}
                                                    required
                                                    style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                />
                                                <small className="text-muted d-block mt-2">Current semester units</small>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-lg w-100 py-3 rounded-3 shadow-sm"
                                            disabled={loading}
                                            style={{ backgroundColor: '#5e72e4', color: 'white', fontWeight: 600, fontSize: '1.05rem', border: 'none' }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Analyzing Your Eligibility...
                                                </>
                                            ) : (
                                                <>
                                                    <Brain size={20} className="me-2" style={{ marginTop: '-2px' }} />
                                                    Check Eligibility Now
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {eligibilityResult && (
                                        <div className="mt-4">
                                            <div className={`alert border-0 rounded-4 ${eligibilityResult.score >= 80 ? 'alert-success' :
                                                eligibilityResult.score >= 60 ? 'alert-warning' : 'alert-info'
                                            }`} style={{ backgroundColor: eligibilityResult.score >= 80 ? '#d4edda' : eligibilityResult.score >= 60 ? '#fff3cd' : '#d1ecf1' }}>
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="flex-grow-1">
                                                        <h5 className="fw-bold mb-1">{eligibilityResult.classification}</h5>
                                                        <small className="opacity-75">Your eligibility assessment is complete</small>
                                                    </div>
                                                    <div className="text-end">
                                                        <div
                                                            className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold"
                                                            style={{ width: '70px', height: '70px', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                        >
                                                            {eligibilityResult.score}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="mb-4" style={{ fontSize: '1rem', lineHeight: '1.6' }}>{eligibilityResult.message}</p>
                                                <div className="d-flex gap-3">
                                                    <button
                                                        className="btn flex-grow-1 py-2 rounded-3"
                                                        onClick={() => handleNavigation('/register')}
                                                        style={{ backgroundColor: 'white', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                                                    >
                                                        <Users size={18} className="me-2" style={{ marginTop: '-2px' }} />
                                                        Create Account
                                                    </button>
                                                    <button
                                                        className="btn flex-grow-1 py-2 rounded-3"
                                                        onClick={() => handleNavigation('/scholarships')}
                                                        style={{ backgroundColor: 'white', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                                                    >
                                                        <Award size={18} className="me-2" style={{ marginTop: '-2px' }} />
                                                        Browse Scholarships
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Modern Slider */}
            <section className="py-5 bg-white">
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <span className="badge rounded-pill px-4 py-2 mb-3" style={{ backgroundColor: '#e8eaf6', color: '#5e72e4', fontSize: '0.875rem', fontWeight: 600 }}>
                            Success Stories
                        </span>
                        <h2 className="display-5 fw-bold mb-3">What Students Say</h2>
                        <p className="lead text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            Hear from students who have successfully secured scholarships
                        </p>
                    </div>

                    <div className="row g-4">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="col-lg-4">
                                <div className="card border-0 h-100 rounded-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="mb-3">
                                            <Quote style={{ color: '#5e72e4', opacity: 0.2 }} size={48} />
                                        </div>
                                        <div className="mb-3">
                                            {renderStars(testimonial.rating)}
                                        </div>
                                        <p className="text-muted mb-4 flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                                            {testimonial.message}
                                        </p>
                                        <div className="border-top pt-4 mt-auto">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                                                     style={{ width: '52px', height: '52px', backgroundColor: '#e8eaf6' }}>
                                                    <span className="fw-bold" style={{ color: '#5e72e4', fontSize: '1.1rem' }}>
                                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="fw-bold mb-1">{testimonial.name}</div>
                                                    <small className="text-muted d-block" style={{ fontSize: '0.85rem' }}>{testimonial.course}</small>
                                                    <small className="d-block" style={{ color: '#5e72e4', fontSize: '0.85rem', fontWeight: 600 }}>{testimonial.scholarship}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section - Modern Accordion */}
            <section className="py-5" style={{ backgroundColor: '#f8f9fe' }}>
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <span className="badge rounded-pill px-4 py-2 mb-3" style={{ backgroundColor: '#e8eaf6', color: '#5e72e4', fontSize: '0.875rem', fontWeight: 600 }}>
                            Have Questions?
                        </span>
                        <h2 className="display-5 fw-bold mb-3">Frequently Asked Questions</h2>
                        <p className="lead text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            Find answers to common questions about the scholarship process
                        </p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-9">
                            <div className="accordion" id="faqAccordion">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="accordion-item border-0 mb-3 rounded-4 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                        <h2 className="accordion-header">
                                            <button
                                                className={`accordion-button ${openFAQ === index ? '' : 'collapsed'} fw-semibold rounded-4`}
                                                type="button"
                                                onClick={() => toggleFAQ(index)}
                                                style={{ fontSize: '1.05rem', padding: '1.25rem 1.5rem', backgroundColor: openFAQ === index ? '#5e72e4' : 'white', color: openFAQ === index ? 'white' : '#333' }}
                                            >
                                                {faq.question}
                                            </button>
                                        </h2>
                                        <div className={`accordion-collapse collapse ${openFAQ === index ? 'show' : ''}`}>
                                            <div className="accordion-body text-muted" style={{ padding: '1.5rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
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

            {/* CTA Section - Bold & Clear */}
            <section className="py-5 position-relative overflow-hidden" style={{ backgroundColor: '#5e72e4' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ opacity: 0.1 }}>
                    <div className="position-absolute" style={{ top: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'white' }}></div>
                    <div className="position-absolute" style={{ bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'white' }}></div>
                </div>
                <div className="container position-relative py-5">
                    <div className="row justify-content-center text-center">
                        <div className="col-lg-8">
                            <h2 className="display-5 fw-bold text-white mb-4">
                                Ready to Start Your Scholarship Journey?
                            </h2>
                            <p className="lead text-white mb-5" style={{ opacity: 0.95, fontSize: '1.15rem', lineHeight: '1.7' }}>
                                Join hundreds of students who have already secured their scholarships through iScholar's intelligent matching system.
                            </p>
                            <div className="d-flex gap-3 justify-content-center flex-wrap mb-4">
                                <button
                                    className="btn btn-lg px-5 py-3 rounded-pill shadow"
                                    onClick={() => handleNavigation('/register')}
                                    style={{ backgroundColor: 'white', color: '#5e72e4', fontWeight: 600, fontSize: '1.05rem', border: 'none' }}
                                >
                                    <Users size={20} className="me-2" style={{ marginTop: '-2px' }} />
                                    Get Started Now
                                </button>
                                <button
                                    className="btn btn-lg px-5 py-3 rounded-pill"
                                    onClick={() => handleNavigation('/scholarships')}
                                    style={{ backgroundColor: 'transparent', color: 'white', fontWeight: 600, fontSize: '1.05rem', border: '2px solid white' }}
                                >
                                    <Award size={20} className="me-2" style={{ marginTop: '-2px' }} />
                                    Browse Scholarships
                                </button>
                            </div>
                            <div className="text-white small" style={{ opacity: 0.9 }}>
                                <Shield size={18} className="me-2" style={{ marginTop: '-3px' }} />
                                100% Free • Secure • Confidential
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Add Custom CSS */}
            <style>{`
                .hover-lift {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-lift:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
                }
                .hover-link {
                    transition: color 0.2s ease, transform 0.2s ease;
                    display: inline-block;
                }
                .hover-link:hover {
                    color: white !important;
                    transform: translateX(4px);
                }
                .form-control:focus {
                    border-color: #5e72e4 !important;
                    box-shadow: 0 0 0 0.2rem rgba(94, 114, 228, 0.25) !important;
                }
                .accordion-button:not(.collapsed) {
                    box-shadow: none !important;
                }
                .accordion-button:focus {
                    box-shadow: none !important;
                    border: none !important;
                }
                .accordion-button::after {
                    filter: ${openFAQ !== null ? 'brightness(0) invert(1)' : 'none'};
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
