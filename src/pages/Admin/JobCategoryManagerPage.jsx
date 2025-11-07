import React from "react";
import AdminSection from "../../components/Admin/AdminSection";
import JobCategoryManager from "../../components/Admin/JobCategoryManager";

function JobCategoryManagerPage() {
  return (
    <AdminSection title="Quản lý ngành nghề">
      <JobCategoryManager />
    </AdminSection>
  );
}

export default JobCategoryManagerPage;
