import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Users, 
    Building2, 
    Award, 
    ArrowRight, 
    FileSpreadsheet, 
    BarChart3
} from 'lucide-react';

interface ReportCard {
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    path: string;
    badge: string;
    badgeColor: string;
    iconColor: string;
    iconBg: string;
}

const reportCards: ReportCard[] = [
    {
        title: 'Applicants Report',
        description: 'Comprehensive lists of all student scholarship applicants with filtering by status, semester, scholarship, and verification details.',
        icon: Users,
        path: '/admin/reports/applicants',
        badge: 'Applications',
        badgeColor: 'bg-primary-subtle text-primary border-primary-subtle',
        iconColor: 'text-primary',
        iconBg: 'bg-primary bg-opacity-10'
    },
    {
        title: 'Campus & Department Report',
        description: 'Breakdown of applications and awarded scholarships organized by campus, academic department, and college courses.',
        icon: Building2,
        path: '/admin/reports/department',
        badge: 'Demographics',
        badgeColor: 'bg-success-subtle text-success border-success-subtle',
        iconColor: 'text-success',
        iconBg: 'bg-success bg-opacity-10'
    },
    {
        title: 'Scholarship Summary Report',
        description: 'Financial allocations, disbursements, slot utilization, and approval summaries across all active and past scholarship programs.',
        icon: Award,
        path: '/admin/scholarships/scholarship-report',
        badge: 'Financials & Quotas',
        badgeColor: 'bg-info-subtle text-info border-info-subtle',
        iconColor: 'text-info',
        iconBg: 'bg-info bg-opacity-10'
    }
];

const Reports: React.FC = () => {
    return (
        <div className="container-fluid px-4 py-4">
            {/* Header */}
            <div className="mb-4">
                <h1 className="h3 mb-1 text-gray-800 fw-bold d-flex align-items-center gap-2">
                    <FileSpreadsheet className="text-primary" size={28} />
                    Reporting & Analytics Center
                </h1>
                <p className="text-muted small mb-0">
                    Select a reporting module below to view detailed records, demographic summaries, and export data.
                </p>
            </div>

            {/* Report Launchers */}
            <div className="row g-4">
                {reportCards.map((card, idx) => {
                    const IconComponent = card.icon;
                    return (
                        <div key={idx} className="col-lg-4 col-md-6">
                            <div className="card border-0 shadow-sm h-100 d-flex flex-column transition-hover">
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className={`p-3 rounded-3 ${card.iconBg} ${card.iconColor}`}>
                                            <IconComponent size={28} />
                                        </div>
                                        <span className={`badge border ${card.badgeColor} small px-2 py-1`}>
                                            {card.badge}
                                        </span>
                                    </div>

                                    <h5 className="card-title fw-bold text-dark mb-2">
                                        {card.title}
                                    </h5>
                                    <p className="card-text text-muted small flex-grow-1 mb-4">
                                        {card.description}
                                    </p>

                                    <Link 
                                        to={card.path} 
                                        className="btn btn-outline-primary d-flex align-items-center justify-content-between mt-auto w-100"
                                    >
                                        <span className="fw-medium">Open Report</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Tips */}
            <div className="card border-0 bg-light shadow-sm mt-5">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white p-2 rounded-circle shadow-xs text-primary">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h6 className="fw-bold mb-1">Looking for high-level aggregate numbers?</h6>
                            <p className="text-muted small mb-0">
                                Check the <Link to="/admin/metrics" className="fw-semibold text-primary text-decoration-none">Metrics Dashboard</Link> for all-time approval rates, top-ranked courses, and visual charts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;