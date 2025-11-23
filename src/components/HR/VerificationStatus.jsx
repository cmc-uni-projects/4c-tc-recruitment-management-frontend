// src/components/HR/VerificationStatus.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const VerificationStatus = () => {
  const navigate = useNavigate();
  const employer = JSON.parse(localStorage.getItem("employer") || "{}");

  return (
    <div style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "40px auto", maxWidth: "500px" }}>
      <div style={{ fontSize: "64px" }}>Clock</div>
      <h2 style={{ color: "#00a550", margin: "20px 0" }}>
        {employer.verified ? "Đã xác thực thành công!" : "Yêu cầu xác thực đã được gửi!"}
      </h2>
      <p style={{ color: "#555", lineHeight: "1.6" }}>
        {employer.verified 
          ? "Bạn có thể sử dụng đầy đủ tính năng nhà tuyển dụng." 
          : "Chúng tôi đang xem xét hồ sơ của bạn.\nThời gian xử lý: 1-3 ngày làm việc."}
      </p>
      <button 
        onClick={() => navigate("/hr")}
        style={{ marginTop: "24px", padding: "12px 32px", background: "#00a550", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}
      >
        Về trang chủ
      </button>
    </div>
  );
};

export default VerificationStatus;