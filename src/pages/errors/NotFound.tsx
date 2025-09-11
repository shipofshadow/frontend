import React, { useEffect } from 'react';
import feather from 'feather-icons';

const NotFound: React.FC = () => {

    useEffect(() => {
       feather.replace();
     }, []);
   
  return (
            <div id="layoutError">
            <div id="layoutError_content">
                <main>
                    <div className="container-xl px-4">
                        <div className="row justify-content-center">
                            <div className="col-lg-6">
                                <div className="text-center mt-4">
                                    <img className="img-fluid p-4" src="https://sb-admin-pro.startbootstrap.com/assets/img/illustrations/404-error.svg" alt="" />
                                    <p className="lead">This requested URL was not found on this server.</p>
                                    <a className="text-arrow-icon" href="/">
                                        <i className="ms-0 me-1" data-feather="arrow-left"></i>
                                        Return to Dashboard
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <div id="layoutError_footer">
                <footer className="footer-admin mt-auto footer-light">
                    <div className="container-xl px-4">
                        <div className="row">
                            <div className="col-md-6 small">Copyright © Your Website 2021</div>
                            <div className="col-md-6 text-md-end small">
                                <a href="#!">Privacy Policy</a>
                                ·
                                <a href="#!">Terms &amp; Conditions</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>

  );
};

export default NotFound;
