// src/pages/hr/PersonalInfo.jsx
import React, { useState, useEffect, useRef } from "react";
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
};

const PersonalInfo = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    positionTitle: "",
    department: "",
    workEmail: "",
  });

  // THÊM MỚI: Upload file
  const [laborContractFile, setLaborContractFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

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
          Swal.fire(
            "Lỗi",
            "Không tìm thấy userId. Vui lòng đăng nhập lại.",
            "error"
          );
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
        const savedEmployer = JSON.parse(
          localStorage.getItem("employer") || "null"
        );
        if (savedEmployer) {
          // Nếu đã có employer, dọn temp để tránh ghi đè
          localStorage.removeItem("employer_personal_temp");
          setFormData((prev) => ({
            ...prev,
            positionTitle: savedEmployer.positionTitle || "",
            department: savedEmployer.department || "",
            workEmail: savedEmployer.workEmail || "",
          }));
        // Nếu đã có file hợp đồng → preview
          if (savedEmployer.laborContractPath) {
            const base = import.meta.env.VITE_API_URL || "http://localhost:8080";
            setFilePreview(`${base}${savedEmployer.laborContractPath}`);
          }
        } else {
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

  // THÊM MỚI: Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      Swal.fire("Lỗi", "Chỉ chấp nhận file: JPG, PNG, PDF", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Lỗi", "File không được vượt quá 10MB", "error");
      return;
    }

    setLaborContractFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview("/pdf-preview.png");
    }
  };

  // ĐOẠN QUAN TRỌNG NHẤT – ĐÃ SỬA HOÀN HẢO
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.positionTitle.trim()) return Swal.fire("Lỗi", "Nhập chức danh", "warning");
    if (!formData.department.trim()) return Swal.fire("Lỗi", "Nhập phòng ban", "warning");
    if (!formData.workEmail.trim()) return Swal.fire("Lỗi", "Nhập email công việc", "warning");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)) {
      return Swal.fire("Lỗi", "Email công việc không hợp lệ", "warning");
    }

    const companyId = getSelectedCompanyId();
    if (!companyId) {
      return Swal.fire("Lỗi", "Chưa chọn công ty! Vui lòng quay lại Bước 1.", "error");
    }

    if (!laborContractFile && !filePreview) {
      return Swal.fire("Lỗi", "Vui lòng upload hợp đồng lao động", "warning");
    }

    // Lưu tạm để không mất dữ liệu nếu lỗi
    localStorage.setItem("employer_personal_temp", JSON.stringify({
      positionTitle: formData.positionTitle,
      department: formData.department,
      workEmail: formData.workEmail,
    }));

    try {
      setLoading(true);

      // Payload ĐẦY ĐỦ – companyId BẮT BUỘC
      const payload = {
  positionTitle: formData.positionTitle.trim(),
  department: formData.department.trim(),
  workEmail: formData.workEmail.trim(),
  companyId: companyId,
  laborContractFile: laborContractFile, // ← THÊM DÒNG NÀY!!!
};

      // 1. Tạo Employer + upload file luôn trong 1 request
const createRes = await employerAPI.createEmployer(payload); // ← Chỉ 1 tham số!

const createdEmployer = createRes.data;
const employerId = createdEmployer.employerId || createdEmployer.id;

if (!employerId) throw new Error("Không nhận được employerId");

// 2. Gửi yêu cầu duyệt – vẫn gọi bình thường
await employerAPI.requestVerification(employerId);

      // Lưu vào localStorage để HRSection nhận diện ngay
      localStorage.setItem("employer", JSON.stringify(createdEmployer));
      localStorage.removeItem("employer_personal_temp");

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Hồ sơ đã được gửi duyệt. Bạn sẽ nhận email khi được duyệt.",
        timer: 3000,
      });

      navigate("/hr");

    } catch (err) {
      console.error("Lỗi tạo Employer:", err.response?.data);

      const msg = err.response?.data?.message || "Lỗi không xác định";

      // Fallback thông minh: nếu đã tồn tại Employer
      if (msg.includes("đã có hồ sơ") || msg.includes("already exists")) {
        try {
          const me = await employerAPI.getMyEmployer();
          const existingId = me.data?.employerId || me.data?.id;
          if (existingId) {
            await employerAPI.requestVerification(existingId);
            localStorage.setItem("employer", JSON.stringify(me.data));
            Swal.fire("Thành công", "Đã gửi lại yêu cầu xác thực!", "success");
            navigate("/hr");
            return;
          }
        } catch { }
      }

      Swal.fire("Thất bại", msg, "error");
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

        {/* THÊM MỚI: Phần upload hợp đồng lao động - ĐẸP NHƯ BUSINESS REGISTRATION */}
        <div className="upload-section">
          <label className="upload-label">
            Hợp đồng lao động / Giấy bổ nhiệm <span className="required">*</span>
          </label>

          <div className="drop-zone">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
              id="labor-file-input"
            />
            <label htmlFor="labor-file-input" className="drop-label">
              {laborContractFile || filePreview ? (
                <div className="file-preview">
                  <span className="file-name">
                    {laborContractFile?.name || "Đã tải lên hợp đồng"}
                  </span>
                  {filePreview && <img src={filePreview} alt="Preview" className="preview-img" />}
                </div>
              ) : (
                <>
                  <div className="upload-icon">Upload</div>
                  <p>Kéo và thả file vào đây hoặc nhấn để chọn</p>
                  <p className="file-info">Tối đa 10MB • JPG, PNG, PDF</p>
                  <button type="button" className="btn-choose-file">Chọn file</button>
                </>
              )}
            </label>
          </div>

          <div className="warning-box">
            <strong>Lưu ý quan trọng:</strong>
            <ul>
              <li>Hợp đồng phải có chữ ký + đóng dấu công ty</li>
              <li>Thông tin chức danh, phòng ban phải trùng khớp với form</li>
              <li>Chấp nhận scan hoặc ảnh chụp rõ nét</li>
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate(-1)}
          >
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
