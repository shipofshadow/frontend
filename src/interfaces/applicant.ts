export interface Applicant {
    id: number;
    uid: string;
    student_id: number;
    students_student_id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    name_extension: string | null;
    birth_date: string;
    gender: string;
    citizenship: string | null;
    civil_status: string | null;
    contact_number: string | null;
    email: string;
    status: string;
    remarks: string | null;

    // Address
    street: string;
    barangay_code: string;
    barangay_name: string;
    municipality_code: string;
    municipality_name: string;
    province_code: string;
    province_name: string;
    region_code: string;
    region_name: string;
    zip_code: string | null;

    // Family Background
    father_first_name: string;
    father_last_name: string;
    father_middle_name: string;
    father_extension: string;
    father_occupation: string;
    father_income: string;
    mother_first_name: string;
    mother_last_name: string;
    mother_middle_name: string;
    mother_maiden_name: string | null;
    mother_occupation: string;
    mother_income: string;
    siblings: number;
    sublings_studying: number;
    household_number: number;

    // Education Info
    course_id: number;
    course: string;
    department_id: number;
    department: string;
    campus_id: number;
    campus: string;
    academic_year_id: number;
    total_units: string;
    year_level: string;
    enrollment_status: string;

    // IP affiliation
    ip_affiliation: string;

    // Submission
    submitted_at: string;
    created_at: string;
    updated_at: string;
    is_archived: number;
    user_id: number;

    itr_file: string;
    grades_file: string;
}
