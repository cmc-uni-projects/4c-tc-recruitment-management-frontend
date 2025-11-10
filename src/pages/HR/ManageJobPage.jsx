import React from "react";
import AdminSection from "../../components/Admin/AdminSection";
import ManageJobSection from "../../components/HR/ManageJobSection";

function ManageJobPage() {
  return (
    <AdminSection title="Quản lý tin tuyển dụng">
      <ManageJobSection />
    </AdminSection>
  );
}

export default ManageJobPage; // ✅ Bắt buộc có dòng này
