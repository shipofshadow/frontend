import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, GraduationCap, DollarSign, BookOpen, Calculator, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface FuzzyVariable {
    variable_id: number;
    variable_name: string;
    description: string;
}

interface FuzzySet {
    set_id: number;
    variable_id: number;
    set_name: string;
    param_a: number;
    param_b: number;
    param_c: number;
}

interface FuzzyRule {
    rule_id: number;
    if: { [variable_name: string]: string };
    then: number;
    description: string;
}

const FuzzyLogic = () => {
    // State
    const [variables, setVariables] = useState<FuzzyVariable[]>([]);
    const [sets, setSets] = useState<FuzzySet[]>([]);
    const [rules, setRules] = useState<FuzzyRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'variable' | 'set' | 'rule' | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);

    // Load data on component mount
    useEffect(() => {
        loadAllData().catch((err) =>
            console.error("Promise rejection in loadAllData:", err)
        );
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                loadVariables(),
                loadSets(),
                loadRules()
            ]);
        } catch (err) {
            setError('Failed to load fuzzy logic configuration');
            console.error('Load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadVariables = async () => {
        const response = await fetch(`${API_BASE_URL}/api/fuzzy/variables`);
        if (!response.ok) throw new Error('Failed to load variables');
        const data = await response.json();
        setVariables(data);
    };

    const loadSets = async () => {
        const response = await fetch(`${API_BASE_URL}/api/fuzzy/sets`);
        if (!response.ok) throw new Error('Failed to load sets');
        const data = await response.json();
        setSets(data);
    };

    const loadRules = async () => {
        const response = await fetch(`${API_BASE_URL}/api/fuzzy/rules`);
        if (!response.ok) throw new Error('Failed to load rules');
        const data = await response.json();
        setRules(data);
    };

    // Get sets for a specific variable
    const getSetsForVariable = (variableId: number) => {
        return sets.filter(set => set.variable_id === variableId);
    };

    // Get variable name by ID
    const getVariableName = (variableId: number) => {
        const variable = variables.find(v => v.variable_id === variableId);
        return variable ? variable.variable_name : 'Unknown';
    };

    // Helper functions for styling (same as original)
    const getGradeBadgeStyle = (categoryName: string) => {
        if (categoryName.includes('high')) return 'bg-success text-white';
        if (categoryName.includes('medium')) return 'bg-warning text-dark';
        if (categoryName.includes('low')) return 'bg-danger text-dark';
        return 'bg-danger text-white';
    };

    const getChanceBadgeStyle = (chance: number) => {
        if (chance >= 0.8) return 'bg-success text-white';
        if (chance >= 0.6) return 'bg-warning text-dark';
        if (chance >= 0.3) return 'bg-orange text-white';
        return 'bg-danger text-white';
    };

    const formatChance = (chance: number) => {
        return `${Math.round(chance * 100)}%`;
    };

    // Modal handlers
    const openAddModal = (type: 'variable' | 'set' | 'rule') => {
        setModalType(type);
        setEditMode(false);

        if (type === 'variable') {
            setCurrentItem({ variable_name: '', description: '' });
        } else if (type === 'set') {
            setCurrentItem({
                variable_id: variables[0]?.variable_id || 0,
                set_name: '',
                param_a: 0,
                param_b: 0,
                param_c: 0
            });
        } else {
            setCurrentItem({
                conditions: variables.map(v => ({
                    variable_id: v.variable_id,
                    set_id: getSetsForVariable(v.variable_id)[0]?.set_id || 0
                })),
                consequent_value: 0.5,
                description: ''
            });
        }

        setShowModal(true);
    };

    const openEditModal = (type: 'variable' | 'set' | 'rule', item: any) => {
        setModalType(type);
        setEditMode(true);
        setCurrentItem({ ...item });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType(null);
        setEditMode(false);
        setCurrentItem(null);
    };

    // CRUD operations
    const handleSave = async () => {
        if (!currentItem) return;

        setSaving(true);
        try {
            if (modalType === 'variable') {
                if (editMode) {
                    await fetch(`${API_BASE_URL}/api/fuzzy/variables/${currentItem.variable_id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentItem)
                    });
                } else {
                    await fetch(`${API_BASE_URL}/api/fuzzy/variables`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentItem)
                    });
                }
                await loadVariables();
            } else if (modalType === 'set') {
                if (editMode) {
                    await fetch(`${API_BASE_URL}/api/fuzzy/sets/${currentItem.set_id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentItem)
                    });
                } else {
                    await fetch(`${API_BASE_URL}/api/fuzzy/sets`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentItem)
                    });
                }
                await loadSets();
            } else if (modalType === 'rule') {
                const ruleData = {
                    consequent_value: currentItem.consequent_value,
                    description: currentItem.description,
                    conditions: currentItem.conditions
                };

                if (editMode) {
                    await fetch(`${API_BASE_URL}/api/fuzzy/rules/${currentItem.rule_id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(ruleData)
                    });
                } else {
                    await fetch(`${API_BASE_URL}/api/fuzzy/rules`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(ruleData)
                    });
                }
                await loadRules();
            }

            closeModal();
        } catch (err) {
            setError('Failed to save changes');
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (type: 'variable' | 'set' | 'rule', id: number, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            let endpoint = '';
            if (type === 'variable') endpoint = `/api/fuzzy/variables/${id}`;
            else if (type === 'set') endpoint = `/api/fuzzy/sets/${id}`;
            else if (type === 'rule') endpoint = `/api/fuzzy/rules/${id}`;

            const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete');
            }

            // Reload appropriate data
            if (type === 'variable') await loadVariables();
            else if (type === 'set') await loadSets();
            else if (type === 'rule') await loadRules();

        } catch (err) {
            setError(`Failed to delete: ${err}`);
            console.error('Delete error:', err);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .bg-gradient-primary { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
                .bg-gradient-success { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
                .bg-gradient-info { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); }
                .bg-gradient-warning { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
                .bg-orange { background-color: #ea5a47; }
                .min-vh-100 { min-height: 100vh; }
                .bg-gradient-light { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
                .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
                .card-hover:hover { transform: translateY(-2px); box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15); }
            `}</style>

            <div className="min-vh-100 bg-gradient-light">
                {/* Header */}
                <div className="bg-white shadow-sm border-bottom">
                    <div className="container-fluid px-4">
                        <div className="d-flex justify-content-between align-items-center py-4">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-gradient-primary rounded-3">
                                    <GraduationCap className="text-white" size={32} />
                                </div>
                                <div>
                                    <h1 className="h2 mb-1 fw-bold text-dark">Fuzzy Logic Configuration</h1>
                                    <p className="text-muted mb-0">Manage variables, sets, and rules for scholarship eligibility</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <button
                                    onClick={loadAllData}
                                    className="btn btn-outline-primary d-flex align-items-center"
                                    disabled={loading}
                                >
                                    <RefreshCw size={16} className={`me-1 ${loading ? 'spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="container-fluid px-4 pt-4">
                        <div className="alert alert-danger d-flex align-items-center" role="alert">
                            <AlertTriangle size={20} className="me-2" />
                            {error}
                            <button
                                type="button"
                                className="btn-close ms-auto"
                                onClick={() => setError(null)}
                            ></button>
                        </div>
                    </div>
                )}

                <div className="container-fluid px-4 py-4">
                    {/* Summary Stats */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm card-hover h-100">
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1 small fw-medium">Variables</p>
                                        <h3 className="fw-bold mb-0 text-success">{variables.length}</h3>
                                    </div>
                                    <div className="p-3 bg-success bg-opacity-10 rounded-3">
                                        <BookOpen className="text-success" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm card-hover h-100">
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1 small fw-medium">Fuzzy Sets</p>
                                        <h3 className="fw-bold mb-0 text-primary">{sets.length}</h3>
                                    </div>
                                    <div className="p-3 bg-primary bg-opacity-10 rounded-3">
                                        <DollarSign className="text-primary" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm card-hover h-100">
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1 small fw-medium">Rules</p>
                                        <h3 className="fw-bold mb-0 text-warning">{rules.length}</h3>
                                    </div>
                                    <div className="p-3 bg-warning bg-opacity-10 rounded-3">
                                        <Calculator className="text-warning" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Cards */}
                    <div className="row g-4 mb-4">
                        {/* Variables */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm border-0 card-hover h-100">
                                <div className="card-header bg-gradient-success text-white border-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <BookOpen size={24} className="me-3" />
                                            <div>
                                                <h5 className="mb-1 fw-bold">Fuzzy Variables</h5>
                                                <small className="opacity-75">Input variables for evaluation</small>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openAddModal('variable')}
                                            className="btn btn-light btn-sm d-flex align-items-center"
                                        >
                                            <Plus size={16} className="me-1" />
                                            Add Variable
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    <div className="d-grid gap-3">
                                        {variables.map((variable) => (
                                            <div key={variable.variable_id} className="p-3 bg-light rounded-3 border">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-bold text-primary">{variable.variable_name}</div>
                                                        <div className="text-muted small">{variable.description}</div>
                                                        <div className="mt-1">
                                                            <small className="text-success">
                                                                {getSetsForVariable(variable.variable_id).length} sets
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="btn-group">
                                                        <button
                                                            onClick={() => openEditModal('variable', variable)}
                                                            className="btn btn-outline-primary btn-sm"
                                                            title="Edit variable"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('variable', variable.variable_id, variable.variable_name)}
                                                            className="btn btn-outline-danger btn-sm"
                                                            title="Delete variable"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sets */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm border-0 card-hover h-100">
                                <div className="card-header bg-gradient-info text-white border-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <DollarSign size={24} className="me-3" />
                                            <div>
                                                <h5 className="mb-1 fw-bold">Fuzzy Sets</h5>
                                                <small className="opacity-75">Value ranges for variables</small>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openAddModal('set')}
                                            className="btn btn-light btn-sm d-flex align-items-center"
                                        >
                                            <Plus size={16} className="me-1" />
                                            Add Set
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    <div className="d-grid gap-3">
                                        {sets.map((set) => (
                                            <div key={set.set_id} className="p-3 bg-light rounded-3 border">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <span className={`badge ${getGradeBadgeStyle(set.set_name)} me-3 px-3 py-2`}>
                                                            {set.set_name}
                                                        </span>
                                                        <div className="text-muted small">
                                                            <strong>Variable:</strong> {getVariableName(set.variable_id)} <br />
                                                            <strong>Range:</strong> [{set.param_a}, {set.param_b}, {set.param_c}]
                                                        </div>
                                                    </div>
                                                    <div className="btn-group">
                                                        <button
                                                            onClick={() => openEditModal('set', set)}
                                                            className="btn btn-outline-primary btn-sm"
                                                            title="Edit set"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('set', set.set_id, set.set_name)}
                                                            className="btn btn-outline-danger btn-sm"
                                                            title="Delete set"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="card shadow-sm border-0 card-hover">
                        <div className="card-header bg-gradient-warning text-white border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <Calculator size={24} className="me-3" />
                                    <div>
                                        <h5 className="mb-1 fw-bold">Fuzzy Rules</h5>
                                        <small className="opacity-75">Decision rules for evaluation</small>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openAddModal('rule')}
                                    className="btn btn-light btn-sm d-flex align-items-center"
                                >
                                    <Plus size={16} className="me-1" />
                                    Add Rule
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-grid gap-3">
                                {rules.map((rule, index) => (
                                    <div key={rule.rule_id} className="p-3 bg-light rounded-3 border">
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                            <div className="d-flex align-items-center flex-wrap gap-2">
                                                <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
                                                    {index + 1}
                                                </span>
                                                <span className="text-muted small fw-medium">IF</span>
                                                {Object.entries(rule.if).map(([variable, setValue], idx) => (
                                                    <React.Fragment key={variable}>
                                                        {idx > 0 && <span className="text-muted small fw-medium">AND</span>}
                                                        <span className="badge bg-secondary px-3 py-2">
                                                            {variable} = {setValue}
                                                        </span>
                                                    </React.Fragment>
                                                ))}
                                                <span className="text-muted small fw-medium">THEN</span>
                                                <span className={`badge ${getChanceBadgeStyle(rule.then)} px-3 py-2`}>
                                                    {formatChance(rule.then)}
                                                </span>
                                            </div>
                                            <div className="btn-group">

                                                <button
                                                    onClick={() => handleDelete('rule', rule.rule_id, `Rule ${index + 1}`)}
                                                    className="btn btn-outline-danger btn-sm"
                                                    title="Delete rule"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        {rule.description && (
                                            <div className="mt-2 text-muted small">
                                                <strong>Description:</strong> {rule.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Dialog */}
                {showModal && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header bg-gradient-primary text-white border-0">
                                    <h5 className="modal-title fw-bold">
                                        {editMode ? 'Edit' : 'Add New'} {' '}
                                        {modalType === 'variable' && 'Variable'}
                                        {modalType === 'set' && 'Fuzzy Set'}
                                        {modalType === 'rule' && 'Rule'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={closeModal}
                                    ></button>
                                </div>
                                <div className="modal-body p-4">
                                    {/* Variable Form */}
                                    {modalType === 'variable' && currentItem && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Variable Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={currentItem.variable_name}
                                                    onChange={(e) => setCurrentItem({...currentItem, variable_name: e.target.value})}
                                                    placeholder="e.g., gwa, family_income"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    value={currentItem.description}
                                                    onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                                                    placeholder="Describe this variable..."
                                                    rows={3}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Set Form */}
                                    {modalType === 'set' && currentItem && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Variable</label>
                                                <select
                                                    className="form-select"
                                                    value={currentItem.variable_id}
                                                    onChange={(e) => setCurrentItem({...currentItem, variable_id: parseInt(e.target.value)})}
                                                >
                                                    {variables.map(variable => (
                                                        <option key={variable.variable_id} value={variable.variable_id}>
                                                            {variable.variable_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Set Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={currentItem.set_name}
                                                    onChange={(e) => setCurrentItem({...currentItem, set_name: e.target.value})}
                                                    placeholder="e.g., Low, Medium, High"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Triangular Parameters</label>
                                                <div className="row g-2">
                                                    <div className="col">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="form-control"
                                                            placeholder="A (left)"
                                                            value={currentItem.param_a}
                                                            onChange={(e) => setCurrentItem({...currentItem, param_a: parseFloat(e.target.value) || 0})}
                                                        />
                                                    </div>
                                                    <div className="col">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="form-control"
                                                            placeholder="B (peak)"
                                                            value={currentItem.param_b}
                                                            onChange={(e) => setCurrentItem({...currentItem, param_b: parseFloat(e.target.value) || 0})}
                                                        />
                                                    </div>
                                                    <div className="col">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="form-control"
                                                            placeholder="C (right)"
                                                            value={currentItem.param_c}
                                                            onChange={(e) => setCurrentItem({...currentItem, param_c: parseFloat(e.target.value) || 0})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Rule Form */}
                                    {modalType === 'rule' && currentItem && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Conditions</label>
                                                {variables.map((variable) => (
                                                    <div key={variable.variable_id} className="mb-2">
                                                        <label className="form-label small">{variable.variable_name}</label>
                                                        <select
                                                            className="form-select"
                                                            value={currentItem.conditions.find((c: { variable_id: number; }) => c.variable_id === variable.variable_id)?.set_id || ''}
                                                            onChange={(e) => {
                                                                const newConditions = [...currentItem.conditions];
                                                                const existingIndex = newConditions.findIndex(c => c.variable_id === variable.variable_id);
                                                                if (existingIndex >= 0) {
                                                                    newConditions[existingIndex].set_id = parseInt(e.target.value);
                                                                } else {
                                                                    newConditions.push({
                                                                        variable_id: variable.variable_id,
                                                                        set_id: parseInt(e.target.value)
                                                                    });
                                                                }
                                                                setCurrentItem({...currentItem, conditions: newConditions});
                                                            }}
                                                        >
                                                            <option value="">Select set...</option>
                                                            {getSetsForVariable(variable.variable_id).map(set => (
                                                                <option key={set.set_id} value={set.set_id}>
                                                                    {set.set_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Consequent Value</label>
                                                <div className="row g-2 align-items-center">
                                                    <div className="col">
                                                        <input
                                                            type="range"
                                                            className="form-range"
                                                            min="0"
                                                            max="1"
                                                            step="0.05"
                                                            value={currentItem.consequent_value}
                                                            onChange={(e) => setCurrentItem({...currentItem, consequent_value: parseFloat(e.target.value)})}
                                                        />
                                                    </div>
                                                    <div className="col-auto">
                                                        <span className={`badge ${getChanceBadgeStyle(currentItem.consequent_value)} px-3 py-2`}>
                                                            {formatChance(currentItem.consequent_value)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    value={currentItem.description}
                                                    onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                                                    placeholder="Describe this rule..."
                                                    rows={3}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="modal-footer bg-light border-0">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary d-flex align-items-center"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving && <div className="spinner-border spinner-border-sm me-2" role="status"></div>}
                                        <Save size={16} className="me-1" />
                                        {editMode ? 'Update' : 'Create'}
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

export default FuzzyLogic;