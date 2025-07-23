import React, { useState } from "react";

type FuzzySet = {
    id: number;
    criterion: "GWA" | "Family Income";
    label: string;
    type: "triangular" | "trapezoidal";
    points: number[];
};

const criteriaOptions = ["GWA", "Family Income"] as const;

const triangularMembership = (x: number, [a, b, c]: number[]) => {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x < b) return (x - a) / (b - a);
    return (c - x) / (c - b);
};

const trapezoidalMembership = (x: number, [a, b, c, d]: number[]) => {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    return (d - x) / (d - c);
};

const FuzzyLogic = () => {
    const [sets, setSets] = useState<FuzzySet[]>([
        { id: 1, criterion: "GWA", label: "Excellent", type: "triangular", points: [0.75, 1.0, 1.25] },
        { id: 2, criterion: "GWA", label: "Very Good", type: "trapezoidal", points: [1.25, 1.4, 1.6, 1.8] },
        { id: 3, criterion: "GWA", label: "Average", type: "trapezoidal", points: [1.75, 2.2, 2.6, 3.0] },
        { id: 4, criterion: "GWA", label: "Poor", type: "trapezoidal", points: [3.0, 4.0, 5.0, 5.0] },
        { id: 5, criterion: "Family Income", label: "Low", type: "trapezoidal", points: [0, 3000, 10000, 20000] },
        { id: 6, criterion: "Family Income", label: "Average", type: "trapezoidal", points: [15000, 50000, 100000, 150000] },
        { id: 7, criterion: "Family Income", label: "High", type: "trapezoidal", points: [130000, 200000, 300000, 400000] }
    ]);

    const [sampleGwa, setSampleGwa] = useState<number>(1.75);
    const [sampleIncome, setSampleIncome] = useState<number>(100000);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<FuzzySet>({
        id: 0,
        criterion: "GWA",
        label: "",
        type: "triangular",
        points: [0, 0, 0],
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    const getMembership = (value: number, set: FuzzySet) => {
        return set.type === "triangular"
            ? triangularMembership(value, set.points)
            : trapezoidalMembership(value, set.points);
    };

    const computeEligibility = (gwa: number, income: number, fuzzySets: FuzzySet[]) => {
        const getDegree = (value: number, criterion: "GWA" | "Family Income", labels: string[]) => {
            return Math.max(0,
                ...fuzzySets
                    .filter(s => s.criterion === criterion && labels.includes(s.label))
                    .map(s => getMembership(value, s))
            );
        };

        const gwaHigh = getDegree(gwa, "GWA", ["Excellent", "Very Good"]);
        const gwaMedium = getDegree(gwa, "GWA", ["Average"]);
        const gwaLow = getDegree(gwa, "GWA", ["Poor"]);

        const incomeLow = getDegree(income, "Family Income", ["Low"]);
        const incomeMedium = getDegree(income, "Family Income", ["Average"]);
        const incomeHigh = getDegree(income, "Family Income", ["High"]);

        const ruleResults = [
            { label: "High Eligibility", strength: Math.min(gwaHigh, incomeLow) },
            { label: "Medium Eligibility", strength: Math.min(gwaMedium, Math.max(incomeLow, incomeMedium)) },
            { label: "Low Eligibility", strength: Math.min(gwaMedium, incomeHigh) },
            { label: "Not Eligible", strength: gwaLow },
        ];

        let best = { label: "Not Eligible", strength: 0 };

        for (const rule of ruleResults) {
            if (rule.strength > best.strength) {
                best = rule;
            }
        }

        return {
            eligibility: best.label,
            strength: best.strength,
            memberships: {
                gwa: { high: gwaHigh, medium: gwaMedium, low: gwaLow },
                income: { low: incomeLow, medium: incomeMedium, high: incomeHigh }
            }
        };
    };

    const eligibilityResult = computeEligibility(sampleGwa, sampleIncome, sets);

    const getEligibilityColor = (eligibility: string) => {
        switch (eligibility) {
            case "High Eligibility": return "alert-success";
            case "Medium Eligibility": return "alert-warning";
            case "Low Eligibility": return "alert-info";
            case "Not Eligible": return "alert-danger";
            default: return "alert-secondary";
        }
    };

    const openModal = (setToEdit?: FuzzySet) => {
        if (setToEdit) {
            setEditingId(setToEdit.id);
            setForm(setToEdit);
        } else {
            setEditingId(null);
            setForm({ id: 0, criterion: "GWA", label: "", type: "triangular", points: [0, 0, 0] });
        }
        setShowModal(true);
    };

    const handlePointChange = (index: number, value: number) => {
        const newPoints = [...form.points];
        newPoints[index] = value;
        setForm({ ...form, points: newPoints });
    };

    const saveSet = () => {
        if (!form.label.trim()) {
            alert("Label is required.");
            return;
        }

        if (form.type === "triangular" && form.points.length !== 3) {
            alert("Triangular function requires 3 points.");
            return;
        }

        if (form.type === "trapezoidal" && form.points.length !== 4) {
            alert("Trapezoidal function requires 4 points.");
            return;
        }

        if (editingId !== null) {
            setSets(prev => prev.map(s => (s.id === editingId ? { ...form, id: editingId } : s)));
        } else {
            setSets(prev => [...prev, { ...form, id: Date.now() }]);
        }

        setShowModal(false);
    };

    const deleteSet = (id: number) => {
        if (window.confirm("Are you sure you want to delete this set?")) {
            setSets(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className="container-xl mt-4">
            <h3 className="mb-4">Fuzzy Logic Scholarship Eligibility System</h3>

            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between">
                    <span>Fuzzy Sets</span>
                    <button className="btn btn-primary btn-sm" onClick={() => openModal()}>Add Fuzzy Set</button>
                </div>
                <div className="card-body table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                        <tr>
                            <th>Criterion</th>
                            <th>Label</th>
                            <th>Type</th>
                            <th>Points</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sets.length === 0 ? (
                            <tr><td colSpan={5} className="text-center text-muted">No fuzzy sets defined.</td></tr>
                        ) : sets.map(s => (
                            <tr key={s.id}>
                                <td>{s.criterion}</td>
                                <td>{s.label}</td>
                                <td>{s.type}</td>
                                <td>{s.points.join(", ")}</td>
                                <td>
                                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => openModal(s)}>Edit</button>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteSet(s.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">Test Eligibility</div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <label className="form-label">Sample GWA (1.0 = highest)</label>
                            <input type="number" step="0.01" min="1.0" max="5.0" className="form-control"
                                   value={sampleGwa} onChange={(e) => setSampleGwa(+e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Sample Family Income (PHP)</label>
                            <input type="number" min="0" className="form-control"
                                   value={sampleIncome} onChange={(e) => setSampleIncome(+e.target.value)} />
                        </div>
                    </div>

                    <h5 className="mt-4 text-primary">Scholarship Eligibility Result:</h5>
                    <div className={`alert ${getEligibilityColor(eligibilityResult.eligibility)}`}>
                        <strong>{eligibilityResult.eligibility}</strong><br />
                        <small>Confidence: {(eligibilityResult.strength * 100).toFixed(1)}%</small>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <h6>GWA Membership Degrees:</h6>
                            <ul className="list-group list-group-flush">
                                {sets.filter(s => s.criterion === "GWA").map(s => (
                                    <li key={s.id} className="list-group-item d-flex justify-content-between">
                                        {s.label}
                                        <span className="badge bg-secondary">{getMembership(sampleGwa, s).toFixed(3)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <h6>Family Income Membership Degrees:</h6>
                            <ul className="list-group list-group-flush">
                                {sets.filter(s => s.criterion === "Family Income").map(s => (
                                    <li key={s.id} className="list-group-item d-flex justify-content-between">
                                        {s.label}
                                        <span className="badge bg-secondary">{getMembership(sampleIncome, s).toFixed(3)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingId ? "Edit Fuzzy Set" : "Add Fuzzy Set"}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <label>Criterion</label>
                                <select className="form-select mb-2"
                                        value={form.criterion}
                                        onChange={(e) => setForm({ ...form, criterion: e.target.value as "GWA" | "Family Income" })}>
                                    {criteriaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>

                                <label>Label</label>
                                <input className="form-control mb-2" value={form.label}
                                       onChange={(e) => setForm({ ...form, label: e.target.value })} />

                                <label>Type</label>
                                <select className="form-select mb-2"
                                        value={form.type}
                                        onChange={(e) => {
                                            const newType = e.target.value as "triangular" | "trapezoidal";
                                            let newPoints = newType === "triangular" ? [0, 0, 0] : [0, 0, 0, 0];
                                            setForm({ ...form, type: newType, points: newPoints });
                                        }}>
                                    <option value="triangular">Triangular</option>
                                    <option value="trapezoidal">Trapezoidal</option>
                                </select>

                                {form.points.map((p, idx) => (
                                    <div key={idx} className="mb-2">
                                        <label>Point {idx + 1}</label>
                                        <input type="number" step="0.01" className="form-control"
                                               value={p}
                                               onChange={(e) => handlePointChange(idx, +e.target.value)} />
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={saveSet}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuzzyLogic;
