export interface Profile {
    first_name: string;
    last_name: string;
    middle_name: string;
    student_id: string;
    extension_name: string;
    avatar: string;

    email: string;
    contact_number: string;
    birth_date: string;
    civil_status: string;

    street: string;
    region_code: string;
    region_name: string;
    province_code: string;
    province_name: string;
    municipality_code: string;
    municipality_name: string;
    barangay_code: string;
    barangay_name: string;

    father_last_name: string;
    father_first_name: string;
    father_middle_name: string;
    father_extension: string;
    father_occupation: string;
    father_income: string;

    mother_last_name: string;
    mother_first_name: string;
    mother_middle_name: string;
    mother_occupation: string;
    mother_income: string;

    household_number: number;
    siblings: number;
    siblings_studying: number;
    ip_affiliation: string;
    is_4ps_member: number;

    citizenship: string;

    emergency_contact_name: string;
    emergency_contact_number: string;
}
