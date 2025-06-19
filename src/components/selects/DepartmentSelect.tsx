import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type {Department} from '../../interfaces/meta';
import { API_BASE_URL } from "../../config.ts";

interface Props {
    campusId: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

const DepartmentSelect: React.FC<Props> = ({ campusId, value, onChange }) => {
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        if (campusId) {
            axios.get(`${API_BASE_URL}/api/departments`, { params: { campus_id: campusId } })
                .then(res => setDepartments(res.data));
        } else {
            setDepartments([]);
        }
    }, [campusId]);

    return (
        <select name="department" className="form-select" value={value} onChange={onChange} required>
            <option value="">Select Department</option>
            {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
        </select>
    );
};

export default DepartmentSelect;
