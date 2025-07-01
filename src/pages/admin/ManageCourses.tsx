import React, { useEffect, useState } from "react";
import axios from "axios";
import {API_BASE_URL} from "../../config.ts";

type Department = {
    id: number;
    name: string;
};

type Course = {
    id: number;
    name: string;
    department_id: number;
};

const ManageCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);

    const [courseName, setCourseName] = useState("");
    const [selectedDeptId, setSelectedDeptId] = useState("");

    useEffect(() => {
        fetchDepartments();
        fetchCourses();
    }, []);

    const fetchDepartments = () => {
        axios
            .get(`${API_BASE_URL}/api/departments`)
            .then((res) => setDepartments(res.data))
            .catch((err) => console.error("Failed to load departments", err));
    };

    const fetchCourses = () => {
        setLoading(true);
        axios
            .get(`${API_BASE_URL}/api/courses`)
            .then((res) => setCourses(res.data))
            .catch((err) => console.error("Failed to load courses", err))
            .finally(() => setLoading(false));
    };

    const openModal = (course: Course | null = null) => {
        setEditing(course);
        setCourseName(course?.name || "");
        setSelectedDeptId(course?.department_id.toString() || "");
        setShowModal(true);
    };

    const handleSave = () => {
        if (!courseName.trim() || !selectedDeptId) return alert("All fields are required");

        const data = { name: courseName, department_id: parseInt(selectedDeptId) };

        if (editing) {
            axios.put(`${API_BASE_URL}/api/courses/${editing.id}`, data).then(() => {
                fetchCourses();
                setShowModal(false);
            });
        } else {
            axios.post(`${API_BASE_URL}/api/courses`, data).then(() => {
                fetchCourses();
                setShowModal(false);
            });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        axios.delete(`${API_BASE_URL}/api/courses/${id}`).then(() => fetchCourses());
    };

    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon">
                                        <i data-feather="book-open"></i>
                                    </div>
                                    Manage Courses
                                </h1>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
                                    <i className="fa fa-plus me-2"></i>Add Course
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                <div className="card">
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : (
                            <table className="table table-bordered table-hover">
                                <thead>
                                <tr>
                                    <th style={{ width: "10%" }}>#</th>
                                    <th>Course Name</th>
                                    <th>Department</th>
                                    <th style={{ width: "20%" }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {courses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted">
                                            No courses found.
                                        </td>
                                    </tr>
                                ) : (
                                    courses.map((course, index) => (
                                        <tr key={course.id}>
                                            <td>{index + 1}</td>
                                            <td>{course.name}</td>
                                            <td>
                                                {
                                                    departments.find((d) => d.id === course.department_id)?.name ||
                                                    "Unknown"
                                                }
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => openModal(course)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(course.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow">
                            <div className="modal-header">
                                <h5 className="modal-title">{editing ? "Edit Course" : "Add Course"}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Course Name</label>
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                />

                                <label className="form-label">Department</label>
                                <select
                                    className="form-select"
                                    value={selectedDeptId}
                                    onChange={(e) => setSelectedDeptId(e.target.value)}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    {editing ? "Update" : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageCourses;
