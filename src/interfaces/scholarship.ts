export interface ScholarshipRules {
    rule_id: number;
    min_gwa: number;
    max_gwa: number;
    min_income: number;
    max_income: number;
    min_units_enrolled: number;
    max_units_enrolled: number;
    preferred_campus_ids: number[];
    preferred_course_ids: number[];
    preferred_department_ids: number[];
    preferred_year_levels: string[];
    priorities: {
        must_be_ofw: boolean;
        prefer_farmers_child: boolean;
        prefer_pwd: boolean;
        require_ip: boolean;
    };
}

export interface Scholarship {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    rules: ScholarshipRules;
}
