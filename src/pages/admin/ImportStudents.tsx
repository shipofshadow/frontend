import React, { useState } from "react";

const ImportStudents = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
    };

    const handleUpload = () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        // Example: Send to API
        fetch("/api/import-students", {
            method: "POST",
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                alert("Upload successful!");
                console.log(data);
            })
            .catch(() => alert("Upload failed."));
    };

    const handleDownloadSample = () => {
        window.open("/sample-import-template.xlsx", "_blank");
    };

    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon">
                                        <i data-feather="upload"></i>
                                    </div>
                                    Import Students
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Upload Excel File</span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={handleDownloadSample}>
                            <i className="fa fa-download me-2"></i> Download Sample File
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label htmlFor="fileInput" className="form-label">Choose file (.xlsx, .xls, .csv)</label>
                            <input
                                className="form-control"
                                type="file"
                                id="fileInput"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                            />
                        </div>
                        <button className="btn btn-success" onClick={handleUpload}>
                            <i className="fa fa-upload me-2"></i> Upload Students
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImportStudents;
