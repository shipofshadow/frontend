import React, { useEffect, useState } from 'react';
import ScholarshipBreakdownCharts from "../../components/charts/ScholarshipBreakdownCharts";
import { Clock, Calendar, BookOpen } from "lucide-react"; 
import { API_BASE_URL } from '../../config';
const Dashboard = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentSemester, setCurrentSemester] = useState('Loading...');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/active-academic-term`)
            .then(response => response.json())
            .then(data => setCurrentSemester(data.formatted)
            );
            
        const timer = setInterval(() => setCurrentDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const day = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const date = currentDate.toLocaleDateString('en-US', options);
    const time = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <>
            {/* Header */}
            <header className="page-header page-header-dark bg-gradient-primary-to-secondary pb-10">
                <div className="container-xl px-4">
                    <div className="page-header-content pt-4">
                        <div className="row align-items-center justify-content-between">
                            <div className="col-auto mt-4">
                                <h1 className="page-header-title d-flex align-items-center">
                                    <div className="page-header-icon me-2"><i data-feather="award"></i></div>
                                    Dashboard
                                </h1>
                                <div className="page-header-subtitle">Overview</div>
                            </div>
                        </div>
                        <div className="row small text-white mt-0">
                            <div className="col-md-6 mb-2 mb-md-0 d-flex align-items-center gap-2 flex-wrap">
                                <Calendar size={16} />
                                <span className="fw-500">{day}</span> · 
                                <span>{date}</span> · 
                                <Clock size={16} />
                                <span>{time}</span>
                            </div>
                            <div className="col-md-6 text-md-end d-flex align-items-center justify-content-md-end gap-2">
                                <BookOpen size={16} />
                                <span>{ currentSemester }</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="container-xl px-4 mt-n10">
                <div className="row">
                    {/* Applicants Cards */}
                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-start-lg border-start-info h-100">
                            <div className="card-body d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="small fw-bold text-info mb-1">Total Applicants</div>
                                    <div className="h5 mb-0"><span id="total_applicants">1,248</span></div>
                                </div>
                                <div className="ms-2"><i className="fas fa-users fa-2x text-gray-200"></i></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-start-lg border-start-success h-100">
                            <div className="card-body d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="small fw-bold text-success mb-1">Qualified Applicants</div>
                                    <div className="h5 mb-0"><span id="qualified_applicants">976</span></div>
                                </div>
                                <div className="ms-2"><i className="fas fa-check-circle fa-2x text-gray-200"></i></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-start-lg border-start-warning h-100">
                            <div className="card-body d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="small fw-bold text-warning mb-1">Pending Applications</div>
                                    <div className="h5 mb-0"><span id="pending_applications">135</span></div>
                                </div>
                                <div className="ms-2"><i className="fas fa-hourglass-half fa-2x text-gray-200"></i></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-start-lg border-start-danger h-100">
                            <div className="card-body d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="small fw-bold text-danger mb-1">Disqualified</div>
                                    <div className="h5 mb-0"><span id="disqualified_applicants">112</span></div>
                                </div>
                                <div className="ms-2"><i className="fas fa-times-circle fa-2x text-gray-200"></i></div>
                            </div>
                        </div>
                    </div>
                </div>

                <ScholarshipBreakdownCharts />

                {/* Charts & Reports */}
                <div className="row">
                    {/* Application Trends */}
                    <div className="col-lg-8 mb-4">
                        <div className="card">
                            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                                <span>Application Trends</span>
                                <select className="form-control w-auto" id="year_filter" defaultValue="2025">
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                            <div className="card-body">
                                <div id="applicationsChart" className="chart-area" style={{ height: 300 }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Pie Charts */}
                    <div className="col-lg-4 mb-4">
                        <div className="card card-header-actions mb-4">
                            <div className="card-header">Qualification Distribution</div>
                            <div className="card-body">
                                <canvas id="qualificationPieChart"></canvas>
                            </div>
                        </div>

                        <div className="card card-header-actions">
                            <div className="card-header">Course Distribution</div>
                            <div className="card-body">
                                <canvas id="coursePieChart"></canvas>
                            </div>
                        </div>
                    </div>

                    {/* Reports & Logs */}
                    <div className="col-lg-4 mb-4">
                        <div className="card">
                            <div className="card-header">Reports</div>
                            <div className="list-group list-group-flush small">
                                <a href="/admin/applicant-logs" className="list-group-item list-group-item-action">
                                    <i className="fas fa-file-alt fa-fw text-primary me-2"></i>
                                    Applicant Logs
                                </a>
                                <a href="/admin/export-reports" className="list-group-item list-group-item-action">
                                    <i className="fas fa-download fa-fw text-success me-2"></i>
                                    Export Reports
                                </a>
                            </div>
                            <div className="card-footer border-top-0">
                                <a className="stretched-link" href="/admin/reports">
                                    <div className="text-xs d-flex align-items-center justify-content-between">
                                        View Full Reports <i className="fas fa-long-arrow-alt-right"></i>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Future Features */}
                    <div className="col-lg-8 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="text-muted">Upcoming Features</h6>
                                <ul className="mb-0">
                                    <li>Fuzzy logic tuning dashboard</li>
                                    <li>Scholarship recommendation engine</li>
                                    <li>Application tracking notifications</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
