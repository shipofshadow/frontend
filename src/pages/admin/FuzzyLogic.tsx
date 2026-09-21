import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Edit3,
    Trash2,
    BookOpen,
    RefreshCw,
    AlertTriangle,
    Search,
    Sliders,
    Layers,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Grid,
    Info,
    Award
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './FuzzyLogic.css';

// ── Interfaces ──────────────────────────────────────────────────────────────
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

// Color palette for linguistic sets
const SET_COLORS = [
    { name: 'emerald', hex: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981' },
    { name: 'amber', hex: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b' },
    { name: 'indigo', hex: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', border: '#6366f1' },
    { name: 'cyan', hex: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4' },
    { name: 'rose', hex: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)', border: '#f43f5e' },
    { name: 'purple', hex: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', border: '#a855f7' }
];

const getSetColor = (index: number) => SET_COLORS[index % SET_COLORS.length];

// Format numbers nicely (e.g. currency or decimal)
const formatScalar = (val: number, isCurrency: boolean = false) => {
    if (isCurrency) {
        if (val >= 1000000) return `₱${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `₱${(val / 1000).toFixed(0)}k`;
        return `₱${val.toLocaleString()}`;
    }
    return val >= 100 ? val.toLocaleString() : val.toFixed(2);
};

// ── Multi-Membership Function Visualizer Canvas ──────────────────────────────
interface MultiCurveProps {
    variable?: FuzzyVariable;
    sets: FuzzySet[];
    currentVal?: number;
    height?: number;
    isCurrency?: boolean;
}

const MultiVariableCurveCanvas: React.FC<MultiCurveProps> = ({
    sets,
    currentVal,
    height = 140,
    isCurrency = false
}) => {
    const width = 460;
    const paddingLeft = 32;
    const paddingRight = 32;
    const paddingTop = 20;
    const paddingBottom = 30;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    // Calculate domain [minX, maxX]
    const allParams = sets.flatMap((s) => [s.param_a, s.param_b, s.param_c]);
    let minX = allParams.length > 0 ? Math.min(...allParams) : 0;
    let maxX = allParams.length > 0 ? Math.max(...allParams) : 100;
    if (minX === maxX) maxX += 1;
    const range = maxX - minX;

    const getX = (val: number) => paddingLeft + ((val - minX) / range) * graphWidth;
    const getY = (degree: number) => paddingTop + graphHeight * (1 - degree);

    // Calculate degree of membership for a set given a crisp value
    const calcDegree = (set: FuzzySet, x: number | undefined) => {
        if (x === undefined) return 0;
        const { param_a: a, param_b: b, param_c: c } = set;
        if (x >= a && x <= b && b > a) return (x - a) / (b - a);
        if (x >= b && x <= c && c > b) return (c - x) / (c - b);
        if (x === b) return 1;
        return 0;
    };

    return (
        <div className="fz-chart-container">
            <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
                style={{ userSelect: 'none' }}
            >
                <defs>
                    {sets.map((set, idx) => {
                        const color = getSetColor(idx);
                        return (
                            <linearGradient
                                key={`grad-${set.set_id}`}
                                id={`grad-${set.set_id}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop offset="0%" stopColor={color.hex} stopOpacity="0.32" />
                                <stop offset="100%" stopColor={color.hex} stopOpacity="0.03" />
                            </linearGradient>
                        );
                    })}
                </defs>

                {/* Grid horizontal lines for degree 0.5 and 1.0 */}
                <line
                    x1={paddingLeft}
                    y1={getY(1.0)}
                    x2={width - paddingRight}
                    y2={getY(1.0)}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                />
                <text x={paddingLeft - 6} y={getY(1.0) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
                    1.0
                </text>

                <line
                    x1={paddingLeft}
                    y1={getY(0.5)}
                    x2={width - paddingRight}
                    y2={getY(0.5)}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                />
                <text x={paddingLeft - 6} y={getY(0.5) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
                    0.5
                </text>

                {/* Baseline (degree = 0) */}
                <line
                    x1={paddingLeft}
                    y1={getY(0)}
                    x2={width - paddingRight}
                    y2={getY(0)}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                />
                <text x={paddingLeft - 6} y={getY(0) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
                    0.0
                </text>

                {/* Render Curves */}
                {sets.map((set, idx) => {
                    const color = getSetColor(idx);
                    const xA = getX(set.param_a);
                    const xB = getX(set.param_b);
                    const xC = getX(set.param_c);
                    const y0 = getY(0);
                    const y1 = getY(1);

                    const points = `${xA},${y0} ${xB},${y1} ${xC},${y0}`;

                    return (
                        <g key={set.set_id}>
                            {/* Area Fill */}
                            <polygon points={points} fill={`url(#grad-${set.set_id})`} />
                            {/* Curve Stroke */}
                            <polyline
                                points={points}
                                fill="none"
                                stroke={color.hex}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Peak Point & Label */}
                            <circle cx={xB} cy={y1} r="4" fill={color.hex} stroke="#ffffff" strokeWidth="1.5" />
                            <text
                                x={xB}
                                y={y1 - 6}
                                fontSize="10"
                                fill={color.hex}
                                fontWeight="700"
                                textAnchor="middle"
                            >
                                {set.set_name}
                            </text>
                        </g>
                    );
                })}

                {/* Current Value Needle / Indicator */}
                {currentVal !== undefined && currentVal >= minX && currentVal <= maxX && (
                    <g>
                        <line
                            x1={getX(currentVal)}
                            y1={paddingTop - 5}
                            x2={getX(currentVal)}
                            y2={getY(0)}
                            stroke="#dc2626"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                        />
                        {/* Intersection Dots for each set */}
                        {sets.map((set, idx) => {
                            const deg = calcDegree(set, currentVal);
                            if (deg <= 0) return null;
                            const color = getSetColor(idx);
                            return (
                                <g key={`dot-${set.set_id}`}>
                                    <circle
                                        cx={getX(currentVal)}
                                        cy={getY(deg)}
                                        r="5"
                                        fill="#ffffff"
                                        stroke={color.hex}
                                        strokeWidth="2.5"
                                    />
                                </g>
                            );
                        })}

                        {/* Top Needle Tag */}
                        <rect
                            x={getX(currentVal) - 24}
                            y={paddingTop - 18}
                            width="48"
                            height="15"
                            rx="4"
                            fill="#dc2626"
                        />
                        <text
                            x={getX(currentVal)}
                            y={paddingTop - 7}
                            fontSize="9"
                            fill="#ffffff"
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            {formatScalar(currentVal, isCurrency)}
                        </text>
                    </g>
                )}

                {/* X-Axis Bound Markers */}
                <text x={paddingLeft} y={height - 6} fontSize="9" fill="#64748b" textAnchor="middle">
                    {formatScalar(minX, isCurrency)}
                </text>
                <text x={width - paddingRight} y={height - 6} fontSize="9" fill="#64748b" textAnchor="middle">
                    {formatScalar(maxX, isCurrency)}
                </text>
            </svg>

            {/* Set Legend with Parameter Pills */}
            <div className="fz-chart-legend">
                {sets.map((set, idx) => {
                    const color = getSetColor(idx);
                    const deg = currentVal !== undefined ? calcDegree(set, currentVal) : 0;
                    return (
                        <div key={set.set_id} className="fz-legend-item">
                            <span className="fz-legend-color" style={{ backgroundColor: color.hex }} />
                            <span style={{ color: color.hex }}>{set.set_name}</span>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                [{set.param_a}, {set.param_b}, {set.param_c}]
                            </span>
                            {currentVal !== undefined && deg > 0 && (
                                <span className="badge rounded-pill" style={{ backgroundColor: color.bg, color: color.hex }}>
                                    μ = {(deg * 100).toFixed(0)}%
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────────────
export const FuzzyLogic: React.FC = () => {
    // State
    const [variables, setVariables] = useState<FuzzyVariable[]>([]);
    const [sets, setSets] = useState<FuzzySet[]>([]);
    const [rules, setRules] = useState<FuzzyRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Navigation Tab
    const [activeTab, setActiveTab] = useState<'simulator' | 'matrix' | 'variables'>('simulator');

    // Rule Filters
    const [ruleSearch, setRuleSearch] = useState('');
    const [ruleFilterTier, setRuleFilterTier] = useState<string>('all');

    // Simulator Inputs
    const [simInputs, setSimInputs] = useState<Record<string, number>>({});

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'variable' | 'set' | 'rule' | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);

    // Initial Load
    useEffect(() => {
        loadAllData().catch((err) => console.error('Error loading fuzzy logic data:', err));
    }, []);

    // Set Default Simulator Inputs
    useEffect(() => {
        if (variables.length > 0 && sets.length > 0) {
            const defaults: Record<string, number> = {};
            variables.forEach((v) => {
                const varSets = sets.filter((s) => s.variable_id === v.variable_id);
                if (varSets.length > 0) {
                    const mid = varSets[Math.floor(varSets.length / 2)];
                    defaults[v.variable_name] = mid.param_b;
                } else {
                    defaults[v.variable_name] = 1.0;
                }
            });
            setSimInputs((prev) => (Object.keys(prev).length === 0 ? defaults : prev));
        }
    }, [variables, sets]);

    const loadAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([loadVariables(), loadSets(), loadRules()]);
        } catch (err) {
            setError('Failed to load fuzzy logic configuration');
            console.error(err);
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

    const getSetsForVariable = (variableId: number) => {
        return sets.filter((set) => set.variable_id === variableId);
    };

    const getVariableName = (variableId: number) => {
        const variable = variables.find((v) => v.variable_id === variableId);
        return variable ? variable.variable_name : 'Unknown';
    };

    // Calculate Real-time Membership & Mamdani Inference
    const simResults = useMemo(() => {
        if (variables.length === 0 || sets.length === 0 || rules.length === 0) {
            return { firedRules: [], defuzzifiedScore: 0, setMemberships: {} };
        }

        const setMemberships: Record<string, number> = {};
        sets.forEach((set) => {
            const varName = getVariableName(set.variable_id);
            const val = simInputs[varName];
            let degree = 0;
            if (val !== undefined) {
                const { param_a: a, param_b: b, param_c: c } = set;
                if (val >= a && val <= b && b > a) degree = (val - a) / (b - a);
                else if (val >= b && val <= c && c > b) degree = (c - val) / (c - b);
                else if (val === b) degree = 1;
            }
            setMemberships[`${varName}:${set.set_name.toLowerCase()}`] = Math.max(0, Math.min(1, degree));
        });

        const firedRules: Array<{ rule: FuzzyRule; strength: number }> = [];
        let numerator = 0;
        let denominator = 0;

        rules.forEach((rule) => {
            let strength = 1;
            Object.entries(rule.if).forEach(([varName, setName]) => {
                const mem = setMemberships[`${varName}:${setName.toLowerCase()}`] || 0;
                strength = Math.min(strength, mem);
            });

            if (strength > 0) {
                firedRules.push({ rule, strength });
                numerator += strength * rule.then;
                denominator += strength;
            }
        });

        const defuzzifiedScore = denominator > 0 ? (numerator / denominator) * 100 : 0;
        return { firedRules, defuzzifiedScore, setMemberships };
    }, [variables, sets, rules, simInputs]);

    // Scenario Presets
    const applyPreset = (preset: { [key: string]: number }) => {
        setSimInputs((prev) => ({ ...prev, ...preset }));
    };

    // CRUD Operations
    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);
        try {
            if (modalType === 'variable') {
                const url = editMode
                    ? `${API_BASE_URL}/api/fuzzy/variables/${currentItem.variable_id}`
                    : `${API_BASE_URL}/api/fuzzy/variables`;
                await fetch(url, {
                    method: editMode ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentItem)
                });
                await loadVariables();
            } else if (modalType === 'set') {
                const url = editMode
                    ? `${API_BASE_URL}/api/fuzzy/sets/${currentItem.set_id}`
                    : `${API_BASE_URL}/api/fuzzy/sets`;
                await fetch(url, {
                    method: editMode ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentItem)
                });
                await loadSets();
            } else if (modalType === 'rule') {
                const conditionMap: Record<string, string> = {};
                for (const c of currentItem.conditions || []) {
                    const varName = getVariableName(c.variable_id);
                    const setName = sets.find((s) => s.set_id === c.set_id)?.set_name;
                    if (varName && setName) conditionMap[varName] = setName;
                }

                const duplicate = rules.find((r) => {
                    if (editMode && r.rule_id === currentItem.rule_id) return false;
                    const rKeys = Object.keys(r.if);
                    const cKeys = Object.keys(conditionMap);
                    if (rKeys.length !== cKeys.length) return false;
                    return rKeys.every((k) => r.if[k] === conditionMap[k]);
                });

                if (duplicate) {
                    alert(`A rule with these exact conditions already exists (Rule #${duplicate.rule_id}).`);
                    setSaving(false);
                    return;
                }

                const ruleData = {
                    consequent_value: currentItem.consequent_value,
                    description: currentItem.description,
                    conditions: currentItem.conditions
                };

                const url = editMode
                    ? `${API_BASE_URL}/api/fuzzy/rules/${currentItem.rule_id}`
                    : `${API_BASE_URL}/api/fuzzy/rules`;
                await fetch(url, {
                    method: editMode ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ruleData)
                });
                await loadRules();
            }
            closeModal();
        } catch (err) {
            setError('Failed to save changes');
            console.error(err);
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
                const err = await response.json();
                throw new Error(err.error || 'Failed to delete');
            }

            if (type === 'variable') await loadVariables();
            else if (type === 'set') await loadSets();
            else if (type === 'rule') await loadRules();
        } catch (err) {
            setError(`Failed to delete: ${err}`);
        }
    };

    const openAddModal = (type: 'variable' | 'set' | 'rule', initialData?: any) => {
        setModalType(type);
        setEditMode(false);
        if (type === 'variable') {
            setCurrentItem({ variable_name: '', description: '' });
        } else if (type === 'set') {
            setCurrentItem({
                variable_id: initialData?.variable_id || variables[0]?.variable_id || 0,
                set_name: '',
                param_a: 0,
                param_b: 0,
                param_c: 0
            });
        } else {
            setCurrentItem({
                conditions: variables.map((v) => ({
                    variable_id: v.variable_id,
                    set_id: getSetsForVariable(v.variable_id)[0]?.set_id || 0
                })),
                consequent_value: 0.8,
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

    // Filtered Rules
    const filteredRules = useMemo(() => {
        return rules.filter((r) => {
            const matchesSearch =
                !ruleSearch ||
                (r.description && r.description.toLowerCase().includes(ruleSearch.toLowerCase())) ||
                Object.entries(r.if).some(
                    ([k, v]) =>
                        k.toLowerCase().includes(ruleSearch.toLowerCase()) ||
                        v.toLowerCase().includes(ruleSearch.toLowerCase())
                );
            let matchesTier = true;
            if (ruleFilterTier === 'high') matchesTier = r.then >= 0.8;
            else if (ruleFilterTier === 'medium') matchesTier = r.then >= 0.6 && r.then < 0.8;
            else if (ruleFilterTier === 'low') matchesTier = r.then < 0.6;

            return matchesSearch && matchesTier;
        });
    }, [rules, ruleSearch, ruleFilterTier]);

    // Loading State
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 fuzzy-studio">
                <div className="text-center p-5 fz-card">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
                    <h5 className="fw-bold text-dark">Initializing Fuzzy Logic Studio...</h5>
                    <p className="text-muted small mb-0">Loading variables, membership sets, and Mamdani rule base.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 py-4 fuzzy-studio">
            {/* ── Studio Hero Header ─────────────────────────────────────────── */}
            <div className="fz-hero-banner mb-4">
                <div className="row align-items-center g-3">
                    <div className="col-lg-7">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="fz-hero-badge">
                                <span className="fz-status-dot" />
                                Mamdani Engine Active
                            </span>
                            <span className="badge bg-white bg-opacity-10 text-white rounded-pill px-3 py-1 font-monospace" style={{ fontSize: '0.72rem' }}>
                                Centroid Defuzzification
                            </span>
                        </div>
                        <h2 className="h3 fw-bold mb-1 text-white">Fuzzy Logic Decision Studio</h2>
                        <p className="text-slate-300 small mb-3 opacity-85">
                            Interactive visual modeling and real-time simulation of scholarship eligibility rules using multi-variable fuzzy inference.
                        </p>

                        {/* Scenario Presets */}
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="text-slate-400 small fw-semibold me-1">
                                <Sparkles size={14} className="me-1 text-warning" />
                                Test Scenarios:
                            </span>
                            <button
                                className="fz-preset-pill"
                                onClick={() => applyPreset({ gwa: 1.15, income: 30000 })}
                            >
                                🌟 Top Honors (High Need)
                            </button>
                            <button
                                className="fz-preset-pill"
                                onClick={() => applyPreset({ gwa: 1.5, income: 65000 })}
                            >
                                🎓 Dean's Lister (Mid Income)
                            </button>
                            <button
                                className="fz-preset-pill"
                                onClick={() => applyPreset({ gwa: 2.2, income: 45000 })}
                            >
                                💼 Average (High Need)
                            </button>
                            <button
                                className="fz-preset-pill"
                                onClick={() => applyPreset({ gwa: 2.8, income: 110000 })}
                            >
                                ⚠️ Borderline
                            </button>
                        </div>
                    </div>

                    <div className="col-lg-5 text-lg-end">
                        <div className="d-inline-flex align-items-center gap-2 flex-wrap justify-content-lg-end">
                            <button
                                onClick={loadAllData}
                                className="btn btn-outline-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                            >
                                <RefreshCw size={13} />
                                Reload
                            </button>
                            <button
                                onClick={() => openAddModal('variable')}
                                className="btn btn-outline-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                            >
                                <Plus size={13} />
                                New Variable
                            </button>
                            <button
                                onClick={() => openAddModal('rule')}
                                className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 fw-bold shadow-sm"
                                style={{ backgroundColor: '#6366f1', borderColor: '#6366f1' }}
                            >
                                <Plus size={13} />
                                New Rule
                            </button>
                        </div>

                        {/* Live Studio Metrics */}
                        <div className="d-flex justify-content-lg-end gap-3 mt-3 pt-3 border-top border-white border-opacity-10 text-slate-300 small">
                            <div>
                                <span className="fw-bold text-white fs-6">{variables.length}</span>
                                <span className="opacity-75 ms-1">Variables</span>
                            </div>
                            <div className="border-start border-white border-opacity-20 ps-3">
                                <span className="fw-bold text-white fs-6">{sets.length}</span>
                                <span className="opacity-75 ms-1">Sets</span>
                            </div>
                            <div className="border-start border-white border-opacity-20 ps-3">
                                <span className="fw-bold text-white fs-6">{rules.length}</span>
                                <span className="opacity-75 ms-1">Inference Rules</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger rounded-4 border-0 shadow-sm mb-4 d-flex align-items-center gap-2">
                    <AlertTriangle size={18} className="flex-shrink-0" />
                    <span className="flex-grow-1">{error}</span>
                    <button type="button" className="btn-close" onClick={() => setError(null)} />
                </div>
            )}

            {/* ── Studio Navigation Pill Bar ──────────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div className="fz-nav-container">
                    <button
                        className={`fz-nav-btn ${activeTab === 'simulator' ? 'active' : ''}`}
                        onClick={() => setActiveTab('simulator')}
                    >
                        <Sliders size={16} />
                        Live Playground &amp; Curves
                    </button>
                    <button
                        className={`fz-nav-btn ${activeTab === 'matrix' ? 'active' : ''}`}
                        onClick={() => setActiveTab('matrix')}
                    >
                        <Grid size={16} />
                        2D Decision Matrix
                    </button>
                    <button
                        className={`fz-nav-btn ${activeTab === 'variables' ? 'active' : ''}`}
                        onClick={() => setActiveTab('variables')}
                    >
                        <Layers size={16} />
                        Variable &amp; Set Modeler
                    </button>
                </div>

                <div className="text-muted small">
                    <Info size={14} className="me-1 text-primary" />
                    Drag sliders or select presets to test real-time Mamdani evaluation.
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                VIEW 1: LIVE PLAYGROUND & MULTI-CURVES
               ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'simulator' && (
                <div className="row g-4">
                    {/* Left Column: Input Sliders & Synchronized Multi-Curves */}
                    <div className="col-lg-7">
                        <div className="vstack gap-4">
                            {variables.map((variable) => {
                                const varSets = getSetsForVariable(variable.variable_id);
                                const isIncome = variable.variable_name.toLowerCase().includes('income');
                                const allParams = varSets.flatMap((s) => [s.param_a, s.param_b, s.param_c]);
                                const min = allParams.length > 0 ? Math.min(...allParams) : 0;
                                const max = allParams.length > 0 ? Math.max(...allParams) : 100;
                                const step = isIncome ? 5000 : max > 10 ? 1 : 0.05;
                                const currentVal = simInputs[variable.variable_name] ?? min;

                                return (
                                    <div key={variable.variable_id} className="fz-card p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <h5 className="fw-bold text-dark mb-0 font-monospace">
                                                        {variable.variable_name}
                                                    </h5>
                                                    <span className="badge bg-light text-muted border rounded-pill">
                                                        {varSets.length} sets
                                                    </span>
                                                </div>
                                                <small className="text-muted">{variable.description}</small>
                                            </div>

                                            {/* Crisp Value Badge */}
                                            <div className="text-end">
                                                <span
                                                    className="badge px-3 py-2 fs-6 font-monospace shadow-xs"
                                                    style={{ backgroundColor: '#4338ca', color: '#ffffff' }}
                                                >
                                                    {formatScalar(currentVal, isIncome)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Multi-Membership SVG Canvas */}
                                        <MultiVariableCurveCanvas
                                            variable={variable}
                                            sets={varSets}
                                            currentVal={currentVal}
                                            height={140}
                                            isCurrency={isIncome}
                                        />

                                        {/* Interactive Slider */}
                                        <div className="fz-slider-track-wrap mt-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="small text-muted fw-semibold">
                                                    Min: {formatScalar(min, isIncome)}
                                                </span>
                                                <span className="small text-muted fw-semibold">
                                                    Max: {formatScalar(max, isIncome)}
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                className="fz-slider"
                                                min={min}
                                                max={max}
                                                step={step}
                                                value={currentVal}
                                                onChange={(e) =>
                                                    setSimInputs((prev) => ({
                                                        ...prev,
                                                        [variable.variable_name]: parseFloat(e.target.value) || 0
                                                    }))
                                                }
                                            />
                                        </div>

                                        {/* Live Linguistic Membership Breakdown */}
                                        <div className="row g-2 mt-2">
                                            {varSets.map((set, idx) => {
                                                const color = getSetColor(idx);
                                                const deg =
                                                    simResults.setMemberships[
                                                        `${variable.variable_name}:${set.set_name.toLowerCase()}`
                                                    ] || 0;
                                                return (
                                                    <div key={set.set_id} className="col-sm-4">
                                                        <div
                                                            className="p-2 rounded-3 border"
                                                            style={{
                                                                backgroundColor: deg > 0 ? color.bg : '#f8fafc',
                                                                borderColor: deg > 0 ? color.border : '#e2e8f0'
                                                            }}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center small mb-1">
                                                                <span className="fw-bold" style={{ color: color.hex }}>
                                                                    {set.set_name}
                                                                </span>
                                                                <span className="font-monospace fw-bold" style={{ color: deg > 0 ? color.hex : '#94a3b8' }}>
                                                                    {(deg * 100).toFixed(0)}%
                                                                </span>
                                                            </div>
                                                            <div className="fz-mem-bar">
                                                                <div
                                                                    className="fz-mem-fill"
                                                                    style={{
                                                                        width: `${deg * 100}%`,
                                                                        backgroundColor: color.hex
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Real-Time Defuzzified Score & Rule Inference Engine */}
                    <div className="col-lg-5">
                        <div className="vstack gap-4">
                            {/* Defuzzification Output Card */}
                            <div className="fz-card p-4 text-center position-relative overflow-hidden">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <Award size={18} className="text-primary" />
                                        <h6 className="fw-bold text-dark mb-0">Defuzzified Eligibility</h6>
                                    </div>
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1 small">
                                        Centroid Index
                                    </span>
                                </div>

                                {/* Circular Radial Progress Gauge */}
                                <div className="my-3 d-inline-flex justify-content-center align-items-center position-relative">
                                    <svg width="200" height="200" viewBox="0 0 200 200">
                                        <defs>
                                            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#10b981" />
                                            </linearGradient>
                                        </defs>
                                        {/* Background Ring */}
                                        <circle
                                            cx="100"
                                            cy="100"
                                            r="80"
                                            fill="none"
                                            stroke="#e2e8f0"
                                            strokeWidth="16"
                                        />
                                        {/* Animated Progress Arc */}
                                        <circle
                                            cx="100"
                                            cy="100"
                                            r="80"
                                            fill="none"
                                            stroke="url(#scoreGrad)"
                                            strokeWidth="16"
                                            strokeDasharray={2 * Math.PI * 80}
                                            strokeDashoffset={
                                                2 * Math.PI * 80 * (1 - simResults.defuzzifiedScore / 100)
                                            }
                                            strokeLinecap="round"
                                            transform="rotate(-90 100 100)"
                                            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                                        />
                                    </svg>

                                    <div
                                        className="position-absolute d-flex flex-column align-items-center justify-content-center"
                                        style={{ width: '130px', height: '130px' }}
                                    >
                                        <span className="display-6 fw-bold text-dark lh-1">
                                            {simResults.defuzzifiedScore.toFixed(1)}%
                                        </span>
                                        <span
                                            className="text-muted fw-bold text-uppercase mt-1"
                                            style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}
                                        >
                                            Score
                                        </span>
                                    </div>
                                </div>

                                {/* Dynamic Classification Badge */}
                                <div className="mt-1">
                                    {simResults.defuzzifiedScore >= 80 ? (
                                        <span className="badge bg-success text-white px-3 py-2 rounded-pill fs-6">
                                            ⭐ Highly Eligible (First Priority)
                                        </span>
                                    ) : simResults.defuzzifiedScore >= 60 ? (
                                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fs-6">
                                            ✓ Moderately Eligible (Regular Award)
                                        </span>
                                    ) : simResults.defuzzifiedScore >= 40 ? (
                                        <span className="badge bg-info text-white px-3 py-2 rounded-pill fs-6">
                                            ℹ️ Conditionally Eligible (Waitlist)
                                        </span>
                                    ) : (
                                        <span className="badge bg-danger text-white px-3 py-2 rounded-pill fs-6">
                                            ✕ Low Priority / Ineligible
                                        </span>
                                    )}
                                </div>

                                <p className="text-muted small mt-2 mb-0">
                                    {simResults.firedRules.length} fuzzy rule{simResults.firedRules.length !== 1 ? 's' : ''} fired based on active inputs.
                                </p>
                            </div>

                            {/* Active Rules Triggered */}
                            <div className="fz-card p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <CheckCircle size={18} className="text-success" />
                                        <h6 className="fw-bold text-dark mb-0">Active Fired Rules</h6>
                                    </div>
                                    <span className="badge bg-light text-muted border rounded-pill small">
                                        Mamdani Min Operator
                                    </span>
                                </div>

                                {simResults.firedRules.length === 0 ? (
                                    <div className="text-center py-4 text-muted small">
                                        No rules match the current variable values.
                                    </div>
                                ) : (
                                    <div className="vstack gap-2" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                                        {simResults.firedRules.map(({ rule, strength }, i) => (
                                            <div
                                                key={i}
                                                className="fz-fired-rule active-firing d-flex justify-content-between align-items-center flex-wrap gap-2"
                                            >
                                                <div>
                                                    <div className="d-flex align-items-center gap-1 flex-wrap small">
                                                        <span className="badge rounded-pill bg-primary text-white">
                                                            {(strength * 100).toFixed(0)}% weight
                                                        </span>
                                                        <span className="text-muted fw-bold">IF</span>
                                                        {Object.entries(rule.if).map(([k, v], idx) => (
                                                            <span key={k} className="badge bg-white text-dark border">
                                                                {idx > 0 && <span className="text-muted me-1">AND</span>}
                                                                {k}={v}
                                                            </span>
                                                        ))}
                                                        <ArrowRight size={13} className="text-muted" />
                                                        <span
                                                            className={`badge ${
                                                                rule.then >= 0.8
                                                                    ? 'bg-success text-white'
                                                                    : rule.then >= 0.6
                                                                    ? 'bg-warning text-dark'
                                                                    : 'bg-primary text-white'
                                                            }`}
                                                        >
                                                            {(rule.then * 100).toFixed(0)}% Eligible
                                                        </span>
                                                    </div>
                                                    {rule.description && (
                                                        <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                                                            {rule.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                VIEW 2: 2D DECISION MATRIX & HEATMAP
               ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'matrix' && (
                <div className="vstack gap-4">
                    {/* 2D Heatmap Grid for 2 Variables */}
                    {variables.length >= 2 && (
                        <div className="fz-card p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                        <Grid size={20} className="text-primary" />
                                        2D Decision Matrix Heatmap
                                    </h5>
                                    <p className="text-muted small mb-0">
                                        Cross-tabulation of <strong>{variables[0].variable_name}</strong> vs{' '}
                                        <strong>{variables[1].variable_name}</strong>. Click any cell to inspect or edit.
                                    </p>
                                </div>
                                <button
                                    onClick={() => openAddModal('rule')}
                                    className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                                >
                                    <Plus size={14} />
                                    Add Rule
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="fz-matrix-table">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-muted small text-center" style={{ width: '120px' }}>
                                                {variables[0].variable_name} \ {variables[1].variable_name}
                                            </th>
                                            {getSetsForVariable(variables[1].variable_id).map((colSet) => (
                                                <th key={colSet.set_id} className="p-2 text-center">
                                                    <span className="badge bg-light text-dark border px-3 py-2 fs-6">
                                                        {colSet.set_name}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getSetsForVariable(variables[0].variable_id).map((rowSet) => (
                                            <tr key={rowSet.set_id}>
                                                <th className="p-2 text-center" style={{ verticalAlign: 'middle' }}>
                                                    <span className="badge bg-light text-dark border px-3 py-2 fs-6">
                                                        {rowSet.set_name}
                                                    </span>
                                                </th>
                                                {getSetsForVariable(variables[1].variable_id).map((colSet) => {
                                                    const matchingRule = rules.find((r) => {
                                                        const var1 = variables[0].variable_name;
                                                        const var2 = variables[1].variable_name;
                                                        return (
                                                            r.if[var1]?.toLowerCase() === rowSet.set_name.toLowerCase() &&
                                                            r.if[var2]?.toLowerCase() === colSet.set_name.toLowerCase()
                                                        );
                                                    });

                                                    if (!matchingRule) {
                                                        return (
                                                            <td
                                                                key={colSet.set_id}
                                                                className="fz-matrix-cell fz-cell-empty"
                                                                onClick={() =>
                                                                    openAddModal('rule', {
                                                                        conditions: [
                                                                            { variable_id: variables[0].variable_id, set_id: rowSet.set_id },
                                                                            { variable_id: variables[1].variable_id, set_id: colSet.set_id }
                                                                        ]
                                                                    })
                                                                }
                                                            >
                                                                <span className="small fw-semibold">+ Add Rule</span>
                                                            </td>
                                                        );
                                                    }

                                                    const score = matchingRule.then * 100;
                                                    const cellClass =
                                                        score >= 80
                                                            ? 'fz-cell-score-high'
                                                            : score >= 60
                                                            ? 'fz-cell-score-medium'
                                                            : score >= 40
                                                            ? 'fz-cell-score-low'
                                                            : 'fz-cell-score-danger';

                                                    return (
                                                        <td
                                                            key={colSet.set_id}
                                                            className={`fz-matrix-cell ${cellClass}`}
                                                            onClick={() => openEditModal('rule', matchingRule)}
                                                        >
                                                            <div className="fw-bold fs-5">{score.toFixed(0)}%</div>
                                                            <div className="small opacity-75" style={{ fontSize: '0.72rem' }}>
                                                                Rule #{matchingRule.rule_id}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Searchable Rule Catalog */}
                    <div className="fz-card p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <div>
                                <h5 className="fw-bold text-dark mb-0">Rule Catalog ({rules.length})</h5>
                                <small className="text-muted">All active decision logic registered in the inference engine.</small>
                            </div>

                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <div className="input-group" style={{ maxWidth: '280px' }}>
                                    <span className="input-group-text bg-light border-0">
                                        <Search size={14} className="text-muted" />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 small"
                                        placeholder="Search rules..."
                                        value={ruleSearch}
                                        onChange={(e) => setRuleSearch(e.target.value)}
                                    />
                                    {ruleSearch && (
                                        <button className="btn btn-light border-0" onClick={() => setRuleSearch('')}>
                                            &times;
                                        </button>
                                    )}
                                </div>

                                <div className="btn-group btn-group-sm">
                                    <button
                                        className={`btn ${ruleFilterTier === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setRuleFilterTier('all')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`btn ${ruleFilterTier === 'high' ? 'btn-success' : 'btn-outline-secondary'}`}
                                        onClick={() => setRuleFilterTier('high')}
                                    >
                                        High (≥80%)
                                    </button>
                                    <button
                                        className={`btn ${ruleFilterTier === 'medium' ? 'btn-warning' : 'btn-outline-secondary'}`}
                                        onClick={() => setRuleFilterTier('medium')}
                                    >
                                        Mid (60-79%)
                                    </button>
                                    <button
                                        className={`btn ${ruleFilterTier === 'low' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                        onClick={() => setRuleFilterTier('low')}
                                    >
                                        Low (&lt;60%)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {filteredRules.length === 0 ? (
                            <div className="text-center py-4 text-muted small">No rules found matching your filter criteria.</div>
                        ) : (
                            <div className="row g-3">
                                {filteredRules.map((rule, idx) => (
                                    <div key={rule.rule_id} className="col-12">
                                        <div className="p-3 bg-light rounded-4 border d-flex justify-content-between align-items-center flex-wrap gap-2">
                                            <div className="d-flex align-items-center flex-wrap gap-2">
                                                <span
                                                    className="badge bg-white text-dark border rounded-circle d-flex align-items-center justify-content-center"
                                                    style={{ width: '28px', height: '28px' }}
                                                >
                                                    {idx + 1}
                                                </span>
                                                <span className="badge bg-secondary-subtle text-secondary fw-bold">IF</span>
                                                {Object.entries(rule.if).map(([k, v], i) => (
                                                    <React.Fragment key={k}>
                                                        {i > 0 && <span className="small text-muted fw-bold">AND</span>}
                                                        <span className="badge bg-white text-dark border px-3 py-1 font-monospace">
                                                            <strong className="text-primary">{k}</strong> = {v}
                                                        </span>
                                                    </React.Fragment>
                                                ))}
                                                <ArrowRight size={14} className="text-muted" />
                                                <span className="badge bg-secondary-subtle text-secondary fw-bold">THEN</span>
                                                <span
                                                    className={`badge px-3 py-1 fs-6 ${
                                                        rule.then >= 0.8
                                                            ? 'bg-success text-white'
                                                            : rule.then >= 0.6
                                                            ? 'bg-warning text-dark'
                                                            : 'bg-primary text-white'
                                                    }`}
                                                >
                                                    {(rule.then * 100).toFixed(0)}% Eligible
                                                </span>
                                                {rule.description && (
                                                    <span className="text-muted small ms-2 border-start ps-2">
                                                        {rule.description}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    onClick={() => handleDelete('rule', rule.rule_id, `Rule #${rule.rule_id}`)}
                                                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                                >
                                                    <Trash2 size={13} className="me-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                VIEW 3: VARIABLE & SET MODELER
               ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'variables' && (
                <div className="row g-4">
                    {variables.map((variable) => {
                        const varSets = getSetsForVariable(variable.variable_id);
                        const isIncome = variable.variable_name.toLowerCase().includes('income');

                        return (
                            <div key={variable.variable_id} className="col-lg-6">
                                <div className="fz-card h-100 p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                                                <BookOpen size={18} />
                                            </div>
                                            <div>
                                                <h5 className="fw-bold text-dark mb-0 font-monospace">{variable.variable_name}</h5>
                                                <small className="text-muted">{variable.description || 'No description'}</small>
                                            </div>
                                        </div>

                                        <div className="btn-group btn-group-sm">
                                            <button
                                                onClick={() => openEditModal('variable', variable)}
                                                className="btn btn-outline-secondary"
                                                title="Edit variable"
                                            >
                                                <Edit3 size={13} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete('variable', variable.variable_id, variable.variable_name)
                                                }
                                                className="btn btn-outline-danger"
                                                title="Delete variable"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Multi-Curve Canvas */}
                                    <MultiVariableCurveCanvas
                                        variable={variable}
                                        sets={varSets}
                                        height={130}
                                        isCurrency={isIncome}
                                    />

                                    {/* Sets Detail Table */}
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="small text-muted fw-bold text-uppercase">Membership Sets</span>
                                            <button
                                                onClick={() => openAddModal('set', { variable_id: variable.variable_id })}
                                                className="btn btn-outline-primary btn-sm rounded-pill px-2 py-0 small"
                                            >
                                                <Plus size={12} className="me-1" />
                                                Add Set
                                            </button>
                                        </div>

                                        <div className="vstack gap-2">
                                            {varSets.map((set, idx) => {
                                                const color = getSetColor(idx);
                                                return (
                                                    <div
                                                        key={set.set_id}
                                                        className="p-2 bg-light rounded-3 border d-flex justify-content-between align-items-center"
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span
                                                                className="fz-legend-color"
                                                                style={{ backgroundColor: color.hex }}
                                                            />
                                                            <strong style={{ color: color.hex }}>{set.set_name}</strong>
                                                            <span className="small text-muted font-monospace">
                                                                [{set.param_a}, {set.param_b}, {set.param_c}]
                                                            </span>
                                                        </div>

                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                onClick={() => openEditModal('set', set)}
                                                                className="btn btn-outline-secondary btn-sm"
                                                                title="Edit set"
                                                            >
                                                                <Edit3 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete('set', set.set_id, set.set_name)}
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Delete set"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                MODALS: ADD / EDIT DIALOG
               ══════════════════════════════════════════════════════════════════ */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header bg-white border-bottom p-4">
                                <h5 className="modal-title fw-bold text-dark mb-0">
                                    {editMode ? 'Edit' : 'Add New'}{' '}
                                    {modalType === 'variable' && 'Fuzzy Variable'}
                                    {modalType === 'set' && 'Fuzzy Set'}
                                    {modalType === 'rule' && 'Inference Rule'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal} />
                            </div>

                            <div className="modal-body p-4">
                                {/* Variable Form */}
                                {modalType === 'variable' && currentItem && (
                                    <div className="vstack gap-3">
                                        <div>
                                            <label className="form-label fw-semibold small">Variable Name</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                value={currentItem.variable_name}
                                                onChange={(e) =>
                                                    setCurrentItem({ ...currentItem, variable_name: e.target.value })
                                                }
                                                placeholder="e.g., gwa, household_income"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold small">Description</label>
                                            <textarea
                                                className="form-control rounded-3"
                                                value={currentItem.description}
                                                onChange={(e) =>
                                                    setCurrentItem({ ...currentItem, description: e.target.value })
                                                }
                                                placeholder="Describe how this variable affects eligibility..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Set Form */}
                                {modalType === 'set' && currentItem && (
                                    <div className="vstack gap-3">
                                        <div>
                                            <label className="form-label fw-semibold small">Associated Variable</label>
                                            <select
                                                className="form-select rounded-3"
                                                value={currentItem.variable_id}
                                                onChange={(e) =>
                                                    setCurrentItem({
                                                        ...currentItem,
                                                        variable_id: parseInt(e.target.value)
                                                    })
                                                }
                                            >
                                                {variables.map((v) => (
                                                    <option key={v.variable_id} value={v.variable_id}>
                                                        {v.variable_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="form-label fw-semibold small">Set Name</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                value={currentItem.set_name}
                                                onChange={(e) => setCurrentItem({ ...currentItem, set_name: e.target.value })}
                                                placeholder="e.g., High, Medium, Low"
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label fw-semibold small">
                                                Triangular Parameters [A, B, C]
                                            </label>
                                            <div className="row g-2">
                                                <div className="col-4">
                                                    <label className="small text-muted">A (Start)</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="form-control rounded-3 font-monospace"
                                                        value={currentItem.param_a}
                                                        onChange={(e) =>
                                                            setCurrentItem({
                                                                ...currentItem,
                                                                param_a: parseFloat(e.target.value) || 0
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <label className="small text-muted">B (Peak)</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="form-control rounded-3 font-monospace"
                                                        value={currentItem.param_b}
                                                        onChange={(e) =>
                                                            setCurrentItem({
                                                                ...currentItem,
                                                                param_b: parseFloat(e.target.value) || 0
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <label className="small text-muted">C (End)</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="form-control rounded-3 font-monospace"
                                                        value={currentItem.param_c}
                                                        onChange={(e) =>
                                                            setCurrentItem({
                                                                ...currentItem,
                                                                param_c: parseFloat(e.target.value) || 0
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Rule Form */}
                                {modalType === 'rule' && currentItem && (
                                    <div className="vstack gap-3">
                                        <div>
                                            <label className="form-label fw-semibold small">Antecedent Conditions (IF)</label>
                                            <div className="vstack gap-2">
                                                {variables.map((variable) => {
                                                    const varSets = getSetsForVariable(variable.variable_id);
                                                    const condition = currentItem.conditions?.find(
                                                        (c: any) => c.variable_id === variable.variable_id
                                                    );
                                                    return (
                                                        <div
                                                            key={variable.variable_id}
                                                            className="p-2 bg-light rounded-3 d-flex align-items-center justify-content-between gap-3"
                                                        >
                                                            <span className="fw-bold font-monospace small">
                                                                {variable.variable_name} =
                                                            </span>
                                                            <select
                                                                className="form-select form-select-sm rounded-3 w-auto flex-grow-1"
                                                                value={condition?.set_id || ''}
                                                                onChange={(e) => {
                                                                    const newConditions = (
                                                                        currentItem.conditions || []
                                                                    ).map((c: any) =>
                                                                        c.variable_id === variable.variable_id
                                                                            ? { ...c, set_id: parseInt(e.target.value) }
                                                                            : c
                                                                    );
                                                                    setCurrentItem({
                                                                        ...currentItem,
                                                                        conditions: newConditions
                                                                    });
                                                                }}
                                                            >
                                                                {varSets.map((s) => (
                                                                    <option key={s.set_id} value={s.set_id}>
                                                                        {s.set_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="form-label fw-semibold small d-flex justify-content-between">
                                                <span>Consequent Output (THEN)</span>
                                                <span className="badge bg-primary">
                                                    {(currentItem.consequent_value * 100).toFixed(0)}%
                                                </span>
                                            </label>
                                            <input
                                                type="range"
                                                className="form-range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={currentItem.consequent_value}
                                                onChange={(e) =>
                                                    setCurrentItem({
                                                        ...currentItem,
                                                        consequent_value: parseFloat(e.target.value)
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label fw-semibold small">Description</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                value={currentItem.description || ''}
                                                onChange={(e) =>
                                                    setCurrentItem({ ...currentItem, description: e.target.value })
                                                }
                                                placeholder="e.g., High academic honors with low income"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer bg-light border-top p-3">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-pill px-4 fw-bold"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuzzyLogic;