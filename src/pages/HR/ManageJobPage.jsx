import React from "react";
import HRSection from "../../components/HR/HRSection";  // ✅ Layout HR
import ManageJobSection from "../../components/HR/ManageJobSection";

function ManageJobPage() {
  return (
    <HRSection title="Quản Lý Tin Tuyển Dụng">
      <ManageJobSection />
    </HRSection>
  );
}

export default ManageJobPage;
