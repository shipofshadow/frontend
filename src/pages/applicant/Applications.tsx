import React from 'react';

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

const Applications: React.FC = () => {
    return (
        <div className="container py-5">
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-white border-bottom">
                    <h4 className="mb-0">
                        <i className="bi bi-table me-2 text-primary"></i>
                        My Scholarship Applications
                    </h4>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
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
                                    <td>
                      <span
                          className={`badge ${
                              app.status === 'Qualified'
                                  ? 'bg-success'
                                  : app.status === 'Rejected'
                                      ? 'bg-danger'
                                      : 'bg-warning text-dark'
                          }`}
                      >
                        {app.status}
                      </span>
                                    </td>
                                    <td>{app.submittedAt}</td>
                                </tr>
                            ))}
                            {sampleApplications.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted">
                                        No applications found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Applications;
