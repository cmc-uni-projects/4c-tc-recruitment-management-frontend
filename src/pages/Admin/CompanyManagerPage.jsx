import React from "react";
import AdminSection from "../../components/Admin/AdminSection";
import CompanyManager from "../../components/Admin/CompanyManager";

function CompanyManagerPage() {
  return (
    <AdminSection title="Quản lý công ty">
      <CompanyManager />
    </AdminSection>
  );
}
export default CompanyManagerPage;