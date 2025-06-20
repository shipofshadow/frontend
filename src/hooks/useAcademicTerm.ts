import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface AcademicTerm {
    academic_year_id: number;
    academic_year: number;
    semester_id: number;
    semester_name: string;
    formatted: string;
}

export const useAcademicTerm = () => {
    const [term, setTerm] = useState<AcademicTerm | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios
            .get<AcademicTerm>(`${API_BASE_URL}/api/active-academic-term`)
            .then((res) => setTerm(res.data))
            .catch((err) => {
                console.error('Failed to fetch academic term:', err);
                setError('Failed to load academic term');
            })
    }, []);

    return { term, error };
};
