import { CheckCircle, History } from 'lucide-react';

interface ActivePeriodBadgeProps {
    isActive: boolean;
}

const ActivePeriodBadge = ({ isActive }: ActivePeriodBadgeProps) => (
    isActive ? (
        <span className="active-period-badge active-period-badge--current">
            <CheckCircle size={14} />
            <span>Current Period</span>
        </span>
    ) : (
        <span className="active-period-badge active-period-badge--historical">
            <History size={14} />
            <span>Historical Data</span>
        </span>
    )
);

export default ActivePeriodBadge;
