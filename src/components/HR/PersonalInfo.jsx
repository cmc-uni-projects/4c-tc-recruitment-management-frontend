// src/pages/hr/PersonalInfo.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./PersonalInfo.css";
import axios from "axios";

const PersonalInfo = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    positionTitle: "",
    department: "",
    workEmail: "",
  });

  // Fetch user từ /users/:id và prefill 3 trường readonly
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        // userId có thể lưu riêng hoặc nằm trong object 'user'
        const userObj = JSON.parse(localStorage.getItem("user") || "{}");
        const userId =
          localStorage.getItem("userId") || userObj.userId || userObj.id || userObj._id;

        if (!userId) {
          toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
          navigate("/login");
          return;
        }

        const res = await axios.get(`http://localhost:8080/users/${userId}`, {
          // Nếu server không yêu cầu token, có thể bỏ headers này.
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // Payload của bạn trả thẳng object user
        const u = res?.data || {};
        const fullName = u.fullName ?? "";
        const email = u.email ?? "";
        const phone = u.phone ?? "";

        if (!mounted) return;
        setFormData((prev) => ({
          ...prev,
          fullName,
          email,
          phone,
        }));
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Không lấy được thông tin người dùng.";
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();

    // Validation chỉ cho 3 ô bắt buộc
    if (!formData.positionTitle.trim())
      return toast.error("Vui lòng nhập chức danh");
    if (!formData.department.trim())
      return toast.error("Vui lòng nhập phòng ban");
    if (!formData.workEmail.trim())
      return toast.error("Vui lòng nhập email công việc");

    // Lưu tạm đúng 3 trường cho bước 2
    const personalTemp = {
      positionTitle: formData.positionTitle,
      department: formData.department,
      workEmail: formData.workEmail,
    };

    localStorage.setItem("employer_personal_temp", JSON.stringify(personalTemp));

    toast.success("Đã lưu thông tin cá nhân tạm thời!");
    navigate("/hr/profile/company"); // Sang bước 2
  };

  if (loading) {
    return (
      <div className="personal-info-container">
        <h2>Cập nhật thông tin cá nhân</h2>
        <p className="step-hint">Bước 1/4 - Thông tin người đại diện</p>
        <div className="skeleton">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="personal-info-container">
      <h2>Cập nhật thông tin cá nhân</h2>
      <p className="step-hint">Bước 1/4 - Thông tin người đại diện</p>

      <form onSubmit={handleNext} className="personal-info-form">
        {/* Email cá nhân (readonly) */}
        <div className="form-grid">
          <div className="email-display">
            Email cá nhân: <strong>{formData.email}</strong>
          </div>
        </div>

        {/* Họ tên & SĐT (readonly) */}
        <div className="form-grid">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={formData.fullName}
              disabled
              style={{ background: "#f9f9f9" }}
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              value={formData.phone}
              disabled
              style={{ background: "#f9f9f9" }}
            />
          </div>
        </div>

        {/* 3 ô bắt buộc để nhập */}
        <div className="form-group full-width">
          <label>
            Chức danh <span className="required">*</span>
          </label>
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
          <label>
            Phòng ban <span className="required">*</span>
          </label>
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
          <label>
            Email công việc <span className="required">*</span>
          </label>
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