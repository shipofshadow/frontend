import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { Course } from '../../interfaces/meta.ts';
import { API_BASE_URL } from '../../config.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
    departmentId: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

const CourseSelect: React.FC<Props> = ({ departmentId, value, onChange }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        if (departmentId) {
            axios
                .get<Course[]>(`${API_BASE_URL}/api/campus/course`, {
                    params: { department_id: departmentId },
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => setCourses(res.data))
                .catch((err) => console.error('Failed to load courses', err));
        } else {
            setCourses([]);
        }
    }, [departmentId, token]);

    return (
        <select
            name="course"
            className="form-select"
            value={value}
            onChange={onChange}
            required
        >
            <option value="">Select Course</option>
            {courses.map((course) => (
                <option key={course.id} value={course.id.toString()}>
                    {course.name}
                    {course.major ? ` (${course.major})` : ''}
                </option>
            ))}
        </select>
    );
};

export default CourseSelect;
