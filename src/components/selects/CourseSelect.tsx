import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type {Course} from '../../types/meta';
import { API_BASE_URL } from "../../config.ts";

interface Props {
    departmentId: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

const CourseSelect: React.FC<Props> = ({ departmentId, value, onChange }) => {
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        if (departmentId) {
            axios.get(`${API_BASE_URL}/api/courses`, { params: { department_id: departmentId } })
                .then(res => setCourses(res.data));
        } else {
            setCourses([]);
        }
    }, [departmentId]);

    return (
        <select name="course" className="form-select form-select-lg border-2 rounded-3" value={value} onChange={onChange} required>
            <option value="">Select Course</option>
            {courses.map(course => (
                <option key={course.id} value={course.id}>
                    {course.name}{course.major ? ` (${course.major})` : ''}
                </option>
            ))}
        </select>
    );
};

export default CourseSelect;
