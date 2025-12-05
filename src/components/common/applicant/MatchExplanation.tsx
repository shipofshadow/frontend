import { useState, useCallback } from 'react';
import { 
    ChevronDown, 
    ChevronUp, 
    CheckCircle, 
    TrendingUp, 
    Award,
    Sparkles,
    Target,
    GraduationCap,
    DollarSign,
    Star
} from 'lucide-react';
import type { MatchExplanation as MatchExplanationType, StrengthFactor, BonusFactor, ScoreBreakdown } from '../../../interfaces/alert';

interface MatchExplanationProps {
    explanation?: MatchExplanationType | null;
    isLoading?: boolean;
    onToggle?: () => void;
    isExpanded?: boolean;
}

interface MatchExplanationSectionProps {
    explanation: MatchExplanationType;
}

const getImpactColor = (impact: 'high' | 'medium' | 'low'): string => {
    switch (impact) {
        case 'high': return 'success';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'secondary';
    }
};

const getImpactPercentage = (impact: 'high' | 'medium' | 'low'): number => {
    switch (impact) {
        case 'high': return 90;
        case 'medium': return 65;
        case 'low': return 35;
        default: return 50;
    }
};

const StrengthFactorItem = ({ factor }: { factor: StrengthFactor }) => {
    const color = getImpactColor(factor.impact);
    const percentage = factor.score || getImpactPercentage(factor.impact);
    
    return (
        <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center gap-2">
                    <CheckCircle size={14} className={`text-${color}`} />
                    <span className="fw-medium small">{factor.factor}</span>
                </div>
                <span className={`badge bg-${color} ${color === 'warning' ? 'text-dark' : ''} rounded-pill`}>
                    {factor.impact}
                </span>
            </div>
            <div className="progress mb-1" style={{ height: '6px' }}>
                <div 
                    className={`progress-bar bg-${color}`}
                    style={{ 
                        width: `${percentage}%`,
                        transition: 'width 0.6s ease-out'
                    }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
            <small className="text-muted">{factor.description}</small>
        </div>
    );
};

const BonusFactorBadge = ({ bonus }: { bonus: BonusFactor }) => {
    return (
        <div 
            className="d-inline-flex align-items-center gap-1 me-2 mb-2 px-3 py-2 rounded-pill"
            style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '0.8rem'
            }}
            title={bonus.description}
        >
            <Sparkles size={12} />
            <span>{bonus.factor}</span>
            <span className="badge bg-white text-primary ms-1">+{bonus.points}</span>
        </div>
    );
};

const ScoreBreakdownChart = ({ breakdown }: { breakdown: ScoreBreakdown }) => {
    const items = [
        { label: 'Base Score', value: breakdown.base_score, icon: Target, color: '#667eea' },
        { label: 'Academic Fit', value: breakdown.academic_fit, icon: GraduationCap, color: '#11998e' },
        { label: 'Financial Fit', value: breakdown.financial_fit, icon: DollarSign, color: '#f093fb' },
        { label: 'Priority Bonus', value: breakdown.priority_bonus, icon: Star, color: '#f5576c' }
    ];

    const maxValue = Math.max(...items.map(i => i.value), 1);

    return (
        <div className="mt-3">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                Score Breakdown
            </h6>
            <div className="row g-2">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    const widthPercent = (item.value / maxValue) * 100;
                    return (
                        <div key={index} className="col-12">
                            <div className="d-flex align-items-center gap-2">
                                <div 
                                    className="rounded-2 p-1 d-flex align-items-center justify-content-center"
                                    style={{ 
                                        backgroundColor: `${item.color}20`,
                                        width: '28px',
                                        height: '28px'
                                    }}
                                >
                                    <Icon size={14} style={{ color: item.color }} />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-muted">{item.label}</small>
                                        <small className="fw-bold">{item.value}</small>
                                    </div>
                                    <div className="progress" style={{ height: '4px' }}>
                                        <div 
                                            className="progress-bar"
                                            style={{ 
                                                width: `${widthPercent}%`,
                                                backgroundColor: item.color,
                                                transition: 'width 0.6s ease-out'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-3 p-2 bg-light rounded-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold">Total Match Score</span>
                <span 
                    className="badge px-3 py-2"
                    style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '1rem'
                    }}
                >
                    {breakdown.total}%
                </span>
            </div>
        </div>
    );
};

const MatchExplanationSection = ({ explanation }: MatchExplanationSectionProps) => {
    return (
        <div 
            className="match-explanation-content"
            style={{
                animation: 'slideDown 0.3s ease-out'
            }}
        >
            {/* Summary */}
            <div className="mb-4 p-3 bg-light rounded-3">
                <p className="mb-0 small">{explanation.summary}</p>
            </div>

            {/* Strength Factors */}
            {explanation.strength_factors && explanation.strength_factors.length > 0 && (
                <div className="mb-4">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <Award size={16} className="text-success" />
                        Matching Strengths
                    </h6>
                    {explanation.strength_factors.map((factor, index) => (
                        <StrengthFactorItem key={index} factor={factor} />
                    ))}
                </div>
            )}

            {/* Bonus Factors */}
            {explanation.bonus_factors && explanation.bonus_factors.length > 0 && (
                <div className="mb-4">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <Sparkles size={16} className="text-warning" />
                        Bonus Points
                    </h6>
                    <div>
                        {explanation.bonus_factors.map((bonus, index) => (
                            <BonusFactorBadge key={index} bonus={bonus} />
                        ))}
                    </div>
                </div>
            )}

            {/* Score Breakdown */}
            {explanation.score_breakdown && (
                <ScoreBreakdownChart breakdown={explanation.score_breakdown} />
            )}
        </div>
    );
};

const MatchExplanationSkeleton = () => {
    return (
        <div className="match-explanation-skeleton p-3">
            <div className="skeleton-line mb-3" style={{ height: '60px', background: '#e9ecef', borderRadius: '8px' }} />
            <div className="skeleton-line mb-2" style={{ height: '40px', background: '#e9ecef', borderRadius: '4px' }} />
            <div className="skeleton-line mb-2" style={{ height: '40px', background: '#e9ecef', borderRadius: '4px', width: '80%' }} />
            <div className="skeleton-line" style={{ height: '40px', background: '#e9ecef', borderRadius: '4px', width: '60%' }} />
        </div>
    );
};

export default function MatchExplanation({ 
    explanation, 
    isLoading = false,
    onToggle,
    isExpanded = false
}: MatchExplanationProps) {
    const [internalExpanded, setInternalExpanded] = useState(false);
    
    const expanded = onToggle ? isExpanded : internalExpanded;
    
    const handleToggle = useCallback(() => {
        if (onToggle) {
            onToggle();
        } else {
            setInternalExpanded(prev => !prev);
        }
    }, [onToggle]);

    return (
        <div className="match-explanation-wrapper mt-3">
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        max-height: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        max-height: 800px;
                        transform: translateY(0);
                    }
                }
                
                .match-explanation-toggle {
                    transition: all 0.2s ease;
                }
                
                .match-explanation-toggle:hover {
                    background: rgba(102, 126, 234, 0.1) !important;
                }
                
                .match-explanation-content {
                    overflow: hidden;
                }
                
                .skeleton-line {
                    animation: pulse 1.5s ease-in-out infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>

            <button
                type="button"
                className="btn btn-link text-decoration-none w-100 text-start p-2 match-explanation-toggle rounded-2"
                onClick={handleToggle}
                aria-expanded={expanded}
                aria-controls="match-explanation-panel"
            >
                <div className="d-flex align-items-center justify-content-between">
                    <span className="d-flex align-items-center gap-2 text-primary fw-medium small">
                        <TrendingUp size={14} />
                        Why this matches you?
                    </span>
                    {expanded ? (
                        <ChevronUp size={16} className="text-primary" />
                    ) : (
                        <ChevronDown size={16} className="text-primary" />
                    )}
                </div>
            </button>

            {expanded && (
                <div 
                    id="match-explanation-panel"
                    className="border-top pt-3 mt-2"
                >
                    {isLoading ? (
                        <MatchExplanationSkeleton />
                    ) : explanation ? (
                        <MatchExplanationSection explanation={explanation} />
                    ) : (
                        <div className="text-center text-muted py-3">
                            <p className="small mb-0">Match explanation not available</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
