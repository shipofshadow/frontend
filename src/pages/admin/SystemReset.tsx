import { useState, useEffect, useCallback } from 'react';
import {
    AlertTriangle,
    RefreshCw,
    Trash2,
    CheckCircle,
    XCircle,
    Database,
    Users,
    FileText,
    Shield,
    Settings,
    GraduationCap,
    Calendar,
    Bell
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from '../../config.ts';

interface ResetPreview {
    success: boolean;
    will_delete: {
        applications?: number;
        students?: number;
        users?: number;
        notifications?: number;
        announcements?: number;
        scholarships?: number;
        academic_years?: number;
        semesters?: number;
        [key: string]: number | undefined;
    };
    will_preserve: {
        admin_users?: number;
        fuzzy_variables?: number;
        configs?: number;
    };
}

const SystemReset = () => {
    const [preview, setPreview] = useState<ResetPreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmText, setConfirmText] = useState('');
    const [confirmChecked, setConfirmChecked] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const { token, isBitress } = useAuth();

    const fetchPreview = useCallback(async () => {
        if (!token) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/system/reset/preview`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error('Access denied. Bitress role required.');
                }
                throw new Error('Failed to fetch reset preview');
            }
            
            const data: ResetPreview = await res.json();
            if (data.success) {
                setPreview(data);
            } else {
                throw new Error('Failed to load preview data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPreview();
    }, [fetchPreview]);

    const handleReset = async () => {
        if (!confirmChecked || confirmText !== 'RESET') {
            await Swal.fire({
                icon: 'warning',
                title: 'Confirmation Required',
                text: 'Please check the confirmation box and type "RESET" to proceed.',
            });
            return;
        }

        const firstConfirm = await Swal.fire({
            title: '⚠️ Final Warning',
            html: `
                <div class="text-start">
                    <p class="text-danger fw-bold">You are about to reset the entire system!</p>
                    <p>This will permanently delete:</p>
                    <ul>
                        <li><strong>${preview?.will_delete.users || 0}</strong> users</li>
                        <li><strong>${preview?.will_delete.applications || 0}</strong> applications</li>
                        <li><strong>${preview?.will_delete.students || 0}</strong> students</li>
                        <li><strong>${preview?.will_delete.scholarships || 0}</strong> scholarships</li>
                        <li><strong>${totalRecordsToDelete}</strong> total records</li>
                    </ul>
                    <p class="text-success"><strong>Preserved:</strong> ${preview?.will_preserve.admin_users || 0} admin users, ${preview?.will_preserve.fuzzy_variables || 0} fuzzy variables, ${preview?.will_preserve.configs || 0} configs</p>
                    <p class="text-danger"><strong>This action cannot be undone!</strong></p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Reset Everything',
            cancelButtonText: 'Cancel',
        });

        if (!firstConfirm.isConfirmed) return;

        setResetting(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/system/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    confirmation: 'RESET'
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'System reset failed');
            }

            setResetSuccess(true);
            setConfirmText('');
            setConfirmChecked(false);
            
            await Swal.fire({
                icon: 'success',
                title: 'System Reset Complete',
                text: 'The system has been reset successfully. You will be logged out.',
                timer: 3000,
                showConfirmButton: false,
            });

            // Redirect to login page after reset
            window.location.href = '/login';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'System reset failed');
            await Swal.fire({
                icon: 'error',
                title: 'Reset Failed',
                text: err instanceof Error ? err.message : 'An error occurred during reset',
            });
        } finally {
            setResetting(false);
        }
    };

    const isConfirmValid = confirmChecked && confirmText === 'RESET';

    // Calculate total records from will_delete
    const totalRecordsToDelete = preview 
        ? Object.values(preview.will_delete).reduce((sum, val) => (sum || 0) + (val || 0), 0) 
        : 0;

    if (!isBitress) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <Shield size={64} className="text-danger mb-3" />
                    <h3 className="text-danger">Access Denied</h3>
                    <p className="text-muted">This feature is only accessible to Bitress administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-gray-50 text-dark">
            {/* Header */}
            <header className="bg-danger text-white border-bottom sticky-top shadow-sm" style={{ zIndex: 20 }}>
                <div className="container-fluid px-4">
                    <div className="d-flex justify-content-between align-items-center py-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-white text-danger p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm">
                                <Trash2 size={24} />
                            </div>
                            <div>
                                <h1 className="h5 fw-bold text-white mb-0">System Reset</h1>
                                <p className="text-white-50 small mb-0">⚡ Bitress-Only Feature</p>
                            </div>
                        </div>
                        <button
                            className="btn btn-outline-light d-flex align-items-center gap-2 btn-sm px-3"
                            onClick={fetchPreview}
                            disabled={loading}
                        >
                            <RefreshCw size={16} className={loading ? 'spin' : ''} />
                            <span className="d-none d-sm-inline">Refresh</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="container-fluid px-4 py-4">
                {/* Warning Banner */}
                <div className="alert alert-danger border-danger mb-4">
                    <div className="d-flex align-items-start gap-3">
                        <AlertTriangle size={24} className="flex-shrink-0 mt-1" />
                        <div>
                            <h5 className="alert-heading mb-2">⚠️ Danger Zone</h5>
                            <p className="mb-0">
                                This page allows you to completely reset the system database. 
                                <strong> All data will be permanently deleted.</strong> This action cannot be undone.
                                Only proceed if you are absolutely certain.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                        <XCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success State */}
                {resetSuccess && (
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                        <CheckCircle size={20} />
                        <span>System reset completed successfully!</span>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading reset preview...</p>
                    </div>
                ) : preview ? (
                    <div className="row g-4">
                        {/* Preview Statistics */}
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <Database size={20} className="text-danger" />
                                        Data to be Deleted
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="p-3 bg-light rounded text-center">
                                                <Users size={32} className="text-primary mb-2" />
                                                <h3 className="mb-0 fw-bold">{preview.will_delete.users || 0}</h3>
                                                <small className="text-muted">Users</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 bg-light rounded text-center">
                                                <GraduationCap size={32} className="text-info mb-2" />
                                                <h3 className="mb-0 fw-bold">{preview.will_delete.students || 0}</h3>
                                                <small className="text-muted">Students</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 bg-light rounded text-center">
                                                <FileText size={32} className="text-success mb-2" />
                                                <h3 className="mb-0 fw-bold">{preview.will_delete.applications || 0}</h3>
                                                <small className="text-muted">Applications</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 bg-light rounded text-center">
                                                <Bell size={32} className="text-warning mb-2" />
                                                <h3 className="mb-0 fw-bold">{preview.will_delete.notifications || 0}</h3>
                                                <small className="text-muted">Notifications</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 bg-light rounded text-center">
                                                <Database size={32} className="text-secondary mb-2" />
                                                <h3 className="mb-0 fw-bold">{preview.will_delete.scholarships || 0}</h3>
                                                <small className="text-muted">Scholarships</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 bg-light rounded text-center">
                                                <Calendar size={32} className="text-dark mb-2" />
                                                <h3 className="mb-0 fw-bold">{preview.will_delete.academic_years || 0}</h3>
                                                <small className="text-muted">Academic Years</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total to delete */}
                                    <div className="mt-4 p-3 bg-danger bg-opacity-10 rounded border border-danger">
                                        <div className="d-flex align-items-center gap-2 text-danger">
                                            <AlertTriangle size={20} />
                                            <strong>Total Records to Delete: {totalRecordsToDelete}</strong>
                                        </div>
                                    </div>

                                    {/* Preserved items */}
                                    <div className="mt-3 p-3 bg-success bg-opacity-10 rounded border border-success">
                                        <h6 className="text-success fw-bold mb-2 d-flex align-items-center gap-2">
                                            <Settings size={18} />
                                            Data to be Preserved
                                        </h6>
                                        <div className="row g-2">
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Shield size={16} className="text-success" />
                                                    <span className="small">{preview.will_preserve.admin_users || 0} Admin Users</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Database size={16} className="text-success" />
                                                    <span className="small">{preview.will_preserve.fuzzy_variables || 0} Fuzzy Variables</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Settings size={16} className="text-success" />
                                                    <span className="small">{preview.will_preserve.configs || 0} Configs</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Panel */}
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-danger border-2">
                                <div className="card-header bg-danger text-white py-3">
                                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <Shield size={20} />
                                        Confirmation Required
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-4">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="confirmCheck"
                                                checked={confirmChecked}
                                                onChange={(e) => setConfirmChecked(e.target.checked)}
                                                disabled={resetting}
                                            />
                                            <label className="form-check-label" htmlFor="confirmCheck">
                                                I understand that this action will <strong className="text-danger">permanently delete all data</strong> and cannot be undone.
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            Type <code className="text-danger">RESET</code> to confirm:
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${confirmText === 'RESET' ? 'border-success' : ''}`}
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                            placeholder="Type RESET"
                                            disabled={resetting}
                                        />
                                    </div>

                                    <button
                                        className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
                                        onClick={handleReset}
                                        disabled={!isConfirmValid || resetting}
                                    >
                                        {resetting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" />
                                                Resetting System...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={18} />
                                                Reset System
                                            </>
                                        )}
                                    </button>

                                    {!isConfirmValid && (
                                        <p className="text-muted small text-center mt-2 mb-0">
                                            Complete both confirmations to enable reset
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </main>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SystemReset;
