
import React from "react";
import AdminSection from "../../components/Admin/AdminSection";
import EmployerManager from "./EmployerManager";

function EmployerManagerPage() {
  return (
    <AdminSection title="Quản lý nhà tuyển dụng">
      <EmployerManager />
    </AdminSection>
  );
}

export default EmployerManagerPage;
