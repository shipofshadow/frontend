import { useEffect, useRef } from 'react';
import { DataTable } from 'simple-datatables';
import "simple-datatables/dist/style.css";

const ApplicantsTable = () => {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      new DataTable(tableRef.current, {
        perPage: 5,
        searchable: true,
        sortable: true,
      });
    }
  }, []);

  return (
    <div>
         <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i className="far fa-user-check"></i></div>
                                    Application Management
                                </h1>
                            </div>
                          
                        </div>
                    </div>
                </div>
            </header>
                    <div className="container-xl">
                        <div className="card mb-4">
                        <div className="card-header">
                            <div className="d-flex justify-content-end">
                                <button className="btn btn-success btn-sm" onClick={() => alert('Add New Applicant')}>Add New Applicant</button>
                            </div>
                        </div>
                            <div className="card-body">
                                <table ref={tableRef} id="datatablesSimple">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Course</th>
                                            <th>Campus</th>
                                            <th>Birth Date</th>
                                            <th>Address</th>
                                            <th>Date Applied</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tfoot>
                                        <tr>
                                            <th>Name</th>
                                            <th>Course</th>
                                            <th>Campus</th>
                                            <th>Birth Date</th>
                                            <th>Address</th>
                                            <th>Date Applied</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </tfoot>
                                    <tbody>
                                    <tr>
                                        <td>Garrett Winters</td>
                                        <td>Accountant</td>
                                        <td>Tokyo</td>
                                        <td>63</td>
                                        <td>2011/07/25</td>
                                        <td>2011/07/25</td>
                                        <td>
                                            <div className="badge bg-warning rounded-pill">Pending</div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-1">
                                                {/* Dropdown for ellipsis */}
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-datatable btn-icon btn-transparent-dark"
                                                        id="actionDropdown"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                        title="Actions"
                                                    >
                                                        <i className="fa-solid fa-ellipsis-vertical"></i>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="actionDropdown">
                                                        <li>
                                                            <button className="dropdown-item">
                                                                <i className="fa-regular fa-eye me-2"></i> View
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item">
                                                                <i className="fa-regular fa-pen-to-square me-2"></i> Edit
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>

                                                {/* Trash button with tooltip */}
                                                <button
                                                    className="btn btn-datatable btn-icon btn-transparent-dark"
                                                    data-bs-toggle="tooltip"
                                                    data-bs-placement="top"
                                                    title="Delete"
                                                >
                                                    <i className="fa-regular fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>

                                    </tr>


                                    </tbody>
                                </table>
                            </div>
        </div>
    </div>
  </div>
  );
};

export default ApplicantsTable;
