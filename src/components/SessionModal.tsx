const SessionModal = () => {
    return (
        <div className="modal show fade" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-danger">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Session Expired</h5>
                    </div>
                    <div className="modal-body">
                        <p>Your session has expired. Please log in again to continue.</p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger" onClick={() => window.location.href = "/login"}>
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionModal;
