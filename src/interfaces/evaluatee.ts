export interface Grade {
    subject_name: string;
    grade: number;
    units: number;
}

export interface Evaluatee {
    id: number;
    name: string;
    status: string;
    campus_id: number;
    department_id: number;
    course_id: number;
    year_level: string;
    family_income: string;
    is_farmers_child: boolean;
    is_ip: boolean;
    is_ofw: boolean;
    grades: Grade[];
}
