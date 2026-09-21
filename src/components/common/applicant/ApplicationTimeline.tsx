import React from 'react';

export type ApplicationStatus =
    | 'pending'
    | 'evaluated'
    | 'awaiting_approval'
    | 'approved'
    | 'rejected'
    | 'denied'
    | string;

interface TimelineProps {
    status: ApplicationStatus;
    submittedAt?: string | null;
    evaluatedAt?: string | null;
    selectedAt?: string | null;
    approvedAt?: string | null;
    compact?: boolean;
}

interface Step {
    key: string;
    label: string;
    sublabel: string;
    icon: string;
    dateField?: string | null;
}

const STEPS: Step[] = [
    { key: 'submitted',  label: 'Submitted',          sublabel: 'Application received',      icon: 'fas fa-paper-plane' },
    { key: 'pending',    label: 'Under Review',        sublabel: 'Being reviewed by admin',   icon: 'fas fa-search' },
    { key: 'evaluated',  label: 'Evaluated',           sublabel: 'Fuzzy score computed',      icon: 'fas fa-chart-bar' },
    { key: 'selected',   label: 'Scholarship Selected',sublabel: 'Awaiting admin approval',   icon: 'fas fa-hand-pointer' },
    { key: 'approved',   label: 'Approved',            sublabel: 'Scholarship granted',       icon: 'fas fa-check-circle' },
];

const STATUS_ORDER: Record<string, number> = {
    pending:           1,
    evaluated:         2,
    awaiting_approval: 3,
    approved:          4,
    denied:            4,
    rejected:          4,
};

function getStepState(_stepKey: string, status: ApplicationStatus, stepIndex: number): 'step-done' | 'step-active' | 'step-rejected' | 'step-pending' {
    const currentOrder = STATUS_ORDER[status] ?? 0;
    const isRejected = status === 'denied' || status === 'rejected';

    if (isRejected && stepIndex === STEPS.length - 1) return 'step-rejected';
    if (stepIndex < currentOrder) return 'step-done';
    if (stepIndex === currentOrder) return 'step-active';
    return 'step-pending';
}

function fmtDate(d?: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STEP_DATES = (props: TimelineProps): (string | null)[] => [
    fmtDate(props.submittedAt),
    fmtDate(props.submittedAt),
    fmtDate(props.evaluatedAt),
    fmtDate(props.selectedAt),
    fmtDate(props.approvedAt),
];

const ApplicationTimeline: React.FC<TimelineProps> = (props) => {
    const { status, compact } = props;
    const dates = STEP_DATES(props);
    const isRejected = status === 'denied' || status === 'rejected';

    // Swap last label on rejection
    const steps = STEPS.map((s, i) =>
        i === STEPS.length - 1 && isRejected
            ? { ...s, label: 'Rejected', sublabel: 'Application not approved', icon: 'fas fa-times-circle' }
            : s
    );

    return (
        <div className="app-timeline">
            {steps.map((step, i) => {
                const state = getStepState(step.key, status, i);
                return (
                    <div key={step.key} className={`app-timeline-step ${state}`}>
                        <div className="app-timeline-icon">
                            <i className={step.icon} style={{ fontSize: compact ? 12 : 14 }} />
                        </div>
                        {!compact && (
                            <>
                                <div className="app-timeline-label">{step.label}</div>
                                {state === 'step-done' || state === 'step-active' || state === 'step-rejected' ? (
                                    <>
                                        <div className="text-muted" style={{ fontSize: '0.68rem' }}>{step.sublabel}</div>
                                        {dates[i] && (
                                            <div className="app-timeline-date">{dates[i]}</div>
                                        )}
                                    </>
                                ) : (
                                    <div className="app-timeline-date text-muted">{step.sublabel}</div>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ApplicationTimeline;
