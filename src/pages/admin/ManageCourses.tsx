import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config.ts";

type Campus = {
    id: number;
    name: string;
};

type Department = {
    id: number;
    name: string;
    campus_id: number;
};

type Course = {
    id: number;
    name: string;
    department_id: number;
    department_name: string;
    campus_id: number;
};

const ManageCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);

    const [courseName, setCourseName] = useState("");
    const [selectedCampusId, setSelectedCampusId] = useState("");
    const [selectedDeptId, setSelectedDeptId] = useState("");

    useEffect(() => {
        fetchCampuses();
        fetchCourses();
    }, []);

    const fetchCampuses = () => {
        axios
            .get<Campus[]>(`${API_BASE_URL}/api/campus`)
            .then((res) => setCampuses(res.data))
            .catch((err) => console.error("Failed to load campuses", err));
    };

    const fetchDepartments = (campusId: string) => {
        if (!campusId) {
            setDepartments([]);
            return;
        }
        axios
            .get<Department[]>(`${API_BASE_URL}/api/campus/department?campus_id=${campusId}`)
            .then((res) => setDepartments(res.data))
            .catch((err) => console.error("Failed to load departments", err));
    };

    const fetchCourses = () => {
        setLoading(true);
        axios
            .get<Course[]>(`${API_BASE_URL}/api/campus/course`)
            .then((res) => setCourses(res.data))
            .catch((err) => console.error("Failed to load courses", err))
        setLoading(false)
    };

    const openModal = (course: Course | null = null) => {
        setEditing(course);
        setCourseName(course?.name || "");

        if (course) {
            setSelectedCampusId(course.campus_id.toString());
            setSelectedDeptId(course.department_id.toString());
            fetchDepartments(course.campus_id.toString());
        } else {
            setSelectedCampusId("");
            setSelectedDeptId("");
            setDepartments([]);
        }

        setShowModal(true);
    };

    const handleSave = () => {
        if (!courseName.trim() || !selectedDeptId || !selectedCampusId) {
            alert("All fields are required");
            return;
        }

        const data = {
            name: courseName,
            department_id: parseInt(selectedDeptId)
        };

        if (editing) {
            axios
                .put(`${API_BASE_URL}/api/campus/course/${editing.id}`, data)
                .then(() => {
                    fetchCourses();
                    setShowModal(false);
                    resetForm();
                })
                .catch((err) => console.error("Failed to update course", err));
        } else {
            axios
                .post(`${API_BASE_URL}/api/campus/course`, data)
                .then(() => {
                    fetchCourses();
                    setShowModal(false);
                    resetForm();
                })
                .catch((err) => console.error("Failed to create course", err));
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
        axios
            .delete(`${API_BASE_URL}/api/campus/course/${id}`)
            .then(() => fetchCourses())
            .catch((err) => console.error("Failed to delete course", err));
    };

    const resetForm = () => {
        setCourseName("");
        setSelectedCampusId("");
        setSelectedDeptId("");
        setDepartments([]);
    };


    return (
        <>
            <style>{`
                .stat-card {
                    transition: transform 0.2s, box-shadow 0.2s;
                    border: 1px solid #e9ecef;
                }
                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                }
                .table thead th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #dee2e6;
                }
                .table tbody tr {
                    transition: background-color 0.15s ease;
                }
                .table tbody tr:hover {
                    background-color: #f8f9fa;
                }
                .modal-backdrop.show {
                    opacity: 0.5;
                }
                .fade-in {
                    animation: fadeIn 0.3s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .action-btn {
                    transition: all 0.15s ease;
                }
                .action-btn:hover {
                    transform: translateY(-1px);
                }
                .badge-custom {
                    font-size: 0.7rem;
                    padding: 0.35em 0.65em;
                }
            `}</style>

            {/* Header */}
            <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container-fluid px-4">
                    <div className="py-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-primary bg-opacity-10 rounded">
                                    <i className="fas fa-book-open fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold">Manage Courses</h1>
                                    <p className="text-muted mb-0 small">
                                        Configure academic programs and courses across departments
                                    </p>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={() => openModal()}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Add Course
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                {/* Stats Row */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Courses</p>
                                        <h3 className="mb-0 fw-bold">{courses.length}</h3>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-graduation-cap fa-2x text-primary"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Departments</p>
                                        <h3 className="mb-0 fw-bold text-success">
                                            {new Set(courses.map(c => c.department_id)).size}
                                        </h3>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-building fa-2x text-success"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Campuses</p>
                                        <h3 className="mb-0 fw-bold text-info">{campuses.length}</h3>
                                    </div>
                                    <div className="bg-info bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-map-marker-alt fa-2x text-info"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Avg per Campus</p>
                                        <h3 className="mb-0 fw-bold text-warning">
                                            {campuses.length > 0 ? (courses.length / campuses.length).toFixed(1) : '0'}
                                        </h3>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 p-3 rounded">
                                        <i className="fas fa-chart-line fa-2x text-warning"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Main Card */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom py-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <h5 className="mb-0 fw-semibold">
                                <i className="fas fa-list me-2 text-primary"></i>
                                Course Catalog
                            </h5>
                            <span className="badge bg-primary">{courses.length} Total</span>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mb-0">Loading courses...</p>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-book-open fa-3x text-muted mb-3 opacity-25"></i>
                                <h5 className="text-muted">No Courses Found</h5>
                                <p className="text-muted small mb-3">
                                    Start by adding your first course or academic program
                                </p>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openModal()}
                                >
                                    <i className="fas fa-plus me-1"></i>
                                    Add First Course
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead>
                                    <tr>
                                        <th className="border-0" style={{ width: "60px" }}>#</th>
                                        <th className="border-0">
                                            <i className="fas fa-book me-2 text-primary"></i>
                                            Course Name
                                        </th>
                                        <th className="border-0">
                                            <i className="fas fa-building me-2 text-success"></i>
                                            Department
                                        </th>
                                        <th className="border-0">
                                            <i className="fas fa-map-marker-alt me-2 text-info"></i>
                                            Campus
                                        </th>
                                        <th className="border-0 text-center" style={{ width: "200px" }}>
                                            <i className="fas fa-cog me-2 text-muted"></i>
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {courses.map((course, index) => {
                                        const campus = campuses.find(c => c.id === course.campus_id);
                                        return (
                                            <tr key={course.id} className="fade-in">
                                                <td>
                                                        <span className="badge bg-light text-dark border fw-semibold">
                                                            {index + 1}
                                                        </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                                                            <i className="fas fa-graduation-cap text-primary"></i>
                                                        </div>
                                                        <div>
                                                            <strong className="d-block">{course.name}</strong>
                                                            <small className="text-muted">Course ID: {course.id}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                        <span className="badge badge-custom bg-success bg-opacity-10 text-success border border-success">
                                                            <i className="fas fa-briefcase me-1"></i>
                                                            {course.department_name}
                                                        </span>
                                                </td>
                                                <td>
                                                        <span className="badge badge-custom bg-info bg-opacity-10 text-info border border-info">
                                                            <i className="fas fa-map-pin me-1"></i>
                                                            {campus?.name || "Unknown"}
                                                        </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary action-btn"
                                                            onClick={() => openModal(course)}
                                                            title="Edit Course"
                                                        >
                                                            <i className="fas fa-edit me-1"></i>
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger action-btn"
                                                            onClick={() => handleDelete(course.id)}
                                                            title="Delete Course"
                                                        >
                                                            <i className="fas fa-trash-alt me-1"></i>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {courses.length > 0 && (
                        <div className="card-footer bg-white border-top py-3">
                            <div className="d-flex justify-content-between align-items-center text-muted small">
                                <span>
                                    <i className="fas fa-info-circle me-1"></i>
                                    Showing {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                                </span>
                                <span>Last updated: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header border-0 bg-light">
                                    <div>
                                        <h5 className="modal-title fw-bold">
                                            <i className={`fas ${editing ? 'fa-edit text-warning' : 'fa-plus-circle text-primary'} me-2`}></i>
                                            {editing ? "Edit Course" : "Add New Course"}
                                        </h5>
                                        <p className="text-muted small mb-0">
                                            {editing
                                                ? "Update the course information below"
                                                : "Enter the details for the new course or program"
                                            }
                                        </p>
                                    </div>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        aria-label="Close"
                                    />
                                </div>
                                <div className="modal-body px-4 py-4">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                <i className="fas fa-book me-2 text-primary"></i>
                                                Course Name
                                                <span className="text-danger ms-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                placeholder="e.g., Bachelor of Science in Information Technology"
                                                value={courseName}
                                                onChange={(e) => setCourseName(e.target.value)}
                                                autoFocus
                                            />
                                            <small className="text-muted">
                                                <i className="fas fa-info-circle me-1"></i>
                                                Enter the full official name of the course or program
                                            </small>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">
                                                <i className="fas fa-map-marker-alt me-2 text-info"></i>
                                                Campus
                                                <span className="text-danger ms-1">*</span>
                                            </label>
                                            <select
                                                className="form-select form-select-lg"
                                                value={selectedCampusId}
                                                onChange={(e) => {
                                                    setSelectedCampusId(e.target.value);
                                                    setSelectedDeptId("");
                                                    fetchDepartments(e.target.value);
                                                }}
                                            >
                                                <option value="">Select Campus</option>
                                                {campuses.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted">
                                                <i className="fas fa-info-circle me-1"></i>
                                                Choose the campus location first
                                            </small>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">
                                                <i className="fas fa-building me-2 text-success"></i>
                                                Department
                                                <span className="text-danger ms-1">*</span>
                                            </label>
                                            <select
                                                className="form-select form-select-lg"
                                                value={selectedDeptId}
                                                onChange={(e) => setSelectedDeptId(e.target.value)}
                                                disabled={!selectedCampusId}
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted">
                                                <i className="fas fa-info-circle me-1"></i>
                                                {!selectedCampusId
                                                    ? "Select a campus first to see departments"
                                                    : departments.length === 0
                                                        ? "No departments available for this campus"
                                                        : "Choose which department offers this course"
                                                }
                                            </small>
                                        </div>
                                    </div>

                                    {editing && (
                                        <div className="alert alert-info border-0 mt-3 mb-0">
                                            <div className="d-flex align-items-start">
                                                <i className="fas fa-lightbulb me-2 mt-1"></i>
                                                <div>
                                                    <strong>Note:</strong> Updating this course will affect all students enrolled in this program and related scholarship rules.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {campuses.length === 0 && (
                                        <div className="alert alert-warning border-0 mt-3 mb-0">
                                            <div className="d-flex align-items-start">
                                                <i className="fas fa-exclamation-triangle me-2 mt-1"></i>
                                                <div>
                                                    <strong>No campuses available.</strong> Please create a campus and department first before adding courses.
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 bg-light">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Cancel
                                    </button>
                                    <button
                                        className={`btn ${editing ? 'btn-warning' : 'btn-primary'}`}
                                        onClick={handleSave}
                                        disabled={!courseName.trim() || !selectedDeptId || !selectedCampusId}
                                    >
                                        <i className={`fas ${editing ? 'fa-save' : 'fa-check'} me-1`}></i>
                                        {editing ? "Update Course" : "Create Course"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ManageCourses;
