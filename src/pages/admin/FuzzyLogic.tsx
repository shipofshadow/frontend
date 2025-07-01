import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";

type FuzzyRule = {
    id: number;
    name: string;
    min: number;
    max: number;
    weight: number;
};

const FuzzyLogic = () => {
    const tableRef = useRef(null);
    const [rules, setRules] = useState<FuzzyRule[]>([
        { id: 1, name: "GWA", min: 85, max: 100, weight: 0.4 },
        { id: 2, name: "Family Income", min: 0, max: 200000, weight: 0.3 },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<FuzzyRule>({ id: 0, name: "", min: 0, max: 0, weight: 0 });
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        if (tableRef.current) {
            new DataTable(tableRef.current, {
                perPage: 5,
                searchable: true,
                sortable: true,
            });
        }
    }, []);

    const openModal = (rule?: FuzzyRule) => {
        if (rule) {
            setEditingId(rule.id);
            setForm(rule);
        } else {
            setEditingId(null);
            setForm({ id: 0, name: "", min: 0, max: 0, weight: 0 });
        }
        setShowModal(true);
    };

    const saveRule = () => {
        if (editingId !== null) {
            setRules((prev) => prev.map((r) => (r.id === editingId ? { ...form, id: editingId } : r)));
        } else {
            setRules((prev) => [...prev, { ...form, id: Date.now() }]);
        }
        setShowModal(false);
    };

    const deleteRule = (id: number) => {
        if (confirm("Are you sure you want to delete this rule?")) {
            setRules((prev) => prev.filter((r) => r.id !== id));
        }
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
                                        <i data-feather="settings"></i>
                                    </div>
                                    Fuzzy Logic Settings
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                <div className="card mb-4">
                    <div className="card-header">
                        <div className="d-flex justify-content-end">
                            <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
                                Add New Rule
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <table ref={tableRef} id="datatablesSimple">
                            <thead>
                            <tr>
                                <th>Criterion</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Weight</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tfoot>
                            <tr>
                                <th>Criterion</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Weight</th>
                                <th>Actions</th>
                            </tr>
                            </tfoot>
                            <tbody>
                            {rules.map((rule) => (
                                <tr key={rule.id}>
                                    <td>{rule.name}</td>
                                    <td>{rule.min}</td>
                                    <td>{rule.max}</td>
                                    <td>{rule.weight}</td>
                                    <td>
                                        <button
                                            className="btn btn-outline-secondary btn-sm me-2"
                                            onClick={() => openModal(rule)}
                                        >
                                            <i className="fa fa-edit me-1"></i>Edit
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => deleteRule(rule.id)}
                                        >
                                            <i className="fa fa-trash me-1"></i>Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content shadow">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingId ? "Edit Rule" : "Add Rule"}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Criterion Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Minimum Value</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.min}
                                        onChange={(e) => setForm({ ...form, min: +e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Maximum Value</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.max}
                                        onChange={(e) => setForm({ ...form, max: +e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Weight (0 - 1)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        value={form.weight}
                                        onChange={(e) => setForm({ ...form, weight: +e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={saveRule}>
                                    {editingId ? "Update" : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FuzzyLogic;
