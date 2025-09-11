import {useEffect, useRef} from "react";
import {DataTable} from "simple-datatables";
import "simple-datatables/dist/style.css";

const QualifiedStudents= () => {
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
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i data-feather="user"></i></div>
                                    Qualified Students
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
                                <th>Eligibility Score</th>
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
                                <th>Eligibility Score</th>
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
                                <td>1</td>
                                <td>
                                    <div className="badge bg-warning rounded-pill">Pending</div>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                                        title="View Details"
                                    >
                                        <i className="fa-regular fa-eye me-2"></i>
                                        View
                                    </button>
                                </td>
                            </tr>


                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default QualifiedStudents;