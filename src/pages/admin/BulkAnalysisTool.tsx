import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
    Upload,
    Users,
    CheckCircle,
    AlertCircle,
    X,
    Info,
    TrendingUp,
    FileSpreadsheet,
    Eye,
    ChevronRight,
    Search, Download
} from 'lucide-react';
import { API_BASE_URL } from "../../config.ts";

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
                'Student ID', 'Name', 'Course', 'Year Level', 'GWA', 'Family Income',
                '4Ps Member', 'IP Affiliation', 'PWD', 'Siblings in College',
                "Father's Occupation", "Mother's Occupation", 'Total Units'
            ],
            [
                'E21-00193', 'Juan Dela Cruz', 'BS Information Technology', '3', '1.25',
                '8000', 'yes', 'no', 'no', '2', 'Farmer', 'Teacher', '25'
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

    // --- Calculations ---
    const scholarshipsList = Array.from(
        new Set(students.flatMap(s => s.recommended_scholarships.map(sch => sch.name)))
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

    // --- Design Implementation ---
    return (
        <div className="min-vh-100 bg-gray-50 text-dark">
            <style>{`
                :root {
                    --primary-color: #2563eb; /* Blue 600 */
                    --primary-hover: #1d4ed8; /* Blue 700 */
                    --bg-page: #f8fafc; /* Slate 50 */
                    --border-color: #e2e8f0; /* Slate 200 */
                    --text-secondary: #64748b; /* Slate 500 */
                    --card-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    --card-hover-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                }

                body {
                    background-color: var(--bg-page);
                }
                
                /* Custom Utils */
                .bg-gray-50 { background-color: var(--bg-page) !important; }
                .text-secondary-custom { color: var(--text-secondary) !important; }
                .border-subtle { border-color: var(--border-color) !important; }
                
                /* Card Styling */
                .custom-card {
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                    transition: all 0.3s ease;
                }
                .custom-card-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--card-hover-shadow);
                    border-color: #cbd5e1;
                }

                /* Upload Area */
                .upload-zone {
                    background-color: #f8fafc;
                    border: 2px dashed #cbd5e1;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                }
                .upload-zone:hover, .upload-zone.drag-active {
                    background-color: #eff6ff;
                    border-color: var(--primary-color);
                }

                /* Table Styling */
                .custom-table thead th {
                    background-color: #f8fafc;
                    border-bottom: 2px solid var(--border-color);
                    color: var(--text-secondary);
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    padding: 1rem;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .custom-table tbody td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    vertical-align: middle;
                }
                .custom-table tbody tr:hover {
                    background-color: #f8fafc;
                }
                
                /* Badges */
                .badge-pill {
                    border-radius: 9999px;
                    padding: 0.35em 0.8em;
                    font-weight: 500;
                }

                /* Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }

                /* Animations */
                .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Modal Backdrop */
                .modal-backdrop.show { opacity: 0.6; background-color: #0f172a; }
                .modal-content { border: none; border-radius: 16px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
                .modal-header { border-bottom: 1px solid var(--border-color); padding: 1.5rem; }
                .modal-body { padding: 1.5rem; }
                .modal-footer { border-top: 1px solid var(--border-color); padding: 1.25rem 1.5rem; }
            `}</style>

            {/* Header */}
            <header className="bg-white border-bottom sticky-top shadow-sm z-20">
                <div className="container-fluid px-4">
                    <div className="d-flex justify-content-between align-items-center py-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h1 className="h5 fw-bold text-dark mb-0">Pre-Qualification Analysis</h1>
                                <p className="text-secondary-custom small mb-0">Bulk Student Data Processing Tool</p>
                            </div>
                        </div>
                        <button
                            className="btn btn-outline-secondary d-flex align-items-center gap-2 btn-sm rounded-pill px-3"
                            onClick={handleDownloadTemplate}
                        >
                            <Download size={16} />
                            <span>Template</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="container-fluid px-4 py-4">
                {/* Main Action Area */}
                <div className="row g-4 mb-5">
                    {/* Left: Upload Section */}
                    <div className="col-lg-5">
                        <div className="custom-card h-100 d-flex flex-column">
                            <div className="p-4 flex-grow-1">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <Upload size={20} className="text-primary" />
                                    Import Data
                                </h5>

                                <div
                                    className={`upload-zone p-5 text-center mb-4 cursor-pointer d-flex flex-column align-items-center justify-content-center ${dragActive ? 'drag-active' : ''}`}
                                    style={{ minHeight: '260px' }}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => !processing && fileInputRef.current?.click()}
                                >
                                    {selectedFile ? (
                                        <div className="fade-in-up w-100">
                                            <div className="bg-white p-3 rounded-3 shadow-sm border mb-3 d-inline-flex align-items-center gap-3">
                                                <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                                                    <FileSpreadsheet className="text-success" size={24} />
                                                </div>
                                                <div className="text-start">
                                                    <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>{selectedFile.name}</div>
                                                    <div className="small text-secondary-custom">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                                                </div>
                                                {!processing && (
                                                    <button
                                                        className="btn btn-link text-danger p-1"
                                                        onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                            {processing ? (
                                                <div className="mt-2">
                                                    <div className="d-flex justify-content-between small mb-1 text-secondary-custom">
                                                        <span>Processing...</span>
                                                        <span className="fw-bold text-dark">{Math.round((progress.current / progress.total) * 100)}%</span>
                                                    </div>
                                                    <div className="progress" style={{ height: '6px' }}>
                                                        <div
                                                            className="progress-bar bg-primary rounded-pill"
                                                            style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-success small fw-medium mt-2">
                                                    <CheckCircle size={14} className="inline me-1" />
                                                    Ready to analyze
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mb-3 bg-white p-3 rounded-circle shadow-sm">
                                                <Upload className="text-primary" size={32} />
                                            </div>
                                            <h6 className="fw-bold mb-1">Click or drag file here</h6>
                                            <p className="text-secondary-custom small mb-0 px-4">
                                                Supports .xlsx or .csv files containing student enrollment data.
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" className="d-none" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                            </div>

                            <div className="p-4 border-top bg-light rounded-bottom-3 d-flex gap-3">
                                <button
                                    className="btn btn-primary w-100 py-2 fw-medium shadow-sm"
                                    onClick={() => selectedFile && !processing && setConfirmAnalyzeModal(true)}
                                    disabled={!selectedFile || processing}
                                >
                                    {processing ? 'Processing...' : 'Run Analysis'}
                                </button>
                                {showResults && !processing && (
                                    <button
                                        className="btn btn-white border bg-white text-dark py-2 px-3 shadow-sm hover-shadow"
                                        onClick={() => setExportModal(true)}
                                        title="Export Results"
                                    >
                                        <Download size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Metrics Dashboard */}
                    <div className="col-lg-7">
                        <div className="row g-3 h-100 align-content-start">
                            {showResults ? (
                                <>
                                    {/* Summary Stats */}
                                    <div className="col-sm-6">
                                        <div className="custom-card p-4 h-100 fade-in-up" style={{ animationDelay: '0ms' }}>
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-blue-50 p-2 rounded-3">
                                                    <Users className="text-primary" size={24} />
                                                </div>
                                                <span className="badge bg-light text-dark border">Total</span>
                                            </div>
                                            <h2 className="display-6 fw-bold mb-1">{summary.total_students}</h2>
                                            <p className="text-secondary-custom small mb-0">Students processed</p>
                                        </div>
                                    </div>

                                    <div className="col-sm-6">
                                        <div className="custom-card p-4 h-100 fade-in-up" style={{ animationDelay: '100ms' }}>
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-green-50 p-2 rounded-3">
                                                    <CheckCircle className="text-success" size={24} />
                                                </div>
                                                <span className="badge bg-success bg-opacity-10 text-success">
                                                    {summary.total_students > 0 ? Math.round((summary.students_with_qualifications / summary.total_students) * 100) : 0}% Rate
                                                </span>
                                            </div>
                                            <h2 className="display-6 fw-bold mb-1">{summary.students_with_qualifications}</h2>
                                            <p className="text-secondary-custom small mb-0">Qualified students</p>
                                        </div>
                                    </div>

                                    <div className="col-sm-6">
                                        <div className="custom-card p-4 h-100 fade-in-up" style={{ animationDelay: '200ms' }}>
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-purple-50 p-2 rounded-3">
                                                    <FileSpreadsheet className="text-info" size={24} />
                                                </div>
                                            </div>
                                            <h2 className="display-6 fw-bold mb-1">{summary.total_qualifications}</h2>
                                            <p className="text-secondary-custom small mb-0">Total scholarship matches</p>
                                        </div>
                                    </div>

                                    <div className="col-sm-6">
                                        <div className="custom-card p-4 h-100 fade-in-up" style={{ animationDelay: '300ms' }}>
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-orange-50 p-2 rounded-3">
                                                    <AlertCircle className="text-warning" size={24} />
                                                </div>
                                                {summary.students_needing_data > 0 && (
                                                    <span className="badge bg-warning bg-opacity-10 text-warning border-warning border-opacity-25">Action Needed</span>
                                                )}
                                            </div>
                                            <h2 className="display-6 fw-bold mb-1">{summary.students_needing_data}</h2>
                                            <p className="text-secondary-custom small mb-0">Students missing key data</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Empty State for Dashboard
                                <div className="col-12 h-100">
                                    <div className="custom-card h-100 d-flex flex-column align-items-center justify-content-center text-center p-5 bg-white border-dashed">
                                        <div className="bg-light p-4 rounded-circle mb-4">
                                            <Info size={40} className="text-secondary-custom opacity-50" />
                                        </div>
                                        <h5 className="fw-bold">No Analysis Yet</h5>
                                        <p className="text-secondary-custom" style={{ maxWidth: '300px' }}>
                                            Upload a student roster file on the left to generate insights and identify scholarship candidates.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4 rounded-3 fade-in-up" role="alert">
                        <AlertCircle className="me-3" size={24} />
                        <div>
                            <div className="fw-bold">Processing Failed</div>
                            <div className="small">{error}</div>
                        </div>
                        <button type="button" className="btn-close ms-auto" onClick={() => setError(null)}></button>
                    </div>
                )}

                {/* Results Section */}
                {showResults && (
                    <div className="fade-in-up" style={{ animationDelay: '400ms' }}>
                        {/* Filter Bar */}
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                            <h5 className="fw-bold mb-0">Detailed Results</h5>
                            <div className="d-flex gap-2">
                                <div className="position-relative">
                                    <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary-custom" />
                                    <select
                                        className="form-select ps-5 bg-white border-subtle shadow-sm"
                                        style={{ width: '220px', fontSize: '0.9rem' }}
                                        value={selectedScholarship}
                                        onChange={(e) => setSelectedScholarship(e.target.value)}
                                    >
                                        <option value="all">All Scholarships</option>
                                        {scholarshipsList.map((name, i) => (
                                            <option key={i} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <select
                                    className="form-select bg-white border-subtle shadow-sm"
                                    style={{ width: '160px', fontSize: '0.9rem' }}
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="high-score">High Score (≥80)</option>
                                    <option value="needs-data">Needs Data</option>
                                </select>
                            </div>
                        </div>

                        {/* Table Card */}
                        <div className="custom-card overflow-hidden">
                            <div className="table-responsive custom-scrollbar" style={{ maxHeight: '650px' }}>
                                <table className="table mb-0 custom-table w-100">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Student Name</th>
                                        <th>Academic Info</th>
                                        <th className="text-end">Income</th>
                                        <th className="text-center">Score</th>
                                        <th>Matched Scholarships</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredResults.length > 0 ? (
                                        filteredResults.map((student, idx) => (
                                            <tr key={idx}>
                                                <td className="text-secondary-custom fw-medium text-nowrap" style={{ fontSize: '0.85rem' }}>
                                                    {student.student_id}
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">{student.name}</div>
                                                </td>
                                                <td>
                                                    <div className="small text-dark fw-medium">{student.course}</div>
                                                    <div className="small text-secondary-custom">
                                                        Year {student.year_level} • GWA: {student.gwa?.toFixed(2) || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="text-end fw-medium text-secondary-custom">
                                                    {student.income !== null ? `₱${student.income.toLocaleString()}` : 'N/A'}
                                                </td>
                                                <td className="text-center">
                                                        <span className={`badge badge-pill ${
                                                            student.eligibility_score >= 80 ? 'bg-success text-white' :
                                                                student.eligibility_score >= 60 ? 'bg-primary text-white' :
                                                                    student.eligibility_score >= 40 ? 'bg-warning text-dark' : 'bg-secondary text-white'
                                                        }`}>
                                                            {student.eligibility_score.toFixed(0)}%
                                                        </span>
                                                    <div className="small text-secondary-custom mt-1" style={{ fontSize: '0.7rem' }}>
                                                        {student.classification}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {student.recommended_scholarships.length > 0 ? (
                                                            student.recommended_scholarships.slice(0, 2).map((sch, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="badge bg-white text-dark border fw-normal"
                                                                    title={sch.name}
                                                                >
                                                                        {sch.name}
                                                                    </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted small fst-italic">None</span>
                                                        )}
                                                        {student.recommended_scholarships.length > 2 && (
                                                            <span className="badge bg-light text-secondary-custom border">+{student.recommended_scholarships.length - 2}</span>
                                                        )}
                                                        {student.has_missing_data && (
                                                            <span className="badge bg-warning bg-opacity-10 text-warning border-warning border-opacity-25" title="Missing Data">!</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-light text-primary border-0 rounded-circle p-2"
                                                        onClick={() => setDetailModal(student)}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-5">
                                                <div className="text-secondary-custom opacity-50 mb-2">
                                                    <Search size={32} />
                                                </div>
                                                <p className="mb-0 fw-medium text-secondary-custom">No results found matching filters</p>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* --- MODALS --- */}

            {/* Confirm Analysis Modal */}
            {confirmAnalyzeModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">Ready to Analyze?</h5>
                                    <button type="button" className="btn-close" onClick={() => setConfirmAnalyzeModal(false)}></button>
                                </div>
                                <div className="modal-body text-center py-4">
                                    <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-block mb-3">
                                        <TrendingUp size={32} />
                                    </div>
                                    <h5 className="mb-2">{selectedFile?.name}</h5>
                                    <p className="text-secondary-custom mb-0 px-4">
                                        This will process all rows against active scholarship requirements using the fuzzy logic engine.
                                    </p>
                                </div>
                                <div className="modal-footer bg-light border-0 d-flex gap-2 justify-content-center pb-4">
                                    <button type="button" className="btn btn-white border px-4" onClick={() => setConfirmAnalyzeModal(false)}>Cancel</button>
                                    <button type="button" className="btn btn-primary px-4 shadow-sm" onClick={handleAnalyze}>Start Analysis</button>
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
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">Export Qualified List</h5>
                                    <button type="button" className="btn-close" onClick={() => setExportModal(false)}></button>
                                </div>
                                <div className="modal-body p-0">
                                    <div className="list-group list-group-flush">
                                        <button
                                            className="list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center"
                                            onClick={() => handleExportQualified()}
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary bg-opacity-10 p-2 rounded">
                                                    <Users size={20} className="text-primary" />
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">All Qualified Students</div>
                                                    <div className="small text-secondary-custom">Combined list of all matches</div>
                                                </div>
                                            </div>
                                            <span className="badge bg-primary rounded-pill">{summary.students_with_qualifications}</span>
                                        </button>

                                        <div className="p-2 bg-light text-uppercase text-secondary-custom fw-bold small px-3">By Specific Scholarship</div>

                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="custom-scrollbar">
                                            {scholarshipsList.map((name, i) => (
                                                <button
                                                    key={i}
                                                    className="list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center"
                                                    onClick={() => handleExportQualified(name)}
                                                >
                                                    <div className="text-truncate me-3" style={{ maxWidth: '280px' }}>
                                                        <span className="fw-medium">{name}</span>
                                                    </div>
                                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill border border-success border-opacity-25">
                                                        {summary.by_scholarship[name].count}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
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
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header bg-white">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {detailModal.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0">{detailModal.name}</h5>
                                            <p className="text-secondary-custom small mb-0 font-monospace">{detailModal.student_id}</p>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close" onClick={() => setDetailModal(null)}></button>
                                </div>
                                <div className="modal-body bg-gray-50">
                                    {/* Score Card */}
                                    <div className="custom-card p-4 mb-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="fw-bold mb-0 text-dark">Eligibility Score</h6>
                                            <span className="badge bg-light text-dark border">{detailModal.classification}</span>
                                        </div>
                                        <div className="progress mb-2" style={{ height: '10px' }}>
                                            <div
                                                className={`progress-bar rounded-pill ${
                                                    detailModal.eligibility_score >= 80 ? 'bg-success' :
                                                        detailModal.eligibility_score >= 60 ? 'bg-primary' :
                                                            detailModal.eligibility_score >= 40 ? 'bg-warning' : 'bg-secondary'
                                                }`}
                                                style={{ width: `${detailModal.eligibility_score}%` }}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-between small text-secondary-custom">
                                            <span>0%</span>
                                            <span className="fw-bold text-dark">{detailModal.eligibility_score.toFixed(1)}%</span>
                                            <span>100%</span>
                                        </div>

                                        {detailModal.has_missing_data && (
                                            <div className="mt-3 p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3 d-flex gap-2 align-items-start">
                                                <AlertCircle size={16} className="text-warning mt-1 flex-shrink-0" />
                                                <div className="small text-dark">
                                                    <strong>Missing Data:</strong> {detailModal.missing_fields.join(', ')}. Update registrar records for better accuracy.
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <div className="custom-card p-4 h-100">
                                                <h6 className="fw-bold mb-3 text-secondary-custom text-uppercase small">Academic Profile</h6>
                                                <div className="d-flex flex-column gap-3">
                                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                                        <span className="text-secondary-custom">Course</span>
                                                        <span className="fw-medium text-end">{detailModal.course}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                                        <span className="text-secondary-custom">Year Level</span>
                                                        <span className="fw-medium">{detailModal.year_level}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between pb-2">
                                                        <span className="text-secondary-custom">GWA</span>
                                                        <span className="fw-bold badge bg-light text-dark border px-3">{detailModal.gwa?.toFixed(2) || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="custom-card p-4 h-100">
                                                <h6 className="fw-bold mb-3 text-secondary-custom text-uppercase small">Socio-Economic</h6>
                                                <div className="d-flex flex-column gap-3">
                                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                                        <span className="text-secondary-custom">Income</span>
                                                        <span className="fw-medium">₱{detailModal.income?.toLocaleString() || 'N/A'}</span>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-2 mt-1">
                                                        {detailModal.is_4ps_member && <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">4Ps Member</span>}
                                                        {detailModal.ip_affiliation && <span className="badge bg-purple-100 text-purple-700 border">IP Member</span>}
                                                        {detailModal.is_pwd && <span className="badge bg-light text-dark border">PWD</span>}
                                                        {(!detailModal.is_4ps_member && !detailModal.ip_affiliation && !detailModal.is_pwd) && (
                                                            <span className="text-secondary-custom small italic">No special status indicators</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold mb-3 px-1">Recommended Scholarships</h6>
                                    {detailModal.recommended_scholarships.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {detailModal.recommended_scholarships.map((sch, i) => (
                                                <div key={i} className="custom-card p-3 d-flex align-items-center gap-3">
                                                    <div className="bg-success bg-opacity-10 p-3 rounded-3 d-flex flex-column align-items-center justify-content-center" style={{ minWidth: '80px' }}>
                                                        <span className="fw-bold text-success">{sch.score}%</span>
                                                        <span className="small text-success" style={{ fontSize: '0.65rem' }}>MATCH</span>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <h6 className="fw-bold mb-1">{sch.name}</h6>
                                                            <span className="badge bg-light text-dark border">₱{sch.amount.toLocaleString()}</span>
                                                        </div>
                                                        <p className="small text-secondary-custom mb-0 line-clamp-2">{sch.description}</p>
                                                    </div>
                                                    <ChevronRight size={18} className="text-gray-300" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 border rounded-3 border-dashed">
                                            <p className="text-secondary-custom mb-0">No specific scholarship recommendations found based on current criteria.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer bg-white">
                                    <button type="button" className="btn btn-light w-100" onClick={() => setDetailModal(null)}>Close Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BulkAnalysisTool;