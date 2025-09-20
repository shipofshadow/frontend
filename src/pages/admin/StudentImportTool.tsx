import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Users, CheckCircle, AlertCircle, X, Info } from 'lucide-react';

interface StudentRecord {
    name: string;
    studentId: string;
    email: string;
    gpa: number;
    familyIncome: number;
    status?: 'valid' | 'error' | 'warning';
    errors?: string[];
}

const StudentImportTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [previewData, setPreviewData] = useState<StudentRecord[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [importStats, setImportStats] = useState({ valid: 0, errors: 0, warnings: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sample data for preview/demonstration
    const samplePreviewData: StudentRecord[] = [
        { name: "Juan Dela Cruz", studentId: "2024-001", email: "juan.delacruz@university.edu", gpa: 3.8, familyIncome: 25000, status: 'valid' },
        { name: "Maria Santos", studentId: "2024-002", email: "maria.santos@university.edu", gpa: 3.2, familyIncome: 45000, status: 'valid' },
        { name: "Jose Rizal", studentId: "2024-003", email: "invalid-email", gpa: 2.8, familyIncome: 15000, status: 'error', errors: ['Invalid email format'] },
        { name: "Anna Reyes", studentId: "", email: "anna.reyes@university.edu", gpa: 3.9, familyIncome: 35000, status: 'warning', errors: ['Missing student ID'] },
    ];

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelection(file);
        }
    };

    const handleFileSelection = (file: File) => {
        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            alert('Please select a valid Excel (.xlsx, .xls) or CSV file.');
            return;
        }

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB.');
            return;
        }

        setSelectedFile(file);
        setShowPreview(false);
        setUploadStatus('idle');
    };

    const handlePreview = () => {
        if (!selectedFile) {
            alert('Please select a file first.');
            return;
        }

        // Simulate file parsing and validation
        setUploadStatus('uploading');

        setTimeout(() => {
            setPreviewData(samplePreviewData);
            setImportStats({
                valid: samplePreviewData.filter(record => record.status === 'valid').length,
                errors: samplePreviewData.filter(record => record.status === 'error').length,
                warnings: samplePreviewData.filter(record => record.status === 'warning').length
            });
            setShowPreview(true);
            setUploadStatus('success');
        }, 2000);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file first.');
            return;
        }

        if (showPreview && importStats.errors > 0) {
            const confirm = window.confirm(
                `There are ${importStats.errors} records with errors. Do you want to import only the valid records?`
            );
            if (!confirm) return;
        }

        setUploadStatus('uploading');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Simulate API call
            setTimeout(() => {
                setUploadStatus('success');
                alert(`Successfully imported ${importStats.valid} student records!`);
                // Reset form
                setSelectedFile(null);
                setShowPreview(false);
                setPreviewData([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 2000);

        } catch  {
            setUploadStatus('error');
            alert('Upload failed. Please try again.');
        }
    };

    const handleDownloadSample = () => {
        // In a real app, this would download an actual file
        const csvContent = `Name,Student ID,Email,GPA,Family Income
Juan Dela Cruz,2024-001,juan.delacruz@university.edu,3.8,25000
Maria Santos,2024-002,maria.santos@university.edu,3.2,45000
Jose Rizal,2024-003,jose.rizal@university.edu,2.8,15000`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student-import-template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'valid': return <CheckCircle className="text-success" size={16} />;
            case 'error': return <AlertCircle className="text-danger" size={16} />;
            case 'warning': return <AlertCircle className="text-warning" size={16} />;
            default: return null;
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setShowPreview(false);
        setPreviewData([]);
        setUploadStatus('idle');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <style>{`
        .drag-active {
          border-color: #0d6efd !important;
          background-color: rgba(13, 110, 253, 0.05) !important;
        }
        .upload-area {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .upload-area:hover {
          background-color: #f8f9fa;
          border-color: #6c757d;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .progress-bar {
          transition: width 0.3s ease;
        }
      `}</style>

            <div className="min-vh-100 bg-light">
                {/* Header */}
                <div className="bg-white shadow-sm border-bottom">
                    <div className="container-fluid px-4">
                        <div className="d-flex justify-content-between align-items-center py-4">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-primary bg-opacity-10 rounded-3">
                                    <Users className="text-primary" size={32} />
                                </div>
                                <div>
                                    <h1 className="h2 mb-1 fw-bold text-dark">Import Students</h1>
                                    <p className="text-muted mb-0">Upload student data from Excel or CSV files</p>
                                </div>
                            </div>
                            <button
                                className="btn btn-outline-primary d-flex align-items-center"
                                onClick={handleDownloadSample}
                            >
                                <Download size={16} className="me-2" />
                                Download Template
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container-fluid px-4 py-4">
                    {/* Instructions Card */}
                    <div className="row g-4 mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex align-items-start">
                                        <div className="me-3 p-2 bg-info bg-opacity-10 rounded">
                                            <Info className="text-info" size={20} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-2">Before You Start</h6>
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-primary rounded-circle me-2">1</span>
                                                        <strong>Download Template</strong>
                                                    </div>
                                                    <small className="text-muted">Use our template to ensure proper formatting</small>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-primary rounded-circle me-2">2</span>
                                                        <strong>Fill Your Data</strong>
                                                    </div>
                                                    <small className="text-muted">Include: Name, Student ID, Email, GPA, Family Income</small>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-primary rounded-circle me-2">3</span>
                                                        <strong>Upload & Review</strong>
                                                    </div>
                                                    <small className="text-muted">Preview and fix any errors before importing</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Card */}
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="card-title mb-0 fw-bold d-flex align-items-center">
                                        <Upload className="me-2" size={20} />
                                        Upload Student Data
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {/* File Upload Area */}
                                    <div
                                        className={`upload-area border border-2 border-dashed rounded-3 p-5 text-center mb-4 ${
                                            dragActive ? 'drag-active' : ''
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="text-muted mb-3" size={48} />
                                        {selectedFile ? (
                                            <div className="fade-in">
                                                <div className="d-flex align-items-center justify-content-center mb-2">
                                                    <FileText className="text-success me-2" size={20} />
                                                    <span className="fw-medium">{selectedFile.name}</span>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger ms-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            clearFile();
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-muted small mb-0">
                                                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <h6 className="fw-medium mb-2">Drop your file here or click to browse</h6>
                                                <p className="text-muted mb-0">
                                                    Supports Excel (.xlsx, .xls) and CSV files • Max 5MB
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="d-none"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                    />

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2 flex-wrap">
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={handlePreview}
                                            disabled={!selectedFile || uploadStatus === 'uploading'}
                                        >
                                            {uploadStatus === 'uploading' ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <FileText size={16} className="me-2" />
                                                    Preview Data
                                                </>
                                            )}
                                        </button>

                                        <button
                                            className="btn btn-success"
                                            onClick={handleUpload}
                                            disabled={!selectedFile || uploadStatus === 'uploading'}
                                        >
                                            {uploadStatus === 'uploading' ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={16} className="me-2" />
                                                    Import Students
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h6 className="card-title mb-0 fw-bold">Import Statistics</h6>
                                </div>
                                <div className="card-body">
                                    {showPreview ? (
                                        <div className="fade-in">
                                            <div className="d-grid gap-3">
                                                <div className="d-flex justify-content-between align-items-center p-3 bg-success bg-opacity-10 rounded">
                                                    <div className="d-flex align-items-center">
                                                        <CheckCircle className="text-success me-2" size={20} />
                                                        <span className="fw-medium">Valid Records</span>
                                                    </div>
                                                    <span className="badge bg-success fs-6">{importStats.valid}</span>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center p-3 bg-warning bg-opacity-10 rounded">
                                                    <div className="d-flex align-items-center">
                                                        <AlertCircle className="text-warning me-2" size={20} />
                                                        <span className="fw-medium">Warnings</span>
                                                    </div>
                                                    <span className="badge bg-warning fs-6">{importStats.warnings}</span>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center p-3 bg-danger bg-opacity-10 rounded">
                                                    <div className="d-flex align-items-center">
                                                        <AlertCircle className="text-danger me-2" size={20} />
                                                        <span className="fw-medium">Errors</span>
                                                    </div>
                                                    <span className="badge bg-danger fs-6">{importStats.errors}</span>
                                                </div>
                                            </div>

                                            {importStats.errors > 0 && (
                                                <div className="alert alert-warning mt-3 mb-0">
                                                    <small>
                                                        <strong>Note:</strong> Records with errors will be skipped during import.
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-4">
                                            <Users size={48} className="mb-3 opacity-50" />
                                            <p className="mb-0">Upload a file to see import statistics</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Table */}
                    {showPreview && (
                        <div className="row g-4 mt-2">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm fade-in">
                                    <div className="card-header bg-white border-bottom">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="card-title mb-0 fw-bold">Data Preview</h5>
                                            <span className="badge bg-primary">{previewData.length} records found</span>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead className="table-light">
                                                <tr>
                                                    <th className="border-0">Status</th>
                                                    <th className="border-0">Name</th>
                                                    <th className="border-0">Student ID</th>
                                                    <th className="border-0">Email</th>
                                                    <th className="border-0">GPA</th>
                                                    <th className="border-0">Family Income</th>
                                                    <th className="border-0">Issues</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {previewData.map((record, index) => (
                                                    <tr key={index} className={
                                                        record.status === 'error' ? 'table-danger' :
                                                            record.status === 'warning' ? 'table-warning' : ''
                                                    }>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                {getStatusIcon(record.status || 'valid')}
                                                            </div>
                                                        </td>
                                                        <td className="fw-medium">{record.name}</td>
                                                        <td>{record.studentId || <span className="text-muted">—</span>}</td>
                                                        <td>{record.email}</td>
                                                        <td>
                                                            <span className="badge bg-primary">{record.gpa}</span>
                                                        </td>
                                                        <td>₱{record.familyIncome.toLocaleString()}</td>
                                                        <td>
                                                            {record.errors && record.errors.length > 0 ? (
                                                                <small className="text-danger">
                                                                    {record.errors.join(', ')}
                                                                </small>
                                                            ) : (
                                                                <span className="text-success small">✓ Valid</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
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
        </>
    );
};

export default StudentImportTool;