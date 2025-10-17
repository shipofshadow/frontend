// pages/admin/reports/ScholarshipSummary.tsx
import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import {
    Award, Users, CheckCircle, TrendingUp, DollarSign, Building,
    Filter, Download, RefreshCw, ChevronDown, AlertCircle, type LucideIcon
} from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import type {ApexOptions} from "apexcharts";

interface FilterState {
    academicYear: string;
    semester: string;
    campus: string;
    department: string;
    course: string;
    scholarship: string;
    status: string;
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
const ScholarshipSummaryReport = () => {
    const [filters, setFilters] = useState<FilterState>({
        academicYear: '2025-2026',
        semester: '1st Semester',
        campus: 'All',
        department: 'All',
        course: 'All',
        scholarship: 'All',
        status: 'All'
    });

    const { data, loading, error, refetch, exportData } = useDashboardData(filters);

    const handleFilterChange = (filterName: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleExport = async () => {
        try {
            await exportData();
        } catch (err) {
            alert('Failed to export data. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <style>{dashboardStyles}</style>
                <div className="loading-container">
                    <div className="spinner-modern"></div>
                    <p className="loading-text">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <style>{dashboardStyles}</style>
                <div className="error-container">
                    <div className="error-icon-wrapper">
                        <AlertCircle size={48} />
                    </div>
                    <h3 className="error-title">Unable to Load Dashboard</h3>
                    <p className="error-message">{error}</p>
                    <button className="btn-primary" onClick={refetch}>
                        <RefreshCw size={16} />
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <style>{dashboardStyles}</style>

            {/* ================ HEADER ================ */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="header-icon-wrapper">
                            <Award className="header-icon" />
                        </div>
                        <div className="header-text">
                            <h1 className="header-title">Scholarship Analytics</h1>
                            <p className="header-subtitle">Comprehensive scholarship performance overview</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={refetch}>
                            <RefreshCw size={18} />
                            <span>Refresh</span>
                        </button>
                        <button className="btn-primary" onClick={handleExport}>
                            <Download size={18} />
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ================ FILTERS ================ */}
            <div className="filters-section">
                <div className="filters-container">
                    <div className="filters-header">
                        <div className="filters-title-wrapper">
                            <Filter size={20} />
                            <h2 className="filters-title">Filters</h2>
                        </div>
                    </div>
                    <div className="filters-grid">
                        <FilterDropdown
                            label="Academic Year"
                            value={filters.academicYear}
                            onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                            options={['All', ...(data.filterOptions?.academicYears || [])]}
                        />
                        <FilterDropdown
                            label="Semester"
                            value={filters.semester}
                            onChange={(e) => handleFilterChange('semester', e.target.value)}
                            options={['All', ...(data.filterOptions?.semesters || [])]}
                        />
                        <FilterDropdown
                            label="Campus"
                            value={filters.campus}
                            onChange={(e) => handleFilterChange('campus', e.target.value)}
                            options={['All', ...(data.filterOptions?.campuses || [])]}
                        />
                        <FilterDropdown
                            label="Department"
                            value={filters.department}
                            onChange={(e) => handleFilterChange('department', e.target.value)}
                            options={['All', ...(data.filterOptions?.departments || [])]}
                        />
                        <FilterDropdown
                            label="Course"
                            value={filters.course}
                            onChange={(e) => handleFilterChange('course', e.target.value)}
                            options={['All', ...(data.filterOptions?.courses || [])]}
                        />
                        <FilterDropdown
                            label="Scholarship"
                            value={filters.scholarship}
                            onChange={(e) => handleFilterChange('scholarship', e.target.value)}
                            options={['All', ...(data.filterOptions?.scholarships || [])]}
                        />
                        <FilterDropdown
                            label="Status"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            options={data.filterOptions?.statuses || ['All', 'Pending', 'Approved', 'Denied']}
                        />
                    </div>
                </div>
            </div>

            {/* ================ MAIN CONTENT ================ */}
            <main className="dashboard-main">
                <KeyMetricsSection data={data.summary?.metrics} />
                <ScholarshipOverview data={data.scholarships} timeseriesData={data.timeseries} />
                <ScholarshipPerformance data={data.scholarships} />
                <CampusDepartmentInsights data={data.campuses} />
                <ApplicantDemographics data={data.demographics} />
                <FuzzyEvaluationInsights data={data.fuzzy} />
                <TimeSeriesAnalysis data={data.timeseries} />
                <ScholarshipComparison data={data.scholarships} />
            </main>
        </div>
    );
};

// ============================================================================
// FILTER DROPDOWN COMPONENT
// ============================================================================
interface FilterDropdownProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}

const FilterDropdown = ({ label, value, onChange, options }: FilterDropdownProps) => (
    <div className="filter-dropdown">
        <label className="filter-label">{label}</label>
        <div className="select-wrapper">
            <select value={value} onChange={onChange} className="filter-select">
                {options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                ))}
            </select>
            <ChevronDown className="select-icon" size={16} />
        </div>
    </div>
);

// ============================================================================
// KEY METRICS SECTION
// ============================================================================
interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: LucideIcon;
    trend?: string;
    colorClass: string;
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, colorClass }: MetricCardProps) => (
    <div className={`metric-card ${colorClass}`}>
        <div className="metric-header">
            <div className={`metric-icon-circle ${colorClass}`}>
                <Icon size={24} />
            </div>
            <p className="metric-title">{title}</p>
        </div>
        <div className="metric-body">
            <h3 className="metric-value">{value}</h3>
            <p className="metric-subtitle">{subtitle}</p>
            {trend && (
                <div className="metric-trend">
                    <TrendingUp size={14} />
                    <span>{trend}</span>
                </div>
            )}
        </div>
    </div>
);

const KeyMetricsSection = ({ data }: { data: any }) => {
    if (!data) return null;

    return (
        <div className="metrics-grid">
            <MetricCard
                title="Active Scholarships"
                value={data.activeScholarships || 0}
                subtitle="Total available programs"
                icon={Award}
                colorClass="color-blue"
            />
            <MetricCard
                title="Total Applications"
                value={data.totalApplications || 0}
                subtitle="This semester"
                icon={Users}
                colorClass="color-purple"
            />
            <MetricCard
                title="Approved Applications"
                value={data.approvedApplications || 0}
                subtitle={`${data.totalApplications > 0 ? Math.round((data.approvedApplications / data.totalApplications) * 100) : 0}% approval rate`}
                icon={CheckCircle}
                colorClass="color-green"
            />
            <MetricCard
                title="Average GWA"
                value={data.avgGWA || 0}
                subtitle="Of approved students"
                icon={TrendingUp}
                colorClass="color-orange"
            />
            <MetricCard
                title="Avg Family Income"
                value={`₱${(data.avgIncome || 0).toLocaleString()}`}
                subtitle="Monthly median"
                icon={DollarSign}
                colorClass="color-indigo"
            />
            <MetricCard
                title="Top Campus"
                value={data.topCampus || 'N/A'}
                subtitle={`${data.topCampusRate || 0}% approval rate`}
                icon={Building}
                colorClass="color-pink"
            />
        </div>
    );
};

// ============================================================================
// SCHOLARSHIP OVERVIEW SECTION
// ============================================================================
const ScholarshipOverview = ({ data, timeseriesData }: { data: any; timeseriesData: any }) => {
    if (!data) return null;

    const distributionOptions: ApexOptions = {
        chart: { type: 'donut', height: 350, fontFamily: 'inherit' },
        labels: ['Active Scholarships', 'Inactive Scholarships'],
        colors: ['#2563eb', '#dc2626'],
        legend: { position: 'bottom', fontSize: '14px', fontWeight: 600 },
        dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: 700 } },
        stroke: { width: 0 },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: { show: true, fontSize: '24px', fontWeight: 700, color: '#111827', label: 'Total Programs' }
                    }
                }
            }
        }
    };
    const distributionSeries = [data.distribution?.active || 0, data.distribution?.inactive || 0];

    const statusTimeline = timeseriesData?.statusTimeline || [];
    const categories = statusTimeline.map((item: any) => item.month);
    const timelineOptions: ApexOptions = {
        chart: { type: 'area', height: 350, zoom: { enabled: false }, fontFamily: 'inherit', toolbar: { show: false } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#2563eb', '#10b981', '#dc2626', '#f59e0b'],
        xaxis: {
            categories: categories,
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Number of Applications', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        legend: { position: 'top', fontSize: '13px', fontWeight: 600 },
        fill: { type: 'solid', opacity: 0.15 },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4, padding: { top: 0, right: 10, bottom: 0, left: 10 } }
    };
    const timelineSeries = [
        {
            name: 'Total Applications',
            data: statusTimeline.map((item: any) =>
                (Number(item.evaluated) || 0) +
                (Number(item.pending) || 0) +
                (Number(item.approved) || 0) +
                (Number(item.denied) || 0)
            )
        },
        { name: 'Approved', data: statusTimeline.map((item: any) => Number(item.approved) || 0) },
        { name: 'Evaluated', data: statusTimeline.map((item: any) => Number(item.evaluated) || 0) },
        { name: 'Denied', data: statusTimeline.map((item: any) => Number(item.denied) || 0) },
        { name: 'Pending', data: statusTimeline.map((item: any) => Number(item.pending) || 0) }
    ];


    return (
        <div className="section-grid-2">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Scholarship Distribution</h2>
                    <p className="card-subtitle">Active vs Inactive Programs</p>
                </div>
                <div className="card-body">
                    <ReactApexChart options={distributionOptions} series={distributionSeries} type="donut" height={350} />
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Applications Over Time</h2>
                    <p className="card-subtitle">Monthly application trends</p>
                </div>
                <div className="card-body">
                    <ReactApexChart options={timelineOptions} series={timelineSeries} type="area" height={350} />
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// SCHOLARSHIP PERFORMANCE SECTION
// ============================================================================
const ScholarshipPerformance = ({ data }: { data: any }) => {
    if (!data) return null;

    const applicationsPerScholarship = data.applicationsPerScholarship || [];
    const statusDistribution = data.statusDistribution || [];

    const applicantsOptions: ApexOptions = {
        chart: { type: 'bar', height: 400, toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: {
            bar: { horizontal: true, distributed: true, dataLabels: { position: 'top' }, borderRadius: 8 }
        },
        colors: ['#2563eb', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#dc2626'],
        dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 700 } },
        xaxis: {
            categories: applicationsPerScholarship.map((item: any) => item.name),
            title: { text: 'Number of Applicants', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: { labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } } },
        legend: { show: false },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const applicantsSeries = [{
        name: 'Applicants',
        data: applicationsPerScholarship.map((item: any) => item.applications || 0)
    }];

    const statusOptions: ApexOptions = {
        chart: { type: 'bar', height: 400, stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: { bar: { horizontal: false, borderRadius: 8, columnWidth: '65%' } },
        colors: ['#10b981', '#dc2626', '#f59e0b'],
        xaxis: {
            categories: statusDistribution.map((item: any) => item.name),
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Applications Count', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        legend: { position: 'top', fontSize: '13px', fontWeight: 600 },
        dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 700 } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const statusSeries = [
        { name: 'Approved', data: statusDistribution.map((item: any) => item.approved || 0) },
        { name: 'Denied', data: statusDistribution.map((item: any) => item.denied || 0) },
        { name: 'Pending', data: statusDistribution.map((item: any) => item.pending || 0) }
    ];

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Scholarship Performance</h2>
            </div>
            <div className="card-body">
                <div className="section-grid-2">
                    <div>
                        <h3 className="chart-title">Applicants per Scholarship</h3>
                        <ReactApexChart options={applicantsOptions} series={applicantsSeries} type="bar" height={400} />
                    </div>
                    <div>
                        <h3 className="chart-title">Approval Status Distribution</h3>
                        <ReactApexChart options={statusOptions} series={statusSeries} type="bar" height={400} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// CAMPUS & DEPARTMENT INSIGHTS
// ============================================================================
const CampusDepartmentInsights = ({ data }: { data: any }) => {
    if (!data) return null;

    const campuses = data.campuses || [];
    const departments = data.departments || [];

    const campusOptions: ApexOptions = {
        chart: { type: 'bar', height: 350, toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: { bar: { borderRadius: 8, distributed: true, horizontal: false, columnWidth: '65%' } },
        colors: ['#2563eb', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6', '#dc2626'],
        dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 700 } },
        xaxis: {
            categories: campuses.map((item: any) => item.name),
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Number of Applications', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        legend: { show: false },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const campusSeries = [{ name: 'Applications', data: campuses.map((item: any) => item.applications || 0) }];

    const treemapOptions: ApexOptions = {
        chart: { type: 'treemap', height: 350, toolbar: { show: false }, fontFamily: 'inherit' },
        legend: { show: false },
        colors: ['#2563eb', '#8b5cf6', '#ec4899', '#f97316'],
        plotOptions: {
            treemap: {
                distributed: true,
                enableShades: false,
                borderRadius: 8
            }
        },
        dataLabels: {
            enabled: true,
            style: { fontSize: '14px', fontWeight: 700, colors: ['#ffffff'] },
            formatter: (text: string, op: any) => [text, op.value + ' applicants']
        }
    };
    const treemapSeries = [{
        data: departments.map((item: any) => ({ x: item.name, y: item.applications || 0 }))
    }];

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Campus & Department Insights</h2>
            </div>
            <div className="card-body">
                <div className="section-grid-2">
                    <div>
                        <h3 className="chart-title">Applications by Campus</h3>
                        <ReactApexChart options={campusOptions} series={campusSeries} type="bar" height={350} />
                    </div>
                    <div>
                        <h3 className="chart-title">Department Distribution</h3>
                        <ReactApexChart options={treemapOptions} series={treemapSeries} type="treemap" height={350} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// APPLICANT DEMOGRAPHICS
// ============================================================================
const ApplicantDemographics = ({ data }: { data: any }) => {
    if (!data) return null;

    const genderData = data.gender || [];
    const yearLevelData = data.yearLevel || [];
    const incomeData = data.income || [];
    const qualificationData = data.qualificationFactors || {};

    const genderOptions: ApexOptions = {
        chart: { type: 'pie', height: 300, fontFamily: 'inherit' },
        labels: genderData.map((item: any) => item.gender),
        colors: ['#2563eb', '#ec4899', '#8b5cf6'],
        legend: { position: 'bottom', fontSize: '13px', fontWeight: 600 },
        dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: 700 } },
        stroke: { width: 0 }
    };
    const genderSeries = genderData.map((item: any) => item.count || 0);

    const yearLevelOptions: ApexOptions = {
        chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: { bar: { distributed: true, borderRadius: 8, columnWidth: '65%' } },
        colors: ['#2563eb', '#8b5cf6', '#ec4899', '#f97316'],
        xaxis: {
            categories: yearLevelData.map((item: any) => `${item.year_level} Year`),
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Number of Students', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        legend: { show: false },
        dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 700 } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const yearLevelSeries = [{ name: 'Students', data: yearLevelData.map((item: any) => item.count || 0) }];

    const incomeOptions: ApexOptions = {
        chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: { bar: { borderRadius: 8, columnWidth: '65%' } },
        colors: ['#10b981'],
        xaxis: {
            categories: incomeData.map((item: any) => item.income_bracket),
            title: { text: 'Monthly Family Income', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Number of Families', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 700 } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const incomeSeries = [{ name: 'Families', data: incomeData.map((item: any) => item.count || 0) }];

    const radarOptions: ApexOptions = {
        chart: { type: 'radar', height: 350, toolbar: { show: false }, fontFamily: 'inherit' },
        xaxis: {
            categories: ['High GWA', 'Low Income', '4Ps Member', 'IP Affiliation', 'OFW Parent'],
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: { show: false },
        colors: ['#2563eb'],
        markers: { size: 6, strokeWidth: 2, strokeColors: '#fff' },
        fill: { opacity: 0.2 },
        stroke: { width: 3 },
        dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 700 } }
    };
    const radarSeries = [{
        name: 'Qualification Score',
        data: [
            Math.round(qualificationData.high_gwa || 0),
            Math.round(qualificationData.low_income || 0),
            Math.round(qualificationData.fourps || 0),
            Math.round(qualificationData.ip || 0),
            Math.round(qualificationData.ofw || 0)
        ]
    }];

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Applicant Demographics</h2>
            </div>
            <div className="card-body">
                <div className="demographics-grid">
                    <div>
                        <h3 className="chart-title-sm">Gender Distribution</h3>
                        <ReactApexChart options={genderOptions} series={genderSeries} type="pie" height={300} />
                    </div>
                    <div>
                        <h3 className="chart-title-sm">Year Level</h3>
                        <ReactApexChart options={yearLevelOptions} series={yearLevelSeries} type="bar" height={300} />
                    </div>
                    <div>
                        <h3 className="chart-title-sm">Income Brackets</h3>
                        <ReactApexChart options={incomeOptions} series={incomeSeries} type="bar" height={300} />
                    </div>
                    <div>
                        <h3 className="chart-title-sm">Qualification Factors</h3>
                        <ReactApexChart options={radarOptions} series={radarSeries} type="radar" height={300} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// FUZZY EVALUATION INSIGHTS
// ============================================================================
const FuzzyEvaluationInsights = ({ data }: { data: any }) => {
    if (!data) return null;

    const classifications = data.classifications || [];
    const scatterData = data.scatterData || [];
    const scoreTrend = data.scoreTrend || [];

    const scoreOptions: ApexOptions = {
        chart: { type: 'line', height: 300, zoom: { enabled: false }, toolbar: { show: false }, fontFamily: 'inherit' },
        stroke: { curve: 'smooth', width: 4 },
        colors: ['#2563eb'],
        xaxis: {
            categories: scoreTrend.map((item: any) => `${item.semester} ${item.academic_year}`),
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Average Score', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            min: 0,
            max: 1,
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        markers: { size: 7, strokeWidth: 3, strokeColors: '#fff', hover: { size: 9 } },
        dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 700 } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const scoreSeries = [{ name: 'Avg Fuzzy Score', data: scoreTrend.map((item: any) => (item.avg_score * 100).toFixed(2) || 0) }];

    const eligibleData = scatterData.filter((item: any) => item.score >= 0.8).map((item: any) => [item.gwa, item.income]);
    const conditionalData = scatterData.filter((item: any) => item.score >= 0.5 && item.score < 0.8).map((item: any) => [item.gwa, item.income]);
    const notEligibleData = scatterData.filter((item: any) => item.score < 0.5).map((item: any) => [item.gwa, item.income]);

    const scatterOptions: ApexOptions = {
        chart: { type: 'scatter', height: 300, zoom: { enabled: true }, toolbar: { show: false }, fontFamily: 'inherit' },
        xaxis: {
            title: { text: 'GWA', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            min: 1.0,
            max: 3.0,
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Family Income (₱)', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: {
                formatter: (val: number) => '₱' + val.toLocaleString(),
                style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' }
            }
        },
        colors: ['#10b981', '#f59e0b', '#dc2626'],
        markers: { size: 9, strokeWidth: 2, strokeColors: '#fff', hover: { size: 11 } },
        legend: { position: 'top', fontSize: '13px', fontWeight: 600 },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const scatterSeries = [
        { name: 'Eligible (>0.8)', data: eligibleData },
        { name: 'Conditional (0.5-0.8)', data: conditionalData },
        { name: 'Not Eligible (<0.5)', data: notEligibleData }
    ];

    const classificationOptions: ApexOptions = {
        chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: { bar: { distributed: true, borderRadius: 8, columnWidth: '65%' } },
        colors: ['#10b981', '#f59e0b', '#dc2626'],
        xaxis: {
            categories: classifications.map((item: any) => item.classification),
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Number of Applicants', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        legend: { show: false },
        dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 700 } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const classificationSeries = [{ name: 'Count', data: classifications.map((item: any) => item.count || 0) }];

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Fuzzy Evaluation Insights</h2>
            </div>
            <div className="card-body">
                <div className="section-grid-3">
                    <div>
                        <h3 className="chart-title-sm">Average Score Trend</h3>
                        <ReactApexChart options={scoreOptions} series={scoreSeries} type="line" height={300} />
                    </div>
                    <div>
                        <h3 className="chart-title-sm">GWA vs Income Analysis</h3>
                        <ReactApexChart options={scatterOptions} series={scatterSeries} type="scatter" height={300} />
                    </div>
                    <div>
                        <h3 className="chart-title-sm">Classification Distribution</h3>
                        <ReactApexChart options={classificationOptions} series={classificationSeries} type="bar" height={300} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// TIME SERIES ANALYSIS
// ============================================================================
const TimeSeriesAnalysis = ({ data }: { data: any }) => {
    if (!data) return null;

    const monthly = data.monthly || [];
    const yearly = data.yearly || [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyApplications = Array(12).fill(0);
    monthly.forEach((item: any) => {
        if (item.month >= 1 && item.month <= 12) {
            monthlyApplications[item.month - 1] = item.applications || 0;
        }
    });

    const monthlyOptions: ApexOptions = {
        chart: { type: 'area', height: 350, zoom: { enabled: true }, toolbar: { show: false }, fontFamily: 'inherit' },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#2563eb'],
        xaxis: {
            categories: monthNames,
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Applications Submitted', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        fill: { type: 'solid', opacity: 0.15 },
        markers: { size: 5, strokeWidth: 2, strokeColors: '#fff', hover: { size: 7 } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const monthlySeries = [{ name: 'Applications', data: monthlyApplications }];

    const yearlyOptions: ApexOptions = {
        chart: { type: 'line', height: 350, toolbar: { show: false }, fontFamily: 'inherit' },
        stroke: { curve: 'smooth', width: 4 },
        colors: ['#10b981', '#2563eb'],
        xaxis: {
            categories: yearly.map((item: any) => item.academic_year),
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        yaxis: {
            title: { text: 'Scholarships Awarded', style: { fontSize: '13px', fontWeight: 700, color: '#475569' } },
            labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#64748b' } }
        },
        markers: { size: 7, strokeWidth: 3, strokeColors: '#fff', hover: { size: 9 } },
        legend: { position: 'top', fontSize: '13px', fontWeight: 600 },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    const yearlySeries = [
        { name: 'Awarded', data: yearly.map((item: any) => item.awarded || 0) },
        { name: 'Applications', data: yearly.map((item: any) => item.total_applications || 0) }
    ];

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Time-Series Analysis</h2>
            </div>
            <div className="card-body">
                <div className="section-grid-2">
                    <div>
                        <h3 className="chart-title">Monthly Application Trend</h3>
                        <ReactApexChart options={monthlyOptions} series={monthlySeries} type="area" height={350} />
                    </div>
                    <div>
                        <h3 className="chart-title">Annual Scholarship Awards</h3>
                        <ReactApexChart options={yearlyOptions} series={yearlySeries} type="line" height={350} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// SCHOLARSHIP COMPARISON TABLES
// ============================================================================
const ScholarshipComparison = ({ data }: { data: any }) => {
    if (!data) return null;

    const topScholarships = data.topScholarships || [];
    const leastUtilized = data.leastUtilized || [];

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Top Applied Scholarships</h2>
                    <p className="card-subtitle">Most popular scholarship programs</p>
                </div>
                <div className="card-body">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Scholarship Name</th>
                                <th>Applications</th>
                                <th>Avg GWA</th>
                                <th>Avg Income</th>
                                <th>Approval Rate</th>
                                <th>Total Awarded</th>
                            </tr>
                            </thead>
                            <tbody>
                            {topScholarships.length > 0 ? (
                                topScholarships.map((s: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="font-medium">{s.name}</td>
                                        <td><span className="badge badge-blue">{s.applications}</span></td>
                                        <td>{s.avg_gwa ? s.avg_gwa.toFixed(2) : 'N/A'}</td>
                                        <td>₱{s.avg_income ? s.avg_income.toLocaleString() : '0'}</td>
                                        <td><span className="badge badge-green">{s.approval_rate || 0}%</span></td>
                                        <td className="font-semibold">₱{s.total_awarded ? s.total_awarded.toLocaleString() : '0'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="empty-state">No data available</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Least Utilized Scholarships</h2>
                    <p className="card-subtitle">Programs with low application rates</p>
                </div>
                <div className="card-body">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Scholarship Name</th>
                                <th>Applications</th>
                                <th>Avg GWA</th>
                                <th>Avg Income</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leastUtilized.length > 0 ? (
                                leastUtilized.map((s: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="font-medium">{s.name}</td>
                                        <td><span className="badge badge-red">{s.applications || 0}</span></td>
                                        <td>{s.avg_gwa ? s.avg_gwa.toFixed(2) : '-'}</td>
                                        <td>{s.avg_income ? `₱${s.avg_income.toLocaleString()}` : '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="empty-state">No data available</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

const dashboardStyles = `
/* ============================================================================
   RESET & ROOT VARIABLES
   ============================================================================ */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* Primary Color Palette */
    --color-primary: #2563eb;
    --color-primary-dark: #1e40af;
    --color-primary-light: #3b82f6;
    --color-primary-lighter: #60a5fa;
    
    /* Accent Colors */
    --color-purple: #8b5cf6;
    --color-green: #10b981;
    --color-orange: #f97316;
    --color-pink: #ec4899;
    --color-indigo: #6366f1;
    --color-teal: #14b8a6;
    --color-red: #dc2626;
    
    /* Neutral Palette */
    --color-slate-50: #f8fafc;
    --color-slate-100: #f1f5f9;
    --color-slate-200: #e2e8f0;
    --color-slate-300: #cbd5e1;
    --color-slate-400: #94a3b8;
    --color-slate-500: #64748b;
    --color-slate-600: #475569;
    --color-slate-700: #334155;
    --color-slate-800: #1e293b;
    --color-slate-900: #0f172a;
    
    /* Background Colors */
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    
    /* Border & Shadow */
    --border-color: #e2e8f0;
    --border-color-dark: #cbd5e1;
    --border-radius: 16px;
    --border-radius-md: 12px;
    --border-radius-sm: 8px;
    --border-radius-xs: 6px;
    
    --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
    
    /* Spacing System */
    --spacing-xs: 0.5rem;
    --spacing-sm: 0.75rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 2.5rem;
    --spacing-3xl: 3rem;
    
    /* Typography */
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    
    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================================================
   BASE STYLES
   ============================================================================ */
.dashboard-container {
    min-height: 100vh;
    background: var(--bg-secondary);
    font-family: var(--font-family);
    color: var(--color-slate-800);
    line-height: 1.6;
}

/* ============================================================================
   HEADER STYLES
   ============================================================================ */
.dashboard-header {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    padding: var(--spacing-xl) var(--spacing-2xl);
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1920px;
    margin: 0 auto;
    gap: var(--spacing-xl);
}

.header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
}

.header-icon-wrapper {
    width: 56px;
    height: 56px;
    background: rgba(37, 99, 235, 0.1);
    border-radius: var(--border-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.header-icon {
    width: 32px;
    height: 32px;
    color: var(--color-primary);
    stroke-width: 2.5;
}

.header-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.header-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--color-slate-900);
    letter-spacing: -0.025em;
    line-height: 1.2;
}

.header-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-slate-600);
    font-weight: 500;
}

.header-actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-shrink: 0;
}

/* ============================================================================
   BUTTON STYLES
   ============================================================================ */
.btn-primary,
.btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all var(--transition-base);
    letter-spacing: 0.01em;
    white-space: nowrap;
}

.btn-primary {
    background: var(--color-primary);
    color: white;
    box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
    background: var(--color-primary-dark);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
}

.btn-primary:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
}

.btn-secondary {
    background: var(--bg-primary);
    color: var(--color-slate-700);
    border: 1.5px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-tertiary);
    border-color: var(--border-color-dark);
}

.btn-secondary:active {
    background: var(--color-slate-200);
}

/* ============================================================================
   FILTERS SECTION
   ============================================================================ */
.filters-section {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
}

.filters-container {
    max-width: 1920px;
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-2xl);
}

.filters-header {
    margin-bottom: var(--spacing-lg);
}

.filters-title-wrapper {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.filters-title {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--color-slate-900);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--spacing-lg);
}

.filter-dropdown {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-label {
    font-size: var(--font-size-xs);
    font-weight: 700;
    color: var(--color-slate-700);
    text-transform: uppercase;
    letter-spacing: 0.075em;
}

.select-wrapper {
    position: relative;
}

.filter-select {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    background: var(--bg-primary);
    border: 1.5px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    color: var(--color-slate-800);
    font-weight: 600;
    cursor: pointer;
    appearance: none;
    outline: none;
    transition: all var(--transition-base);
}

.filter-select:hover {
    border-color: var(--border-color-dark);
    background: var(--bg-tertiary);
}

.filter-select:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    background: var(--bg-primary);
}

.select-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-slate-500);
    pointer-events: none;
}

/* ============================================================================
   MAIN CONTENT
   ============================================================================ */
.dashboard-main {
    padding: var(--spacing-2xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
    max-width: 1920px;
    margin: 0 auto;
}

/* ============================================================================
   METRICS GRID
   ============================================================================ */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
}

.metric-card {
    background: var(--bg-primary);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
    padding: var(--spacing-xl);
    transition: all var(--transition-base);
    position: relative;
    overflow: hidden;
}

.metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: currentColor;
    opacity: 0;
    transition: opacity var(--transition-base);
}

.metric-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
    border-color: currentColor;
}

.metric-card:hover::before {
    opacity: 1;
}

.metric-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.metric-icon-circle {
    width: 48px;
    height: 48px;
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: currentColor;
    opacity: 0.12;
    flex-shrink: 0;
}

.metric-icon-circle svg {
    color: currentColor;
    stroke-width: 2.5;
}

.metric-title {
    font-size: var(--font-size-sm);
    font-weight: 700;
    color: var(--color-slate-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.metric-body {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.metric-value {
    font-size: var(--font-size-3xl);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.025em;
    color: currentColor;
}

.metric-subtitle {
    font-size: var(--font-size-xs);
    color: var(--color-slate-600);
    font-weight: 600;
}

.metric-trend {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--color-green);
    font-weight: 700;
    background: rgba(16, 185, 129, 0.1);
    padding: 0.375rem 0.75rem;
    border-radius: var(--border-radius-xs);
    width: fit-content;
}

/* Color Classes */
.color-blue { color: var(--color-primary); }
.color-purple { color: var(--color-purple); }
.color-green { color: var(--color-green); }
.color-orange { color: var(--color-orange); }
.color-indigo { color: var(--color-indigo); }
.color-pink { color: var(--color-pink); }
.color-teal { color: var(--color-teal); }

/* ============================================================================
   CARD STYLES
   ============================================================================ */
.card {
    background: var(--bg-primary);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-xs);
    transition: all var(--transition-base);
    overflow: hidden;
}

.card:hover {
    box-shadow: var(--shadow-md);
}

.card-header {
    padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-tertiary);
}

.card-title {
    font-size: var(--font-size-xl);
    font-weight: 800;
    color: var(--color-slate-900);
    margin-bottom: 0.25rem;
    letter-spacing: -0.025em;
}

.card-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-slate-600);
    font-weight: 600;
}

.card-body {
    padding: var(--spacing-xl);
}

.chart-title {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--color-slate-800);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid var(--color-slate-100);
}

.chart-title-sm {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--color-slate-800);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 2px solid var(--color-slate-100);
}

/* ============================================================================
   GRID LAYOUTS
   ============================================================================ */
.section-grid-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: var(--spacing-xl);
}

.section-grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: var(--spacing-lg);
}

.demographics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
}

/* ============================================================================
   TABLE STYLES
   ============================================================================ */
.table-container {
    overflow-x: auto;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--border-color);
    margin-top: var(--spacing-md);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: var(--color-slate-50);
    border-bottom: 2px solid var(--border-color);
}

.data-table th {
    padding: var(--spacing-md) var(--spacing-lg);
    text-align: left;
    font-size: var(--font-size-xs);
    font-weight: 800;
    color: var(--color-slate-700);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.data-table tbody tr {
    border-bottom: 1px solid var(--border-color);
    transition: background var(--transition-fast);
}

.data-table tbody tr:last-child {
    border-bottom: none;
}

.data-table tbody tr:hover {
    background: var(--color-slate-50);
}

.data-table td {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-sm);
    color: var(--color-slate-600);
    white-space: nowrap;
}

.font-medium {
    font-weight: 700;
    color: var(--color-slate-900);
}

.font-semibold {
    font-weight: 800;
    color: var(--color-slate-900);
}

.empty-state {
    text-align: center;
    padding: var(--spacing-3xl) !important;
    color: var(--color-slate-500);
    font-weight: 600;
}

/* ============================================================================
   BADGE STYLES
   ============================================================================ */
.badge {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.875rem;
    border-radius: var(--border-radius-xs);
    font-size: var(--font-size-xs);
    font-weight: 700;
    letter-spacing: 0.025em;
}

.badge-blue {
    background: rgba(37, 99, 235, 0.12);
    color: #1e40af;
    border: 1px solid rgba(37, 99, 235, 0.2);
}

.badge-green {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
    border: 1px solid rgba(16, 185, 129, 0.2);
}

.badge-red {
    background: rgba(220, 38, 38, 0.12);
    color: #991b1b;
    border: 1px solid rgba(220, 38, 38, 0.2);
}

/* ============================================================================
   LOADING STATES
   ============================================================================ */
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    flex-direction: column;
    gap: var(--spacing-lg);
    background: var(--bg-secondary);
}

.spinner-modern {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-slate-200);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.loading-text {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-slate-600);
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* ============================================================================
   ERROR STATES
   ============================================================================ */
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    flex-direction: column;
    gap: var(--spacing-md);
    background: var(--bg-secondary);
    padding: var(--spacing-2xl);
}

.error-icon-wrapper {
    width: 80px;
    height: 80px;
    background: rgba(220, 38, 38, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-md);
}

.error-icon-wrapper svg {
    color: var(--color-red);
    stroke-width: 2;
}

.error-title {
    font-size: var(--font-size-xl);
    font-weight: 800;
    color: var(--color-slate-900);
    text-align: center;
}

.error-message {
    font-size: var(--font-size-base);
    color: var(--color-slate-600);
    font-weight: 600;
    text-align: center;
    max-width: 500px;
}

/* ============================================================================
   RESPONSIVE DESIGN
   ============================================================================ */
@media (max-width: 1536px) {
    .filters-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (max-width: 1280px) {
    .dashboard-main {
        padding: var(--spacing-xl);
    }
    
    .section-grid-2 {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 1024px) {
    .filters-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .demographics-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .card-header,
    .card-body {
        padding: var(--spacing-lg);
    }
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: flex-start;
        padding: var(--spacing-lg);
    }

    .header-left {
        width: 100%;
    }

    .header-actions {
        width: 100%;
        justify-content: stretch;
    }

    .header-actions button {
        flex: 1;
    }

    .filters-container {
        padding: var(--spacing-lg);
    }

    .filters-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
    }

    .metrics-grid {
        grid-template-columns: 1fr;
    }

    .demographics-grid {
        grid-template-columns: 1fr;
    }

    .section-grid-3 {
        grid-template-columns: 1fr;
    }
    
    .dashboard-main {
        padding: var(--spacing-lg);
        gap: var(--spacing-lg);
    }

    .section-grid-2 {
        gap: var(--spacing-lg);
    }
}

@media (max-width: 640px) {
    .filters-grid {
        grid-template-columns: 1fr;
    }

    .header-title {
        font-size: var(--font-size-xl);
    }
    
    .metric-value {
        font-size: var(--font-size-2xl);
    }
    
    .card-title {
        font-size: var(--font-size-lg);
    }

    .btn-primary,
    .btn-secondary {
        padding: 0.625rem 1.25rem;
        font-size: var(--font-size-xs);
    }
}

/* ============================================================================
   PRINT STYLES
   ============================================================================ */
@media print {
    .dashboard-header,
    .filters-section {
        display: none;
    }

    .card {
        break-inside: avoid;
        page-break-inside: avoid;
        box-shadow: none;
        margin-bottom: var(--spacing-lg);
    }
    
    .dashboard-main {
        padding: 0;
    }
}

/* ============================================================================
   ACCESSIBILITY IMPROVEMENTS
   ============================================================================ */
*:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}

.btn-primary:focus-visible,
.btn-secondary:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
`;

export default ScholarshipSummaryReport;