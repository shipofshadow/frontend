import  { useEffect, useState } from "react";
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
            {/* Header */}
            <header className="bg-white border-bottom shadow-sm">
                <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div className="bg-primary bg-gradient rounded-circle p-2 me-3">
                                <i className="fas fa-calendar-alt text-white"></i>
                            </div>
                            <div>
                                <h1 className="h4 mb-0 fw-bold text-dark">Academic Years</h1>
                                <p className="text-muted small mb-0">Manage academic years and semesters</p>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary btn-sm px-3 py-2 rounded-pill shadow-sm"
                            onClick={() => setShowYearModal(true)}
                            disabled={loading}
                        >
                            <i className="fas fa-plus me-2"></i>
                            Add Academic Year
                        </button>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4 py-4">
                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
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
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3">Loading academic years...</p>
                    </div>
                ) : academicYears.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-5">
                        <div className="mb-4">
                            <i className="fas fa-calendar-plus text-muted" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h5 className="text-muted">No Academic Years Found</h5>
                        <p className="text-muted">Get started by adding your first academic year.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowYearModal(true)}
                        >
                            <i className="fas fa-plus me-2"></i>
                            Add Academic Year
                        </button>
                    </div>
                ) : (
                    /* Academic Years List */
                    <div className="row">
                        {academicYears
                            .sort((a, b) => {
                                if (a.is_active === b.is_active) {
                                    return b.year_start - a.year_start;
                                }
                                return a.is_active ? -1 : 1;
                            })
                            .map((year) => (
                                <div key={year.id} className="col-12 col-lg-6 col-xl-4 mb-4">
                                    <div className={`card h-100 shadow-sm border-0 ${year.is_active ? 'border-start border-success border-4' : ''}`}>
                                        <div className="card-header bg-transparent border-0 pb-0">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h5 className="card-title mb-1 fw-bold">
                                                        {year.year_start} - {year.year_end}
                                                    </h5>
                                                    {year.is_active && (
                                                        <span className="badge bg-success rounded-pill">
                                                            <i className="fas fa-check-circle me-1"></i>
                                                            Active Year
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-body pt-3">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="text-muted small">
                                                    <i className="fas fa-list me-1"></i>
                                                    {year.semesters.length} Semester{year.semesters.length !== 1 ? 's' : ''}
                                                </span>
                                                <button
                                                    className="btn btn-outline-primary btn-sm rounded-pill"
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
                                                <div className="text-center py-3">
                                                    <i className="fas fa-calendar-times text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                                                    <p className="text-muted small mb-0">No semesters added yet</p>
                                                </div>
                                            ) : (
                                                <div className="list-group list-group-flush">
                                                    {year.semesters.map((sem) => (
                                                        <div key={sem.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                                                            <div className="d-flex align-items-center">
                                                                <i className={`fas fa-circle me-2 ${sem.is_active ? 'text-success' : 'text-muted'}`} style={{ fontSize: '0.5rem' }}></i>
                                                                <span className={sem.is_active ? 'fw-semibold' : ''}>{sem.name}</span>
                                                            </div>
                                                            <button
                                                                className={`btn btn-sm rounded-pill ${
                                                                    sem.is_active
                                                                        ? "btn-success"
                                                                        : "btn-outline-success"
                                                                }`}
                                                                onClick={() => activateSemester(sem.id)}
                                                                disabled={sem.is_active}
                                                            >
                                                                {sem.is_active ? (
                                                                    <>
                                                                        <i className="fas fa-check me-1"></i>
                                                                        Active
                                                                    </>
                                                                ) : (
                                                                    "Set Active"
                                                                )}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header border-0 pb-0">
                                    <div>
                                        <h5 className="modal-title fw-bold">Add New Semester</h5>
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
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="fas fa-tag me-2"></i>
                                            Semester Name
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
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        className="btn btn-light"
                                        onClick={closeModals}
                                        disabled={semesterLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary px-4"
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
                                                <i className="fas fa-plus me-2"></i>
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
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header border-0 pb-0">
                                    <div>
                                        <h5 className="modal-title fw-bold">Add Academic Year</h5>
                                        <p className="text-muted small mb-0">Create a new academic year period</p>
                                    </div>
                                    <button
                                        className="btn-close"
                                        onClick={closeModals}
                                        disabled={yearLoading}
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">
                                                <i className="fas fa-calendar-week me-2"></i>
                                                Start Year
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
                                                <i className="fas fa-calendar-check me-2"></i>
                                                End Year
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
                                    {yearStart && yearEnd && yearStart >= yearEnd && (
                                        <div className="alert alert-warning mt-3 mb-0" role="alert">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            End year must be greater than start year.
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        className="btn btn-light"
                                        onClick={closeModals}
                                        disabled={yearLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary px-4"
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
                                                <i className="fas fa-plus me-2"></i>
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