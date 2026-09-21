import React from 'react';
import { Navigate } from 'react-router-dom';

const Document: React.FC = () => {
    return <Navigate to="/admin/documents/requirements" replace />;
};

export default Document;