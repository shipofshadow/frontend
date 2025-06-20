export interface ApplicationForm {
    // Personal Info
    firstName: string;
    middleName?: string | null;
    lastName: string;
    nameExtension?: string | null;
    email: string;
    phone: string;
    birthDate: string;

    // Address Info
    street: string;

    regionCode: string;
    regionName: string;

    provinceCode: string;
    provinceName: string;

    municipalityCode: string;
    municipalityName: string;

    barangayCode: string;
    barangayName: string;

    // Parental Info
    father: {
        lastName: string;
        firstName: string;
        middleName?: string | null;
        extension?: string | null;
        occupation: string;
        income: number;
    };

    mother: {
        lastName: string;
        firstName: string;
        middleName?: string | null;
        occupation: string;
        income: number;
    };

    // Emergency Contact
    emergencyContactName: string;
    emergencyContactNumber: string;

    // Household Info
    householdNumber: number;
    siblings: number;
    siblingsStudying: number;
    ipAffiliation?: string | null;
    dswdProgram?: string | null;

    // Academic Info
    studentId: string;
    campus: number;
    department: number;
    course: number;
    academicYearId: number;
    semesterId: number;
    enrollmentStatus: string;
    total_units: number;
    // Scholarship Info
    scholarshipName: string;
    otherScholarship?: string;
    scholarshipAmount: number;

    itr: File | null;
    grades: File | null;

}
