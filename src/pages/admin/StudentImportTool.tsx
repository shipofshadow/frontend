import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Users, CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentRecord {
    studentId: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    extensionName?: string;
    fullName: string;
    gender: string;
    birthDate: string;
    campus: string;
    department: string;
    course: string;
    yearLevel: string;
    income: number;
    totalUnits: number;
    gwa: number;
    status: 'valid' | 'error' | 'warning';
    errors: string[];
}

interface GradeRecord {
    studentId: string;
    subjectName: string;
    grade: number;
    units: number;
    status: 'valid' | 'error' | 'warning';
    errors: string[];
}

interface ImportStats {
    valid: number;
    warnings: number;
    errors: number;
}

const StudentImportTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [previewData, setPreviewData] = useState<StudentRecord[]>([]);
    const [gradesData, setGradesData] = useState<GradeRecord[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [importStats, setImportStats] = useState<ImportStats>({ valid: 0, errors: 0, warnings: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        setPreviewData([]);
        setGradesData([]);
    };

    const validateEmail = (email: string): boolean => {
        if (!email || email.trim() === '') return true; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidDate = (dateString: string): boolean => {
        if (!dateString || dateString.trim() === '') return true; // Date might be optional
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    };

    const parseNumericValue = (value: any): number => {
        if (value === '' || value === null || value === undefined) return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    const validateStudentRecord = (row: any): { record: StudentRecord; isValid: boolean } => {
        const errors: string[] = [];
        
        // Required field validation
        const studentId = String(row["Student ID"] || '').trim();
        if (!studentId) {
            errors.push("Student ID is required");
        }

        const firstName = String(row["First Name"] || '').trim();
        const lastName = String(row["Last Name"] || '').trim();
        const middleName = String(row["Middle Name"] || '').trim();
        const extensionName = String(row["Extension Name"] || '').trim();
        
        if (!firstName) errors.push("First Name is required");
        if (!lastName) errors.push("Last Name is required");

        // Optional email validation
        const email = String(row["Email"] || '').trim();
        if (email && !validateEmail(email)) {
            errors.push("Invalid email format");
        }

        // Numeric field validation
        const income = parseNumericValue(row["Income"]);
        const gwa = parseNumericValue(row["GWA"]);
        const totalUnits = parseNumericValue(row["Total Units"]);

        if (row["Income"] !== '' && row["Income"] !== null && row["Income"] !== undefined && isNaN(parseFloat(row["Income"]))) {
            errors.push("Income must be a valid number");
        }

        if (row["GWA"] !== '' && row["GWA"] !== null && row["GWA"] !== undefined && isNaN(parseFloat(row["GWA"]))) {
            errors.push("GWA must be a valid number");
        }

        if (row["Total Units"] !== '' && row["Total Units"] !== null && row["Total Units"] !== undefined && isNaN(parseFloat(row["Total Units"]))) {
            errors.push("Total Units must be a valid number");
        }

        // Birth date validation
        const birthDate = String(row["Birth Date"] || '').trim();
        if (birthDate && !isValidDate(birthDate)) {
            errors.push("Invalid birth date format");
        }

        // Determine status
        let status: 'valid' | 'error' | 'warning' = 'valid';
        if (errors.length > 0) {
            const hasRequiredFieldErrors = errors.some(error => 
                error.includes("required") || 
                error.includes("Invalid email") || 
                error.includes("must be a valid number")
            );
            status = hasRequiredFieldErrors ? 'error' : 'warning';
        }

        const record: StudentRecord = {
            studentId,
            firstName,
            lastName,
            middleName,
            extensionName,
            fullName: `${firstName} ${middleName} ${lastName} ${extensionName}`.trim(),
            gender: String(row["Gender"] || '').trim(),
            birthDate,
            campus: String(row["Campus"] || '').trim(),
            department: String(row["Department"] || '').trim(),
            course: String(row["Course"] || '').trim(),
            yearLevel: String(row["Year Level"] || '').trim(),
            income,
            totalUnits,
            gwa,
            status,
            errors
        };

        return { record, isValid: status === 'valid' };
    };

    const validateGradeRecord = (row: any): { record: GradeRecord; isValid: boolean } => {
        const errors: string[] = [];
        
        const studentId = String(row["Student ID"] || '').trim();
        if (!studentId) {
            errors.push("Student ID is required");
        }

        const subjectName = String(row["Subject Name"] || '').trim();
        if (!subjectName) {
            errors.push("Subject Name is required");
        }

        const grade = parseNumericValue(row["Grade"]);
        const units = parseNumericValue(row["Units"]);

        if (row["Grade"] !== '' && row["Grade"] !== null && row["Grade"] !== undefined && isNaN(parseFloat(row["Grade"]))) {
            errors.push("Grade must be a valid number");
        }

        if (row["Units"] !== '' && row["Units"] !== null && row["Units"] !== undefined && isNaN(parseFloat(row["Units"]))) {
            errors.push("Units must be a valid number");
        }

        let status: 'valid' | 'error' | 'warning' = 'valid';
        if (errors.length > 0) {
            status = errors.some(error => error.includes("required") || error.includes("must be a valid number")) ? 'error' : 'warning';
        }

        const record: GradeRecord = {
            studentId,
            subjectName,
            grade,
            units,
            status,
            errors
        };

        return { record, isValid: status === 'valid' };
    };

    const handlePreview = () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        setUploadStatus("uploading");

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });

                // Parse ImportedStudents sheet
                let studentsSheet = null;
                let studentsSheetName = '';
                
                // Look for ImportedStudents sheet (case insensitive)
                for (const sheetName of workbook.SheetNames) {
                    if (sheetName.toLowerCase().includes('students') || sheetName.toLowerCase() === 'importedstudents') {
                        studentsSheet = workbook.Sheets[sheetName];
                        studentsSheetName = sheetName;
                        break;
                    }
                }

                // Fallback to first sheet if ImportedStudents not found
                if (!studentsSheet && workbook.SheetNames.length > 0) {
                    studentsSheetName = workbook.SheetNames[0];
                    studentsSheet = workbook.Sheets[studentsSheetName];
                }

                if (!studentsSheet) {
                    throw new Error("No valid sheet found in the file");
                }

                // Parse students data
                const studentsJsonData: any[] = XLSX.utils.sheet_to_json(studentsSheet, { defval: "" });
                const parsedStudents: StudentRecord[] = [];
                
                studentsJsonData.forEach((row, index) => {
                    if (index === 0 && Object.keys(row).length === 0) return; // Skip empty first row
                    
                    const { record } = validateStudentRecord(row);
                    parsedStudents.push(record);
                });

                // Parse ImportedGrades sheet (optional)
                let gradesSheet = null;
                for (const sheetName of workbook.SheetNames) {
                    if (sheetName.toLowerCase().includes('grades') || sheetName.toLowerCase() === 'importedgrades') {
                        gradesSheet = workbook.Sheets[sheetName];
                        break;
                    }
                }

                const parsedGrades: GradeRecord[] = [];
                if (gradesSheet) {
                    const gradesJsonData: any[] = XLSX.utils.sheet_to_json(gradesSheet, { defval: "" });
                    
                    gradesJsonData.forEach((row, index) => {
                        if (index === 0 && Object.keys(row).length === 0) return; // Skip empty first row
                        
                        const { record } = validateGradeRecord(row);
                        parsedGrades.push(record);
                    });
                }

                // Calculate statistics
                const stats: ImportStats = {
                    valid: parsedStudents.filter(r => r.status === 'valid').length,
                    warnings: parsedStudents.filter(r => r.status === 'warning').length,
                    errors: parsedStudents.filter(r => r.status === 'error').length
                };

                setPreviewData(parsedStudents);
                setGradesData(parsedGrades);
                setImportStats(stats);
                setShowPreview(true);
                setUploadStatus("success");

            } catch (error) {
                console.error("Error parsing file:", error);
                setUploadStatus("error");
                alert("Error parsing file. Please check the file format and try again.");
            }
        };

        reader.onerror = () => {
            setUploadStatus("error");
            alert("Error reading file. Please try again.");
        };

        reader.readAsArrayBuffer(selectedFile);
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

            // Add processed data as JSON for the backend
            const validStudents = previewData.filter(student => student.status === 'valid');
            const validGrades = gradesData.filter(grade => grade.status === 'valid');

            formData.append('studentsData', JSON.stringify(validStudents));
            formData.append('gradesData', JSON.stringify(validGrades));

            // TODO: Replace with actual API call
            // const response = await fetch('/api/import-students', {
            //     method: 'POST',
            //     body: formData,
            // });

            // Simulate API call
            setTimeout(() => {
                setUploadStatus('success');
                alert(`Successfully imported ${importStats.valid} student records!`);
                // Reset form
                setSelectedFile(null);
                setShowPreview(false);
                setPreviewData([]);
                setGradesData([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 2000);

        } catch (error) {
            console.error("Upload error:", error);
            setUploadStatus('error');
            alert('Upload failed. Please try again.');
        }
    };

    const handleDownloadSample = () => {
        // Create sample data for the template
        const studentsData = [
            {
                "Student ID": "2024-001",
                "First Name": "Juan",
                "Last Name": "Dela Cruz",
                "Middle Name": "Dela Cruz",
                "Extension Name": "Dela Cruz",
                "Gender": "Male",
                "Birth Date": "2000-01-15",
                "Campus": "Main Campus",
                "Department": "Engineering",
                "Course": "Computer Engineering",
                "Year Level": "3rd Year",
                "Email": "juan.delacruz@university.edu",
                "Income": 25000,
                "Total Units": 21,
                "GWA": 1.75
            },
            {
                "Student ID": "2024-002",
                "First Name": "Maria",
                "Last Name": "Santos",
                "Middle Name": "Dela Cruz",
                "Extension Name": "Dela Cruz",
                "Gender": "Female",
                "Birth Date": "1999-12-08",
                "Campus": "Main Campus",
                "Department": "Business",
                "Course": "Business Administration",
                "Year Level": "2nd Year",
                "Email": "maria.santos@university.edu",
                "Income": 45000,
                "Total Units": 18,
                "GWA": 2.25
            }
        ];

        const gradesData = [
            {
                "Student ID": "2024-001",
                "Subject Name": "Data Structures",
                "Grade": 1.50,
                "Units": 3
            },
            {
                "Student ID": "2024-001",
                "Subject Name": "Database Systems",
                "Grade": 2.00,
                "Units": 3
            },
            {
                "Student ID": "2024-002",
                "Subject Name": "Business Math",
                "Grade": 2.25,
                "Units": 3
            }
        ];

        // Create workbook with two sheets
        const wb = XLSX.utils.book_new();
        const studentsWs = XLSX.utils.json_to_sheet(studentsData);
        const gradesWs = XLSX.utils.json_to_sheet(gradesData);
        
        XLSX.utils.book_append_sheet(wb, studentsWs, "ImportedStudents");
        XLSX.utils.book_append_sheet(wb, gradesWs, "ImportedGrades");
        
        XLSX.writeFile(wb, "imported_students_template.xlsx");
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
        setGradesData([]);
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
                                            <h6 className="fw-bold mb-2">Template Requirements</h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-primary rounded-circle me-2">1</span>
                                                        <strong>ImportedStudents Sheet</strong>
                                                    </div>
                                                    <small className="text-muted">Required: Student ID*, First Name*, Last Name*<br/>
                                                    Optional: Gender, Birth Date, Campus, Department, Course, Year Level, Email, Income, Total Units, GWA</small>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-primary rounded-circle me-2">2</span>
                                                        <strong>ImportedGrades Sheet (Optional)</strong>
                                                    </div>
                                                    <small className="text-muted">Columns: Student ID*, Subject Name*, Grade, Units<br/>
                                                    Links subjects to students for detailed grade tracking</small>
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

                                            {gradesData.length > 0 && (
                                                <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
                                                    <small className="text-info fw-medium">
                                                        📊 Found {gradesData.length} grade records
                                                    </small>
                                                </div>
                                            )}

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
                    {showPreview && previewData.length > 0 && (
                        <div className="row g-4 mt-2">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm fade-in">
                                    <div className="card-header bg-white border-bottom">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="card-title mb-0 fw-bold">Student Records Preview</h5>
                                            <span className="badge bg-primary">{previewData.length} records found</span>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="border-0">Status</th>
                                                        <th className="border-0">Student ID</th>
                                                        <th className="border-0">Name</th>
                                                        <th className="border-0">Course</th>
                                                        <th className="border-0">Year Level</th>
                                                        <th className="border-0">GWA</th>
                                                        <th className="border-0">Income</th>
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
                                                                {getStatusIcon(record.status)}
                                                            </div>
                                                        </td>
                                                        <td className="fw-medium">{record.studentId || <span className="text-muted">—</span>}</td>
                                                        <td>{record.fullName}</td>
                                                        <td>{record.course || <span className="text-muted">—</span>}</td>
                                                        <td>{record.yearLevel || <span className="text-muted">—</span>}</td>
                                                        <td>
                                                            {record.gwa > 0 ? (
                                                                <span className="badge bg-primary">{record.gwa.toFixed(2)}</span>
                                                            ) : (
                                                                <span className="text-muted">—</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {record.income > 0 ? (
                                                                `₱${record.income.toLocaleString()}`
                                                            ) : (
                                                                <span className="text-muted">—</span>
                                                            )}
                                                        </td>
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

                    {/* Grades Preview (if available) */}
                    {showPreview && gradesData.length > 0 && (
                        <div className="row g-4 mt-2">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm fade-in">
                                    <div className="card-header bg-white border-bottom">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="card-title mb-0 fw-bold">Grade Records Preview</h5>
                                            <span className="badge bg-info">{gradesData.length} grade records found</span>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="border-0">Status</th>
                                                        <th className="border-0">Student ID</th>
                                                        <th className="border-0">Subject Name</th>
                                                        <th className="border-0">Grade</th>
                                                        <th className="border-0">Units</th>
                                                        <th className="border-0">Issues</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {gradesData.slice(0, 10).map((record, index) => (
                                                    <tr key={index} className={
                                                        record.status === 'error' ? 'table-danger' :
                                                            record.status === 'warning' ? 'table-warning' : ''
                                                    }>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                {getStatusIcon(record.status)}
                                                            </div>
                                                        </td>
                                                        <td className="fw-medium">{record.studentId}</td>
                                                        <td>{record.subjectName}</td>
                                                        <td>
                                                            {record.grade > 0 ? (
                                                                <span className="badge bg-secondary">{record.grade.toFixed(2)}</span>
                                                            ) : (
                                                                <span className="text-muted">—</span>
                                                            )}
                                                        </td>
                                                        <td>{record.units > 0 ? record.units : <span className="text-muted">—</span>}</td>
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
                                        {gradesData.length > 10 && (
                                            <div className="card-footer bg-light text-center">
                                                <small className="text-muted">
                                                    Showing first 10 of {gradesData.length} grade records
                                                </small>
                                            </div>
                                        )}
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