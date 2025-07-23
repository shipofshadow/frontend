import React from 'react';
import { CheckCircle, XCircle, Hourglass } from 'lucide-react';

const sampleApplications = [
    {
        id: 1,
        scholarship: 'CHED-TES',
        status: 'Under Evaluation',
        submittedAt: '2025-06-25',
    },
    {
        id: 2,
        scholarship: 'DOST',
        status: 'Qualified',
        submittedAt: '2025-05-12',
    },
];

const statusBadge = (status: string) => {
    switch (status) {
        case 'Qualified':
            return (
                <span className="badge bg-success d-flex align-items-center gap-1 px-3 py-2">
                    <CheckCircle size={16} /> {status}
                </span>
            );
        case 'Rejected':
            return (
                <span className="badge bg-danger d-flex align-items-center gap-1 px-3 py-2">
                    <XCircle size={16} /> {status}
                </span>
            );
        default:
            return (
                <span className="badge bg-warning text-dark d-flex align-items-center gap-1 px-3 py-2">
                    <Hourglass size={16} /> {status}
                </span>
            );
    }
};

const Applications: React.FC = () => {
    return (
        <div className="container py-5">
            <div className="card shadow rounded-4 border-0">
                <div className="card-header bg-white border-bottom rounded-top-4">
                    <h4 className="mb-0 d-flex align-items-center">
                        <i className="bi bi-award me-2 text-primary"></i>
                        My Scholarship Applications
                    </h4>
                </div>
                <div className="card-body">
                    {sampleApplications.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Scholarship</th>
                                    <th>Status</th>
                                    <th>Submitted On</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sampleApplications.map((app, index) => (
                                    <tr key={app.id}>
                                        <td>{index + 1}</td>
                                        <td>{app.scholarship}</td>
                                        <td>{statusBadge(app.status)}</td>
                                        <td>{app.submittedAt}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-folder-x fs-1 mb-3"></i>
                            <p className="mb-0">No scholarship applications found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Applications;
