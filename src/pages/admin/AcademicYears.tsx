import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config.ts";

type Semester = {
    id: number;
    name: string;
    is_active: boolean;
};

type AcademicYear = {
    id: number;
    year_start: number;
    year_end: number;
    is_active: boolean;
    semesters: Semester[];
};

const AcademicYearsManager = () => {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showSemesterModal, setShowSemesterModal] = useState(false);
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
    const [newSemesterName, setNewSemesterName] = useState("");
    const [semesterLoading, setSemesterLoading] = useState(false);

    const [showYearModal, setShowYearModal] = useState(false);
    const [yearStart, setYearStart] = useState<number | "">("");
    const [yearEnd, setYearEnd] = useState<number | "">("");
    const [yearLoading, setYearLoading] = useState(false);

    useEffect(() => {
        fetchAllYears();
    }, []);

    const fetchAllYears = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/period/all`);
            if (!res.ok) throw new Error('Failed to fetch academic years');

            const data = await res.json();

            // Determine is_active flag for Academic Year based on active semester
            const updatedYears = data.map((year: AcademicYear) => {
                const hasActiveSemester = year.semesters.some((s) => s.is_active);
                return { ...year, is_active: hasActiveSemester };
            });

            setAcademicYears(updatedYears);
        } catch (err) {
            console.error("Error fetching years", err);
            setError("Failed to load academic years. Please try again.");
        }
        setLoading(false);
    };

    const addSemester = async () => {
        if (!selectedYearId || !newSemesterName.trim()) return;

        setSemesterLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/period/semester`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    academic_year_id: selectedYearId,
                    name: newSemesterName.trim(),
                }),
            });

            if (!res.ok) throw new Error('Failed to add semester');

            setShowSemesterModal(false);
            setNewSemesterName("");
            setSelectedYearId(null);
            await fetchAllYears();
        } catch (err) {
            console.error("Error adding semester", err);
            setError("Failed to add semester. Please try again.");
        }
        setSemesterLoading(false);
    };

    const activateSemester = async (semesterId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/period/semester/${semesterId}/activate`, {
                method: "PUT"
            });

            if (!res.ok) throw new Error('Failed to activate semester');

            await fetchAllYears();
        } catch (err) {
            console.error("Error activating semester", err);
            setError("Failed to activate semester. Please try again.");
        }
    };

    const addYear = async () => {
        if (!yearStart || !yearEnd) return;
        if (yearStart >= yearEnd) {
            setError("End year must be greater than start year.");
            return;
        }

        setYearLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/period/year`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    year_start: yearStart,
                    year_end: yearEnd,
                }),
            });

            if (!res.ok) throw new Error('Failed to add academic year');

            setShowYearModal(false);
            setYearStart("");
            setYearEnd("");
            await fetchAllYears();
        } catch (err) {
            console.error("Error adding year", err);
            setError("Failed to add academic year. Please try again.");
        }
        setYearLoading(false);
    };

    const closeModals = () => {
        setShowYearModal(false);
        setShowSemesterModal(false);
        setNewSemesterName("");
        setSelectedYearId(null);
        setYearStart("");
        setYearEnd("");
        setError(null);
    };

    const getSelectedYearInfo = () => {
        if (!selectedYearId) return null;
        return academicYears.find(year => year.id === selectedYearId);
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
                .year-card {
                    transition: all 0.2s ease;
                    border: 1px solid #e9ecef;
                }
                .year-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }
                .year-card.active-year {
                    border-left: 4px solid #198754;
                    background-color: #f8fdf9;
                }
                .semester-item {
                    transition: background-color 0.15s ease;
                    border-radius: 6px;
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                }
                .semester-item:hover {
                    background-color: #f8f9fa;
                }
                .semester-item.active {
                    background-color: #d1e7dd;
                    border-left: 3px solid #198754;
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
            `}</style>

            {/* Header */}
            <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container-fluid px-4">
                    <div className="py-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-primary bg-opacity-10 rounded">
                                    <i className="fas fa-calendar-alt fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold">Academic Years & Semesters</h1>
                                    <p className="text-muted mb-0 small">
                                        Manage academic periods and configure active semesters
                                    </p>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={() => setShowYearModal(true)}
                                disabled={loading}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Add Academic Year
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">


                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <div className="d-flex align-items-center">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            <div>{error}</div>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError(null)}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mb-0">Loading academic years...</p>
                        </div>
                    </div>
                ) : academicYears.length === 0 ? (
                    /* Empty State */
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <i className="fas fa-calendar-plus fa-3x text-muted mb-3 opacity-25"></i>
                            <h5 className="text-muted">No Academic Years Found</h5>
                            <p className="text-muted small mb-3">
                                Get started by creating your first academic year and add semesters to it
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowYearModal(true)}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Add First Academic Year
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Academic Years Grid */
                    <div className="row g-4">
                        {academicYears
                            .sort((a, b) => {
                                if (a.is_active === b.is_active) {
                                    return b.year_start - a.year_start;
                                }
                                return a.is_active ? -1 : 1;
                            })
                            .map((year) => (
                                <div key={year.id} className="col-12 col-lg-6 col-xl-4 fade-in">
                                    <div className={`card year-card h-100 shadow-sm ${year.is_active ? 'active-year' : ''}`}>
                                        <div className="card-header bg-white border-bottom">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h5 className="mb-1 fw-bold">
                                                        <i className="fas fa-calendar-alt me-2 text-primary"></i>
                                                        {year.year_start} - {year.year_end}
                                                    </h5>
                                                    {year.is_active && (
                                                        <span className="badge bg-success">
                                                            <i className="fas fa-check-circle me-1"></i>
                                                            Active Year
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-list-ul me-2 text-muted"></i>
                                                    <span className="text-muted small fw-semibold">
                                                        {year.semesters.length} Semester{year.semesters.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-primary action-btn"
                                                    onClick={() => {
                                                        setSelectedYearId(year.id);
                                                        setShowSemesterModal(true);
                                                    }}
                                                >
                                                    <i className="fas fa-plus me-1"></i>
                                                    Add Semester
                                                </button>
                                            </div>

                                            {year.semesters.length === 0 ? (
                                                <div className="text-center py-4 bg-light rounded">
                                                    <i className="fas fa-calendar-times text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                                                    <p className="text-muted small mb-0">No semesters added yet</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {year.semesters.map((sem) => (
                                                        <div
                                                            key={sem.id}
                                                            className={`semester-item ${sem.is_active ? 'active' : ''}`}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <i className={`fas fa-circle me-2 ${sem.is_active ? 'text-success' : 'text-muted'}`} style={{ fontSize: '0.5rem' }}></i>
                                                                    <span className={sem.is_active ? 'fw-semibold' : ''}>
                                                                        {sem.name}
                                                                    </span>

                                                                </div>
                                                                <button
                                                                    className={`btn btn-sm action-btn ${
                                                                        sem.is_active
                                                                            ? "btn-success"
                                                                            : "btn-outline-secondary"
                                                                    }`}
                                                                    onClick={() => activateSemester(sem.id)}
                                                                    disabled={sem.is_active}
                                                                    title={sem.is_active ? "Currently active" : "Set as active semester"}
                                                                >
                                                                    {sem.is_active ? (
                                                                        <>
                                                                            <i className="fas fa-check me-1"></i>
                                                                            Active
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-toggle-on me-1"></i>
                                                                            Activate
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-footer bg-white border-top">
                                            <div className="d-flex justify-content-between align-items-center text-muted small">
                                                <span>
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Year ID: {year.id}
                                                </span>
                                                <span>
                                                    {year.semesters.filter(s => s.is_active).length > 0
                                                        ? "Has active semester"
                                                        : "No active semester"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Add Semester Modal */}
            {showSemesterModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header border-0 bg-light">
                                    <div>
                                        <h5 className="modal-title fw-bold">
                                            <i className="fas fa-plus-circle text-primary me-2"></i>
                                            Add New Semester
                                        </h5>
                                        {getSelectedYearInfo() && (
                                            <p className="text-muted small mb-0">
                                                Academic Year: {getSelectedYearInfo()?.year_start} - {getSelectedYearInfo()?.year_end}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        className="btn-close"
                                        onClick={closeModals}
                                        disabled={semesterLoading}
                                        aria-label="Close"
                                    />
                                </div>
                                <div className="modal-body px-4 py-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="fas fa-tag me-2 text-primary"></i>
                                            Semester Name
                                            <span className="text-danger ms-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="e.g., 1st Semester, Fall 2025"
                                            value={newSemesterName}
                                            onChange={(e) => setNewSemesterName(e.target.value)}
                                            disabled={semesterLoading}
                                            autoFocus
                                        />
                                        <small className="text-muted">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Enter a descriptive name for this semester period
                                        </small>
                                    </div>

                                    <div className="alert alert-info border-0 mb-0">
                                        <div className="d-flex align-items-start">
                                            <i className="fas fa-lightbulb me-2 mt-1"></i>
                                            <div>
                                                <strong>Note:</strong> After creating this semester, you can set it as the active semester by clicking the "Activate" button.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={closeModals}
                                        disabled={semesterLoading}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={addSemester}
                                        disabled={semesterLoading || !newSemesterName.trim()}
                                    >
                                        {semesterLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check me-1"></i>
                                                Add Semester
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Add Academic Year Modal */}
            {showYearModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header border-0 bg-light">
                                    <div>
                                        <h5 className="modal-title fw-bold">
                                            <i className="fas fa-calendar-plus text-primary me-2"></i>
                                            Add Academic Year
                                        </h5>
                                        <p className="text-muted small mb-0">Create a new academic year period</p>
                                    </div>
                                    <button
                                        className="btn-close"
                                        onClick={closeModals}
                                        disabled={yearLoading}
                                        aria-label="Close"
                                    />
                                </div>
                                <div className="modal-body px-4 py-4">
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">
                                                <i className="fas fa-calendar-week me-2 text-primary"></i>
                                                Start Year
                                                <span className="text-danger ms-1">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control form-control-lg"
                                                placeholder="2025"
                                                value={yearStart}
                                                onChange={(e) => setYearStart(Number(e.target.value) || "")}
                                                disabled={yearLoading}
                                                min={2020}
                                                max={2050}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">
                                                <i className="fas fa-calendar-check me-2 text-success"></i>
                                                End Year
                                                <span className="text-danger ms-1">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control form-control-lg"
                                                placeholder="2026"
                                                value={yearEnd}
                                                onChange={(e) => setYearEnd(Number(e.target.value) || "")}
                                                disabled={yearLoading}
                                                min={2020}
                                                max={2050}
                                            />
                                        </div>
                                    </div>

                                    {yearStart && yearEnd && (
                                        <div className={`alert ${yearStart >= yearEnd ? 'alert-warning' : 'alert-success'} border-0 mt-3 mb-0`}>
                                            <div className="d-flex align-items-start">
                                                <i className={`fas ${yearStart >= yearEnd ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2 mt-1`}></i>
                                                <div>
                                                    {yearStart >= yearEnd ? (
                                                        <span>End year must be greater than start year.</span>
                                                    ) : (
                                                        <span>Academic Year: <strong>{yearStart} - {yearEnd}</strong></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(!yearStart || !yearEnd) && (
                                        <div className="alert alert-info border-0 mt-3 mb-0">
                                            <div className="d-flex align-items-start">
                                                <i className="fas fa-info-circle me-2 mt-1"></i>
                                                <div>
                                                    <small>Enter both start and end years to create an academic year. After creation, you can add semesters to it.</small>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 bg-light">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={closeModals}
                                        disabled={yearLoading}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={addYear}
                                        disabled={yearLoading || !yearStart || !yearEnd || yearStart >= yearEnd}
                                    >
                                        {yearLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check me-1"></i>
                                                Create Year
                                            </>
                                        )}
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

export default AcademicYearsManager;
