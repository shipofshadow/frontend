// types/dashboard.types.ts

/**
 * Filter parameters for dashboard queries
 */
export interface DashboardFilters {
    semester?: string | number;
    campus?: string | number;
    department?: string | number;
    course?: string | number;
    academicYear?: string | number;
    yearLevel?: string | number;
    status?: 'pending' | 'approved' | 'denied' | 'All';
}

/**
 * Summary statistics for the dashboard
 */
export interface DashboardSummary {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    deniedApplications: number;
    totalScholarships: number;
    totalAmountAwarded: number;
    averageGWA: number;
    averageIncome: number;
}

/**
 * Scholarship data with application statistics
 */
export interface ScholarshipData {
    id: number;
    name: string;
    description?: string;
    grantAmount: number;
    isActive: boolean;
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    deniedApplications: number;
    totalAmountAwarded: number;
}

/**
 * Campus-level statistics
 */
export interface CampusData {
    campusId: number;
    campusName: string;
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    deniedApplications: number;
    averageGWA: number;
    averageIncome: number;
    departments?: DepartmentData[];
}

/**
 * Department-level statistics
 */
export interface DepartmentData {
    departmentId: number;
    departmentName: string;
    campusId: number;
    totalApplications: number;
    approvedApplications: number;
    averageGWA: number;
    courses?: CourseData[];
}

/**
 * Course-level statistics
 */
export interface CourseData {
    courseId: number;
    courseName: string;
    departmentId: number;
    totalApplications: number;
    approvedApplications: number;
    averageGWA: number;
}

/**
 * Fuzzy logic evaluation distribution
 */
export interface FuzzyData {
    classification: 'Eligible' | 'Conditionally Eligible' | 'Low Eligibility' | 'Not Eligible';
    count: number;
    percentage: number;
    averageScore: number;
    averageGWA: number;
    averageIncome: number;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
    date: string;
    period: string;
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    deniedApplications: number;
    averageGWA: number;
    averageScore: number;
}

/**
 * Demographics breakdown
 */
export interface DemographicsData {
    gender: {
        male: number;
        female: number;
        other: number;
    };
    civilStatus: {
        single: number;
        married: number;
        widowed: number;
        separated: number;
    };
    yearLevel: {
        [key: string]: number;
    };
    enrollmentStatus: {
        enrolled: number;
        notEnrolled: number;
        dropped: number;
    };
    fourPsMember: {
        yes: number;
        no: number;
    };
    indigenousPeople: {
        yes: number;
        no: number;
    };
}

/**
 * Bubble chart data point (Income vs GWA)
 */
export interface BubbleDataPoint {
    studentId: string;
    studentName: string;
    income: number;
    gwa: number;
    score: number;
    classification: string;
    scholarshipName?: string;
    campusName: string;
    courseName: string;
}

/**
 * Statistical measures
 */
export interface StatisticsData {
    gwa: {
        min: number;
        max: number;
        mean: number;
        median: number;
        stdDev: number;
    };
    income: {
        min: number;
        max: number;
        mean: number;
        median: number;
        stdDev: number;
    };
    score: {
        min: number;
        max: number;
        mean: number;
        median: number;
        stdDev: number;
    };
    correlations: {
        gwaIncome: number;
        gwaScore: number;
        incomeScore: number;
    };
}

/**
 * Filter options available for selection
 */
export interface FilterOptions {
    semesters: Array<{
        id: number;
        name: string;
        academicYearId: number;
        academicYear: string;
        isActive: boolean;
    }>;
    campuses: Array<{
        id: number;
        name: string;
    }>;
    departments: Array<{
        id: number;
        name: string;
        campusId: number;
        campusName: string;
    }>;
    courses: Array<{
        id: number;
        name: string;
        departmentId: number;
        departmentName: string;
        major?: string;
    }>;
    academicYears: Array<{
        id: number;
        yearStart: number;
        yearEnd: number;
        display: string;
    }>;
    yearLevels: Array<string | number>;
    statuses: Array<{
        value: string;
        label: string;
    }>;
}

/**
 * Complete dashboard data structure
 */
export interface DashboardData {
    summary: DashboardSummary | null;
    scholarships: ScholarshipData[] | null;
    campuses: CampusData[] | null;
    fuzzy: FuzzyData[] | null;
    timeseries: TimeSeriesDataPoint[] | null;
    demographics: DemographicsData | null;
    bubbleData: BubbleDataPoint[] | null;
    statistics: StatisticsData | null;
    filterOptions: FilterOptions | null;
}

/**
 * Hook return type for useDashboardData
 */
export interface UseDashboardDataReturn {
    data: DashboardData;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    exportData: () => Promise<any>;
}

/**
 * Hook return type for useDashboardSection
 */
export interface UseDashboardSectionReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Export data response
 */
export interface ExportDataResponse {
    data: Array<Record<string, any>>;
    filename: string;
    timestamp: string;
    filters: DashboardFilters;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

/**
 * Chart data types for ApexCharts
 */
export interface ChartSeries {
    name: string;
    data: number[] | Array<{ x: string | number; y: number }>;
}

export interface PieChartData {
    labels: string[];
    series: number[];
}

export interface BubbleChartSeries {
    name: string;
    data: Array<{
        x: number;
        y: number;
        z: number;
        meta?: Record<string, any>;
    }>;
}