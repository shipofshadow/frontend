import  { useEffect, useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { API_BASE_URL } from '../../config';
import { BarChart3, Users, Building, GraduationCap, BookOpen, Award, RefreshCw, AlertCircle } from 'lucide-react';
import type {ApexOptions} from "apexcharts";
import { useAuth } from "../../context/AuthContext.tsx";

interface ApplicantData {
    course: string;
    campus: string;
    total_applicants: number;
}

interface AcademicYear {
    id: number;
    year_end: number;
    year_start: number;
}

interface Semester {
    academic_year: AcademicYear;
    id: number;
    is_active: number;
    name: string;
}

interface Campus {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
    campus_id: number;
}

interface Course {
    id: number;
    name: string;
    major: string | null;
    department_id: number;
}

const ApplicantsBarChart = () => {
    const { token } = useAuth();
    // Data states
    const [data, setData] = useState<ApplicantData[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    // Filter states
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);
    const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
    const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    // Filtered data states
    const [availableSemesters, setAvailableSemesters] = useState<Semester[]>([]);
    const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

    // Loading and error states
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filtersLoading, setFiltersLoading] = useState(true);

    // Chart view mode
    const [viewMode, setViewMode] = useState<'campus' | 'course'>('campus');

    // Initialize data
    useEffect(() => {
        initializeData();
    }, []);

    // Update available semesters when academic year changes
    useEffect(() => {
        if (selectedAcademicYearId && semesters.length > 0) {
            const filteredSemesters = semesters.filter(
                semester => semester.academic_year.id === selectedAcademicYearId
            );
            setAvailableSemesters(filteredSemesters);
            setSelectedSemesterId(null);
        } else {
            setAvailableSemesters([]);
            setSelectedSemesterId(null);
        }
    }, [selectedAcademicYearId, semesters]);

    // Update available departments when campus changes
    useEffect(() => {
        if (selectedCampusId && departments.length > 0) {
            const filteredDepartments = departments.filter(
                department => department.campus_id === selectedCampusId
            );
            setAvailableDepartments(filteredDepartments);
            setSelectedDepartmentId(null);
            setSelectedCourseId(null);
        } else {
            setAvailableDepartments([]);
            setSelectedDepartmentId(null);
            setSelectedCourseId(null);
        }
    }, [selectedCampusId, departments]);

    // Update available courses when department changes
    useEffect(() => {
        if (selectedDepartmentId && courses.length > 0) {
            const filteredCourses = courses.filter(
                course => course.department_id === selectedDepartmentId
            );
            setAvailableCourses(filteredCourses);
            setSelectedCourseId(null);
        } else {
            setAvailableCourses([]);
            setSelectedCourseId(null);
        }
    }, [selectedDepartmentId, courses]);

    // Fetch data when filters change
    useEffect(() => {
        if (!filtersLoading) {
            fetchData();
        }
    }, [selectedAcademicYearId, selectedSemesterId, selectedCampusId, selectedDepartmentId, selectedCourseId, filtersLoading]);

    const initializeData = async () => {
        setFiltersLoading(true);
        try {
            await Promise.all([
                fetchSemesters(),
                fetchCampuses(),
                fetchDepartments(),
                fetchCourses()
            ]);
        } catch (error) {
            console.error('Error initializing data:', error);
            setError('Failed to load initial data');
        } finally {
            setFiltersLoading(false);
        }
    };

    const fetchSemesters = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/semesters`);
            if (!res.ok) throw new Error(`Failed to fetch semesters: ${res.statusText}`);

            const data: Semester[] = await res.json();
            setSemesters(data);

            // Extract unique academic years
            const uniqueAcademicYears = data.reduce((acc: AcademicYear[], semester) => {
                const exists = acc.find(year => year.id === semester.academic_year.id);
                if (!exists) {
                    acc.push(semester.academic_year);
                }
                return acc;
            }, []);

            uniqueAcademicYears.sort((a, b) => b.year_start - a.year_start);
            setAcademicYears(uniqueAcademicYears);

            // Set default academic year
            const activeSemester = data.find(sem => sem.is_active === 1);
            if (activeSemester) {
                setSelectedAcademicYearId(activeSemester.academic_year.id);
            } else if (uniqueAcademicYears.length > 0) {
                setSelectedAcademicYearId(uniqueAcademicYears[0].id);
            }
        } catch (error) {
            console.error('Error fetching semesters:', error);
            throw error;
        }
    };

    const fetchCampuses = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/campus`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch campuses: ${res.statusText}`);

            const data: Campus[] = await res.json();
            setCampuses(data);
        } catch (error) {
            console.error('Error fetching campuses:', error);
            throw error;
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/campus/department`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch departments: ${res.statusText}`);

            const data: Department[] = await res.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
            throw error;
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/campus/course`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch courses: ${res.statusText}`);

            const data: Course[] = await res.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    };

    const fetchData = async (showRefresh = false) => {
        if (showRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            // Build query parameters
            const params = new URLSearchParams();

            if (selectedAcademicYearId) {
                params.append('academic_year_id', selectedAcademicYearId.toString());
            }

            if (selectedSemesterId) {
                params.append('semester_id', selectedSemesterId.toString());
            }

            if (selectedCampusId) {
                params.append('campus_id', selectedCampusId.toString());
            }

            if (selectedDepartmentId) {
                params.append('department_id', selectedDepartmentId.toString());
            }

            if (selectedCourseId) {
                params.append('course_id', selectedCourseId.toString());
            }

            const endpoint = `${API_BASE_URL}/api/dashboard/applicants-breakdown${params.toString() ? `?${params.toString()}` : ''}`;
            const res = await fetch(endpoint);

            if (!res.ok) {
                throw new Error(`Failed to fetch data: ${res.statusText}`);
            }

            const jsonData: ApplicantData[] = await res.json();
            setData(jsonData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchData(true);
    };

    const clearFilters = () => {
        setSelectedCampusId(null);
        setSelectedDepartmentId(null);
        setSelectedCourseId(null);
        setSelectedSemesterId(null);
    };

    const getFilteredData = useMemo(() => {
        if (!data || data.length === 0) {
            return { categories: [], series: [] };
        }

        if (viewMode === 'campus') {
            // Group by campus, show courses
            const uniqueCourses = [...new Set(data.map(item => item.course))];
            const uniqueCampuses = [...new Set(data.map(item => item.campus))];

            const series = uniqueCampuses.map(campus => ({
                name: campus,
                data: uniqueCourses.map(course => {
                    const match = data.find(
                        item => item.campus === campus && item.course === course
                    );
                    return match ? match.total_applicants : 0;
                }),
            }));

            return { categories: uniqueCourses, series };
        } else {
            // Group by course, show campuses
            const uniqueCampuses = [...new Set(data.map(item => item.campus))];
            const uniqueCourses = [...new Set(data.map(item => item.course))];

            const series = uniqueCourses.map(course => ({
                name: course,
                data: uniqueCampuses.map(campus => {
                    const match = data.find(
                        item => item.course === course && item.campus === campus
                    );
                    return match ? match.total_applicants : 0;
                }),
            }));

            return { categories: uniqueCampuses, series };
        }
    }, [data, viewMode]);

    const getTotalApplicants = useMemo(() => {
        return data.reduce((sum, item) => sum + item.total_applicants, 0);
    }, [data]);

    const getTopPerformer = useMemo(() => {
        if (!data || data.length === 0) return null;

        if (viewMode === 'campus') {
            const campusTotals = data.reduce((acc, item) => {
                acc[item.campus] = (acc[item.campus] || 0) + item.total_applicants;
                return acc;
            }, {} as Record<string, number>);

            const topCampus = Object.entries(campusTotals).reduce((a, b) =>
                campusTotals[a[0]] > campusTotals[b[0]] ? a : b
            );

            return { name: topCampus[0], count: topCampus[1], type: 'Campus' };
        } else {
            const courseTotals = data.reduce((acc, item) => {
                acc[item.course] = (acc[item.course] || 0) + item.total_applicants;
                return acc;
            }, {} as Record<string, number>);

            const topCourse = Object.entries(courseTotals).reduce((a, b) =>
                courseTotals[a[0]] > courseTotals[b[0]] ? a : b
            );

            return { name: topCourse[0], count: topCourse[1], type: 'Course' };
        }
    }, [data, viewMode]);

    const buildFilterDescription = () => {
        const filters = [];
        const selectedYear = academicYears.find(year => year.id === selectedAcademicYearId);
        const selectedSemester = availableSemesters.find(semester => semester.id === selectedSemesterId);
        const selectedCampus = campuses.find(campus => campus.id === selectedCampusId);
        const selectedDepartment = availableDepartments.find(department => department.id === selectedDepartmentId);
        const selectedCourse = availableCourses.find(course => course.id === selectedCourseId);

        if (selectedYear) {
            filters.push(`${selectedYear.year_start}-${selectedYear.year_end}`);
        }

        if (selectedSemester) {
            filters.push(selectedSemester.name);
        }

        if (selectedCampus) {
            filters.push(`${selectedCampus.name} Campus`);
        }

        if (selectedDepartment) {
            filters.push(selectedDepartment.name);
        }

        if (selectedCourse) {
            filters.push(selectedCourse.name);
        }

        return filters.length > 0 ? filters.join(' • ') : 'All Data';
    };

    const chartOptions = useMemo<ApexOptions>(
        () => ({
            chart: {
                type: 'bar',
                stacked: false,
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    },
                    export: {
                        csv: {
                            filename: `applicants_breakdown_${viewMode}`
                        },
                        png: {
                            filename: `applicants_breakdown_${viewMode}`
                        }
                    }
                },
                fontFamily: 'inherit',
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '60%',
                    borderRadius: 4,
                    dataLabels: {
                        position: 'top'
                    }
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: getFilteredData.categories,
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                        colors: '#6c757d'
                    },
                },
                title: {
                    text: viewMode === 'campus' ? 'Courses' : 'Campuses',
                    style: {
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#6c757d'
                    }
                },
                axisBorder: {
                    show: true,
                    color: '#e9ecef'
                },
                axisTicks: {
                    show: true,
                    color: '#e9ecef'
                }
            },
            yaxis: {
                title: {
                    text: 'Total Applicants',
                    style: {
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#6c757d'
                    }
                },
                labels: {
                    formatter: function (val) {
                        return Math.floor(val).toString();
                    },
                    style: {
                        fontSize: '12px',
                        colors: '#6c757d'
                    }
                }
            },
            colors: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'],
            grid: {
                borderColor: '#e9ecef',
                strokeDashArray: 3,
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left',
                fontSize: '13px',
                fontWeight: 500,
            },
            tooltip: {
                theme: 'light',
                style: {
                    fontSize: '12px'
                },
                y: {
                    formatter: (val: number) => `${val.toLocaleString()} applicants`,
                },
                marker: {
                    show: true
                }
            },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        chart: {
                            toolbar: {
                                show: false
                            }
                        },
                        plotOptions: {
                            bar: {
                                columnWidth: '80%',
                            },
                        },
                        xaxis: {
                            labels: {
                                rotate: -60,
                            },
                        },
                        legend: {
                            position: 'bottom'
                        }
                    },
                },
            ],
        }),
        [getFilteredData.categories, viewMode]
    );

    const renderContent = () => {
        if (loading || filtersLoading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mb-0">Loading applicant data...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                    <div className="text-center">
                        <AlertCircle size={48} className="text-danger mb-3" />
                        <h6 className="text-danger mb-2">Unable to Load Data</h6>
                        <p className="text-muted small mb-3">{error}</p>
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Retrying...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={14} className="me-1" />
                                    Try Again
                                </>
                            )}
                        </button>
                    </div>
                </div>
            );
        }

        if (!data || data.length === 0) {
            return (
                <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                    <div className="text-center">
                        <BarChart3 size={48} className="text-muted mb-3" />
                        <h6 className="text-muted mb-2">No Data Available</h6>
                        <p className="text-muted small mb-0">
                            No applicant data found for the selected filters
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <Chart
                options={chartOptions}
                series={getFilteredData.series}
                type="bar"
                height={400}
                className="apexcharts-canvas"
            />
        );
    };

    return (
        <div className="col-lg-12 mb-4">
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="d-flex align-items-center">
                                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                    <Users size={20} className="text-success" />
                                </div>
                                <div>
                                    <h5 className="card-title mb-0 fw-bold">
                                        Applicants by {viewMode === 'campus' ? 'Course' : 'Campus'}
                                    </h5>
                                    <p className="text-muted small mb-0">
                                        {buildFilterDescription()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="d-flex align-items-center justify-content-lg-end gap-2 flex-wrap">
                                {/* View Mode Toggle */}
                                <div className="btn-group btn-group-sm" role="group">
                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="chartViewMode"
                                        id="campusView"
                                        checked={viewMode === 'campus'}
                                        onChange={() => setViewMode('campus')}
                                    />
                                    <label className="btn btn-outline-success" htmlFor="campusView">
                                        <Building size={14} className="me-1" />
                                        By Campus
                                    </label>

                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="chartViewMode"
                                        id="courseView"
                                        checked={viewMode === 'course'}
                                        onChange={() => setViewMode('course')}
                                    />
                                    <label className="btn btn-outline-success" htmlFor="courseView">
                                        <Award size={14} className="me-1" />
                                        By Course
                                    </label>
                                </div>

                                {/* Refresh Button */}
                                <button
                                    className="btn btn-outline-secondary btn-sm rounded-pill"
                                    onClick={handleRefresh}
                                    disabled={loading || isRefreshing || filtersLoading}
                                    title="Refresh data"
                                >
                                    <RefreshCw
                                        size={14}
                                        className={isRefreshing ? 'spin' : ''}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="row mt-3 g-3">
                        {/* Academic Year */}
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="d-flex align-items-center gap-2">
                                <GraduationCap size={16} className="text-muted" />
                                <span className="small text-muted fw-medium">Academic Year:</span>
                            </div>
                            <select
                                className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium mt-1"
                                value={selectedAcademicYearId || ''}
                                onChange={(e) => setSelectedAcademicYearId(Number(e.target.value) || null)}
                                disabled={filtersLoading || loading}
                            >
                                <option value="">All Years</option>
                                {academicYears.map(year => (
                                    <option key={year.id} value={year.id}>
                                        {year.year_start}-{year.year_end}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Semester */}
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="d-flex align-items-center gap-2">
                                <BookOpen size={16} className="text-muted" />
                                <span className="small text-muted fw-medium">Semester:</span>
                            </div>
                            <select
                                className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium mt-1"
                                value={selectedSemesterId || ''}
                                onChange={(e) => setSelectedSemesterId(Number(e.target.value) || null)}
                                disabled={loading || !selectedAcademicYearId || availableSemesters.length === 0}
                            >
                                {!selectedAcademicYearId ? (
                                    <option value="">All Semesters</option>
                                ) : availableSemesters.length === 0 ? (
                                    <option value="">No Semesters</option>
                                ) : (
                                    <>
                                        <option value="">All Semesters</option>
                                        {availableSemesters.map(semester => (
                                            <option key={semester.id} value={semester.id}>
                                                {semester.name}
                                                {semester.is_active ? ' (Active)' : ''}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Campus */}
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="d-flex align-items-center gap-2">
                                <Building size={16} className="text-muted" />
                                <span className="small text-muted fw-medium">Campus:</span>
                            </div>
                            <select
                                className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium mt-1"
                                value={selectedCampusId || ''}
                                onChange={(e) => setSelectedCampusId(Number(e.target.value) || null)}
                                disabled={filtersLoading || loading}
                            >
                                <option value="">All Campuses</option>
                                {campuses.map(campus => (
                                    <option key={campus.id} value={campus.id}>
                                        {campus.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Department */}
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="d-flex align-items-center gap-2">
                                <Users size={16} className="text-muted" />
                                <span className="small text-muted fw-medium">Department:</span>
                            </div>
                            <select
                                className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium mt-1"
                                value={selectedDepartmentId || ''}
                                onChange={(e) => setSelectedDepartmentId(Number(e.target.value) || null)}
                                disabled={loading || !selectedCampusId || availableDepartments.length === 0}
                            >
                                {!selectedCampusId ? (
                                    <option value="">All Departments</option>
                                ) : availableDepartments.length === 0 ? (
                                    <option value="">No Departments</option>
                                ) : (
                                    <>
                                        <option value="">All Departments</option>
                                        {availableDepartments.map(department => (
                                            <option key={department.id} value={department.id}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Course */}
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="d-flex align-items-center gap-2">
                                <Award size={16} className="text-muted" />
                                <span className="small text-muted fw-medium">Course:</span>
                            </div>
                            <select
                                className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium mt-1"
                                value={selectedCourseId || ''}
                                onChange={(e) => setSelectedCourseId(Number(e.target.value) || null)}
                                disabled={loading || !selectedDepartmentId || availableCourses.length === 0}
                            >
                                {!selectedDepartmentId ? (
                                    <option value="">All Courses</option>
                                ) : availableCourses.length === 0 ? (
                                    <option value="">No Courses</option>
                                ) : (
                                    <>
                                        <option value="">All Courses</option>
                                        {availableCourses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.name}
                                                {course.major && ` - ${course.major}`}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="col-lg-2 col-md-4 col-sm-6 d-flex align-items-end">
                            <button
                                className="btn btn-outline-secondary btn-sm w-100"
                                onClick={clearFilters}
                                disabled={!selectedCampusId && !selectedDepartmentId && !selectedCourseId && !selectedSemesterId}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0">
                    {renderContent()}
                </div>

                {/* Summary Stats */}
                {!loading && !error && data && data.length > 0 && (
                    <div className="card-footer bg-light bg-opacity-50 border-0 py-3">
                        <div className="row g-0">
                            <div className="col-md-4">
                                <div className="text-center px-3">
                                    <div className="small text-muted fw-medium mb-1">Total Applicants</div>
                                    <div className="h5 mb-0 fw-bold text-success">
                                        {getTotalApplicants.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 border-start border-light">
                                <div className="text-center px-3">
                                    <div className="small text-muted fw-medium mb-1">Data Points</div>
                                    <div className="h6 mb-0 fw-bold text-info">
                                        {data.length.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 border-start border-light">
                                <div className="text-center px-3">
                                    <div className="small text-muted fw-medium mb-1">Top Performer</div>
                                    <div className="h6 mb-0 fw-bold text-primary">
                                        {getTopPerformer ? `${getTopPerformer.name} (${getTopPerformer.count})` : '—'}
                                    </div>
                                    <div className="small text-muted">{getTopPerformer?.type}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicantsBarChart;
