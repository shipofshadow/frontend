import { DollarSign, Users, Award, Clock } from 'lucide-react';
import type { ComparisonData } from '../../../hooks/useDashboardData';

interface SummaryCardsProps {
    data: ComparisonData | null;
}

interface SummaryCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string;
}

const SummaryCard = ({ title, value, subtitle, icon, colorClass }: SummaryCardProps) => (
    <div className={`summary-card ${colorClass}`}>
        <div className="summary-card__icon">
            {icon}
        </div>
        <div className="summary-card__content">
            <p className="summary-card__title">{title}</p>
            <h3 className="summary-card__value">{value}</h3>
            <p className="summary-card__subtitle">{subtitle}</p>
        </div>
    </div>
);

const SummaryCards = ({ data }: SummaryCardsProps) => {
    if (!data?.current) return null;

    const current = data.current;
    
    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const avgAwardAmount = current.numberOfScholars > 0 
        ? current.totalAmountAwarded / current.numberOfScholars 
        : 0;

    return (
        <div className="summary-cards-grid">
            <SummaryCard
                title="Total Amount Awarded"
                value={formatCurrency(current.totalAmountAwarded)}
                subtitle="This period"
                icon={<DollarSign size={24} />}
                colorClass="summary-card--green"
            />
            <SummaryCard
                title="Number of Scholars"
                value={current.numberOfScholars.toLocaleString()}
                subtitle="Active scholars"
                icon={<Users size={24} />}
                colorClass="summary-card--blue"
            />
            <SummaryCard
                title="Average Award Amount"
                value={formatCurrency(avgAwardAmount)}
                subtitle="Per scholar"
                icon={<Award size={24} />}
                colorClass="summary-card--purple"
            />
            <SummaryCard
                title="Pending Applications"
                value={current.pendingApplications.toLocaleString()}
                subtitle="Awaiting review"
                icon={<Clock size={24} />}
                colorClass="summary-card--orange"
            />
        </div>
    );
};

export default SummaryCards;
