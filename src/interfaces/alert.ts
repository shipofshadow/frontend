// Alert Interfaces for Scholarship Match Alerts

export interface MatchExplanation {
    summary: string;
    strength_factors: StrengthFactor[];
    bonus_factors: BonusFactor[];
    score_breakdown: ScoreBreakdown;
}

export interface StrengthFactor {
    factor: string;
    score: number;
    description: string;
    impact: 'high' | 'medium' | 'low';
}

export interface BonusFactor {
    factor: string;
    points: number;
    description: string;
}

export interface ScoreBreakdown {
    base_score: number;
    academic_fit: number;
    financial_fit: number;
    priority_bonus: number;
    total: number;
}

export interface RecommendedScholarship {
    scholarship_name: string;
    scholarship_description: string;
    grant_amount: number | null;
    score: number;
    scholarship_id: number;
    match_explanation?: MatchExplanation;
    created_at?: string;
}

export interface ScholarshipAlert {
    id: number;
    scholarship_id: number;
    scholarship_name: string;
    scholarship_description?: string;
    grant_amount: number | null;
    match_score: number;
    top_factors: string[];
    match_summary: string;
    deadline?: string;
    is_read: boolean;
    created_at: string;
}

export interface AlertPreferences {
    email_alerts_enabled: boolean;
    min_match_score: number;
    alert_frequency: 'immediate' | 'daily' | 'weekly';
}

export interface AlertsResponse {
    unread_count: number;
    alerts: ScholarshipAlert[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
