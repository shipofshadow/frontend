import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ActivateAccount: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code = searchParams.get('code');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState<string>('Verifying your activation code...');
    const [manualCode, setManualCode] = useState<string>('');

    const activateWithCode = async (activationCode: string) => {
        if (!activationCode.trim()) {
            setStatus('error');
            setMessage('Please enter a valid activation code.');
            return;
        }

        setStatus('loading');
        setMessage('Activating your account...');

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/activate?code=${encodeURIComponent(activationCode.trim())}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'Your account has been successfully activated!');
            } else {
                setStatus('error');
                setMessage(data.message || 'Activation failed. The code may be invalid or expired.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Could not reach the activation service.');
        }
    };

    useEffect(() => {
        if (code) {
            activateWithCode(code);
        } else {
            setStatus('error');
            setMessage('No activation code was provided in the link.');
        }
    }, [code]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
            <div className="card shadow-sm border-0 rounded-4" style={{ maxWidth: '480px', width: '100%' }}>
                <div className="card-body p-4 p-md-5 text-center">
                    <div className="mb-4">
                        <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill">
                            Account Activation
                        </span>
                    </div>

                    {status === 'loading' && (
                        <div className="py-4">
                            <Loader2 size={56} className="text-primary animate-spin mb-3 mx-auto" />
                            <h4 className="fw-bold text-dark mb-2">Activating Account</h4>
                            <p className="text-muted mb-0">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-2">
                            <div className="rounded-circle bg-success-subtle d-inline-flex p-3 mb-3 text-success">
                                <CheckCircle size={48} />
                            </div>
                            <h4 className="fw-bold text-dark mb-2">Account Activated!</h4>
                            <p className="text-muted mb-4">{message}</p>
                            <button
                                className="btn btn-primary btn-lg w-100 d-inline-flex align-items-center justify-content-center gap-2 rounded-3"
                                onClick={() => navigate('/login')}
                            >
                                Proceed to Login <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-2">
                            <div className="rounded-circle bg-danger-subtle d-inline-flex p-3 mb-3 text-danger">
                                <XCircle size={48} />
                            </div>
                            <h4 className="fw-bold text-dark mb-2">Activation Issue</h4>
                            <p className="text-muted mb-4">{message}</p>

                            <div className="mb-3 text-start">
                                <label className="form-label small fw-semibold text-muted">Enter Activation Code Manually</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Paste activation code..."
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={() => activateWithCode(manualCode)}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>

                            <div className="d-flex gap-2 justify-content-center mt-4">
                                <button
                                    className="btn btn-outline-secondary rounded-3"
                                    onClick={() => navigate('/login')}
                                >
                                    Go to Login
                                </button>
                                <button
                                    className="btn btn-outline-primary rounded-3"
                                    onClick={() => navigate('/register')}
                                >
                                    Register Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivateAccount;
