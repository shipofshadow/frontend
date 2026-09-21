import React, { useEffect, useState } from 'react';

interface MembershipSet {
    [setName: string]: number;
}

interface Memberships {
    [variable: string]: MembershipSet;
}

interface FiredRule {
    rule_index: number;
    conditions: Record<string, string>;
    strength: number;
    consequent: number;
    contribution: number;
}

interface ExplanationData {
    memberships: Memberships;
    fired_rules: FiredRule[];
    inputs: { gwa?: number; income?: number };
}

interface Props {
    explanation: ExplanationData | null;
    classification: string | null;
    score: number | null;
    gwa: number | null;
    income: number | null;
}

const VAR_LABELS: Record<string, string> = {
    gwa: '🎓 Academic Performance (GWA)',
    income: '💰 Family Income',
};

const barColor = (pct: number) => {
    if (pct >= 0.7) return '#198754'; // green
    if (pct >= 0.4) return '#0d6efd'; // blue
    if (pct >= 0.1) return '#fd7e14'; // orange
    return '#dee2e6';                  // grey
};

const classColor = (cls: string | null) => {
    switch (cls) {
        case 'Eligible': return '#198754';
        case 'Conditionally Eligible': return '#0dcaf0';
        case 'Low Eligibility': return '#fd7e14';
        default: return '#dc3545';
    }
};

const formatIncome = (v: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(v);

const FuzzyScoreExplanation: React.FC<Props> = ({ explanation, classification, score }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate bars in after mount
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    if (!explanation) return null;

    const { memberships, fired_rules, inputs } = explanation;
    const scorePct = Math.round((score ?? 0) * 100);

    return (
        <div className="card border-0 shadow-sm mt-3">
            <div className="card-body">
                <h6 className="fw-bold mb-3">
                    📊 Eligibility Score Breakdown
                    <span
                        className="ms-2 badge"
                        style={{ background: classColor(classification), fontSize: '0.8rem' }}
                    >
                        {classification || 'N/A'}
                    </span>
                </h6>

                {/* Overall score bar */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">Overall Eligibility Score</span>
                        <strong style={{ color: classColor(classification) }}>{scorePct}%</strong>
                    </div>
                    <div className="fuzzy-bar-track">
                        <div
                            className="fuzzy-bar-fill"
                            style={{
                                width: visible ? `${scorePct}%` : '0%',
                                background: classColor(classification),
                            }}
                        />
                    </div>
                </div>

                {/* Per-variable membership bars */}
                {Object.entries(memberships).map(([varName, sets]) => (
                    <div key={varName} className="mb-3">
                        <div className="small fw-semibold mb-1 text-muted">
                            {VAR_LABELS[varName] || varName}
                            {varName === 'gwa' && inputs.gwa != null && (
                                <span className="ms-1 text-dark">— {inputs.gwa}</span>
                            )}
                            {varName === 'income' && inputs.income != null && (
                                <span className="ms-1 text-dark">— {formatIncome(inputs.income)}/mo</span>
                            )}
                        </div>
                        {Object.entries(sets).map(([setName, degree]) => {
                            const pct = Math.round(degree * 100);
                            return (
                                <div key={setName} className="d-flex align-items-center gap-2 mb-1">
                                    <span
                                        className="text-capitalize"
                                        style={{ width: 100, fontSize: '0.72rem', color: '#6c757d' }}
                                    >
                                        {setName}
                                    </span>
                                    <div className="fuzzy-bar-track flex-grow-1">
                                        <div
                                            className="fuzzy-bar-fill"
                                            style={{
                                                width: visible ? `${pct}%` : '0%',
                                                background: barColor(degree),
                                            }}
                                        />
                                    </div>
                                    <span style={{ width: 36, fontSize: '0.72rem', color: '#495057', textAlign: 'right' }}>
                                        {pct}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Fired rules */}
                {fired_rules.length > 0 && (
                    <div className="mt-3 pt-3 border-top">
                        <div className="small fw-semibold text-muted mb-2">🔥 Active Rules</div>
                        <ul className="list-unstyled mb-0">
                            {fired_rules.map((rule) => {
                                const condStr = Object.entries(rule.conditions)
                                    .map(([v, s]) => `${VAR_LABELS[v] || v} is <strong>${s}</strong>`)
                                    .join(' AND ');
                                return (
                                    <li key={rule.rule_index} className="mb-2 d-flex gap-2 align-items-start" style={{ fontSize: '0.78rem' }}>
                                        <span className="badge bg-primary" style={{ marginTop: 1 }}>
                                            Rule {rule.rule_index}
                                        </span>
                                        <div>
                                            <span dangerouslySetInnerHTML={{ __html: `IF ${condStr}` }} />
                                            <span className="text-muted ms-1">
                                                → score {Math.round(rule.consequent * 100)}%
                                                (strength: {Math.round(rule.strength * 100)}%)
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FuzzyScoreExplanation;
