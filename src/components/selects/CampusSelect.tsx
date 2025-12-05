import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { Campus } from '../../interfaces/meta.ts';
import { API_BASE_URL } from '../../config.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

const CampusSelect: React.FC<Props> = ({ value, onChange }) => {
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        axios
            .get<Campus[]>(`${API_BASE_URL}/api/campus`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setCampuses(res.data))
            .catch((err) => console.error("Failed to load campuses", err));
    }, [token]);

    return (
        <select name="campus" className="form-select" value={value} onChange={onChange} required>
            <option value="">Select Campus</option>
            {campuses.map((campus) => (
                <option key={campus.id} value={campus.id.toString()}>
                    {campus.name}
                </option>
            ))}
        </select>
    );
};

export default CampusSelect;
