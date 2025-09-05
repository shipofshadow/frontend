import  { useState, useMemo, useEffect } from 'react';
import { Plus, Edit3, Trash2, GraduationCap, DollarSign, Award, BookOpen, Calculator } from 'lucide-react';
import {API_BASE_URL} from "../../config.ts";

interface GradeRange {
    [categoryName: string]: [number, number, number]; // [min, peak, max]
}

interface IncomeRange {
    [categoryName: string]: [number, number, number]; // [min, peak, max]
}

interface EligibilityRule {
    gradeCategory: string;
    incomeCategory: string;
    scholarshipChance: number; // 0-1 scale
}


const FuzzyLogic = () => {
    // Default grade categories (GPA scale)
    const [gradeCategories, setGradeCategories] = useState<GradeRange>({
        'Excellent (A)': [3.5, 4.0, 4.0],
        'Good (B)': [2.5, 3.0, 3.5],
        'Fair (C)': [1.5, 2.0, 2.5]
    });

    // Default income categories (monthly family income)
    const [incomeCategories, setIncomeCategories] = useState<IncomeRange>({
        'Low Income': [0, 15000, 30000],
        'Middle Income': [25000, 50000, 75000],
        'High Income': [70000, 100000, 150000]
    });

    // Scholarship eligibility rules
    const [eligibilityRules, setEligibilityRules] = useState<EligibilityRule[]>([
        { gradeCategory: 'Excellent (A)', incomeCategory: 'Low Income', scholarshipChance: 0.95 },
        { gradeCategory: 'Excellent (A)', incomeCategory: 'Middle Income', scholarshipChance: 0.80 },
        { gradeCategory: 'Excellent (A)', incomeCategory: 'High Income', scholarshipChance: 0.40 },
        { gradeCategory: 'Good (B)', incomeCategory: 'Low Income', scholarshipChance: 0.75 },
        { gradeCategory: 'Good (B)', incomeCategory: 'Middle Income', scholarshipChance: 0.55 },
        { gradeCategory: 'Good (B)', incomeCategory: 'High Income', scholarshipChance: 0.25 },
        { gradeCategory: 'Fair (C)', incomeCategory: 'Low Income', scholarshipChance: 0.45 },
        { gradeCategory: 'Fair (C)', incomeCategory: 'Middle Income', scholarshipChance: 0.20 },
        { gradeCategory: 'Fair (C)', incomeCategory: 'High Income', scholarshipChance: 0.05 },
    ]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'grade' | 'income' | 'rule' | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);

    // Get category names for dropdowns
    const gradeNames = useMemo(() => Object.keys(gradeCategories), [gradeCategories]);
    const incomeNames = useMemo(() => Object.keys(incomeCategories), [incomeCategories]);

    const fetchFuzzyConfig = async () => {

        try {
            const response = await fetch(`${API_BASE_URL}/api/fuzzy/fuzzy-config`)
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();


            console.log(data);

        } catch (err) {
            console.error('Error fetching config:', err);
        }

    };

    useEffect(() => {
        fetchFuzzyConfig().catch((err) =>
            console.error("Promise rejection in fetchFuzzyConfig:", err)
        );
    }, [])

    // Helper functions for styling
    const getGradeBadgeStyle = (categoryName: string) => {
        if (categoryName.includes('Excellent')) return 'bg-success text-white';
        if (categoryName.includes('Good')) return 'bg-warning text-dark';
        return 'bg-danger text-white';
    };

    const getIncomeBadgeStyle = (categoryName: string) => {
        if (categoryName.includes('High')) return 'bg-primary text-white';
        if (categoryName.includes('Middle')) return 'bg-info text-white';
        return 'bg-secondary text-white';
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
    const openAddModal = (type: 'grade' | 'income' | 'rule') => {
        setModalType(type);
        setEditMode(false);

        if (type === 'grade') {
            setCurrentItem({ name: '', range: [0, 0, 0] });
        } else if (type === 'income') {
            setCurrentItem({ name: '', range: [0, 0, 0] });
        } else {
            setCurrentItem({
                gradeCategory: gradeNames[0] || '',
                incomeCategory: incomeNames[0] || '',
                scholarshipChance: 0.5
            });
        }

        setShowModal(true);
    };

    const openEditModal = (type: 'grade' | 'income' | 'rule', item: any, index?: number) => {
        setModalType(type);
        setEditMode(true);
        setCurrentItem({ ...item, originalName: type === 'rule' ? undefined : Object.keys(type === 'grade' ? gradeCategories : incomeCategories)[index!], index });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType(null);
        setEditMode(false);
        setCurrentItem(null);
    };

    const handleSave = () => {
        if (!currentItem) return;

        if (modalType === 'grade') {
            if (!currentItem.name.trim()) {
                alert('Please enter a category name.');
                return;
            }

            if (!editMode && gradeCategories[currentItem.name]) {
                alert('A category with this name already exists.');
                return;
            }

            if (editMode && currentItem.originalName) {
                // Check if category is used in rules
                const isUsed = eligibilityRules.some(rule => rule.gradeCategory === currentItem.originalName);
                if (isUsed && currentItem.name !== currentItem.originalName) {
                    alert('Cannot rename this category as it is used in eligibility rules. Please update the rules first.');
                    return;
                }

                const newCategories = { ...gradeCategories };
                delete newCategories[currentItem.originalName];
                newCategories[currentItem.name] = currentItem.range;
                setGradeCategories(newCategories);
            } else {
                setGradeCategories(prev => ({
                    ...prev,
                    [currentItem.name]: currentItem.range
                }));
            }
        }
        else if (modalType === 'income') {
            if (!currentItem.name.trim()) {
                alert('Please enter a category name.');
                return;
            }

            if (!editMode && incomeCategories[currentItem.name]) {
                alert('A category with this name already exists.');
                return;
            }

            if (editMode && currentItem.originalName) {
                const isUsed = eligibilityRules.some(rule => rule.incomeCategory === currentItem.originalName);
                if (isUsed && currentItem.name !== currentItem.originalName) {
                    alert('Cannot rename this category as it is used in eligibility rules. Please update the rules first.');
                    return;
                }

                const newCategories = { ...incomeCategories };
                delete newCategories[currentItem.originalName];
                newCategories[currentItem.name] = currentItem.range;
                setIncomeCategories(newCategories);
            } else {
                setIncomeCategories(prev => ({
                    ...prev,
                    [currentItem.name]: currentItem.range
                }));
            }
        }
        else if (modalType === 'rule') {
            if (editMode && currentItem.index !== undefined) {
                setEligibilityRules(prev => {
                    const newRules = [...prev];
                    newRules[currentItem.index] = {
                        gradeCategory: currentItem.gradeCategory,
                        incomeCategory: currentItem.incomeCategory,
                        scholarshipChance: currentItem.scholarshipChance
                    };
                    return newRules;
                });
            } else {
                setEligibilityRules(prev => [...prev, {
                    gradeCategory: currentItem.gradeCategory,
                    incomeCategory: currentItem.incomeCategory,
                    scholarshipChance: currentItem.scholarshipChance
                }]);
            }
        }

        closeModal();
    };

    const handleDelete = (type: 'grade' | 'income' | 'rule', name: string, index: number) => {
        if (type === 'rule') {
            if (window.confirm(`Are you sure you want to delete this eligibility rule?`)) {
                setEligibilityRules(prev => prev.filter((_, i) => i !== index));
            }
            return;
        }

        // Check if category is used in rules
        const isUsed = eligibilityRules.some(rule =>
            type === 'grade' ? rule.gradeCategory === name : rule.incomeCategory === name
        );

        if (isUsed) {
            alert(`Cannot delete "${name}" because it is used in eligibility rules. Please remove or update the rules first.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
            if (type === 'grade') {
                setGradeCategories(prev => {
                    const newCategories = { ...prev };
                    delete newCategories[name];
                    return newCategories;
                });
            } else {
                setIncomeCategories(prev => {
                    const newCategories = { ...prev };
                    delete newCategories[name];
                    return newCategories;
                });
            }
        }
    };

    return (
        <>
            <style>{`
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                }
                .bg-gradient-success {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                }
                .bg-gradient-info {
                    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
                }
                .bg-gradient-warning {
                    background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
                }
                .bg-orange {
                    background-color: #ea5a47;
                }
                .min-vh-100 {
                    min-height: 100vh;
                }
                .bg-gradient-light {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }
                .card-hover {
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .card-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
                }
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
                                    <h1 className="h2 mb-1 fw-bold text-dark">Scholarship Eligibility Tool</h1>
                                    <p className="text-muted mb-0">Configure grade categories, income ranges, and eligibility criteria</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center text-muted">
                                <Award size={16} className="me-2" />
                                <small>Assessment Configuration</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-fluid px-4 py-4">
                    {/* Summary Stats */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm card-hover h-100">
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1 small fw-medium">Grade Categories</p>
                                        <h3 className="fw-bold mb-0 text-success">{gradeNames.length}</h3>
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
                                        <p className="text-muted mb-1 small fw-medium">Income Categories</p>
                                        <h3 className="fw-bold mb-0 text-primary">{incomeNames.length}</h3>
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
                                        <p className="text-muted mb-1 small fw-medium">Eligibility Rules</p>
                                        <h3 className="fw-bold mb-0 text-warning">{eligibilityRules.length}</h3>
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
                        {/* Grade Categories */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm border-0 card-hover h-100">
                                <div className="card-header bg-gradient-success text-white border-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <BookOpen size={24} className="me-3" />
                                            <div>
                                                <h5 className="mb-1 fw-bold">Grade Categories</h5>
                                                <small className="opacity-75">Define academic performance levels</small>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openAddModal('grade')}
                                            className="btn btn-light btn-sm d-flex align-items-center"
                                        >
                                            <Plus size={16} className="me-1" />
                                            Add Category
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    <div className="d-grid gap-3">
                                        {Object.entries(gradeCategories).map(([name, range], index) => (
                                            <div key={name} className="p-3 bg-light rounded-3 border">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                            <span className={`badge ${getGradeBadgeStyle(name)} me-3 px-3 py-2`}>
                              {name}
                            </span>
                                                        <div className="text-muted small">
                                                            <strong>Range:</strong> {range[0]} - {range[2]} <br />
                                                            <strong>Typical:</strong> {range[1]}
                                                        </div>
                                                    </div>
                                                    <div className="btn-group">
                                                        <button
                                                            onClick={() => openEditModal('grade', { name, range }, index)}
                                                            className="btn btn-outline-primary btn-sm"
                                                            title="Edit category"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('grade', name, index)}
                                                            className="btn btn-outline-danger btn-sm"
                                                            title="Delete category"
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

                        {/* Income Categories */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm border-0 card-hover h-100">
                                <div className="card-header bg-gradient-info text-white border-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <DollarSign size={24} className="me-3" />
                                            <div>
                                                <h5 className="mb-1 fw-bold">Income Categories</h5>
                                                <small className="opacity-75">Define family income ranges (₱)</small>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openAddModal('income')}
                                            className="btn btn-light btn-sm d-flex align-items-center"
                                        >
                                            <Plus size={16} className="me-1" />
                                            Add Category
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    <div className="d-grid gap-3">
                                        {Object.entries(incomeCategories).map(([name, range], index) => (
                                            <div key={name} className="p-3 bg-light rounded-3 border">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                            <span className={`badge ${getIncomeBadgeStyle(name)} me-3 px-3 py-2`}>
                              {name}
                            </span>
                                                        <div className="text-muted small">
                                                            <strong>Range:</strong> ₱{range[0].toLocaleString()} - ₱{range[2].toLocaleString()} <br />
                                                            <strong>Typical:</strong> ₱{range[1].toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div className="btn-group">
                                                        <button
                                                            onClick={() => openEditModal('income', { name, range }, index)}
                                                            className="btn btn-outline-primary btn-sm"
                                                            title="Edit category"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('income', name, index)}
                                                            className="btn btn-outline-danger btn-sm"
                                                            title="Delete category"
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

                    {/* Eligibility Rules */}
                    <div className="card shadow-sm border-0 card-hover">
                        <div className="card-header bg-gradient-warning text-white border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <Calculator size={24} className="me-3" />
                                    <div>
                                        <h5 className="mb-1 fw-bold">Scholarship Eligibility Rules</h5>
                                        <small className="opacity-75">Define how grades and income affect scholarship chances</small>
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
                                {eligibilityRules.map((rule, index) => (
                                    <div key={index} className="p-3 bg-light rounded-3 border">
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                            <div className="d-flex align-items-center flex-wrap gap-2">
                        <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
                          {index + 1}
                        </span>
                                                <span className="text-muted small fw-medium">IF student has</span>
                                                <span className={`badge ${getGradeBadgeStyle(rule.gradeCategory)} px-3 py-2`}>
                          {rule.gradeCategory}
                        </span>
                                                <span className="text-muted small fw-medium">grades AND family income is</span>
                                                <span className={`badge ${getIncomeBadgeStyle(rule.incomeCategory)} px-3 py-2`}>
                          {rule.incomeCategory}
                        </span>
                                                <span className="text-muted small fw-medium">THEN scholarship chance is</span>
                                                <span className={`badge ${getChanceBadgeStyle(rule.scholarshipChance)} px-3 py-2`}>
                          {formatChance(rule.scholarshipChance)}
                        </span>
                                            </div>
                                            <div className="btn-group">
                                                <button
                                                    onClick={() => openEditModal('rule', rule, index)}
                                                    className="btn btn-outline-primary btn-sm"
                                                    title="Edit rule"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('rule', '', index)}
                                                    className="btn btn-outline-danger btn-sm"
                                                    title="Delete rule"
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

                {/* Modal Dialog */}
                {showModal && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header bg-gradient-primary text-white border-0">
                                    <h5 className="modal-title fw-bold">
                                        {editMode ? 'Edit' : 'Add New'} {' '}
                                        {modalType === 'grade' && 'Grade Category'}
                                        {modalType === 'income' && 'Income Category'}
                                        {modalType === 'rule' && 'Eligibility Rule'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={closeModal}
                                    ></button>
                                </div>
                                <div className="modal-body p-4">
                                    {/* Grade Category Form */}
                                    {modalType === 'grade' && currentItem && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Category Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={currentItem.name}
                                                    onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                                                    placeholder="e.g., Excellent (A), Good (B), etc."
                                                />
                                                <div className="form-text">Choose a descriptive name for this grade category</div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Grade Range</label>
                                                <div className="row g-2">
                                                    <div className="col">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="form-control"
                                                            placeholder="Minimum"
                                                            value={currentItem.range[0]}
                                                            onChange={(e) => setCurrentItem({...currentItem, range: [parseFloat(e.target.value) || 0, currentItem.range[1], currentItem.range[2]]})}
                                                        />
                                                        <small className="text-muted">Lowest GPA</small>
                                                    </div>
                                                    <div className="col">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="form-control"
                                                            placeholder="Typical"
                                                            value={currentItem.range[1]}
                                                            onChange={(e) => setCurrentItem({...currentItem, range: [currentItem.range[0], parseFloat(e.target.value) || 0, currentItem.range[2]]})}
                                                        />
                                                        <small className="text-muted">Typical GPA</small>
                                                    </div>
                                                    <div className="col">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="form-control"
                                                            placeholder="Maximum"
                                                            value={currentItem.range[2]}
                                                            onChange={(e) => setCurrentItem({...currentItem, range: [currentItem.range[0], currentItem.range[1], parseFloat(e.target.value) || 0]})}
                                                        />
                                                        <small className="text-muted">Highest GPA</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Income Category Form */}
                                    {modalType === 'income' && currentItem && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Category Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={currentItem.name}
                                                    onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                                                    placeholder="e.g., Low Income, Middle Income, etc."
                                                />
                                                <div className="form-text">Choose a descriptive name for this income category</div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Monthly Income Range (₱)</label>
                                                <div className="row g-2">
                                                    <div className="col">
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            placeholder="Minimum"
                                                            value={currentItem.range[0]}
                                                            onChange={(e) => setCurrentItem({...currentItem, range: [parseFloat(e.target.value) || 0, currentItem.range[1], currentItem.range[2]]})}
                                                        />
                                                        <small className="text-muted">Lowest income</small>
                                                    </div>
                                                    <div className="col">
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            placeholder="Typical"
                                                            value={currentItem.range[1]}
                                                            onChange={(e) => setCurrentItem({...currentItem, range: [currentItem.range[0], parseFloat(e.target.value) || 0, currentItem.range[2]]})}
                                                        />
                                                        <small className="text-muted">Typical income</small>
                                                    </div>
                                                    <div className="col">
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            placeholder="Maximum"
                                                            value={currentItem.range[2]}
                                                            onChange={(e) => setCurrentItem({...currentItem, range: [currentItem.range[0], currentItem.range[1], parseFloat(e.target.value) || 0]})}
                                                        />
                                                        <small className="text-muted">Highest income</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Rule Form */}
                                    {modalType === 'rule' && currentItem && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Student's Grade Category</label>
                                                <select
                                                    className="form-select"
                                                    value={currentItem.gradeCategory}
                                                    onChange={(e) => setCurrentItem({...currentItem, gradeCategory: e.target.value})}
                                                >
                                                    {gradeNames.map(name => (
                                                        <option key={name} value={name}>{name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Family Income Category</label>
                                                <select
                                                    className="form-select"
                                                    value={currentItem.incomeCategory}
                                                    onChange={(e) => setCurrentItem({...currentItem, incomeCategory: e.target.value})}
                                                >
                                                    {incomeNames.map(name => (
                                                        <option key={name} value={name}>{name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-medium">Scholarship Eligibility Chance</label>
                                                <div className="row g-2 align-items-center">
                                                    <div className="col">
                                                        <input
                                                            type="range"
                                                            className="form-range"
                                                            min="0"
                                                            max="1"
                                                            step="0.05"
                                                            value={currentItem.scholarshipChance}
                                                            onChange={(e) => setCurrentItem({...currentItem, scholarshipChance: parseFloat(e.target.value)})}
                                                        />
                                                    </div>
                                                    <div className="col-auto">
                            <span className={`badge ${getChanceBadgeStyle(currentItem.scholarshipChance)} px-3 py-2`}>
                              {formatChance(currentItem.scholarshipChance)}
                            </span>
                                                    </div>
                                                </div>
                                                <div className="form-text">
                                                    Set the probability that a student with these characteristics will be eligible for a scholarship
                                                </div>
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
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                    >
                                        {editMode ? 'Save Changes' : 'Add'}
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