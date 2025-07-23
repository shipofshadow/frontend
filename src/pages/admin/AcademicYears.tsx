import React, { useEffect, useState } from "react";
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

    const [showSemesterModal, setShowSemesterModal] = useState(false);
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
    const [newSemesterName, setNewSemesterName] = useState("");

    const [showYearModal, setShowYearModal] = useState(false);
    const [yearStart, setYearStart] = useState<number | "">("");
    const [yearEnd, setYearEnd] = useState<number | "">("");


    useEffect(() => {
        fetchAllYears();
    }, []);

    const fetchAllYears = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/period/all`);
            const data = await res.json();

            // Determine is_active flag for Academic Year based on active semester
            const updatedYears = data.map((year: AcademicYear) => {
                const hasActiveSemester = year.semesters.some((s) => s.is_active);
                return { ...year, is_active: hasActiveSemester };
            });

            setAcademicYears(updatedYears);
        } catch (err) {
            console.error("Error fetching years", err);
        }
        setLoading(false);
    };

    const addSemester = async () => {
        if (!selectedYearId || !newSemesterName) return;

        await fetch(`${API_BASE_URL}/api/period/semester`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                academic_year_id: selectedYearId,
                name: newSemesterName,
            }),
        });

        setShowSemesterModal(false);
        setNewSemesterName("");
        fetchAllYears();
    };

    const activateSemester = async (semesterId: number) => {
        await fetch(`${API_BASE_URL}/api/period/semester/${semesterId}/activate`, { method: "PUT" });
        fetchAllYears();
    };

    const addYear = async () => {
        if (!yearStart || !yearEnd) return;

        await fetch(`${API_BASE_URL}/api/period/year`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                year_start: yearStart,
                year_end: yearEnd,
            }),
        });

        setShowYearModal(false);
        setYearStart("");
        setYearEnd("");
        fetchAllYears();
    };


    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content pt-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <h1 className="page-header-title mb-0">
                                    <i className="far fa-calendar"></i> &nbsp;
                                    Academic Year</h1>
                            </div>

                            <button
                                className="btn btn-primary btn-sm mb-2"
                                onClick={() => setShowYearModal(true)}
                            >
                                <i className="fa fa-plus me-2"></i> Add Academic Year
                            </button>
                        </div>
                    </div>
                </div>
            </header>


            <div className="container mt-4">

                {academicYears
                    .sort((a, b) => {
                        if (a.is_active === b.is_active) {
                            return b.year_start - a.year_start; // Descending by year if both same active state
                        }
                        return a.is_active ? -1 : 1; // Active years first
                    })
                    .map((year) => (
                        <div key={year.id} className="border p-3 mb-3">
                            <h5 className="d-flex align-items-center">
                                {year.year_start} - {year.year_end}
                                {year.is_active && <span className="badge bg-success ms-auto">Active</span>}
                            </h5>

                            <button
                                className="btn btn-sm btn-outline-primary mb-2"
                                onClick={() => {
                                    setSelectedYearId(year.id);
                                    setShowSemesterModal(true);
                                }}
                            >
                                Add Semester
                            </button>

                            <ul className="list-group">
                                {year.semesters.length === 0 ? (
                                    <li className="list-group-item text-muted">No semesters added.</li>
                                ) : (
                                    year.semesters.map((sem) => (
                                        <li key={sem.id} className="list-group-item d-flex justify-content-between">
                                            {sem.name}
                                            <button
                                                className={`btn btn-sm ${sem.is_active ? "btn-success" : "btn-outline-success"}`}
                                                onClick={() => activateSemester(sem.id)}
                                                disabled={sem.is_active}
                                            >
                                                {sem.is_active ? "Active" : "Set Active"}
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    ))}

                {/* Add Semester Modal */}
            {showSemesterModal && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Semester</h5>
                                <button className="btn-close" onClick={() => setShowSemesterModal(false)} />
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
                                <button className="btn btn-secondary" onClick={() => setShowSemesterModal(false)}>
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


                {showYearModal && (
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add Academic Year</h5>
                                    <button className="btn-close" onClick={() => setShowYearModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <label className="form-label">Start Year</label>
                                    <input
                                        type="number"
                                        className="form-control mb-2"
                                        placeholder="e.g., 2025"
                                        value={yearStart}
                                        onChange={(e) => setYearStart(Number(e.target.value))}
                                    />
                                    <label className="form-label">End Year</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g., 2026"
                                        value={yearEnd}
                                        onChange={(e) => setYearEnd(Number(e.target.value))}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowYearModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn btn-primary" onClick={addYear}>
                                        Add Year
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default AcademicYearsManager;
