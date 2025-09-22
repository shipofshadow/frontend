// src/pages/admin/AdminApplicationViewMock.jsx
import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {useAuth} from "../../context/AuthContext.tsx";

const MOCK_DB = {
  // keyed by application id for quick demo
  101: {
    application: {
      application_id: 101,
      user_id: 501,
      semesterid: 1,
      status: 'pending',
      remarks: 'First-time applicant',
      submittedat: '2025-07-28T12:07:07',
      createdat: '2025-07-28T12:07:07',
      updatedat: '2025-07-28T12:07:07',
      username: 'e21-00123',
      email: 'test',
      role: 'student',
      student_no: 'E21-00123',
      lastname: 'test',
      firstname: 'tset',
      middlename: 'test',
      nameextension: '',
      gender: 'Female',
      birthdate: '2003-05-09',
      contactnumber: '09123456789',
      semester_name: '1st Semester'
    },
    education: {
      id: 3001,
      yearlevel: 4,
      totalunits: 20,
      enrollmentstatus: 'Enrolled',
      campusid: 10,
      campus_name: 'Tagudin',
      departmentid: 22,
      department_name: 'College of Arts and Sciences',
      courseid: 77,
      course_name: 'Bachelor of Arts in English Language',
      major: null
    },
    files: [
      { id: 9001, filetype: 'itr', filepath: '13itr.pdf', createdat: '2025-07-28T12:10:00' },
      { id: 9002, filetype: 'grades', filepath: '13gradessem1.png', createdat: '2025-07-28T12:12:00' },
      { id: 9003, filetype: 'birth_certificate', filepath: 'bcert-501.pdf', createdat: '2025-07-28T12:15:00' }
    ],
    grades: [
      { id: 8001, subjectname: 'Math', grade: 2.0, units: 3 },
      { id: 8002, subjectname: 'English', grade: 1.5, units: 3 },
      { id: 8003, subjectname: 'Research Methods', grade: 1.75, units: 3 }
    ],
    evaluation: {
      id: 7001,
      gwa: 1.75,
      totalunits: 20,
      income: 18000,
      score: 84.2,
      classification: 'High Priority',
      status: 'auto_recommended',
      adminreviewed: 0,
      createdat: '2025-07-28T12:20:00',
      updatedat: '2025-07-28T12:20:00'
    },
    recommendations: [
      { id: 6101, scholarshipid: 31, scholarship_name: 'Merit Scholarship A', score: 88.5, classification: 'Merit' },
      { id: 6102, scholarshipid: 12, scholarship_name: 'Needs-Based B', score: 83.0, classification: 'Needs' }
    ]
  }
};

export default function ViewApplication() {
  const { id } = useParams(); // pretend this is the application id, e.g., 101
  const { isAdmin, isAuthenticated } = useAuth();

  const initial = useMemo(() => MOCK_DB[Number(id)] ?? null, [id]);
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState(initial?.application?.status ?? '');
  const [remarks, setRemarks] = useState(initial?.application?.remarks ?? '');
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated || !isAdmin) {
    return <div className="container py-4">Access denied (mock).</div>;
  }
  if (!data) {
    return <div className="container py-4">Application not found (mock).</div>;
  }

  const { application, education, files, grades, evaluation, recommendations } = data;

  const updateStatus = async (newStatus) => {
    setSaving(true);
    // Mock update: just update local state after a small delay
    setTimeout(() => {
      setStatus(newStatus);
      setData(prev => prev ? ({
        ...prev,
        application: { ...prev.application, status: newStatus, remarks }
      }) : prev);
      setSaving(false);
    }, 500);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Application #{application.application_id} (Mock)</h4>
        <Link to="/admin/applications" className="btn btn-outline-secondary btn-sm">Back</Link>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">Applicant</div>
            <div className="card-body">
              <div><strong>Name:</strong> {application.lastname}, {application.firstname} {application.middlename || ''}</div>
              <div><strong>Student No:</strong> {application.student_no}</div>
              <div><strong>Email:</strong> {application.email}</div>
              <div><strong>Semester:</strong> {application.semester_name}</div>
              <div><strong>Submitted:</strong> {dayjs(application.submittedat).format('YYYY-MM-DD HH:mm')}</div>
              <div><strong>Status:</strong> <span className={`badge text-bg-${status==='approved'?'success':status==='denied'?'danger':'secondary'}`}>{status}</span></div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">Education</div>
            <div className="card-body">
              {education ? (
                <>
                  <div><strong>Campus:</strong> {education.campus_name}</div>
                  <div><strong>Department:</strong> {education.department_name}</div>
                  <div><strong>Course:</strong> {education.course_name}{education.major ? ` (${education.major})` : ''}</div>
                  <div><strong>Year Level:</strong> {education.yearlevel}</div>
                  <div><strong>Total Units:</strong> {education.totalunits}</div>
                  <div><strong>Enrollment:</strong> {education.enrollmentstatus}</div>
                </>
              ) : <div>No education record (mock).</div>}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header d-flex justify-content-between">
              <span>Grades</span>
              <span className="text-muted small">{grades?.length || 0} items</span>
            </div>
            <div className="card-body">
              {grades?.length ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr><th>Subject</th><th>Grade</th><th>Units</th></tr>
                    </thead>
                    <tbody>
                      {grades.map(g => (
                        <tr key={g.id}>
                          <td>{g.subjectname}</td>
                          <td>{g.grade}</td>
                          <td>{g.units}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div>No grades (mock).</div>}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">Files</div>
            <div className="card-body">
              {files?.length ? (
                <ul className="list-group">
                  {files.map(f => (
                    <li key={f.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{f.filetype.toUpperCase()}</span>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => alert(`Preview mock: ${f.filepath}`)}>View</button>
                    </li>
                  ))}
                </ul>
              ) : <div>No files (mock).</div>}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-header">Evaluation</div>
            <div className="card-body">
              {evaluation ? (
                <>
                  <div><strong>GWA:</strong> {evaluation.gwa}</div>
                  <div><strong>Units:</strong> {evaluation.totalunits}</div>
                  <div><strong>Income:</strong> {evaluation.income}</div>
                  <div><strong>Score:</strong> {evaluation.score}</div>
                  <div><strong>Class:</strong> {evaluation.classification}</div>
                  <div><strong>Eval Status:</strong> {evaluation.status}</div>
                </>
              ) : <div>No evaluation (mock).</div>}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">Recommendations</div>
            <div className="card-body">
              {recommendations?.length ? (
                <ul className="list-group">
                  {recommendations.map(r => (
                    <li key={r.id} className="list-group-item">
                      <div className="fw-semibold">{r.scholarship_name}</div>
                      <div className="small text-muted">Score: {r.score} • {r.classification}</div>
                    </li>
                  ))}
                </ul>
              ) : <div>No recommendations (mock).</div>}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">Admin Actions</div>
            <div className="card-body">
              <div className="mb-2">
                <textarea className="form-control" rows="3" placeholder="Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-success btn-sm" disabled={saving} onClick={() => updateStatus('approved')}>Approve</button>
                <button className="btn btn-danger btn-sm" disabled={saving} onClick={() => updateStatus('denied')}>Reject</button>
                <button className="btn btn-secondary btn-sm" disabled={saving} onClick={() => updateStatus('pending')}>Mark Pending</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
