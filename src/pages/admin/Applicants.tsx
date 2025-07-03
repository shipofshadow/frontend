import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';

interface Applicant {
    id: number;
    name: string;
    email: string;
    course: string;
    status: string;
}

const initialData: Applicant[] = [
    { id: 1, name: 'Juan Dela Cruz', email: 'juan@example.com', course: 'BSIT', status: 'Pending' },
    { id: 2, name: 'Maria Santos', email: 'maria@example.com', course: 'BSCS', status: 'Approved' },
    { id: 3, name: 'Jose Rizal', email: 'jose@example.com', course: 'BSECE', status: 'Rejected' },
];

const Applicants = () => {
    const [data, setData] = useState<Applicant[]>(initialData);
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<Applicant>({
        id: 0, name: '', email: '', course: '', status: 'Pending',
    });

    const resetForm = () => {
        setFormData({ id: 0, name: '', email: '', course: '', status: 'Pending' });
        setEditIndex(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (index: number) => {
        setFormData(data[index]);
        setEditIndex(index);
        setShowModal(true);
    };

    const handleDelete = (index: number) => {
        if (confirm('Are you sure you want to delete this applicant?')) {
            const updated = [...data];
            updated.splice(index, 1);
            setData(updated);
        }
    };

    const handleSubmit = () => {
        if (editIndex !== null) {
            // Update
            const updated = [...data];
            updated[editIndex] = formData;
            setData(updated);
        } else {
            // Add
            const newId = Math.max(0, ...data.map((d) => d.id)) + 1;
            setData([...data, { ...formData, id: newId }]);
        }
        setShowModal(false);
    };

    const columns: ColumnDef<Applicant>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'course', header: 'Course' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: info => {
                const status = info.getValue() as string;
                const badgeClass = status === 'Approved'
                    ? 'bg-success'
                    : status === 'Rejected'
                        ? 'bg-danger'
                        : 'bg-warning text-dark';
                return <span className={`badge ${badgeClass}`}>{status}</span>;
            }
        },
        {
            header: 'Actions',
            cell: info => {
                const rowIndex = info.row.index;
                return (
                    <>
                        <button className="btn btn-sm btn-primary me-2" onClick={() => openEditModal(rowIndex)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(rowIndex)}>Delete</button>
                    </>
                );
            }
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i data-feather="user"></i></div>
                                    Application Management
                                </h1>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-success" onClick={openAddModal}>Add Applicant</button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

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
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Applicants;
