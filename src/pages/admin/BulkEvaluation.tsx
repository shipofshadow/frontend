import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";

type Student = {
    id: number;
    name: string;
    course: string;
    gwa: number;
    familyIncome: number;
    siblings: number;
    score?: number;
    status?: "Qualified" | "Not Qualified" | "Pending";
};

const BulkEvaluation = () => {
    const tableRef = useRef(null);

    const [students, setStudents] = useState<Student[]>([
        {
            id: 1,
            name: "Alice Santos",
            course: "BSIT",
            gwa: 89,
            familyIncome: 150000,
            siblings: 2,
            status: "Pending",
        },
        {
            id: 2,
            name: "John Reyes",
            course: "BSED",
            gwa: 92,
            familyIncome: 100000,
            siblings: 1,
            status: "Pending",
        },
    ]);

    useEffect(() => {
        if (tableRef.current) {
            new DataTable(tableRef.current, {
                perPage: 5,
                searchable: true,
                sortable: true,
            });
        }
    }, []);

    const evaluateAll = () => {
        if (!confirm("Proceed with bulk evaluation of all students?")) return;

        // Simulate evaluation result using dummy scoring logic
        const evaluated = students.map((student) => {
            const score =
                (student.gwa / 100) * 0.5 +
                ((200000 - student.familyIncome) / 200000) * 0.3 +
                (student.siblings / 5) * 0.2;

            return {
                ...student,
                score: +score.toFixed(2),
                status: score >= 0.7 ? "Qualified" : "Not Qualified",
            };
        });

        // TODO: Replace this with real API call like:
        // fetch('/api/evaluate-bulk', { method: 'POST', body: ... })

        setStudents(evaluated);
        alert("Bulk evaluation completed!");
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
                                        <i data-feather="zap"></i>
                                    </div>
                                    Bulk Evaluation
                                </h1>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-primary btn-sm" onClick={evaluateAll}>
                                    <i className="fa fa-cogs me-2"></i>Evaluate All Students
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                <div className="card mb-4">
                    <div className="card-body">
                        <table ref={tableRef} id="datatablesSimple">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Course</th>
                                <th>GWA</th>
                                <th>Family Income</th>
                                <th>Siblings</th>
                                <th>Eligibility Score</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tfoot>
                            <tr>
                                <th>Name</th>
                                <th>Course</th>
                                <th>GWA</th>
                                <th>Family Income</th>
                                <th>Siblings</th>
                                <th>Eligibility Score</th>
                                <th>Status</th>
                            </tr>
                            </tfoot>
                            <tbody>
                            {students.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td>{s.course}</td>
                                    <td>{s.gwa}</td>
                                    <td>{s.familyIncome}</td>
                                    <td>{s.siblings}</td>
                                    <td>{s.score ?? "—"}</td>
                                    <td>
                      <span
                          className={`badge rounded-pill ${
                              s.status === "Qualified"
                                  ? "bg-success"
                                  : s.status === "Not Qualified"
                                      ? "bg-danger"
                                      : "bg-warning"
                          }`}
                      >
                        {s.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BulkEvaluation;
