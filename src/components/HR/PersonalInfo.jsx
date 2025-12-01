
// src/pages/hr/PersonalInfo.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./PersonalInfo.css";
import axios from "axios";
import { employerAPI } from "../../services/auth.services.js"; // 🔸 THÊM import


// Utility: lấy companyId từ localStorage với fallback + chuẩn hoá UUID
const getSelectedCompanyId = () => {
  let raw = localStorage.getItem("selected_company_id");
  if (!raw) raw = localStorage.getItem("selectedCompanyId");
  if (!raw) raw = localStorage.getItem("companyId");
  if (!raw) raw = localStorage.getItem("selectedCompany"); // có thể là JSON object

  if (!raw) return null;

  // Nếu lỡ lưu object JSON { companyId: "..." }
  try {
    const obj = JSON.parse(raw);
    if (obj && obj.companyId) raw = obj.companyId;
  } catch {
    // raw là chuỗi UUID rồi, giữ nguyên
  }

  const candidate = String(raw).trim();

  // Nếu lỡ lưu dạng path "/companies/<uuid>/..."
  const match = candidate.match(/\/companies\/([0-9a-fA-F-]{36})/);
  const uuid = match ? match[1] : candidate;


  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  return uuidRegex.test(uuid) ? uuid : null;
}

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
        const userObj = JSON.parse(localStorage.getItem("user") || "{}");
        const userId =
          localStorage.getItem("userId") ||
          userObj.userId ||
          userObj.id ||
          userObj._id;

        if (!userId) {
          Swal.fire("Lỗi", "Không tìm thấy userId. Vui lòng đăng nhập lại.", "error");
          navigate("/login");
          return;
        }

        const res = await axios.get(`http://localhost:8080/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

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

        // Đọc employer từ localStorage nếu có
        const savedEmployer = JSON.parse(localStorage.getItem("employer") || "null");
        if (savedEmployer) {
          // Nếu đã có employer, dọn temp để tránh ghi đè
          localStorage.removeItem("employer_personal_temp");
          setFormData((prev) => ({
            ...prev,
            positionTitle: savedEmployer.positionTitle || "",
            department: savedEmployer.department || "",
            workEmail: savedEmployer.workEmail || "",
          }));
        } else {
          // Nếu không có employer thì đọc temp (trường hợp đang làm dở)
          const temp = JSON.parse(localStorage.getItem("employer_personal_temp") || "{}");
          if (temp.positionTitle || temp.department || temp.workEmail) {
            setFormData((prev) => ({
              ...prev,
              positionTitle: temp.positionTitle || "",
              department: temp.department || "",
              workEmail: temp.workEmail || "",
            }));
          }
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Không lấy được thông tin người dùng.";
        Swal.fire("Lỗi", msg, "error");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation cho 3 ô bắt buộc
    if (!formData.positionTitle.trim())
      return Swal.fire("Cảnh báo", "Vui lòng nhập chức danh", "warning");
    if (!formData.department.trim())
      return Swal.fire("Cảnh báo", "Vui lòng nhập phòng ban", "warning");
    if (!formData.workEmail.trim())
      return Swal.fire("Cảnh báo", "Vui lòng nhập email công việc", "warning");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail))
      return Swal.fire("Cảnh báo", "Email công việc không hợp lệ.", "warning");

    // Lấy companyId từ Bước 1 (đã chọn công ty)
    const companyId = getSelectedCompanyId();
    if (!companyId) {
      return Swal.fire(
        "Cảnh báo",
        "Vui lòng chọn công ty ở Bước 1 trước khi gửi yêu cầu xác thực.",
        "warning"
      );
    }

    // Lưu temp (phòng trường hợp call API lỗi)
    localStorage.setItem(
      "employer_personal_temp",
      JSON.stringify({
        positionTitle: formData.positionTitle,
        department: formData.department,
        workEmail: formData.workEmail,
      })
    );

    try {
      setLoading(true);
      // 1) Tạo Employer
      const payload = {
        positionTitle: formData.positionTitle,
        department: formData.department,
        workEmail: formData.workEmail,
        companyId, // bắt buộc
      };
      const createRes = await employerAPI.createEmployer(payload);
      const created = createRes?.data;
      const employerId = created?.employerId;
      if (!employerId) {
        throw new Error("Không nhận được employerId sau khi tạo.");
      }

      // 2) Gửi yêu cầu xác thực ngay
      await employerAPI.requestVerification(employerId);

      // Lưu employer vào localStorage (tuỳ chọn)
      localStorage.setItem("employer", JSON.stringify(created));
      localStorage.removeItem("employer_personal_temp");

      Swal.fire("Thành công", "Đã tạo hồ sơ và gửi yêu cầu xác thực!", "success");
      navigate("/hr"); // hoặc trang khác tuỳ bạn (ví dụ: /hr/profile/summary)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi gửi yêu cầu xác thực.";
      // Fallback: nếu đã có employer, gọi requestVerification cho hồ sơ hiện có
      if (typeof msg === "string" && msg.includes("Bạn đã có hồ sơ Employer")) {
        try {
          const me = await employerAPI.getMyEmployer();
          const exId = me?.data?.employerId;
          if (exId) {
            await employerAPI.requestVerification(exId);
            Swal.fire(
              "Thành công",
              "Đã gửi yêu cầu xác thực cho hồ sơ hiện có!",
              "success"
            );
            return navigate("/hr");
          }
        } catch (e2) {
          const msg2 =
            e2?.response?.data?.message ||
            e2?.message ||
            "Không thể gửi yêu cầu xác thực cho hồ sơ hiện có.";
          Swal.fire("Lỗi", msg2, "error");
        }
      } else {
        Swal.fire("Lỗi", msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="personal-info-container">
        <h2>Cập nhật thông tin cá nhân</h2>
        <p className="step-hint">Bước 2 - Thông tin người đại diện</p>
        <div className="skeleton">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="personal-info-container">
      <h2>Cập nhật thông tin cá nhân</h2>
      <p className="step-hint">Bước 2 - Thông tin người đại diện</p>

      <form onSubmit={handleSubmit} className="personal-info-form">
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
            Gửi yêu cầu xác thực
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;
