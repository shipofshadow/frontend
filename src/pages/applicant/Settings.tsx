import React, { useState } from 'react';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'account' | 'password'>('account');

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow border-0 rounded-4">
                        <div className="card-header border-bottom bg-white">
                            <ul className="nav nav-tabs card-header-tabs">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'account' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('account')}
                                    >
                                        <i className="bi bi-person-gear me-1"></i> Account Info
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('password')}
                                    >
                                        <i className="bi bi-shield-lock me-1"></i> Password
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body">
                            {activeTab === 'account' && (
                                <>
                                    <h5 className="mb-3 text-primary">Update Account Information</h5>
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Email address</label>
                                            <input type="email" className="form-control" placeholder="your@email.com" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Phone number</label>
                                            <input type="tel" className="form-control" placeholder="09xx xxx xxxx" />
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            Save Changes
                                        </button>
                                    </form>
                                </>
                            )}

                            {activeTab === 'password' && (
                                <>
                                    <h5 className="mb-3 text-primary">Change Password</h5>
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Current Password</label>
                                            <input type="password" className="form-control" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">New Password</label>
                                            <input type="password" className="form-control" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Confirm New Password</label>
                                            <input type="password" className="form-control" />
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            Update Password
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
