import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

type Criterion = {
    id: number;
    name: string;
    weight: number;
    sets: FuzzySet[];
};

type FuzzySet = {
    name: string;
    min: number;
    max: number;
    shape: "triangle" | "trapezoid";
};

const EvaluationRules = () => {
    const [criteria, setCriteria] = useState<Criterion[]>([
        {
            id: 1,
            name: "GWA",
            weight: 0.5,
            sets: [
                { name: "Low", min: 75, max: 85, shape: "trapezoid" },
                { name: "Medium", min: 85, max: 90, shape: "triangle" },
                { name: "High", min: 90, max: 100, shape: "trapezoid" },
            ],
        },
        {
            id: 2,
            name: "Family Income",
            weight: 0.3,
            sets: [
                { name: "Low", min: 0, max: 100000, shape: "trapezoid" },
                { name: "Medium", min: 100001, max: 200000, shape: "triangle" },
            ],
        },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [currentCriterion, setCurrentCriterion] = useState<Criterion | null>(null);

    const openCriterionModal = (criterion: Criterion) => {
        setCurrentCriterion(criterion);
        setShowModal(true);
    };

    return (
        <div className="container-xl mt-4">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Evaluation Rules</h5>
                    <Button variant="primary" onClick={() => alert("Add Criterion not yet implemented")}>
                        Add Criterion
                    </Button>
                </div>
                <div className="card-body">
                    {criteria.map((c) => (
                        <div key={c.id} className="mb-4">
                            <h6 className="fw-bold d-flex justify-content-between">
                                {c.name} <span>Weight: {c.weight}</span>
                            </h6>
                            <table className="table table-bordered small">
                                <thead>
                                <tr>
                                    <th>Set Name</th>
                                    <th>Min</th>
                                    <th>Max</th>
                                    <th>Shape</th>
                                </tr>
                                </thead>
                                <tbody>
                                {c.sets.map((s, i) => (
                                    <tr key={i}>
                                        <td>{s.name}</td>
                                        <td>{s.min}</td>
                                        <td>{s.max}</td>
                                        <td>{s.shape}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className="text-end">
                                <Button size="sm" variant="outline-secondary" onClick={() => openCriterionModal(c)}>
                                    Edit Sets
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for Fuzzy Set Edit */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Fuzzy Sets for {currentCriterion?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentCriterion?.sets.map((s, i) => (
                        <div key={i} className="border-bottom pb-2 mb-2">
                            <Form.Group className="mb-2">
                                <Form.Label>Set Name</Form.Label>
                                <Form.Control type="text" defaultValue={s.name} />
                            </Form.Group>
                            <div className="row">
                                <div className="col">
                                    <Form.Group className="mb-2">
                                        <Form.Label>Min</Form.Label>
                                        <Form.Control type="number" defaultValue={s.min} />
                                    </Form.Group>
                                </div>
                                <div className="col">
                                    <Form.Group className="mb-2">
                                        <Form.Label>Max</Form.Label>
                                        <Form.Control type="number" defaultValue={s.max} />
                                    </Form.Group>
                                </div>
                            </div>
                            <Form.Group className="mb-2">
                                <Form.Label>Shape</Form.Label>
                                <Form.Select defaultValue={s.shape}>
                                    <option value="triangle">Triangle</option>
                                    <option value="trapezoid">Trapezoid</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => alert("Save not implemented")}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EvaluationRules;
