export interface StudentInfo {
    id: number;
    student_id: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
}

export interface Application {
    id: number;
    status: 'pending' | 'approved' | 'denied' | 'evaluated' | 'returned' | string;
    submitted_at: string;
    approved_at?: string | null;
    remarks: string | null;
    semester: string;
    academic_year: string;
}

export interface Evaluation {
    id: number;
    gwa: number;
    total_units: number;
    income: number;
    score: number;
    classification: string;
    recommendations_generated: boolean;
    admin_reviewed: boolean;
    status: string;
    evaluated_at: string;
}

export interface RecommendedScholarship {
    id: number;
    scholarship_name: string;
    scholarship_description: string;
    grant_amount: number;
    score: number;
    classification: string;
    eligibility_reasons: any;
    notes: string | null;
    recommended_at: string;
}

export interface SelectedScholarship {
    id: number;
    scholarship_name: string;
    scholarship_description: string;
    grant_amount: number;
    status: 'selected' | 'awarded' | 'cancelled';
    awarded_amount: number | null;
    selection_reason: string | null;
    selected_at: string;
}

export interface ApplicationData {
    application: Application;
    evaluation: Evaluation | null;
    recommended_scholarships: RecommendedScholarship[];
    selected_scholarships: SelectedScholarship[];
}

export interface SummaryStatistics {
    total_applications: number;
    approved_applications: number;
    total_recommendations: number;
    total_awards: number;
    total_awarded_amount: number;
    average_gwa: number | null;
    average_score: number | null;
    approval_rate: number;
    award_rate: number;
}

