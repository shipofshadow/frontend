import { useEffect, useState } from 'react';
import {useAuth} from "../../context/AuthContext.tsx";
import {API_BASE_URL} from "../../config.ts";
import type {Applicant} from "../../interfaces/applicant.ts";


export default function ApplicationsList() {
    const { token, isAuthenticated, isLoading: authLoading, isStudent } = useAuth();
    const [apps, setApps] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    async function fetchApps() {
        try {
            setErr(null);
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/profile/applications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `Failed to load applications (${res.status})`);
            }
            const data = await res.json();
            setApps(Array.isArray(data) ? data : (data.items || []));
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isAuthenticated && token) fetchApps();
    }, [isAuthenticated, token]);

    if (authLoading) {
        return <div className="container py-3">Loading authentication…</div>;
    }

    if (!isAuthenticated) {
        return <div className="container py-3">Please sign in to view applications.</div>;
    }

    return (
        <div className="container py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">My Applications</h5>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={fetchApps}>Refresh</button>
                    {isStudent && (
                        <a className="btn btn-primary btn-sm" href="/apply">New Application</a>
                    )}
                </div>
            </div>

            {err && (
                <div className="alert alert-danger mb-3" role="alert">
                    {err}
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover align-middle">
                    <thead className="table-light">
                    <tr>
                        <th style={{width: 56}}>#</th>
                        <th>Status</th>
                        <th>GWA</th>
                        <th>Eligibility</th>
                        <th>Submitted</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="text-center py-4">Loading applications…</td>
                        </tr>
                    ) : apps.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-4">No applications found.</td>
                        </tr>
                    ) : (
                        apps.map((a, idx) => (
                            <tr key={a.id || idx}>
                                <td>{idx + 1}</td>
                                <td><span className="badge text-bg-secondary">{a.status || '-'}</span></td>
                                <td>{a.gwa ?? '-'}</td>
                                <td>{typeof a.eligibility_score === 'number' ? `${Math.round(a.eligibility_score)}%` : '-'}</td>
                                <td>{a.created_at ? new Date(a.created_at).toLocaleString() : '-'}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
