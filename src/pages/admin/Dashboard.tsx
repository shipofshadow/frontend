import  { useEffect, useState } from 'react';
import { Clock, Calendar, BookOpen, TrendingUp, Users, CheckCircle, AlertCircle, XCircle, BarChart3, PieChart } from "lucide-react";
import { API_BASE_URL } from '../../config';
import { activeApplicants, approvedApplicants, pendingApplicants, rejectedApplicants } from "../../services/dashboard.ts";
import ApplicantsBarChart from "../../components/charts/ScholarshipBreakdownCharts";
import ApplicationsTrendChart from "../../components/charts/ApplicationsTrendChart.tsx";

const Dashboard = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeApplicantsCount, setActiveApplicantsCount] = useState<number | null>(null);
    const [approvedApplicantsCount, setApprovedApplicantsCount] = useState<number | null>(null);
    const [pendingApplicantsCount, setPendingApplicantsCount] = useState<number | null>(null);
    const [rejectedApplicantsCount, setRejectedApplicantsCount] = useState<number | null>(null);
    const [currentSemester, setCurrentSemester] = useState('Loading...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSemester = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/active-academic-term`);
                if (!response.ok) throw new Error('Failed to fetch semester');
                const data = await response.json();
                setCurrentSemester(data.formatted);
            } catch (err) {
                console.error('Error fetching semester:', err);
                setCurrentSemester('N/A');
            }
        };

        fetchSemester().catch((err) =>
            console.error("Promise rejection in fetchSemester:", err)
        );
        const timer = setInterval(() => setCurrentDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [active, approved, pending, rejected] = await Promise.all([
                    activeApplicants().catch(() => 0),
                    approvedApplicants().catch(() => 0),
                    pendingApplicants().catch(() => 0),
                    rejectedApplicants().catch(() => 0)
                ]);

                setActiveApplicantsCount(active);
                setApprovedApplicantsCount(approved);
                setPendingApplicantsCount(pending);
                setRejectedApplicantsCount(rejected);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData().catch((err) =>
            console.error("Promise rejection in fetchAllData:", err)
        );
    }, []);

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'long' }),
            date: date.toLocaleDateString('en-US', options),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        };
    };

    const { day, date, time } = formatDate(currentDate);

    const statsCards = [
        {
            title: "Total Applicants",
            value: activeApplicantsCount,
            icon: Users,
            color: "primary",
            bgGradient: "bg-gradient-primary"
        },
        {
            title: "Approved",
            value: approvedApplicantsCount,
            icon: CheckCircle,
            color: "success",
            bgGradient: "bg-gradient-success"
        },
        {
            title: "Pending Review",
            value: pendingApplicantsCount,
            icon: AlertCircle,
            color: "warning",
            bgGradient: "bg-gradient-warning"
        },
        {
            title: "Denied",
            value: rejectedApplicantsCount,
            icon: XCircle,
            color: "danger",
            bgGradient: "bg-gradient-danger"
        }
    ];

    return (
        <>
            {/* Enhanced Header */}
            <header className="bg-primary position-relative overflow-hidden">
                <div className="container-fluid px-4 py-5">
                    {/* Background Pattern */}
                    <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                        <div className="position-absolute" style={{ top: '20%', right: '10%', transform: 'rotate(15deg)' }}>
                            <BarChart3 size={120} className="text-white" />
                        </div>

                    </div>

                    <div className="position-relative">
                        <div className="row align-items-center">
                            <div className="col-12">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary bg-opacity-20 rounded-circle p-3 me-3">
                                        <TrendingUp size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-white mb-1 fw-bold display-6">Dashboard</h1>
                                        <p className="text-white-50 mb-0 fs-5">Scholarship Management Overview</p>
                                    </div>
                                </div>

                                <div className="row text-white-75">
                                    <div className="col-lg-6">
                                        <div className="d-flex align-items-center flex-wrap gap-3 bg-white bg-opacity-10 rounded-pill px-4 py-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <Calendar size={18} />
                                                <span className="fw-semibold">{day}</span>
                                            </div>
                                            <span className="text-white-50">•</span>
                                            <span>{date}</span>
                                            <span className="text-white-50">•</span>
                                            <div className="d-flex align-items-center gap-2">
                                                <Clock size={18} />
                                                <span className="font-monospace">{time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 mt-3 mt-lg-0">
                                        <div className="d-flex align-items-center justify-content-lg-end">
                                            <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-pill px-4 py-2">
                                                <BookOpen size={18} />
                                                <span className="fw-semibold">Current Semester:</span>
                                                <span className="badge bg-white text-primary px-3">{currentSemester}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4" style={{ marginTop: '-20px' }}>
                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
                )}

                {/* Enhanced Stats Cards */}
                <div className="row mb-5">
                    {statsCards.map((card, index) => {
                        const IconComponent = card.icon;
                        return (
                            <div key={index} className="col-xl-3 col-md-6 mb-4">
                                <div className="card border-0 shadow-sm h-100 overflow-hidden position-relative">
                                    <div className={`position-absolute top-0 end-0 w-100 h-100 opacity-5 ${card.bgGradient}`}></div>
                                    <div className="card-body position-relative">
                                        <div className="row align-items-center">
                                            <div className="col">
                                                <div className={`text-${card.color} fw-bold small text-uppercase mb-1`}>
                                                    {card.title}
                                                </div>
                                                <div className="h2 mb-0 fw-bold">
                                                    {loading ? (
                                                        <div className="placeholder-glow">
                                                            <span className="placeholder col-6"></span>
                                                        </div>
                                                    ) : (
                                                        <span className="counter" data-target={card.value || 0}>
                                                            {card.value !== null ? card.value.toLocaleString() : "N/A"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-auto">
                                                <div className={`bg-${card.color} bg-opacity-10 rounded-circle p-3`}>
                                                    <IconComponent size={24} className={`text-${card.color}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`card-footer bg-${card.color} bg-opacity-5 border-0 py-2`}>
                                        <div className="d-flex align-items-center justify-content-between small">
                                            <span className={`text-white opacity-75`}>
                                                <i className="fas fa-sync-alt me-1"></i>
                                                Updated just now
                                            </span>
                                            <TrendingUp size={14} className={`text-${card.color} opacity-50`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-0 py-3">
                                <h5 className="card-title mb-0 d-flex align-items-center">
                                    <BarChart3 size={20} className="me-2 text-primary" />
                                    Applicants Breakdown by Course and Campus
                                </h5>
                            </div>
                            <div className="card-body">
                                <ApplicantsBarChart />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-5">
                    {/* Application Trends Chart */}
                    <ApplicationsTrendChart />




                {/* Enhanced Placeholder Charts */}
                <div className="row mb-5">
                    <div className="col-lg-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-0 py-3">
                                <h5 className="card-title mb-0 d-flex align-items-center">
                                    <PieChart size={20} className="me-2 text-success" />
                                    Qualification Distribution
                                </h5>
                            </div>
                            <div className="card-body d-flex align-items-center justify-content-center">
                                <div className="text-center py-5">
                                    <PieChart size={64} className="text-muted mb-3" />
                                    <h6 className="text-muted">Chart Implementation</h6>
                                    <p className="text-muted small mb-0">
                                        Qualification breakdown chart will be displayed here
                                    </p>
                                    <canvas id="qualificationPieChart" className="d-none"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-0 py-3">
                                <h5 className="card-title mb-0 d-flex align-items-center">
                                    <PieChart size={20} className="me-2 text-info" />
                                    Course Distribution
                                </h5>
                            </div>
                            <div className="card-body d-flex align-items-center justify-content-center">
                                <div className="text-center py-5">
                                    <PieChart size={64} className="text-muted mb-3" />
                                    <h6 className="text-muted">Chart Implementation</h6>
                                    <p className="text-muted small mb-0">
                                        Course distribution chart will be displayed here
                                    </p>
                                    <canvas id="coursePieChart" className="d-none"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;