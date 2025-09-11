export interface Campus {
    id: string;
    name: string;
}

export interface Department {
    id: string;
    name: string;
    campus_id: string;
}

export interface Course {
    id: number;
    name: string;
    major?: string;
    department_id: number;
}
