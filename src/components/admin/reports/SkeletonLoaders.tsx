const SkeletonPulse = ({ className }: { className?: string }) => (
    <div className={`skeleton-pulse ${className || ''}`} />
);

export const MetricCardSkeleton = () => (
    <div className="metric-card skeleton-card">
        <div className="metric-header">
            <SkeletonPulse className="skeleton-icon" />
            <SkeletonPulse className="skeleton-text skeleton-text--short" />
        </div>
        <div className="metric-body">
            <SkeletonPulse className="skeleton-text skeleton-text--large" />
            <SkeletonPulse className="skeleton-text skeleton-text--medium" />
        </div>
    </div>
);

export const SummaryCardSkeleton = () => (
    <div className="summary-card skeleton-card">
        <SkeletonPulse className="skeleton-icon skeleton-icon--large" />
        <div className="summary-card__content">
            <SkeletonPulse className="skeleton-text skeleton-text--short" />
            <SkeletonPulse className="skeleton-text skeleton-text--large" />
            <SkeletonPulse className="skeleton-text skeleton-text--medium" />
        </div>
    </div>
);

export const ChartSkeleton = () => (
    <div className="card skeleton-card">
        <div className="card-header">
            <SkeletonPulse className="skeleton-text skeleton-text--medium" />
            <SkeletonPulse className="skeleton-text skeleton-text--short" />
        </div>
        <div className="card-body">
            <SkeletonPulse className="skeleton-chart" />
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className="card skeleton-card">
        <div className="card-header">
            <SkeletonPulse className="skeleton-text skeleton-text--medium" />
            <SkeletonPulse className="skeleton-text skeleton-text--short" />
        </div>
        <div className="card-body">
            <div className="skeleton-table">
                <div className="skeleton-table__header">
                    {[...Array(5)].map((_, i) => (
                        <SkeletonPulse key={i} className="skeleton-text skeleton-text--short" />
                    ))}
                </div>
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="skeleton-table__row">
                        {[...Array(5)].map((_, j) => (
                            <SkeletonPulse key={j} className="skeleton-text skeleton-text--short" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const MetricsGridSkeleton = () => (
    <div className="metrics-grid">
        {[...Array(6)].map((_, i) => (
            <MetricCardSkeleton key={i} />
        ))}
    </div>
);

export const SummaryCardsGridSkeleton = () => (
    <div className="summary-cards-grid">
        {[...Array(4)].map((_, i) => (
            <SummaryCardSkeleton key={i} />
        ))}
    </div>
);

const DashboardSkeleton = () => (
    <div className="dashboard-skeleton">
        <SummaryCardsGridSkeleton />
        <MetricsGridSkeleton />
        <div className="section-grid-2">
            <ChartSkeleton />
            <ChartSkeleton />
        </div>
        <ChartSkeleton />
        <TableSkeleton />
    </div>
);

export default DashboardSkeleton;
