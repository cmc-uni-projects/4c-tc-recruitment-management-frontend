// src/pages/hr/HRProfilePage.jsx
import React from "react";
import ProfileLayout from "../../components/HR/ProfileLayout";
import HRSection from "../../components/HR/HRSection";  // ✅ Layout HR
import PersonalInfo from "../../components/HR/PersonalInfo";
import CompanyInfo from "../../components/HR/CompanyInfo";
import { Outlet } from "react-router-dom";

const HRProfilePage = () => {
return (
    <HRSection>
        <Outlet />
    </HRSection>
  );};

export default HRProfilePage;