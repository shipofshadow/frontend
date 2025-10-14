import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
    Upload,
    Download,
    FileText,
    Users,
    CheckCircle,
    AlertCircle,
    X,
    Info,
    TrendingUp,
    FileSpreadsheet,
    Eye
} from 'lucide-react';
import {API_BASE_URL} from "../../config.ts";

interface Student {
    student_id: string;
    name: string;
    course: string;
    year_level: string;
    gwa: number | null;
    income: number | null;
    is_4ps_member?: boolean;
    ip_affiliation?: boolean;
    is_pwd?: boolean;
    siblings_in_college?: number;
    father_occupation?: string;
    mother_occupation?: string;
    total_units?: number;
}

interface Scholarship {
    scholarship_id: number;
    name: string;
    description: string;
    amount: number;
    score: number;
    classification: string;
}

interface StudentResult extends Student {
    eligibility_score: number;
    classification: string;
    recommended_scholarships: Scholarship[];
    has_missing_data: boolean;
    missing_fields: string[];
}

const BulkAnalysisTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [students, setStudents] = useState<StudentResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedScholarship, setSelectedScholarship] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Modal states
    const [confirmAnalyzeModal, setConfirmAnalyzeModal] = useState(false);
    const [exportModal, setExportModal] = useState(false);
    const [detailModal, setDetailModal] = useState<StudentResult | null>(null);

    const analyzeStudent = async (student: Student): Promise<StudentResult> => {
        try {
            const formData = {
                student_id: student.student_id,
                name: student.name,
                course: student.course,
                year_level: student.year_level,
                gwa: student.gwa || 0,
                income: student.income || 0,
                is_4ps_member: student.is_4ps_member || false,
                ip_affiliation: student.ip_affiliation || false,
                is_pwd: student.is_pwd || false,
                siblings_in_college: student.siblings_in_college || 0,
                father_occupation: student.father_occupation || '',
                mother_occupation: student.mother_occupation || '',
                total_units: student.total_units || 0
            };

            const response = await fetch(`${API_BASE_URL}/api/prequalify/bulk_prequalify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();

            const missing_fields: string[] = [];
            if (!student.gwa || student.gwa === 0) missing_fields.push('GWA');
            if (!student.income || student.income === 0) missing_fields.push('Family Income');

            return {
                ...student,
                eligibility_score: result.score || 0,
                classification: result.classification || 'Unknown',
                recommended_scholarships: result.recommended_scholarships || [],
                has_missing_data: missing_fields.length > 0,
                missing_fields
            };
        } catch (err) {
            console.error('Error analyzing student:', err);
            return {
                ...student,
                eligibility_score: 0,
                classification: 'Error',
                recommended_scholarships: [],
                has_missing_data: true,
                missing_fields: ['API Error']
            };
        }
    };

    const parseFile = async (file: File): Promise<Student[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const students: Student[] = jsonData.map((row: any) => {
                        const parseBoolean = (val: any): boolean => {
                            if (val === undefined || val === null || val === '') return false;
                            const str = String(val).toLowerCase().trim();
                            return str === 'yes' || str === 'true' || str === '1';
                        };

                        const parseNumber = (val: any): number | null => {
                            if (val === undefined || val === null || val === '') return null;
                            const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
                            return isNaN(num) ? null : num;
                        };

                        return {
                            student_id: String(row['Student ID'] || row['student_id'] || ''),
                            name: String(row['Name'] || row['name'] || ''),
                            course: String(row['Course'] || row['course'] || ''),
                            year_level: String(row['Year Level'] || row['year_level'] || row['Year'] || ''),
                            gwa: parseNumber(row['GWA'] || row['gwa']),
                            income: parseNumber(row['Family Income'] || row['income'] || row['Income']),
                            is_4ps_member: parseBoolean(row['4Ps Member'] || row['is_4ps_member']),
                            ip_affiliation: parseBoolean(row['IP Affiliation'] || row['ip_affiliation']),
                            is_pwd: parseBoolean(row['PWD'] || row['is_pwd']),
                            siblings_in_college: parseInt(row['Siblings in College'] || row['siblings_in_college'] || '0'),
                            father_occupation: String(row["Father's Occupation"] || row['father_occupation'] || ''),
                            mother_occupation: String(row["Mother's Occupation"] || row['mother_occupation'] || ''),
                            total_units: parseInt(row['Total Units'] || row['total_units'] || '0')
                        };
                    });

                    resolve(students);
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const clearFile = () => {
        setSelectedFile(null);
        setShowResults(false);
        setStudents([]);
        setProgress({ current: 0, total: 0 });
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setConfirmAnalyzeModal(false);
        setProcessing(true);
        setProgress({ current: 0, total: 0 });
        setError(null);

        try {
            const studentData = await parseFile(selectedFile);

            if (studentData.length === 0) {
                throw new Error('No student data found in file');
            }

            setProgress({ current: 0, total: studentData.length });

            const results: StudentResult[] = [];

            const batchSize = 5;
            for (let i = 0; i < studentData.length; i += batchSize) {
                const batch = studentData.slice(i, i + batchSize);
                const batchResults = await Promise.all(
                    batch.map(student => analyzeStudent(student))
                );
                results.push(...batchResults);
                setProgress({ current: results.length, total: studentData.length });
            }

            setStudents(results);
            setShowResults(true);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`Error processing file: ${errorMsg}`);
            console.error('Processing error:', err);
        } finally {
            setProcessing(false);
        }
    };

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            [
                'Student ID',
                'Name',
                'Course',
                'Year Level',
                'GWA',
                'Family Income',
                '4Ps Member',
                'IP Affiliation',
                'PWD',
                'Siblings in College',
                "Father's Occupation",
                "Mother's Occupation",
                'Total Units'
            ],
            [
                'E21-00193',
                'Juan Dela Cruz',
                'BS Information Technology',
                '3',
                '1.25',
                '8000',
                'yes',
                'no',
                'no',
                '2',
                'Farmer',
                'Teacher',
                '25'
            ]
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'ischolar_bulk_template.xlsx');
    };

    const handleExportQualified = (scholarshipName?: string) => {
        const filtered = scholarshipName
            ? students.filter(s => s.recommended_scholarships.some(sch => sch.name === scholarshipName))
            : students.filter(s => s.recommended_scholarships.length > 0);

        if (filtered.length === 0) {
            alert('No qualified students to export');
            return;
        }

        const exportData = filtered.map(s => ({
            'Student ID': s.student_id,
            'Name': s.name,
            'Course': s.course,
            'Year Level': s.year_level,
            'GWA': s.gwa,
            'Family Income': s.income,
            'Eligibility Score': s.eligibility_score.toFixed(2),
            'Classification': s.classification,
            'Qualified Scholarships': s.recommended_scholarships.map(sch => sch.name).join(', '),
            'Total Scholarship Value': s.recommended_scholarships.reduce((sum, sch) => sum + parseFloat(String(sch.amount)), 0)
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Qualified Students');
        XLSX.writeFile(wb, `qualified_students_${scholarshipName || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`);
        setExportModal(false);
    };

    const scholarshipsList = Array.from(
        new Set(
            students.flatMap(s => s.recommended_scholarships.map(sch => sch.name))
        )
    );

    const summary = {
        total_students: students.length,
        students_with_qualifications: students.filter(s => s.recommended_scholarships.length > 0).length,
        total_qualifications: students.reduce((sum, s) => sum + s.recommended_scholarships.length, 0),
        students_needing_data: students.filter(s => s.has_missing_data).length,
        by_scholarship: scholarshipsList.reduce((acc, name) => {
            const studentsWithScholarship = students.filter(s =>
                s.recommended_scholarships.some(sch => sch.name === name)
            );
            const scholarship = studentsWithScholarship[0]?.recommended_scholarships.find(sch => sch.name === name);
            acc[name] = {
                count: studentsWithScholarship.length,
                grant_amount: scholarship?.amount || 0
            };
            return acc;
        }, {} as Record<string, { count: number; grant_amount: number }>)
    };

    const filteredResults = students.filter(s => {
        if (selectedScholarship !== 'all') {
            if (!s.recommended_scholarships.some(sch => sch.name === selectedScholarship)) return false;
        }

        if (filterStatus === 'high-score' && s.eligibility_score < 80) return false;
        if (filterStatus === 'needs-data' && !s.has_missing_data) return false;

        return true;
    });

    const qualificationRate = summary.total_students > 0
        ? Math.round((summary.students_with_qualifications / summary.total_students) * 100)
        : 0;

    return (
        <>
            <style>{`
                .drag-active { 
                    border-color: #0d6efd !important; 
                    background-color: rgba(13, 110, 253, 0.05) !important; 
                }
                .upload-area { 
                    transition: all 0.2s ease; 
                    cursor: pointer; 
                }
                .upload-area:hover { 
                    background-color: #f8f9fa; 
                    border-color: #ced4da; 
                }
                .fade-in { 
                    animation: fadeIn 0.25s ease-in; 
                }
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(8px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .stat-card { 
                    transition: transform 0.15s, box-shadow 0.15s; 
                    border: 1px solid #e9ecef;
                }
                .stat-card:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
                }
                .progress-bar { 
                    transition: width 0.3s ease; 
                }
                .table thead th {
                    position: sticky;
                    top: 0;
                    background: #fff;
                    z-index: 10;
                    box-shadow: 0 2px 2px -1px rgba(0,0,0,0.05);
                }
                .table tbody tr:nth-child(odd) {
                    background-color: #fcfcfd;
                }
                .modal-backdrop.show {
                    opacity: 0.5;
                }
                .modal.show {
                    display: block;
                }
                .modal-dialog {
                    margin-top: 100px;
                }
            `}</style>

            <div className="min-vh-100 bg-light">
                {/* Header */}
                <div className="bg-white shadow-sm border-bottom">
                    <div className="container-fluid px-4">
                        <div className="d-flex justify-content-between align-items-center py-4">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-success bg-opacity-10 rounded-3">
                                    <TrendingUp className="text-success" size={32} />
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold text-dark">Scholarship Pre-Qualification Analysis</h1>
                                    <p className="text-muted mb-0 small">Upload registrar data to identify qualified students proactively</p>
                                </div>
                            </div>
                            <button className="btn btn-outline-primary d-flex align-items-center" onClick={handleDownloadTemplate}>
                                <Download size={16} className="me-2" />
                                Download Template
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container-fluid px-4 py-4">
                    {/* Info Card */}
                    <div className="row g-4 mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex align-items-start">
                                        <div className="me-3 p-2 bg-info bg-opacity-10 rounded">
                                            <Info className="text-info" size={20} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-3">How This Works</h6>
                                            <div className="row g-3 small">
                                                <div className="col-md-4">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-success rounded-circle me-2 d-flex align-items-center justify-content-center" style={{width: '24px', height: '24px'}}>1</span>
                                                        <strong>Upload Enrollment Data</strong>
                                                    </div>
                                                    <p className="text-muted mb-0 ms-4">Get student data from registrar (ID, GWA, Course, Income, etc.)</p>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-success rounded-circle me-2 d-flex align-items-center justify-content-center" style={{width: '24px', height: '24px'}}>2</span>
                                                        <strong>Automatic Analysis</strong>
                                                    </div>
                                                    <p className="text-muted mb-0 ms-4">System checks all students against active scholarships using fuzzy logic</p>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-success rounded-circle me-2 d-flex align-items-center justify-content-center" style={{width: '24px', height: '24px'}}>3</span>
                                                        <strong>Reach Out to Qualified</strong>
                                                    </div>
                                                    <p className="text-muted mb-0 ms-4">Export lists and contact qualified students who haven't applied</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="row g-4 mb-4">
                            <div className="col-12">
                                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    <div className="d-flex align-items-center">
                                        <AlertCircle className="me-2" size={20} />
                                        <div>
                                            <strong>Error:</strong> {error}
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload & Overview */}
                    <div className="row g-4 mb-4">
                        {/* Upload Card */}
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="card-title mb-0 fw-bold d-flex align-items-center">
                                        <Upload className="me-2 text-primary" size={20} />
                                        Upload Student Data
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div
                                        className={`upload-area border border-2 border-dashed rounded-3 p-5 text-center mb-4 ${dragActive ? 'drag-active' : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => !processing && fileInputRef.current?.click()}
                                    >
                                        <Upload className="text-muted mb-3" size={48} />
                                        {selectedFile ? (
                                            <div className="fade-in">
                                                <div className="d-flex align-items-center justify-content-center mb-2">
                                                    <FileText className="text-success me-2" size={20} />
                                                    <span className="fw-medium">{selectedFile.name}</span>
                                                    {!processing && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger ms-2"
                                                            onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-muted small mb-0">Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        ) : (
                                            <>
                                                <h6 className="fw-medium mb-2">Drop a file here or click to browse</h6>
                                                <p className="text-muted small mb-0">Excel or CSV with student enrollment data</p>
                                            </>
                                        )}
                                    </div>

                                    <input ref={fileInputRef} type="file" className="d-none" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />

                                    {processing && (
                                        <div className="mb-3 fade-in">
                                            <div className="d-flex justify-content-between mb-2">
                                                <small className="text-muted fw-medium">Processing students...</small>
                                                <small className="text-primary fw-bold">{progress.current} / {progress.total}</small>
                                            </div>
                                            <div className="progress" style={{ height: '10px' }}>
                                                <div
                                                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                                                    style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary flex-fill d-flex align-items-center justify-content-center"
                                            onClick={() => selectedFile && !processing && setConfirmAnalyzeModal(true)}
                                            disabled={!selectedFile || processing}
                                        >
                                            <TrendingUp size={18} className="me-2" />
                                            {processing ? 'Analyzing...' : 'Analyze Qualifications'}
                                        </button>

                                        {showResults && !processing && (
                                            <button
                                                className="btn btn-outline-success d-flex align-items-center"
                                                onClick={() => setExportModal(true)}
                                            >
                                                <Download size={16} className="me-2" />
                                                Export
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overview Card */}
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="card-title mb-0 fw-bold">Analysis Overview</h5>
                                </div>
                                <div className="card-body">
                                    {showResults ? (
                                        <div className="fade-in">
                                            <div className="row g-3 mb-3">
                                                <div className="col-6">
                                                    <div className="stat-card p-3 bg-white rounded-3">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <Users className="text-primary" size={28} />
                                                            <h2 className="mb-0 fw-bold text-dark">{summary.total_students}</h2>
                                                        </div>
                                                        <small className="text-muted fw-medium">Total Students</small>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="stat-card p-3 bg-white rounded-3">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <CheckCircle className="text-success" size={28} />
                                                            <h2 className="mb-0 fw-bold text-dark">{summary.students_with_qualifications}</h2>
                                                        </div>
                                                        <small className="text-muted fw-medium">Have Qualifications</small>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="stat-card p-3 bg-white rounded-3">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <FileSpreadsheet className="text-info" size={28} />
                                                            <h2 className="mb-0 fw-bold text-dark">{summary.total_qualifications}</h2>
                                                        </div>
                                                        <small className="text-muted fw-medium">Total Qualifications</small>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="stat-card p-3 bg-white rounded-3">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <AlertCircle className="text-warning" size={28} />
                                                            <h2 className="mb-0 fw-bold text-dark">{summary.students_needing_data}</h2>
                                                        </div>
                                                        <small className="text-muted fw-medium">Need More Data</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="alert alert-success border-0 mb-0">
                                                <div className="d-flex align-items-center">
                                                    <CheckCircle size={18} className="me-2" />
                                                    <small className="mb-0">
                                                        <strong>{qualificationRate}%</strong> of students qualify for at least one scholarship. Consider reaching out!
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            <TrendingUp size={56} className="mb-3 opacity-25" />
                                            <p className="mb-0 fw-medium">Upload a file to see analysis results</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scholarship Breakdown */}
                    {showResults && scholarshipsList.length > 0 && (
                        <div className="row g-4 mb-4">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm fade-in">
                                    <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0 fw-bold">Qualified Students by Scholarship</h5>
                                        <span className="badge bg-primary">{scholarshipsList.length} Scholarships</span>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            {scholarshipsList.map((name, index) => {
                                                const schData = summary.by_scholarship[name];
                                                return (
                                                    <div key={index} className="col-md-6 col-lg-4 col-xl-3">
                                                        <div className="card border h-100">
                                                            <div className="card-body">
                                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                                    <h6 className="fw-bold mb-0">{name}</h6>
                                                                    <span className="badge bg-success fs-6">{schData.count}</span>
                                                                </div>
                                                                <p className="text-muted small mb-3">
                                                                    <strong>Grant:</strong> ₱{Number(schData.grant_amount).toLocaleString()}
                                                                </p>
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                                                                    onClick={() => handleExportQualified(name)}
                                                                    disabled={schData.count === 0}
                                                                >
                                                                    <Download size={14} className="me-1" />
                                                                    Export List
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    {showResults && (
                        <div className="row g-4">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm fade-in">
                                    <div className="card-header bg-white border-bottom">
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                            <h5 className="card-title mb-0 fw-bold">Qualified Students Details</h5>

                                            <div className="d-flex gap-2 flex-wrap align-items-center">
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: '200px' }}
                                                    value={selectedScholarship}
                                                    onChange={(e) => setSelectedScholarship(e.target.value)}
                                                >
                                                    <option value="all">All Scholarships</option>
                                                    {scholarshipsList.map((name, i) => (
                                                        <option key={i} value={name}>{name}</option>
                                                    ))}
                                                </select>

                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: '180px' }}
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                >
                                                    <option value="all">All Students</option>
                                                    <option value="high-score">High Score (≥80)</option>
                                                    <option value="needs-data">Needs Data</option>
                                                </select>

                                                <span className="badge bg-primary fs-6 px-3 py-2">{filteredResults.length} results</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                            <table className="table table-hover mb-0 align-middle">
                                                <thead className="table-light">
                                                <tr>
                                                    <th className="border-0 fw-bold">Student ID</th>
                                                    <th className="border-0 fw-bold">Name</th>
                                                    <th className="border-0 fw-bold">Course</th>
                                                    <th className="border-0 fw-bold text-center">Year</th>
                                                    <th className="border-0 fw-bold text-center">GWA</th>
                                                    <th className="border-0 fw-bold text-end">Income</th>
                                                    <th className="border-0 fw-bold text-center">Score</th>
                                                    <th className="border-0 fw-bold">Qualifications</th>
                                                    <th className="border-0 fw-bold text-center">Action</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {filteredResults.length > 0 ? (
                                                    filteredResults.map((student, idx) => (
                                                        <tr key={idx}>
                                                            <td className="fw-medium">{student.student_id}</td>
                                                            <td>{student.name}</td>
                                                            <td className="small">{student.course}</td>
                                                            <td className="text-center">{student.year_level}</td>
                                                            <td className="text-center">
                                                                {student.gwa !== null ? (
                                                                    <span className="badge bg-light text-dark border">{student.gwa.toFixed(2)}</span>
                                                                ) : (
                                                                    <span className="text-muted small">N/A</span>
                                                                )}
                                                            </td>
                                                            <td className="text-end small">
                                                                {student.income !== null ? `₱${student.income.toLocaleString()}` : <span className="text-muted">N/A</span>}
                                                            </td>
                                                            <td className="text-center">
                                                                <div>
                                                                    <span className={`badge ${
                                                                        student.eligibility_score >= 80 ? 'bg-success' :
                                                                            student.eligibility_score >= 60 ? 'bg-primary' :
                                                                                student.eligibility_score >= 40 ? 'bg-warning' :
                                                                                    'bg-secondary'
                                                                    }`}>
                                                                        {student.eligibility_score.toFixed(0)}%
                                                                    </span>
                                                                    <div className="small text-muted mt-1">{student.classification}</div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex flex-wrap gap-1">
                                                                    {student.recommended_scholarships.length > 0 ? (
                                                                        student.recommended_scholarships.slice(0, 2).map((sch, i) => (
                                                                            <span
                                                                                key={i}
                                                                                className="badge bg-success small"
                                                                                title={`Score: ${sch.score}% - ₱${Number(sch.amount).toLocaleString()}`}
                                                                            >
                                                                                {sch.name}
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-muted small">None</span>
                                                                    )}
                                                                    {student.recommended_scholarships.length > 2 && (
                                                                        <span className="badge bg-info small">+{student.recommended_scholarships.length - 2}</span>
                                                                    )}
                                                                    {student.has_missing_data && (
                                                                        <span
                                                                            className="badge bg-warning small"
                                                                            title={`Missing: ${student.missing_fields.join(', ')}`}
                                                                        >
                                                                            Missing Data
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="text-center">
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => setDetailModal(student)}
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={9} className="text-center text-muted py-5">
                                                            <AlertCircle size={48} className="mb-2 opacity-25" />
                                                            <p className="mb-0">No students match the selected filters.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Analyze Modal */}
            {confirmAnalyzeModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show" tabIndex={-1} style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Confirm Analysis</h5>
                                    <button type="button" className="btn-close" onClick={() => setConfirmAnalyzeModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p className="mb-3">You are about to analyze <strong>{selectedFile?.name}</strong> for scholarship qualification.</p>
                                    <div className="alert alert-info border-0 mb-0">
                                        <small className="d-flex align-items-start">
                                            <Info size={16} className="me-2 mt-1" />
                                            <span>This process will check each student against all active scholarships using fuzzy logic. Large files may take a few minutes.</span>
                                        </small>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light" onClick={() => setConfirmAnalyzeModal(false)}>Cancel</button>
                                    <button type="button" className="btn btn-primary d-flex align-items-center" onClick={handleAnalyze}>
                                        <TrendingUp size={16} className="me-2" />
                                        Start Analysis
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Export Modal */}
            {exportModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show" tabIndex={-1} style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Export Qualified Students</h5>
                                    <button type="button" className="btn-close" onClick={() => setExportModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">Select which students to export:</p>
                                    <div className="list-group">
                                        <button
                                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                            onClick={() => handleExportQualified()}
                                        >
                                            <div>
                                                <strong>All Qualified Students</strong>
                                                <div className="small text-muted">Students with at least one qualification</div>
                                            </div>
                                            <span className="badge bg-primary">{summary.students_with_qualifications}</span>
                                        </button>
                                        {scholarshipsList.map((name, i) => {
                                            const count = summary.by_scholarship[name].count;
                                            return (
                                                <button
                                                    key={i}
                                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                                    onClick={() => handleExportQualified(name)}
                                                >
                                                    <div>
                                                        <strong>{name}</strong>
                                                        <div className="small text-muted">Qualified for this scholarship only</div>
                                                    </div>
                                                    <span className="badge bg-success">{count}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light" onClick={() => setExportModal(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Student Detail Modal */}
            {detailModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show" tabIndex={-1} style={{ display: 'block' }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content shadow">
                                <div className="modal-header border-0">
                                    <div>
                                        <h5 className="modal-title fw-bold mb-1">{detailModal.name}</h5>
                                        <p className="text-muted small mb-0">{detailModal.student_id}</p>
                                    </div>
                                    <button type="button" className="btn-close" onClick={() => setDetailModal(null)}></button>
                                </div>
                                <div className="modal-body">
                                    {/* Personal Info */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3 text-primary">Personal Information</h6>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <small className="text-muted d-block">Course</small>
                                                <strong>{detailModal.course}</strong>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Year Level</small>
                                                <strong>{detailModal.year_level}</strong>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">GWA</small>
                                                <strong>{detailModal.gwa !== null ? detailModal.gwa.toFixed(2) : 'N/A'}</strong>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Family Income</small>
                                                <strong>{detailModal.income !== null ? `₱${detailModal.income.toLocaleString()}` : 'N/A'}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3 text-primary">Additional Details</h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {detailModal.is_4ps_member && <span className="badge bg-info">4Ps Member</span>}
                                            {detailModal.ip_affiliation && <span className="badge bg-info">IP Affiliation</span>}
                                            {detailModal.is_pwd && <span className="badge bg-info">PWD</span>}
                                            {detailModal.siblings_in_college! > 0 && (
                                                <span className="badge bg-info">{detailModal.siblings_in_college} Siblings in College</span>
                                            )}
                                        </div>
                                        <div className="row g-3 mt-2">
                                            <div className="col-6">
                                                <small className="text-muted d-block">Father's Occupation</small>
                                                <strong>{detailModal.father_occupation || 'N/A'}</strong>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Mother's Occupation</small>
                                                <strong>{detailModal.mother_occupation || 'N/A'}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Eligibility */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3 text-primary">Eligibility Analysis</h6>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="flex-grow-1">
                                                <div className="progress" style={{ height: '24px' }}>
                                                    <div
                                                        className={`progress-bar ${
                                                            detailModal.eligibility_score >= 80 ? 'bg-success' :
                                                                detailModal.eligibility_score >= 60 ? 'bg-primary' :
                                                                    detailModal.eligibility_score >= 40 ? 'bg-warning' : 'bg-secondary'
                                                        }`}
                                                        style={{ width: `${detailModal.eligibility_score}%` }}
                                                    >
                                                        <strong>{detailModal.eligibility_score.toFixed(1)}%</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="badge bg-light text-dark border ms-3">{detailModal.classification}</span>
                                        </div>

                                        {detailModal.has_missing_data && (
                                            <div className="alert alert-warning border-0">
                                                <div className="d-flex align-items-start">
                                                    <AlertCircle size={18} className="me-2 mt-1" />
                                                    <div>
                                                        <strong>Missing Data:</strong>
                                                        <div className="small">{detailModal.missing_fields.join(', ')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Scholarships */}
                                    <div>
                                        <h6 className="fw-bold mb-3 text-primary">Qualified Scholarships</h6>
                                        {detailModal.recommended_scholarships.length > 0 ? (
                                            <div className="list-group">
                                                {detailModal.recommended_scholarships.map((sch, i) => (
                                                    <div key={i} className="list-group-item">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <strong>{sch.name}</strong>
                                                            <span className="badge bg-success">{sch.score}% match</span>
                                                        </div>
                                                        <p className="text-muted small mb-2">{sch.description}</p>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="badge bg-light text-dark border">{sch.classification}</span>
                                                            <strong className="text-success">₱{Number(sch.amount).toLocaleString()}</strong>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="alert alert-secondary border-0 mb-0">
                                                <small>No scholarship qualifications found.</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setDetailModal(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default BulkAnalysisTool;
