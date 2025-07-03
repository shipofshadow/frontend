import React, { useState } from "react";

type Semester = {
    id: number;
    academic_year_id: number;
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

const AcademicYears = () => {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([
        {
            id: 1,
            year_start: 2025,
            year_end: 2026,
            is_active: true,
            semesters: [
                { id: 1, academic_year_id: 1, name: "1st Semester", is_active: true },
                { id: 2, academic_year_id: 1, name: "2nd Semester", is_active: false },
            ],
        },
    ]);

    const [showAddYearModal, setShowAddYearModal] = useState(false);
    const [newYearStart, setNewYearStart] = useState<number | null>(null);

    const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
    const [newSemesterName, setNewSemesterName] = useState("");
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

    const addAcademicYear = () => {
        if (!newYearStart) return;
        const year_end = newYearStart + 1;

        const exists = academicYears.some(
            (y) => y.year_start === newYearStart && y.year_end === year_end
        );
        if (exists) return alert("Academic Year already exists");

        const newYear: AcademicYear = {
            id: Date.now(),
            year_start: newYearStart,
            year_end,
            is_active: false,
            semesters: [],
        };

        setAcademicYears((prev) => [...prev, newYear]);
        setShowAddYearModal(false);
    };

    const addSemester = () => {
        if (!selectedYearId || !newSemesterName) return;

        const updated = academicYears.map((y) => {
            if (y.id === selectedYearId) {
                return {
                    ...y,
                    semesters: [
                        ...y.semesters,
                        {
                            id: Date.now(),
                            academic_year_id: y.id,
                            name: newSemesterName,
                            is_active: false,
                        },
                    ],
                };
            }
            return y;
        });

        setAcademicYears(updated);
        setShowAddSemesterModal(false);
    };

    const setActiveYear = (id: number) => {
        setAcademicYears((prev) =>
            prev.map((y) => ({ ...y, is_active: y.id === id }))
        );
    };

    const setActiveSemester = (yearId: number, semesterId: number) => {
        const updated = academicYears.map((y) => {
            if (y.id === yearId) {
                return {
                    ...y,
                    semesters: y.semesters.map((s) => ({
                        ...s,
                        is_active: s.id === semesterId,
                    })),
                };
            }
            return y;
        });

        setAcademicYears(updated);
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
                                        <i data-feather="calendar"></i>
                                    </div>
                                    Academic Years & Semesters
                                </h1>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-primary btn-sm" onClick={() => setShowAddYearModal(true)}>
                                    <i className="fa fa-plus me-2"></i>Add Academic Year
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                <div className="card">
                    <div className="card-body">
                        {academicYears.map((year) => (
                            <div key={year.id} className="mb-4 border-bottom pb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5>
                                        {year.year_start} - {year.year_end}{" "}
                                        {year.is_active && <span className="badge bg-success ms-2">Active</span>}
                                    </h5>
                                    <div>
                                        <button
                                            className="btn btn-outline-success btn-sm me-2"
                                            onClick={() => setActiveYear(year.id)}
                                            disabled={year.is_active}
                                        >
                                            Set Active
                                        </button>
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => {
                                                setSelectedYearId(year.id);
                                                setNewSemesterName("");
                                                setShowAddSemesterModal(true);
                                            }}
                                        >
                                            Add Semester
                                        </button>
                                    </div>
                                </div>
                                <ul className="mt-2 list-group small">
                                    {year.semesters.map((sem) => (
                                        <li key={sem.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            {sem.name}
                                            <button
                                                className={`btn btn-sm ${sem.is_active ? "btn-success" : "btn-outline-success"}`}
                                                onClick={() => setActiveSemester(year.id, sem.id)}
                                                disabled={sem.is_active}
                                            >
                                                {sem.is_active ? "Active" : "Set Active"}
                                            </button>
                                        </li>
                                    ))}
                                    {year.semesters.length === 0 && (
                                        <li className="list-group-item text-muted">No semesters added yet.</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Academic Year Modal */}
            {showAddYearModal && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Academic Year</h5>
                                <button className="btn-close" onClick={() => setShowAddYearModal(false)} />
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Start Year (e.g., 2025)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={newYearStart ?? ""}
                                    onChange={(e) => setNewYearStart(parseInt(e.target.value))}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowAddYearModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={addAcademicYear}>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Semester Modal */}
            {showAddSemesterModal && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Semester</h5>
                                <button className="btn-close" onClick={() => setShowAddSemesterModal(false)} />
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Semester Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., 1st Semester"
                                    value={newSemesterName}
                                    onChange={(e) => setNewSemesterName(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowAddSemesterModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={addSemester}>
                                    Add Semester
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AcademicYears;
