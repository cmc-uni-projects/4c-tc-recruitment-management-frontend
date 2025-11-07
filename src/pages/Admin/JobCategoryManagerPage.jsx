import React from "react";
import AdminSection from "../../components/Admin/AdminSection";
import JobCategoryManager from "../../components/Admin/JobCategoryManager";

function JobCategoryManagerPage() {
  return (
    <AdminSection>
      <JobCategoryManager />
    </AdminSection>
  );
}

export default JobCategoryManagerPage; // ✅ Bắt buộc có dòng này