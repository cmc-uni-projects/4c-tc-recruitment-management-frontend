import React from "react";
import "./RegisterPopup.css";
import HR from "../../assets/Tuyendung.png";
import Candidate from "../../assets/Ungvien.png";

export default function RegisterPopup({ onSelectRole }) {
  const handleSelect = (role) => {
    localStorage.setItem("selectedRole", role); // ✅ lưu lại để RegisterSection đọc
    onSelectRole(role); // ✅ gọi để đổi giao diện
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Chào bạn 👋</h2>
        <p>Vui lòng chọn loại tài khoản để tiếp tục đăng ký</p>

        <div className="popup-roles">
          <div className="role-card" onClick={() => handleSelect("HR")}>
            <img src={HR} alt="Nhà tuyển dụng" />
            <h3>Tôi Là Nhà tuyển dụng</h3>
            <p>Tạo tài khoản để đăng tin tuyển dụng và quản lý hồ sơ</p>
          </div>

          <div className="role-card" onClick={() => handleSelect("CANDIDATE")}>
            <img src={Candidate} alt="Ứng viên" />
            <h3>Tôi Là Ứng viên</h3>
            <p>Tạo hồ sơ và ứng tuyển công việc phù hợp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
