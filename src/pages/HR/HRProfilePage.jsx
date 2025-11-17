// src/pages/hr/HRProfilePage.jsx
import React from "react";
import ProfileLayout from "../../components/HR/ProfileLayout";
import HRSection from "../../components/HR/HRSection";  // ✅ Layout HR

const HRProfilePage = () => {
return (
    <HRSection>
      <ProfileLayout />
    </HRSection>
  );};

export default HRProfilePage;