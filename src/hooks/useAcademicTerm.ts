import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface AcademicTerm {
    academic_year_id: number;
    academic_year: number;
    semester_id: number;
    semester_name: string;
    formatted: string;
}

export const useAcademicTerm = () => {
    const [term, setTerm] = useState<AcademicTerm | null>(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/active-academic-term`)
            .then(res => {
                return setTerm(res.data);
            })
            .catch(err => console.error('Failed to fetch academic term:', err))
    }, []);

    return { term };
};
