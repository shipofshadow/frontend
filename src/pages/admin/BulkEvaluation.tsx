<<<<<<< HEAD
import { useForm } from '@tanstack/react-form'
import * as React from 'react'
import type { AnyFieldApi } from '@tanstack/react-form'

const FieldInfo = ({ field }: { field: AnyFieldApi }) => {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <div className="text-danger">{field.state.meta.errors.join(', ')}</div>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

const BulkEvaluation = () => {
  const [showModal, setShowModal] = React.useState(false)
  const [records, setRecords] = React.useState([
    { id: 1, firstName: 'Juan', lastName: 'Dela Cruz' },
    { id: 2, firstName: 'Maria', lastName: 'Santos' },
  ])

  // prevent scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : 'auto'
  }, [showModal])

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit: async ({ value }) => {
      const newId = records.length ? records[records.length - 1].id + 1 : 1
      setRecords([...records, { id: newId, ...value }])
      setShowModal(false)
      form.reset()
    },
  })

  const handleDelete = (id: number) => {
    setRecords(records.filter((rec) => rec.id !== id))
  }

  return (
    <>
      <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
        <div className="container-fluid px-4">
          <div className="page-header-content">
            <div className="row align-items-center justify-content-between pt-3">
              <div className="col-auto mb-3">
                <h1 className="page-header-title">
                  <div className="page-header-icon">
                    <i data-feather="user"></i>
                  </div>
                  Bulk Evaluation
                </h1>
              </div>
              <div className="col-auto mb-3">
                <button
                  className="btn btn-success"
                  onClick={() => setShowModal(true)}
                >
                  + Add Record
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid px-4">
        <div className="card p-4">
          <h4 className="mb-3">Records</h4>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.firstName}</td>
                  <td>{item.lastName}</td>
                  <td>
                    <button className="btn btn-danger btn-sm me-2">Edit</button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Modal (No Bootstrap JS needed) */}
      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
              >
                <div className="modal-header">
                  <h5 className="modal-title">Add Record</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <form.Field
                      name="firstName"
                      validators={{
                        onChange: ({ value }) =>
                          !value
                            ? 'First name is required'
                            : value.length < 3
                              ? 'Minimum 3 characters'
                              : undefined,
                      }}
                      children={(field) => (
                        <>
                          <label htmlFor={field.name} className="form-label">
                            First Name
                          </label>
                          <input
                            className="form-control"
                            id={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          <FieldInfo field={field} />
                        </>
                      )}
                    />
                  </div>
                  <div className="mb-3">
                    <form.Field
                      name="lastName"
                      children={(field) => (
                        <>
                          <label htmlFor={field.name} className="form-label">
                            Last Name
                          </label>
                          <input
                            className="form-control"
                            id={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          <FieldInfo field={field} />
                        </>
                      )}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={!canSubmit}
                        >
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowModal(false)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BulkEvaluation
=======
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
>>>>>>> bdd07267b184537706a1db265b2763e9aacea33a
