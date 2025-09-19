import React, { useEffect, useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../../../config.ts';
import { useAuth } from '../../../context/AuthContext.tsx';
import ScholarshipSummary from '../../../components/common/admin/ScholarshipSummary.tsx';

interface Student {
    uuid: string;
    uid: string;
    first_name: string;
    last_name: string;
    student_id?: number;
    campus?: string;
    course?: string;
    year_level?: string;
    department?: string;
}

interface ApiResponse {
    data?: Student[];
    message?: string;
}

const StudentScholarshipReport: React.FC = () => {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { token } = useAuth();

    // Enhanced filter that searches across multiple fields
    const filteredStudents = students.filter((student) => {
        const searchFields = [
            student.first_name,
            student.last_name,
            student.uid,
            student.uuid,
            student.campus,
            student.course,
            student.year_level,
            student.department
        ].filter(Boolean).join(' ').toLowerCase();

        return searchFields.includes(searchTerm.toLowerCase());
    });

    // Fetch students with additional education info
    const fetchStudents = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/applicants/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            setStudents(Array.isArray(data) ? data : (data?.data || []));
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to load students. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsDropdownOpen(true);
        setHighlightedIndex(-1);

        // Clear selection if search term doesn't match selected student
        if (selectedStudentId) {
            const selectedStudent = students.find(s => s.uuid === selectedStudentId);
            if (selectedStudent) {
                const studentText = [
                    selectedStudent.first_name,
                    selectedStudent.last_name,
                    selectedStudent.student_id,
                    selectedStudent.campus,
                    selectedStudent.course,
                    selectedStudent.uid,
                ].filter(Boolean).join(' ');

                if (!studentText.toLowerCase().includes(value.toLowerCase())) {
                    setSelectedStudentId('');
                }
            }
        }
    };

    const handleStudentSelect = (student: Student) => {
        setSelectedStudentId(student.uuid);

        // Enhanced display text with more context
        const displayParts = [
            student.student_id,
            `${student.first_name} ${student.last_name}`,
            student.campus && `📍 ${student.campus}`,
            student.course && `🎓 ${student.course}`
        ].filter(Boolean);

        setSearchTerm(displayParts.join(' • '));
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isDropdownOpen && e.key !== 'Enter' && e.key !== 'ArrowDown') {
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setIsDropdownOpen(true);
                setHighlightedIndex(prev =>
                    prev < filteredStudents.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredStudents.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredStudents.length) {
                    handleStudentSelect(filteredStudents[highlightedIndex]);
                } else if (filteredStudents.length === 1) {
                    handleStudentSelect(filteredStudents[0]);
                }
                break;
            case 'Escape':
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleClearSelection = () => {
        setSelectedStudentId('');
        setSearchTerm('');
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    const handleInputFocus = () => {
        setIsDropdownOpen(true);
    };

    const handleRetry = () => {
        fetchStudents();
    };

    const selectedStudent = students.find(student => student.uuid === selectedStudentId);

    // Helper function to get year level badge color
    const getYearLevelBadgeColor = (yearLevel?: string) => {
        if (!yearLevel) return 'secondary';
        switch (yearLevel.toLowerCase()) {
            case '1': case 'first': case 'freshman': return 'success';
            case '2': case 'second': case 'sophomore': return 'info';
            case '3': case 'third': case 'junior': return 'warning';
            case '4': case 'fourth': case 'senior': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Enhanced Header Section */}
            <div className="row mb-4">
                <div className="col-md-8">
                    <div className="d-flex align-items-center mb-2">
                        <span className="fs-2 me-2">📊</span>
                        <div>
                            <h1 className="h3 mb-1 text-dark">Student Scholarship Report</h1>
                            <p className="text-muted mb-0">
                                Search by name, student ID, campus, course, or year level
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 text-end">
                    {selectedStudentId && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm shadow-sm"
                            onClick={handleClearSelection}
                        >
                            <i className="fas fa-times me-1"></i>
                            Clear Selection
                        </button>
                    )}
                </div>
            </div>

            {/* Enhanced Error Display */}
            {error && (
                <div className={`alert ${error.includes('Limited') ? 'alert-warning' : 'alert-danger'} d-flex align-items-center mb-4 shadow-sm`}>
                    <span className="me-2">
                        {error.includes('Limited') ? '⚠️' : '❌'}
                    </span>
                    <div className="flex-grow-1">{error}</div>
                    <button
                        type="button"
                        className={`btn btn-sm ${error.includes('Limited') ? 'btn-outline-warning' : 'btn-outline-danger'}`}
                        onClick={handleRetry}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Loading...
                            </>
                        ) : (
                            'Retry'
                        )}
                    </button>
                </div>
            )}

            {/* Enhanced Search Card */}
            <div className="card mb-4 shadow-sm border-0">
                <div className="card-header bg-gradient bg-light border-0">
                    <h5 className="card-title mb-0 d-flex align-items-center">
                        <span className="me-2">🔍</span>
                        Search & Select Student
                        <span className="badge bg-secondary ms-2">{students.length} total</span>
                    </h5>
                </div>
                <div className="card-body p-4">
                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            <label htmlFor="studentSearch" className="form-label fw-bold mb-3">
                                Student Search
                            </label>

                            {/* Enhanced Searchable Dropdown */}
                            <div className="position-relative" ref={dropdownRef}>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-white border-end-0">
                                        {isLoading ? (
                                            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        ) : (
                                            <i className="fas fa-search text-muted"></i>
                                        )}
                                    </span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        id="studentSearch"
                                        className={`form-control border-start-0 ${isDropdownOpen ? 'rounded-bottom-0' : ''}`}
                                        placeholder={isLoading ? 'Loading students...' : 'Search by name, ID, campus, course, or year level...'}
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onFocus={handleInputFocus}
                                        onKeyDown={handleKeyDown}
                                        disabled={isLoading}
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Enhanced Dropdown Menu */}
                                {isDropdownOpen && !isLoading && (
                                    <div
                                        className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-lg"
                                        style={{
                                            zIndex: 1050,
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            borderColor: '#ced4da'
                                        }}
                                    >
                                        {filteredStudents.length > 0 ? (
                                            <>
                                                {filteredStudents.map((student, index) => (
                                                    <div
                                                        key={student.uuid}
                                                        className={`px-4 py-3 cursor-pointer border-bottom ${
                                                            index === highlightedIndex ? 'bg-primary text-white' : 'bg-white hover-bg-light'
                                                        } ${selectedStudentId === student.uuid ? 'bg-light border-start border-success border-4' : ''}`}
                                                        onClick={() => handleStudentSelect(student)}
                                                        onMouseEnter={() => setHighlightedIndex(index)}
                                                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div className="flex-grow-1">
                                                                {/* Student Name & ID */}
                                                                <div className="d-flex align-items-center mb-2">
                                                                    {student.student_id && (
                                                                        <span className={`badge ${index === highlightedIndex ? 'bg-light text-dark' : 'bg-primary text-white'} ms-2`}>
                                                                            {student.uid}
                                                                        </span>
                                                                    )}
                                                                    <h6 className={`mb-0 fw-bold ${index === highlightedIndex ? 'text-white' : 'text-dark'}`}>
                                                                        {student.first_name} {student.last_name}
                                                                        {selectedStudentId === student.uuid && (
                                                                            <i className="fas fa-check-circle text-success ms-2"></i>
                                                                        )}
                                                                    </h6>

                                                                </div>

                                                                {/* Academic Info */}
                                                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                                                    {student.campus && (
                                                                        <small className={`d-flex align-items-center ${index === highlightedIndex ? 'text-white-75' : 'text-muted'}`}>
                                                                            <i className="fas fa-map-marker-alt me-1"></i>
                                                                            {student.campus}
                                                                        </small>
                                                                    )}
                                                                    {student.course && (
                                                                        <small className={`d-flex align-items-center ${index === highlightedIndex ? 'text-white-75' : 'text-muted'}`}>
                                                                            <i className="fas fa-graduation-cap me-1"></i>
                                                                            {student.course}
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Year Level Badge */}
                                                            {student.year_level && (
                                                                <div className="ms-3">
                                                                    <span className={`badge bg-${getYearLevelBadgeColor(student.year_level)} fs-6`}>
                                                                        Year {student.year_level}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Results Count */}
                                                <div className="px-4 py-3 bg-light border-top">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <small className="text-muted">
                                                            <i className="fas fa-users me-1"></i>
                                                            {filteredStudents.length} of {students.length} students
                                                            {searchTerm && ` matching "${searchTerm}"`}
                                                        </small>
                                                        {searchTerm && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => setSearchTerm('')}
                                                            >
                                                                Clear Filter
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="px-4 py-5 text-center text-muted">
                                                {students.length === 0 ? (
                                                    <>
                                                        <i className="fas fa-inbox fa-2x mb-3 text-muted"></i>
                                                        <div className="h5">No students found</div>
                                                        <p className="mb-0">No students are registered in the system</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-search fa-2x mb-3 text-muted"></i>
                                                        <div className="h5">No matches found</div>
                                                        <p className="mb-0">Try searching with different keywords</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Help Text */}
                            <div className="form-text mt-3">
                                {!isLoading && students.length > 0 && (
                                    <div className="row">
                                        <div className="col-md-8">
                                            <small className="text-muted">
                                                <i className="fas fa-keyboard me-1"></i>
                                                Use ↑↓ arrow keys to navigate, Enter to select, Esc to close
                                            </small>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            <small className="text-muted">
                                                <i className="fas fa-database me-1"></i>
                                                {students.length} students available
                                            </small>
                                        </div>
                                    </div>
                                )}
                                {selectedStudent && (
                                    <div className="alert alert-success mt-3 mb-0 py-2">
                                        <i className="fas fa-check-circle me-2"></i>
                                        <strong>Selected:</strong> {selectedStudent.first_name} {selectedStudent.last_name}
                                        {selectedStudent.student_id && ` (ID: ${selectedStudent.student_id})`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Selected Student Info */}
            {selectedStudentId && selectedStudent && (
                <div className="card bg-gradient-primary text-white mb-4 shadow">
                    <div className="card-body p-4">
                        <div className="row align-items-center">
                            <div className="col-lg-9">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="fas fa-chart-line fs-4 me-3"></i>
                                    <div>
                                        <h6 className="mb-1 opacity-75">📊 Scholarship Report for:</h6>
                                        <h4 className="mb-0 fw-bold">
                                            {selectedStudent.first_name} {selectedStudent.last_name}
                                        </h4>
                                    </div>
                                </div>

                                {/* Academic Details Row */}
                                <div className="row mt-3">
                                    {selectedStudent.student_id && (
                                        <div className="col-md-3">
                                            <small className="opacity-75 d-block">Student ID</small>
                                            <strong>{selectedStudent.student_id}</strong>
                                        </div>
                                    )}
                                    {selectedStudent.campus && (
                                        <div className="col-md-3">
                                            <small className="opacity-75 d-block">Campus</small>
                                            <strong>{selectedStudent.campus}</strong>
                                        </div>
                                    )}
                                    {selectedStudent.course && (
                                        <div className="col-md-4">
                                            <small className="opacity-75 d-block">Course</small>
                                            <strong>{selectedStudent.course}</strong>
                                        </div>
                                    )}
                                    {selectedStudent.year_level && (
                                        <div className="col-md-2">
                                            <small className="opacity-75 d-block">Year Level</small>
                                            <strong>Year {selectedStudent.year_level}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-lg-3 text-end">
                                <button
                                    type="button"
                                    className="btn btn-light btn-lg shadow-sm"
                                    onClick={handleClearSelection}
                                >
                                    <i className="fas fa-edit me-2"></i>
                                    Change Student
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Scholarship Summary Component */}
            {selectedStudentId && (
                <div className="scholarship-summary-section">
                    <ScholarshipSummary studentId={selectedStudentId} />
                </div>
            )}
        </div>
    );
};

export default StudentScholarshipReport;
