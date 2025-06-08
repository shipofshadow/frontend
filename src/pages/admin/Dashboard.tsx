const Dashboard = () => {
    return (
        <main>
   <header className="page-header page-header-dark bg-gradient-primary-to-secondary pb-10">
                        <div className="container-xl px-4">
                            <div className="page-header-content pt-4">
                                <div className="row align-items-center justify-content-between">
                                    <div className="col-auto mt-4">
                                        <h1 className="page-header-title">
                                            <div className="page-header-icon"><i data-feather="activity"></i></div>
                                            Dashboard
                                        </h1>
                                        <div className="page-header-subtitle">Example dashboard overview and content summary</div>
                                    </div>
                                    <div className="col-12 col-xl-auto mt-4">
                                        <div className="input-group input-group-joined border-0" >
                                            <span className="input-group-text"><i className="text-primary" data-feather="calendar"></i></span>
                                            <input className="form-control ps-0 pointer" id="litepickerRangePlugin" placeholder="Select date range..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
        </main>
    );
}

export default Dashboard;