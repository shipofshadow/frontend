import  { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import ViewApplicantReadOnlyForm from "../../components/admin/modals/ViewApplicantReadOnlyForm";
import type { Applicant } from "../../interfaces/applicant";
import type { GradeEntry } from "../../interfaces/GradeEntry";
type SortField = 'name' | 'campus' | 'course' | 'year_level' | 'gwa' | 'income' | 'score';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

const ApprovedApplication = () => {

    const { token } = useAuth();
    const { id } = useParams();

    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');
    const [campusFilter, setCampusFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });

    useEffect(() => {
        const fetchApplicantById = async (applicantId: number) => {
            try {
                const response = await axios.get<Applicant>(`${API_BASE_URL}/api/applicants/${applicantId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSelectedApplicant(response.data);
                setShowViewModal(true);
            } catch (error) {
                console.error("Failed to load applicant by ID:", error);
                await Swal.fire("Error", "Applicant not found.", "error");
            }
        };

        if (id) {
            fetchApplicantById(parseInt(id));
        }
    }, [id, token]);

    useEffect(() => {
        const fetchApprovedApplicants = async () => {
            try {
                const response = await axios.get<Applicant[]>(`${API_BASE_URL}/api/applicants/qualified`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApplicants(response.data);
            } catch (error) {
                console.error("Error fetching applicants:", error);
                await Swal.fire("Error", "Failed to load applicants.", "error");
            }
        };

        fetchApprovedApplicants().catch((err) =>
            console.error("Promise rejection in fetchApprovedApplicants:", err)
        );
    }, [token]);

    const calculateGWA = (grades: GradeEntry[]): number => {
        if (!grades || grades.length === 0) return 0;
        const totalUnits = grades.reduce((acc, g) => acc + g.units, 0);
        const totalWeighted = grades.reduce((acc, g) => acc + g.units * g.grade, 0);
        return totalUnits ? +(totalWeighted / totalUnits).toFixed(2) : 0;
    };

    const getScoreBadgeClass = (score: number) => {
        if (score >= 0.75) return "bg-success";
        if (score >= 0.5) return "bg-info text-dark";
        if (score >= 0.25) return "bg-warning text-dark";
        return "bg-danger";
    };

    const handleSort = useCallback((field: SortField) => {
        setSortConfig(prevSort => ({
            field,
            direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const filterOptions = useMemo(() => {
        const courses = [...new Set(applicants.map(a => a.course))].sort();
        const years = [...new Set(applicants.map(a => a.year_level))].sort();
        const campuses = [...new Set(applicants.map(a => a.campus))].sort();
        return { courses, years, campuses };
    }, [applicants]);

    // Filter and sort applicants
    const filteredAndSortedApplicants = useMemo(() => {
        const filtered = applicants.filter(applicant => {
            const fullName = `${applicant.first_name} ${applicant.middle_name || ""} ${applicant.last_name}`.toLowerCase();
            const searchMatch = searchQuery === '' ||
                fullName.includes(searchQuery.toLowerCase()) ||
                applicant.campus.toLowerCase().includes(searchQuery.toLowerCase()) ||
                applicant.course.toLowerCase().includes(searchQuery.toLowerCase());

            const courseMatch = courseFilter === 'all' || applicant.course === courseFilter;
            const yearMatch = yearFilter === 'all' || applicant.year_level.toString() === yearFilter;
            const campusMatch = campusFilter === 'all' || applicant.campus === campusFilter;

            return searchMatch && courseMatch && yearMatch && campusMatch;
        });

        return filtered.sort((a, b) => {
            let aValue: string | number ;
            let bValue: string | number;
 
            switch (sortConfig.field) {
                case 'name':
                    aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
                    bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
                    break;
                case 'campus':
                    aValue = a.campus.toLowerCase();
                    bValue = b.campus.toLowerCase();
                    break;
                case 'course':
                    aValue = a.course.toLowerCase();
                    bValue = b.course.toLowerCase();
                    break;
                case 'year_level':
                    aValue = a.year_level;
                    bValue = b.year_level;
                    break;
                case 'gwa':
                    aValue = calculateGWA(a.grades);
                    bValue = calculateGWA(b.grades);
                    break;
                case 'income':
                    aValue = parseFloat(a.father_income || '0') + parseFloat(a.mother_income || '0');
                    bValue = parseFloat(b.father_income || '0') + parseFloat(b.mother_income || '0');
                    break;
                case 'score':
                    aValue = a.score || -1;
                    bValue = b.score || -1;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [applicants, searchQuery, courseFilter, yearFilter, campusFilter, sortConfig]);

    const clearFilters = () => {
        setSearchQuery('');
        setCourseFilter('all');
        setYearFilter('all');
        setCampusFilter('all');
        setSortConfig({ field: 'name', direction: 'asc' });
    };

    const openViewModal = (applicant: Applicant) => {
        setSelectedApplicant(applicant);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedApplicant(null);
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortConfig.field !== field) {
            return <i className="fas fa-sort text-muted ms-1"></i>;
        }
        return sortConfig.direction === 'asc'
            ? <i className="fas fa-sort-up text-primary ms-1"></i>
            : <i className="fas fa-sort-down text-primary ms-1"></i>;
    };

    return (
        <>
            {/* Header */}
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title d-flex align-items-center gap-2">
                                    <i className="fas fa-check-circle text-success" />
                                    Approved Applications
                                    <small className="text-muted ms-2">
                                        ({filteredAndSortedApplicants.length} of {applicants.length} applicants)
                                    </small>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                {/* Filters */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header fw-bold bg-light">
                        <i className="fas fa-filter me-2"></i>
                        Filter & Search
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Search</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Name, campus, course..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Campus</label>
                                <select
                                    className="form-select"
                                    value={campusFilter}
                                    onChange={(e) => setCampusFilter(e.target.value)}
                                >
                                    <option value="all">All Campuses</option>
                                    {filterOptions.campuses.map(campus => (
                                        <option key={campus} value={campus}>{campus}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Course</label>
                                <select
                                    className="form-select"
                                    value={courseFilter}
                                    onChange={(e) => setCourseFilter(e.target.value)}
                                >
                                    <option value="all">All Courses</option>
                                    {filterOptions.courses.map(course => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Year Level</label>
                                <select
                                    className="form-select"
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                >
                                    <option value="all">All Years</option>
                                    {filterOptions.years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">&nbsp;</label>
                                <div className="d-grid">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={clearFilters}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applicants Table */}
                <div className="card shadow-sm">
                    <div className="card-header fw-bold bg-light d-flex justify-content-between align-items-center">
                        <span>Approved Applicants</span>
                        <small className="text-muted">
                            {applicants.filter(a => a.score !== undefined).length} evaluated / {applicants.length} total
                        </small>
                    </div>
                    <div className="card-body">
                        {filteredAndSortedApplicants.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
                                <p className="text-muted">
                                    {applicants.length === 0 ? "No approved applicants found" : "No applicants match your filters"}
                                </p>
                                {applicants.length > 0 && (
                                    <button className="btn btn-outline-primary" onClick={clearFilters}>
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                    <tr>
                                        <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                            Name <SortIcon field="name" />
                                        </th>
                                        <th onClick={() => handleSort('campus')} style={{ cursor: 'pointer' }}>
                                            Campus <SortIcon field="campus" />
                                        </th>
                                        <th onClick={() => handleSort('course')} style={{ cursor: 'pointer' }}>
                                            Course <SortIcon field="course" />
                                        </th>
                                        <th onClick={() => handleSort('year_level')} style={{ cursor: 'pointer' }}>
                                            Year <SortIcon field="year_level" />
                                        </th>
                                        <th onClick={() => handleSort('gwa')} style={{ cursor: 'pointer' }}>
                                            GWA <SortIcon field="gwa" />
                                        </th>
                                        <th onClick={() => handleSort('income')} style={{ cursor: 'pointer' }}>
                                            Family Income <SortIcon field="income" />
                                        </th>
                                        <th onClick={() => handleSort('score')} style={{ cursor: 'pointer' }}>
                                            Score <SortIcon field="score" />
                                        </th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredAndSortedApplicants.map((applicant) => {
                                        const gwa = calculateGWA(applicant.grades);
                                        const income = parseFloat(applicant.father_income || '0') + parseFloat(applicant.mother_income || '0');
                                        const fullName = `${applicant.first_name} ${applicant.middle_name || ""} ${applicant.last_name}`.trim();
                                        const formattedIncome = new Intl.NumberFormat("en-PH", {
                                            style: "currency",
                                            currency: "PHP",
                                            minimumFractionDigits: 0
                                        }).format(income);

                                        return (
                                            <tr key={applicant.id}>
                                                <td className="fw-semibold">{fullName}</td>
                                                <td>{applicant.campus}</td>
                                                <td>{applicant.course}</td>
                                                <td>{applicant.year_level}</td>
                                                <td className="fw-semibold">{gwa}</td>
                                                <td>{formattedIncome}</td>
                                                <td>
                                                    {applicant.score !== undefined ? (
                                                        <span className={`badge ${getScoreBadgeClass(applicant.score)}`}>
                                                                {(applicant.score * 100).toFixed(1)}%
                                                            </span>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={() => openViewModal(applicant)}
                                                    >
                                                        <i className="fas fa-eye me-1"></i>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {showViewModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-user-circle me-2"></i>
                                    Applicant Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeViewModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {selectedApplicant && (
                                    <ViewApplicantReadOnlyForm applicant={selectedApplicant} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ApprovedApplication;