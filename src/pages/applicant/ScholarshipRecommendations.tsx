import React, { useCallback, useEffect, useState } from 'react';
import { Award, CheckCircle, AlertTriangle, Clock, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import {
    getScholarshipSummary,
    getRecommendations,
    getStudentSelection,
    submitStudentSelection,
    updateStudentSelection,
} from '../../services/scholarshipService';

interface Recommendation {
    scholarship_id: number;
    name: string;
    description: string;
    amount: string;
    score: number;
    classification: string;
    eligibility_reasons: string[];
}

interface StudentSelection {
    id: number;
    scholarship_id: number;
    scholarship_name: string;
    status: 'student_chosen' | 'accepted' | 'rejected';
    created_at: string;
}

interface EvaluationSummary {
    gwa?: number;
    income?: number;
    classification?: string;
    score?: number;
}

const ScholarshipRecommendations: React.FC = () => {
    const { token } = useAuth();

    const [applicationId, setApplicationId] = useState<number | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [selection, setSelection] = useState<StudentSelection | null>(null);
    const [evaluation, setEvaluation] = useState<EvaluationSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const summary = await getScholarshipSummary(token);
            const apps = (summary?.applications ?? []) as Array<{
                application: { id: number; status: string };
                evaluation: EvaluationSummary | null;
            }>;
            const activeApp = apps.find((a) => a.application?.status !== 'archived') ?? apps[0];
            if (!activeApp) {
                setError('No application found. Please submit an application first.');
                setLoading(false);
                return;
            }
            const appId: number = activeApp.application.id;
            setApplicationId(appId);

            if (activeApp.evaluation) {
                setEvaluation(activeApp.evaluation);
            }

            const [recs, sel] = await Promise.all([
                getRecommendations(appId, token),
                getStudentSelection(appId, token).catch(() => null),
            ]);
            setRecommendations(Array.isArray(recs) ? recs : []);
            setSelection(sel ?? null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load scholarship data.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChoose = async (rec: Recommendation) => {
        if (!applicationId || !token) return;

        const result = await Swal.fire({
            title: 'Choose this Scholarship?',
            html: `<strong>${rec.name}</strong><br/>₱${parseFloat(rec.amount).toLocaleString()}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, choose it',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        setSubmitting(true);
        try {
            const isChange = selection?.status === 'student_chosen';
            if (isChange) {
                await updateStudentSelection(applicationId, rec.scholarship_id, token);
            } else {
                await submitStudentSelection(applicationId, rec.scholarship_id, token);
            }
            await Swal.fire({
                icon: 'success',
                title: 'Selection Saved',
                text: 'Your scholarship selection has been submitted for review.',
                timer: 2000,
                showConfirmButton: false,
            });
            await loadData();
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to submit selection. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const getScoreBadgeClass = (score: number) => {
        if (score >= 90) return 'bg-success';
        if (score >= 70) return 'bg-warning text-dark';
        return 'bg-info';
    };

    if (loading) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" />
                    <p className="text-muted">Loading scholarship recommendations…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light">
            {/* Header */}
            <div className="bg-white border-bottom shadow-sm">
                <div className="container-fluid px-4 py-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                            <Award size={32} />
                        </div>
                        <div>
                            <h1 className="h3 fw-bold mb-0 text-dark">Scholarship Recommendations</h1>
                            <p className="text-muted mb-0 small">Scholarships matched to your profile</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid px-4 py-4">

                {/* Error */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Selection status banner */}
                {selection?.status === 'student_chosen' && (
                    <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
                        <Clock size={18} />
                        <span>Your selection (<strong>{selection.scholarship_name}</strong>) is pending admin review.</span>
                    </div>
                )}
                {selection?.status === 'accepted' && (
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                        <CheckCircle size={18} />
                        <span>🎉 Your scholarship (<strong>{selection.scholarship_name}</strong>) has been approved!</span>
                    </div>
                )}
                {selection?.status === 'rejected' && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
                        <AlertTriangle size={18} />
                        <span>Your selection was not approved. Please choose another scholarship.</span>
                    </div>
                )}

                {/* Evaluation summary */}
                {evaluation && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white fw-semibold">Evaluation Summary</div>
                        <div className="card-body">
                            <div className="row g-3 text-center">
                                {evaluation.gwa !== undefined && (
                                    <div className="col-sm-3">
                                        <div className="text-muted small">GWA</div>
                                        <div className="fw-bold fs-5">{evaluation.gwa}</div>
                                    </div>
                                )}
                                {evaluation.income !== undefined && (
                                    <div className="col-sm-3">
                                        <div className="text-muted small">Income</div>
                                        <div className="fw-bold fs-5">₱{evaluation.income?.toLocaleString()}</div>
                                    </div>
                                )}
                                {evaluation.score !== undefined && (
                                    <div className="col-sm-3">
                                        <div className="text-muted small">Score</div>
                                        <div className="fw-bold fs-5">{evaluation.score?.toFixed(1)}</div>
                                    </div>
                                )}
                                {evaluation.classification && (
                                    <div className="col-sm-3">
                                        <div className="text-muted small">Classification</div>
                                        <span className="badge bg-primary">{evaluation.classification}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length === 0 ? (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <Clock size={48} className="text-muted mb-3" />
                            <h5 className="text-muted mb-2">No scholarship recommendations found.</h5>
                            <p className="text-muted">Please wait for your evaluation to be completed.</p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {recommendations.map((rec) => {
                            const isChosen = selection?.scholarship_id === rec.scholarship_id;
                            const isAccepted = isChosen && selection?.status === 'accepted';
                            const canChoose = selection?.status !== 'accepted';

                            return (
                                <div key={rec.scholarship_id} className="col-lg-6 col-xl-4">
                                    <div className={`card h-100 border-0 shadow-sm ${isChosen ? 'border border-primary' : ''}`}>
                                        {isChosen && (
                                            <div className="card-header bg-primary text-white d-flex align-items-center gap-2 py-2">
                                                <Star size={14} fill="currentColor" />
                                                <small className="fw-semibold">Your Current Selection</small>
                                            </div>
                                        )}
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="card-title fw-bold mb-0 me-2">{rec.name}</h6>
                                                <span className={`badge ${getScoreBadgeClass(rec.score)} rounded-pill`}>
                                                    {rec.score.toFixed(0)}%
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Award size={14} className="text-primary" />
                                                <span className="text-primary fw-semibold small">
                                                    ₱{parseFloat(rec.amount).toLocaleString()}
                                                </span>
                                            </div>

                                            <span className="badge bg-secondary mb-3">{rec.classification}</span>

                                            <p className="text-muted small mb-3" style={{ minHeight: '2.5rem' }}>
                                                {rec.description.length > 120
                                                    ? `${rec.description.substring(0, 120)}…`
                                                    : rec.description}
                                            </p>

                                            {/* Score progress bar */}
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small className="text-muted">Eligibility Score</small>
                                                    <small className="text-muted">{rec.score.toFixed(1)}%</small>
                                                </div>
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div
                                                        className={`progress-bar ${getScoreBadgeClass(rec.score)}`}
                                                        style={{ width: `${rec.score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Eligibility reasons */}
                                            {rec.eligibility_reasons?.length > 0 && (
                                                <ul className="list-unstyled mb-3">
                                                    {rec.eligibility_reasons.map((reason, i) => (
                                                        <li key={i} className="d-flex align-items-start gap-2 small text-muted mb-1">
                                                            <CheckCircle size={12} className="text-success mt-1 flex-shrink-0" />
                                                            {reason}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {canChoose ? (
                                                <button
                                                    className={`btn w-100 btn-sm ${isChosen ? 'btn-outline-primary' : 'btn-primary'}`}
                                                    onClick={() => handleChoose(rec)}
                                                    disabled={submitting}
                                                >
                                                    {isChosen ? 'Change Selection' : 'Choose this Scholarship'}
                                                </button>
                                            ) : isAccepted ? (
                                                <span className="badge bg-success w-100 py-2">✓ Approved</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScholarshipRecommendations;
