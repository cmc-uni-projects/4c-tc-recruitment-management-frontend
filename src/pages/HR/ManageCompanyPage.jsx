import React from "react";
import HRSection from "../../components/HR/HRSection";  // ✅ Layout HR
import ManageCompanySection from "../../components/HR/ManageCompanySection";

function ManageCompanyPage() {
  return (
    <HRSection title="Quản Lý Công Ty">
      <ManageCompanySection />
    </HRSection>
  );
}

export default ManageCompanyPage;
