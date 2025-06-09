import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

const ProtectedRoute: React.FC = () => {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/applicant" replace />;
};

export default ProtectedRoute;
