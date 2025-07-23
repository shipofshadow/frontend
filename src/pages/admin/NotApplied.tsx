import { useEffect, useRef, useState } from 'react';
import { DataTable } from 'simple-datatables';
import "simple-datatables/dist/style.css";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import axios from 'axios';
import { API_BASE_URL } from "../../config.ts";
import { useAuth } from "../../context/AuthContext.tsx";

interface NotAppliedStudent {
    student_id: number;
    student_number: string;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    gender: string;
    birth_date: string;
    username: string;
    email: string;
}

const NotApplied = () => {
    const tableRef = useRef(null);
    const [students, setStudents] = useState<NotAppliedStudent[]>([]);
    const { token, user } = useAuth();

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/applicants/not-applied`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            await Swal.fire('Error', 'Failed to load students.', 'error');
        }
    };

    useEffect(() => {
        if (user?.role !== 'admin') {
            Swal.fire('Access Denied', 'Admin access required.', 'error');
            return;
        }
        fetchStudents();
    }, []);

    useEffect(() => {
        if (tableRef.current && students.length > 0) {
            new DataTable(tableRef.current, {
                perPage: 5,
                searchable: true,
                sortable: true,
            });
        }
    }, [students]);

    return (
        <div>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i className="far fa-user-check"></i></div>
                                    Potential Applicants
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-end">
                        <button className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addModal">
                            Add New Student
                        </button>
                    </div>

                    <div className="card-body">
                        <table ref={tableRef} id="datatablesSimple" className="table table-striped table-bordered">
                            <thead>
                            <tr>
                                <th>Student Number</th>
                                <th>Last Name</th>
                                <th>First Name</th>
                                <th>Middle Name</th>
                                <th>Gender</th>
                                <th>Birthdate</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student.student_id}>
                                        <td>{student.student_number}</td>
                                        <td>{student.last_name}</td>
                                        <td>{student.first_name}</td>
                                        <td>{student.middle_name || 'N/A'}</td>
                                        <td>{student.gender}</td>
                                        <td>{new Date(student.birth_date).toLocaleDateString()}</td>
                                        <td>{student.username}</td>
                                        <td>{student.email}</td>
                                        <td>
                                            <button type="button" className="btn btn-sm btn-outline-danger" title="Archive">
                                                <i className="far fa-archive"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="text-center text-muted py-3">
                                        No students found.
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

export default NotApplied;
