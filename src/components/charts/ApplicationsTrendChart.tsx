import {useCallback, useEffect, useState} from 'react';
import Chart from 'react-apexcharts';
import { API_BASE_URL } from "../../config.ts";
import { TrendingUp, AlertCircle, RefreshCw, BarChart3, GraduationCap, BookOpen, Building, Users, Award } from 'lucide-react';
import type {ApexOptions} from "apexcharts";
import { useAuth } from "../../context/AuthContext.tsx";

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

interface TrendData {
    academic_year: string;
    approved: string;
    denied: string;
    pending: string;
    semester: string;
    total: number;
}

interface ChartSeries {
    name: string;
    data: number[];
}

const ApplicationsTrendChart = () => {
    const { token } = useAuth();
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);
    const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
    const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'academic_year' | 'semester'>('academic_year');

    // Data states
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    // Filtered data states
    const [availableSemesters, setAvailableSemesters] = useState<Semester[]>([]);
    const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

    const [series, setSeries] = useState<ChartSeries[]>([
        { name: 'Total Applications', data: [] },
        { name: 'Approved', data: [] },
        { name: 'Pending', data: [] },
        { name: 'Denied', data: [] }
    ]);

    const [categories, setCategories] = useState<string[]>([]);

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [semestersLoading, setSemestersLoading] = useState(true);
    const [campusesLoading, setCampusesLoading] = useState(true);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [coursesLoading, setCoursesLoading] = useState(true);

    useEffect(() => {

       fetchSemesters().catch((err) =>
           console.error("Promise rejection in fetchSemesters:", err)
       );

        fetchCampuses().catch((err) =>
           console.error("Promise rejection in fetchCampuses:", err)
       );

        fetchDepartments().catch((err) =>
           console.error("Promise rejection in fetchDepartments:", err)
       );

        fetchCourses().catch((err) =>
           console.error("Promise rejection in fetchCourses:", err)
       );


    }, []);

    // Update available semesters when academic year changes
    useEffect(() => {
        if (selectedAcademicYearId && semesters.length > 0) {
            const filteredSemesters = semesters.filter(
                semester => semester.academic_year.id === selectedAcademicYearId
            );
            setAvailableSemesters(filteredSemesters);

            // Reset semester selection when academic year changes
            setSelectedSemesterId(null);

            // If in semester view mode, automatically select first semester
            if (viewMode === 'semester' && filteredSemesters.length > 0) {
                setSelectedSemesterId(filteredSemesters[0].id);
            }
        } else {
            setAvailableSemesters([]);
            setSelectedSemesterId(null);
        }
    }, [selectedAcademicYearId, semesters, viewMode]);

    // Update available departments when campus changes
    useEffect(() => {
        if (selectedCampusId && departments.length > 0) {
            const filteredDepartments = departments.filter(
                department => department.campus_id === selectedCampusId
            );
            setAvailableDepartments(filteredDepartments);

            // Reset department and course selection when campus changes
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

            // Reset course selection when department changes
            setSelectedCourseId(null);
        } else {
            setAvailableCourses([]);
            setSelectedCourseId(null);
        }
    }, [selectedDepartmentId, courses]);


    const fetchSemesters = async () => {
        setSemestersLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/semesters`);
            if (!res.ok) {
                throw new Error(`Failed to fetch semesters: ${res.status} ${res.statusText}`);
            }

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

            // Sort academic years by start year (most recent first)
            uniqueAcademicYears.sort((a, b) => b.year_start - a.year_start);
            setAcademicYears(uniqueAcademicYears);

            // Set the first (most recent) academic year as default
            const activeSemester = data.find(sem => sem.is_active === 1);
            if (activeSemester) {
                setSelectedAcademicYearId(activeSemester.academic_year.id);
            } else if (uniqueAcademicYears.length > 0) {
                setSelectedAcademicYearId(uniqueAcademicYears[0].id);
            }
        } catch (error) {
            console.error('Error fetching semesters:', error);
            // Fixed TypeScript error by properly handling error typing
            const errorMessage = error instanceof Error ? error.message : 'Failed to load semester data';
            setError(errorMessage);
        } finally {
            setSemestersLoading(false);
        }
    };

    const fetchCampuses = async () => {
        setCampusesLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/campus`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch campuses: ${res.status} ${res.statusText}`);
            }

            const data: Campus[] = await res.json();
            setCampuses(data);
        } catch (error) {
            console.error('Error fetching campuses:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load campus data';
            setError(errorMessage);
        } finally {
            setCampusesLoading(false);
        }
    };

    const fetchDepartments = async () => {
        setDepartmentsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/campus/department`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch departments: ${res.status} ${res.statusText}`);
            }

            const data: Department[] = await res.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load department data';
            setError(errorMessage);
        } finally {
            setDepartmentsLoading(false);
        }
    };

    const fetchCourses = async () => {
        setCoursesLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/campus/course`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText}`);
            }

            const data: Course[] = await res.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load course data';
            setError(errorMessage);
        } finally {
            setCoursesLoading(false);
        }
    };

    const fetchTrendData = useCallback(
        async (
            mode: 'academic_year' | 'semester',
            id: number,
            showRefresh = false
        ) => {
            if (showRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            try {
                const params = new URLSearchParams();

                if (mode === 'academic_year') {
                    params.append('academic_year_id', id.toString());
                } else {
                    params.append('semester_id', id.toString());
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

                const endpoint = `${API_BASE_URL}/api/dashboard/applications-trend?${params.toString()}`;
                const res = await fetch(endpoint);

                if (!res.ok) {
                    throw new Error(`Failed to fetch trend data: ${res.status} ${res.statusText}`);
                }

                const data: TrendData[] = await res.json();

                if (!Array.isArray(data) || data.length === 0) {
                    setCategories([]);
                    setSeries([
                        { name: 'Total Applications', data: [] },
                        { name: 'Approved', data: [] },
                        { name: 'Pending', data: [] },
                        { name: 'Denied', data: [] }
                    ]);
                    return;
                }

                const semesterNames = data.map(item => item.semester);
                const totalData = data.map(item => parseInt(item.total.toString()) || 0);
                const approvedData = data.map(item => parseInt(item.approved) || 0);
                const pendingData = data.map(item => parseInt(item.pending) || 0);
                const deniedData = data.map(item => parseInt(item.denied) || 0);

                setCategories(semesterNames);
                setSeries([
                    { name: 'Total Applications', data: totalData },
                    { name: 'Approved', data: approvedData },
                    { name: 'Pending', data: pendingData },
                    { name: 'Denied', data: deniedData }
                ]);
            } catch (error) {
                console.error('Error fetching trend data:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to load trend data';
                setError(errorMessage);
                setCategories([]);
                setSeries([
                    { name: 'Total Applications', data: [] },
                    { name: 'Approved', data: [] },
                    { name: 'Pending', data: [] },
                    { name: 'Denied', data: [] }
                ]);
            } finally {
                setLoading(false);
                setIsRefreshing(false);
            }
        },
        [
            selectedCampusId,
            selectedDepartmentId,
            selectedCourseId
        ]
    );


    const handleRefresh = () => {
        if (viewMode === 'academic_year' && selectedAcademicYearId) {
            fetchTrendData('academic_year', selectedAcademicYearId, true);
        } else if (viewMode === 'semester' && selectedSemesterId) {
            fetchTrendData('semester', selectedSemesterId, true);
        }
    };

    useEffect(() => {
        const runFetch = async () => {
            try {
                if (selectedAcademicYearId) {
                    if (viewMode === 'academic_year') {
                        await fetchTrendData('academic_year', selectedAcademicYearId);
                    } else if (viewMode === 'semester' && selectedSemesterId) {
                        await fetchTrendData('semester', selectedSemesterId);
                    }
                }
            } catch (err) {
                console.error("Promise rejection in fetchTrendData:", err);
            }
        };

        runFetch().catch((err) =>
            console.error("Promise rejection in fetchRecommendations:", err)
        );
    }, [
        selectedAcademicYearId,
        selectedSemesterId,
        selectedCampusId,
        selectedDepartmentId,
        selectedCourseId,
        viewMode,
        fetchTrendData
    ]);


    const handleViewModeChange = (newMode: 'academic_year' | 'semester') => {
        setViewMode(newMode);

        if (newMode === 'semester' && availableSemesters.length > 0) {
            setSelectedSemesterId(availableSemesters[0].id);
        }
    };

    const getSelectedAcademicYear = () => {
        return academicYears.find(year => year.id === selectedAcademicYearId);
    };

    const getSelectedSemester = () => {
        return availableSemesters.find(semester => semester.id === selectedSemesterId);
    };

    const getSelectedCampus = () => {
        return campuses.find(campus => campus.id === selectedCampusId);
    };

    const getSelectedDepartment = () => {
        return availableDepartments.find(department => department.id === selectedDepartmentId);
    };

    const getSelectedCourse = () => {
        return availableCourses.find(course => course.id === selectedCourseId);
    };

    const getStatistics = () => {
        const totalSeries = series.find(s => s.name === 'Total Applications');
        const approvedSeries = series.find(s => s.name === 'Approved');
        const pendingSeries = series.find(s => s.name === 'Pending');
        const deniedSeries = series.find(s => s.name === 'Denied');

        const totalApplications = totalSeries ? totalSeries.data.reduce((sum, val) => sum + val, 0) : 0;
        const totalApproved = approvedSeries ? approvedSeries.data.reduce((sum, val) => sum + val, 0) : 0;
        const totalPending = pendingSeries ? pendingSeries.data.reduce((sum, val) => sum + val, 0) : 0;
        const totalDenied = deniedSeries ? deniedSeries.data.reduce((sum, val) => sum + val, 0) : 0;

        const approvalRate = totalApplications > 0 ? Math.round((totalApproved / totalApplications) * 100) : 0;

        return {
            totalApplications,
            totalApproved,
            totalPending,
            totalDenied,
            approvalRate
        };
    };

    const buildFilterDescription = () => {
        const filters = [];
        const selectedYear = getSelectedAcademicYear();
        const selectedSemester = getSelectedSemester();
        const selectedCampus = getSelectedCampus();
        const selectedDepartment = getSelectedDepartment();
        const selectedCourse = getSelectedCourse();

        if (viewMode === 'academic_year' && selectedYear) {
            filters.push(`${selectedYear.year_start}-${selectedYear.year_end}`);
        } else if (viewMode === 'semester' && selectedSemester) {
            filters.push(`${selectedSemester.name}`);
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

    // Fixed ApexCharts options typing
    const options: ApexOptions  = {
        chart: {
            type: 'bar',
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
                        filename: `applications_trend_${viewMode}_${selectedAcademicYearId || selectedSemesterId}`
                    },
                    png: {
                        filename: `applications_trend_${viewMode}_${selectedAcademicYearId || selectedSemesterId}`
                    }
                }
            },
            fontFamily: 'inherit',
            animations: {
                enabled: true,
                speed: 800
            },
            stacked: false
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: viewMode === 'semester' ? '40%' : '60%',
                borderRadius: 4,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories,
            title: {
                text: 'Semester',
                style: {
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6c757d'
                }
            },
            labels: {
                style: {
                    fontSize: '12px',
                    colors: '#6c757d'
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
                text: 'Number of Applications',
                style: {
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6c757d'
                }
            },
            labels: {
                formatter: function (val: number) {
                    return Math.floor(val).toString();
                },
                style: {
                    fontSize: '12px',
                    colors: '#6c757d'
                }
            }
        },
        colors: ['#0d6efd', '#198754', '#ffc107', '#dc3545'],
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
        tooltip: {
            theme: 'light',
            style: {
                fontSize: '12px'
            },
            y: {
                formatter: function (val: number) {
                    return val.toLocaleString() + " applications"
                }
            },
            marker: {
                show: true
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            fontSize: '13px',
            fontWeight: 500,
        },
        responsive: [{
            breakpoint: 768,
            options: {
                chart: {
                    toolbar: {
                        show: false
                    }
                },
                plotOptions: {
                    bar: {
                        columnWidth: '80%'
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="d-flex align-items-center justify-content-center" style={{ height: '350px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mb-0">Loading trend data...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="d-flex align-items-center justify-content-center" style={{ height: '350px' }}>
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

        if (!series[0].data.length || series[0].data.every(val => val === 0)) {
            return (
                <div className="d-flex align-items-center justify-content-center" style={{ height: '350px' }}>
                    <div className="text-center">
                        <BarChart3 size={48} className="text-muted mb-3" />
                        <h6 className="text-muted mb-2">No Data Available</h6>
                        <p className="text-muted small mb-0">
                            No application data found for the selected filters
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <Chart
                options={options}
                series={series}
                type="bar"
                height={350}
            />
        );
    };

    const stats = getStatistics();

    return (
        <div className="col-lg-12 mb-4">
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                    <TrendingUp size={20} className="text-primary" />
                                </div>
                                <div>
                                    <h5 className="card-title mb-0 fw-bold">Application Trends</h5>
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
                                        name="viewMode"
                                        id="yearView"
                                        checked={viewMode === 'academic_year'}
                                        onChange={() => handleViewModeChange('academic_year')}
                                    />
                                    <label className="btn btn-outline-primary" htmlFor="yearView">
                                        <GraduationCap size={14} className="me-1" />
                                        Year View
                                    </label>

                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="viewMode"
                                        id="semesterView"
                                        checked={viewMode === 'semester'}
                                        onChange={() => handleViewModeChange('semester')}
                                    />
                                    <label className="btn btn-outline-primary" htmlFor="semesterView">
                                        <BookOpen size={14} className="me-1" />
                                        Semester View
                                    </label>
                                </div>

                                {/* Refresh Button */}
                                <button
                                    className="btn btn-outline-secondary btn-sm rounded-pill"
                                    onClick={handleRefresh}
                                    disabled={loading || isRefreshing || (!selectedAcademicYearId && !selectedSemesterId)}
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
                        <div className="col-lg-3 col-md-6">
                            <div className="d-flex align-items-center gap-2">
                                <GraduationCap size={16} className="text-muted" />
                                <span className="small text-muted fw-medium">Academic Year:</span>
                            </div>
                            <select
                                className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium mt-1"
                                value={selectedAcademicYearId || ''}
                                onChange={(e) => setSelectedAcademicYearId(Number(e.target.value) || null)}
                                disabled={semestersLoading || loading}
                            >
                                {semestersLoading ? (
                                    <option value="">Loading...</option>
                                ) : (
                                    <>
                                        <option value="">Select Year</option>
                                        {academicYears.map(year => (
                                            <option key={year.id} value={year.id}>
                                                {year.year_start}-{year.year_end}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Semester - only show in semester view mode */}
                        {viewMode === 'semester' && (
                            <div className="col-lg-3 col-md-6">
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
                                        <option value="">Select Year First</option>
                                    ) : availableSemesters.length === 0 ? (
                                        <option value="">No Semesters</option>
                                    ) : (
                                        <>
                                            <option value="">Select Semester</option>
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
                        )}

                        {/* Campus */}
                        <div className="col-lg-3 col-md-6">
                            <div className="d-flex align-items-center gap-2">
                                <Building size={16} className="text-muted" />
                                <span className="small text-muted fw-medium">Campus:</span>
                            </div>
                            <select
                                className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium mt-1"
                                value={selectedCampusId || ''}
                                onChange={(e) => setSelectedCampusId(Number(e.target.value) || null)}
                                disabled={campusesLoading || loading}
                            >
                                {campusesLoading ? (
                                    <option value="">Loading...</option>
                                ) : (
                                    <>
                                        <option value="">All Campuses</option>
                                        {campuses.map(campus => (
                                            <option key={campus.id} value={campus.id}>
                                                {campus.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Department */}
                        <div className="col-lg-3 col-md-6">
                            <div className="d-flex align-items-center gap-2">
                                <Users size={16} className="text-muted" />
                                <span className="small text-muted fw-medium">Department:</span>
                            </div>
                            <select
                                className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium mt-1"
                                value={selectedDepartmentId || ''}
                                onChange={(e) => setSelectedDepartmentId(Number(e.target.value) || null)}
                                disabled={departmentsLoading || loading || !selectedCampusId || availableDepartments.length === 0}
                            >
                                {departmentsLoading ? (
                                    <option value="">Loading...</option>
                                ) : !selectedCampusId ? (
                                    <option value="">Select Campus First</option>
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
                        <div className="col-lg-3 col-md-6">
                            <div className="d-flex align-items-center gap-2">
                                <Award size={16} className="text-muted" />
                                <span className="small text-muted fw-medium">Course:</span>
                            </div>
                            <select
                                className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium mt-1"
                                value={selectedCourseId || ''}
                                onChange={(e) => setSelectedCourseId(Number(e.target.value) || null)}
                                disabled={coursesLoading || loading || !selectedDepartmentId || availableCourses.length === 0}
                            >
                                {coursesLoading ? (
                                    <option value="">Loading...</option>
                                ) : !selectedDepartmentId ? (
                                    <option value="">Select Department First</option>
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
                        <div className="col-12 mt-2">
                            <div className="d-flex justify-content-end">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => {
                                        setSelectedCampusId(null);
                                        setSelectedDepartmentId(null);
                                        setSelectedCourseId(null);
                                    }}
                                    disabled={!selectedCampusId && !selectedDepartmentId && !selectedCourseId}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0">
                    {renderContent()}
                </div>

                {/* Enhanced Summary Stats */}
                {!loading && !error && series[0].data.length > 0 && series[0].data.some(val => val > 0) && (
                    <div className="card-footer bg-light bg-opacity-50 border-0 py-3">
                        <div className="row g-0">
                            <div className="col">
                                <div className="text-center px-3">
                                    <div className="small text-muted fw-medium mb-1">Total Applications</div>
                                    <div className="h5 mb-0 fw-bold text-primary">
                                        {stats.totalApplications.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="col border-start border-light">
                                <div className="text-center px-3">
                                    <div className="small text-muted fw-medium mb-1">Approved</div>
                                    <div className="h6 mb-0 fw-bold text-success">
                                        {stats.totalApproved.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="col border-start border-light">
                                <div className="text-center px-3">
                                    <div className="small text-muted fw-medium mb-1">Pending</div>
                                    <div className="h6 mb-0 fw-bold text-warning">
                                        {stats.totalPending.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="col border-start border-light">
                                <div className="text-center px-3">
                                    <div className="small text-muted fw-medium mb-1">Denied</div>
                                    <div className="h6 mb-0 fw-bold text-danger">
                                        {stats.totalDenied.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="col border-start border-light">
                                <div className="text-center px-3">
                                    <div className="small text-muted fw-medium mb-1">Approval Rate</div>
                                    <div className={`h6 mb-0 fw-bold ${stats.approvalRate >= 70 ? 'text-success' : stats.approvalRate >= 50 ? 'text-warning' : 'text-danger'}`}>
                                        {stats.approvalRate}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(selectedCampusId || selectedDepartmentId || selectedCourseId) && (
                            <div className="row mt-3">
                                <div className="col-12">
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <span className="small text-muted fw-medium">Active Filters:</span>

                                        {selectedCampusId && (
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
                                                <Building size={12} className="me-1" />
                                                {getSelectedCampus()?.name}
                                            </span>
                                        )}

                                        {selectedDepartmentId && (
                                            <span className="badge bg-info bg-opacity-10 text-info rounded-pill">
                                                <Users size={12} className="me-1" />
                                                {getSelectedDepartment()?.name}
                                            </span>
                                        )}

                                        {selectedCourseId && (
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill">
                                                <Award size={12} className="me-1" />
                                                {getSelectedCourse()?.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .form-select:focus {
                    border-color: #86b7fe;
                    outline: 0;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                .badge {
                    font-size: 0.75rem;
                    padding: 0.375rem 0.75rem;
                }

                @media (max-width: 768px) {
                    .col-lg-3 {
                        margin-bottom: 1rem;
                    }
                    
                    .btn-group-sm .btn {
                        font-size: 0.75rem;
                        padding: 0.25rem 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ApplicationsTrendChart;