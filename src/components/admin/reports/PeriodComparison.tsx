import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ComparisonData } from '../../../hooks/useDashboardData';

interface PeriodComparisonProps {
    data: ComparisonData | null;
}

interface ComparisonCardProps {
    title: string;
    current: number;
    previous: number;
    isPercentage?: boolean;
    isCurrency?: boolean;
}

const ComparisonCard = ({ title, current, previous, isPercentage = false, isCurrency = false }: ComparisonCardProps) => {
    // Calculate percentage change, handling edge cases
    const calculateChange = (): number => {
        if (previous === 0 && current === 0) return 0; // No change when both are zero
        if (previous === 0) return current > 0 ? 100 : 0; // From zero to something is 100% increase
        return ((current - previous) / previous) * 100;
    };
    
    const change = calculateChange();
    const isPositive = change > 0;
    const isNeutral = change === 0;

    const formatValue = (value: number) => {
        if (isCurrency) {
            return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }
        if (isPercentage) {
            return `${value.toFixed(1)}%`;
        }
        return value.toLocaleString();
    };

    const getTrendIcon = () => {
        if (isNeutral) return <Minus size={16} />;
        return isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
    };

    const getTrendClass = () => {
        if (isNeutral) return 'comparison-card__trend--neutral';
        return isPositive ? 'comparison-card__trend--positive' : 'comparison-card__trend--negative';
    };

    return (
        <div className="comparison-card">
            <h4 className="comparison-card__title">{title}</h4>
            <div className="comparison-card__values">
                <div className="comparison-card__current">
                    <span className="comparison-card__label">Current</span>
                    <span className="comparison-card__value">{formatValue(current)}</span>
                </div>
                <div className="comparison-card__previous">
                    <span className="comparison-card__label">Previous</span>
                    <span className="comparison-card__value">{formatValue(previous)}</span>
                </div>
            </div>
            <div className={`comparison-card__trend ${getTrendClass()}`}>
                {getTrendIcon()}
                <span>{isNeutral ? 'No change' : `${Math.abs(change).toFixed(1)}% ${isPositive ? 'increase' : 'decrease'}`}</span>
            </div>
        </div>
    );
};

const PeriodComparison = ({ data }: PeriodComparisonProps) => {
    if (!data?.current || !data?.previous) return null;

    const { current, previous } = data;

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Period Comparison</h2>
                <p className="card-subtitle">Comparing current period with previous semester</p>
            </div>
            <div className="card-body">
                <div className="comparison-grid">
                    <ComparisonCard
                        title="Total Applications"
                        current={current.totalApplications}
                        previous={previous.totalApplications}
                    />
                    <ComparisonCard
                        title="Approval Rate"
                        current={current.approvalRate}
                        previous={previous.approvalRate}
                        isPercentage
                    />
                    <ComparisonCard
                        title="Average GWA"
                        current={current.avgGWA}
                        previous={previous.avgGWA}
                    />
                    <ComparisonCard
                        title="Total Amount Awarded"
                        current={current.totalAmountAwarded}
                        previous={previous.totalAmountAwarded}
                        isCurrency
                    />
                </div>
            </div>
        </div>
    );
};

export default PeriodComparison;
