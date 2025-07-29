import React, { useState, useMemo } from 'react';

// --- Type Definitions for our Fuzzy System Configuration ---
interface MembershipParams extends Array<number> {
    [0]: number; // Left boundary (a)
    [1]: number; // Peak (b)
    [2]: number; // Right boundary (c)
}

interface MembershipFunctionSet {
    [setName: string]: MembershipParams;
}

interface FuzzyVariables {
    gwa: MembershipFunctionSet;
    income: MembershipFunctionSet;
}

interface Rule {
    if: {
        gwa: string;
        income: string;
    };
    then: number; // Consequent output value
}


// --- The Main React Component ---
const FuzzyLogic = () => {
    // --- STATE MANAGEMENT ---
    // Initialize state with the default configuration from your Python class
    const [membershipFunctions, setMembershipFunctions] = useState<FuzzyVariables>({
        gwa: {
            'high': [0.75, 1.0, 1.5],
            'medium': [1.25, 1.75, 2.25],
            'low': [2.0, 2.5, 3.25]
        },
        income: {
            'low': [0, 7500, 15000],
            'medium': [10000, 25000, 40000],
            'high': [30000, 65000, 100000]
        }
    });

    const [rules, setRules] = useState<Rule[]>([
        { 'if': { 'gwa': 'high', 'income': 'low' }, 'then': 1.0 },
        { 'if': { 'gwa': 'high', 'income': 'medium' }, 'then': 0.9 },
        { 'if': { 'gwa': 'high', 'income': 'high' }, 'then': 0.6 },
        { 'if': { 'gwa': 'medium', 'income': 'low' }, 'then': 0.8 },
        { 'if': { 'gwa': 'medium', 'income': 'medium' }, 'then': 0.6 },
        { 'if': { 'gwa': 'medium', 'income': 'high' }, 'then': 0.4 },
        { 'if': { 'gwa': 'low', 'income': 'low' }, 'then': 0.5 },
        { 'if': { 'gwa': 'low', 'income': 'medium' }, 'then': 0.3 },
        { 'if': { 'gwa': 'low', 'income': 'high' }, 'then': 0.1 },
    ]);

    // State to manage modals for Add/Edit operations
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'addSet' | 'editSet' | 'addRule' | 'editRule' | null>(null);
    const [currentItem, setCurrentItem] = useState<any>(null); // Holds data for the item being edited/added

    // --- COMPUTED VALUES ---
    // Memoize fuzzy set names to avoid re-calculating on every render
    const gwaSetNames = useMemo(() => Object.keys(membershipFunctions.gwa), [membershipFunctions]);
    const incomeSetNames = useMemo(() => Object.keys(membershipFunctions.income), [membershipFunctions]);

    // --- CRUD HANDLERS FOR FUZZY SETS ---

    const handleAddSet = (variable: 'gwa' | 'income') => {
        setModalType('addSet');
        setCurrentItem({ variable, setName: '', params: [0, 0, 0] });
        setIsModalOpen(true);
    };

    const handleEditSet = (variable: 'gwa' | 'income', setName: string) => {
        const params = membershipFunctions[variable][setName];
        setModalType('editSet');
        setCurrentItem({ variable, setName, params });
        setIsModalOpen(true);
    };

    const handleDeleteSet = (variable: 'gwa' | 'income', setName: string) => {
        // Prevent deletion if the set is used in any rule
        const isSetInUse = rules.some(rule => rule.if[variable] === setName);
        if (isSetInUse) {
            alert(`Cannot delete the set "${setName}". It is currently used in one or more rules.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete the fuzzy set "${setName}"?`)) {
            setMembershipFunctions(prev => {
                const newSets = { ...prev };
                delete newSets[variable][setName];
                return newSets;
            });
        }
    };

    // --- CRUD HANDLERS FOR RULES ---

    const handleAddRule = () => {
        setModalType('addRule');
        // Set default values using the first available set names
        setCurrentItem({ if: { gwa: gwaSetNames[0], income: incomeSetNames[0] }, then: 0.5 });
        setIsModalOpen(true);
    };

    const handleEditRule = (rule: Rule, index: number) => {
        setModalType('editRule');
        setCurrentItem({ ...rule, index });
        setIsModalOpen(true);
    };

    const handleDeleteRule = (index: number) => {
        if (window.confirm(`Are you sure you want to delete Rule #${index + 1}?`)) {
            setRules(prev => prev.filter((_, i) => i !== index));
        }
    };

    // --- MODAL SAVE HANDLER ---

    const handleSave = () => {
        if (!currentItem) return;

        // Save logic for Fuzzy Sets
        if (modalType === 'addSet') {
            if (!currentItem.setName) {
                alert("Set Name cannot be empty.");
                return;
            }
            if (membershipFunctions[currentItem.variable][currentItem.setName]) {
                alert(`A set with the name "${currentItem.setName}" already exists.`);
                return;
            }
            setMembershipFunctions(prev => ({
                ...prev,
                [currentItem.variable]: {
                    ...prev[currentItem.variable],
                    [currentItem.setName]: currentItem.params,
                }
            }));
        }
        else if (modalType === 'editSet') {
            setMembershipFunctions(prev => ({
                ...prev,
                [currentItem.variable]: {
                    ...prev[currentItem.variable],
                    [currentItem.setName]: currentItem.params,
                }
            }));
        }

        // Save logic for Rules
        if (modalType === 'addRule') {
            const { index, ...newRule } = currentItem;
            setRules(prev => [...prev, newRule]);
        }
        else if (modalType === 'editRule') {
            setRules(prev => {
                const newRules = [...prev];
                const { index, ...updatedRule } = currentItem;
                newRules[index] = updatedRule;
                return newRules;
            });
        }

        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalType(null);
        setCurrentItem(null);
    };

    // --- RENDER HELPER ---
    // Renders a card and table for a given fuzzy variable ('gwa' or 'income')
    const renderFuzzySetCard = (variable: 'gwa' | 'income', title: string) => (
        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <span>{title} Fuzzy Sets</span>
                <button className="btn btn-primary btn-sm" onClick={() => handleAddSet(variable)}>Add Set</button>
            </div>
            <div className="card-body table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                    <tr>
                        <th>Set Name</th>
                        <th>Params [low, peak, high]</th>
                        <th style={{ width: '150px' }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(membershipFunctions[variable]).map(([setName, params]) => (
                        <tr key={setName}>
                            <td>{setName}</td>
                            <td>[{params.join(', ')}]</td>
                            <td>
                                <button className="btn btn-datatable btn-icon btn-transparent-dark me-2" onClick={() => handleEditSet(variable, setName)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-datatable btn-icon btn-transparent-dark" onClick={() => handleDeleteSet(variable, setName)}>
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i data-feather="settings"></i></div>
                                    Fuzzy Logic Configuration
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl px-4 mt-4">
                {/* Fuzzy Set Cards */}
                <div className="row">
                    <div className='col-lg-6'>
                        {renderFuzzySetCard('gwa', 'GWA')}
                    </div>
                    <div className='col-lg-6'>
                        {renderFuzzySetCard('income', 'Income')}
                    </div>
                </div>

                {/* Fuzzy Rules Card */}
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <span>Fuzzy Rules</span>
                        <button className="btn btn-primary btn-sm" onClick={handleAddRule}>Add Rule</button>
                    </div>
                    <div className="card-body table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>IF GWA is</th>
                                <th>AND Income is</th>
                                <th>THEN Eligibility is</th>
                                <th style={{ width: '150px' }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rules.map((rule, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td><span className="badge bg-primary-soft text-primary">{rule.if.gwa}</span></td>
                                    <td><span className="badge bg-success-soft text-success">{rule.if.income}</span></td>
                                    <td>{rule.then}</td>
                                    <td>
                                        <button className="btn btn-datatable btn-icon btn-transparent-dark me-2" onClick={() => handleEditRule(rule, index)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-datatable btn-icon btn-transparent-dark" onClick={() => handleDeleteRule(index)}>
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODAL DIALOG for Add/Edit --- */}
            {isModalOpen && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modalType === 'addSet' && 'Add New Fuzzy Set'}
                                    {modalType === 'editSet' && `Edit Fuzzy Set: ${currentItem?.setName}`}
                                    {modalType === 'addRule' && 'Add New Rule'}
                                    {modalType === 'editRule' && `Edit Rule #${currentItem?.index + 1}`}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {/* Form for Fuzzy Sets */}
                                {(modalType === 'addSet' || modalType === 'editSet') && currentItem && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Variable</label>
                                            <input type="text" className="form-control" value={currentItem.variable.toUpperCase()} disabled />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="setName" className="form-label">Set Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="setName"
                                                value={currentItem.setName}
                                                onChange={(e) => setCurrentItem({ ...currentItem, setName: e.target.value })}
                                                disabled={modalType === 'editSet'} // Prevent editing name to avoid breaking rules
                                            />
                                            {modalType === 'editSet' && <div className="form-text">Set name cannot be changed.</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Parameters [a, b, c]</label>
                                            <div className='d-flex'>
                                                <input type="number" className="form-control me-2" value={currentItem.params[0]} onChange={(e) => setCurrentItem({...currentItem, params: [parseFloat(e.target.value), currentItem.params[1], currentItem.params[2]]})} />
                                                <input type="number" className="form-control me-2" value={currentItem.params[1]} onChange={(e) => setCurrentItem({...currentItem, params: [currentItem.params[0], parseFloat(e.target.value), currentItem.params[2]]})} />
                                                <input type="number" className="form-control" value={currentItem.params[2]} onChange={(e) => setCurrentItem({...currentItem, params: [currentItem.params[0], currentItem.params[1], parseFloat(e.target.value)]})} />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {/* Form for Rules */}
                                {(modalType === 'addRule' || modalType === 'editRule') && currentItem && (
                                    <>
                                        <div className="mb-3">
                                            <label htmlFor="gwaSelect" className="form-label">IF GWA is</label>
                                            <select id="gwaSelect" className="form-select" value={currentItem.if.gwa} onChange={e => setCurrentItem({...currentItem, if: {...currentItem.if, gwa: e.target.value}})}>
                                                {gwaSetNames.map(name => <option key={name} value={name}>{name}</option>)}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="incomeSelect" className="form-label">AND Income is</label>
                                            <select id="incomeSelect" className="form-select" value={currentItem.if.income} onChange={e => setCurrentItem({...currentItem, if: {...currentItem.if, income: e.target.value}})}>
                                                {incomeSetNames.map(name => <option key={name} value={name}>{name}</option>)}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="thenValue" className="form-label">THEN Eligibility is</label>
                                            <input
                                                id="thenValue"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="1"
                                                className="form-control"
                                                value={currentItem.then}
                                                onChange={e => setCurrentItem({...currentItem, then: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FuzzyLogic;