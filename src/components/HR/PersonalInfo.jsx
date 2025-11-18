import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./PersonalInfo.css";


const PersonalInfo = () => {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Lấy user hiện tại
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    positionTitle: "",
    department: "",
    workEmail: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    return () => {
      avatarPreview && URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    avatarPreview && URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleNext = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.positionTitle.trim()) return toast.error("Vui lòng nhập chức danh");
    if (!formData.department.trim()) return toast.error("Vui lòng nhập phòng ban");
    if (!formData.workEmail.trim()) return toast.error("Vui lòng nhập email công việc");

    // Lưu tạm vào localStorage (hoặc dùng context nếu bạn có)
    const personalData = {
      ...formData,
      avatarFile, // file sẽ được xử lý sau khi chọn ảnh
      avatarPreview,
    };

    localStorage.setItem("employer_personal_temp", JSON.stringify(personalData));

    toast.success("Đã lưu thông tin cá nhân tạm thời!");
    navigate("/hr/profile/company"); // Chuyển sang bước 2
  };

  return (
    <div className="personal-info-container">
      <h2>Cập nhật thông tin cá nhân</h2>
      <p className="step-hint">Bước 1/4 - Thông tin người đại diện</p>

      <form onSubmit={handleNext} className="personal-info-form">
        <div className="form-grid">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img src={avatarPreview || "/default-avatar.png"} alt="Avatar" className="avatar-preview" />
            </div>
            <label htmlFor="avatar-upload" className="change-avatar-btn">Đổi avatar</label>
            <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </div>

          <div className="email-display">
            Email cá nhân: <strong>{formData.email}</strong>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Họ và tên</label>
            <input type="text" value={formData.fullName} disabled style={{ background: "#f9f9f9" }} />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="text" value={formData.phone} disabled style={{ background: "#f9f9f9" }} />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Chức danh <span className="required">*</span></label>
          <input
            type="text"
            name="positionTitle"
            value={formData.positionTitle}
            onChange={handleChange}
            placeholder="VD: HR Manager, Recruitment Specialist..."
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Phòng ban <span className="required">*</span></label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="VD: Nhân sự, IT, Tuyển dụng..."
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Email công việc <span className="required">*</span></label>
          <input
            type="email"
            name="workEmail"
            value={formData.workEmail}
            onChange={handleChange}
            placeholder="hr@company.com"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
            Hủy
          </button>
          <button type="submit" className="btn-save">
            Tiếp theo
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;