import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type {Campus} from '../../types/meta';
import { API_BASE_URL } from "../../config.ts";

interface Props {
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

const CampusSelect: React.FC<Props> = ({ value, onChange }) => {
    const [campuses, setCampuses] = useState<Campus[]>([]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/campuses`).then(res => setCampuses(res.data));
    }, []);

    return (
        <select name="campus" className="form-control" value={value} onChange={onChange} required>
            <option value="">Select Campus</option>
            {campuses.map(campus => (
                <option key={campus.id} value={campus.id}>{campus.name}</option>
            ))}
        </select>
    );
};

export default CampusSelect;
