import React from 'react';
import { API_BASE_URL } from "../../config";

interface FilePreviewProps {
    label: string;
    filePath: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ label, filePath }) => {
    const fileUrl = `${API_BASE_URL}/api/applicants/files/${filePath.replace(/^uploads[\\/]/, "")}`;
    const isImage = /\.(png|jpe?g)$/i.test(filePath);
    const isPdf = /\.pdf$/i.test(filePath);

    return (
        <div>
            <h6>{label}</h6>
            {isImage ? (
                <img src={fileUrl} alt={label} style={{ maxWidth: "100%", height: "auto" }} />
            ) : isPdf ? (
                <iframe src={fileUrl} style={{ width: "100%", height: "500px" }}></iframe>
            ) : (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    Download {label}
                </a>
            )}
        </div>
    );
};

export default FilePreview;
