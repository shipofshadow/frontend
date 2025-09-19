// layouts/ApplicantLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/applicant/Navbar';
import Footer from "../components/Footer.tsx";

const ApplicantLayout: React.FC = () => {
  return (
    <>
      <Navbar />
          <Outlet />
        <Footer />
    </>
  );
};

export default ApplicantLayout;
