import React, { useState } from "react";
import RegisterPopup from "../../components/Register/RegisterPopup";
import RegisterSection from "../../components/Register/RegisterSection";
import RegisterHRSection from "../../components/Register/RegisterHRSection";

export default function RegisterPage() {
  const [role, setRole] = useState(null);

  // Khi user chọn role trong popup
  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole); // ✅ không cần gọi API, FE chỉ cần biết role là gì
  };

  const handleBack = () => setRole(null);

  // Hiển thị giao diện theo role
  if (!role) return <RegisterPopup onSelectRole={handleSelectRole} />;

  return (
    <>
      {role === "CANDIDATE" && <RegisterSection onBack={handleBack} />}
      {role === "HR" && <RegisterHRSection onBack={handleBack} />}
    </>
  );
}
