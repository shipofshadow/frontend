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
<<<<<<< HEAD

            <div className="container-fluid px-4">
                <div className="card mb-4">
                    <div className="card-header">Applicants</div>
                    <div className="card-body table-responsive">
                        <table className="table table-bordered">
                            <thead className="table-light">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </thead>
                            <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && (
                                <tr><td colSpan={columns.length} className="text-center">No data</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editIndex !== null ? 'Edit' : 'Add'} Applicant</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-2">
                                    <label>Student_ID</label>
                                    <input className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="mb-2">
                                    <label>Email</label>
                                    <input className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="mb-2">
                                    <label>Course</label>
                                    <input className="form-control" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} />
                                </div>
                                <div className="mb-2">
                                    <label>Status</label>
                                    <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option>Pending</option>
                                        <option>Approved</option>
                                        <option>Rejected</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSubmit}>
                                    {editIndex !== null ? 'Update' : 'Add'} Applicant
                                </button>
=======
                    <div className="container-xl">
                        <div className="card mb-4">
                        <div className="card-header">
                            <div className="d-flex justify-content-end">
                                <button className="btn btn-success btn-sm" onClick={() => alert('Add New Applicant')}>Add New Applicant</button>
>>>>>>> bdd07267b184537706a1db265b2763e9aacea33a
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
