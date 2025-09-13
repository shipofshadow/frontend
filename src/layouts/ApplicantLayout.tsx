// layouts/ApplicantLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/applicant/Navbar';

const ApplicantLayout: React.FC = () => {
  return (
    <>
      <Navbar />
          <Outlet />
    </>
  );
};

export default ApplicantLayout;
