
// src/pages/hr/CompanyInfo.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { companyAPI, employerAPI } from "../../services/auth.services";
import "./CompanyInfo.css";

/**
 * CompanyInfo.jsx – HR chọn công ty sẵn có hoặc tạo công ty mới,
 * sau đó tạo hồ sơ Employer gắn với công ty đã chọn.
 *
 * Flow:
 * 1) Tải danh sách company ACTIVE -> Chọn một company hoặc chuyển tab Tạo company.
 * 2) Tạo employer profile (positionTitle, department, workEmail lấy từ localStorage 'employer_personal_temp').
 * 3) Điều hướng sang bước upload giấy phép kinh doanh.
 */

// Helpers: URL / Email / Year validation
const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};
const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
const currentYear = new Date().getFullYear();
const isValidYear = (y) => /^\d{4}$/.test(String(y)) && y >= 1800 && y <= currentYear;

// Validate form tạo company
const validateCompanyForm = (data) => {
  const err = {};
  if (!data.name?.trim()) err.name = "Tên công ty là bắt buộc";
  if (!data.industry?.trim()) err.industry = "Ngành nghề là bắt buộc";
  if (!data.description?.trim()) err.description = "Mô tả là bắt buộc";

  if (!data.logoUrl?.trim()) err.logoUrl = "Logo URL là bắt buộc";
  else if (!isValidUrl(data.logoUrl)) err.logoUrl = "Logo URL không hợp lệ";

  if (!data.coverUrl?.trim()) err.coverUrl = "Ảnh bìa URL là bắt buộc";
  else if (!isValidUrl(data.coverUrl)) err.coverUrl = "Ảnh bìa URL không hợp lệ";

  if (!data.website?.trim()) err.website = "Website là bắt buộc";
  else if (!isValidUrl(data.website)) err.website = "Website không hợp lệ";

  if (!data.address?.trim()) err.address = "Địa chỉ là bắt buộc";
  if (!data.city?.trim()) err.city = "Thành phố là bắt buộc";

  if (!data.size) err.size = "Quy mô là bắt buộc";

  if (!data.foundedYear?.toString().trim())
    err.foundedYear = "Năm thành lập là bắt buộc";
  else if (!isValidYear(Number(data.foundedYear)))
    err.foundedYear = `Năm thành lập phải từ 1800 đến ${currentYear}`;

  return err;
};

// Validate block thông tin cá nhân employer (đã điền ở bước trước)
const validateEmployerPersonal = (personalTemp) => {
  const err = {};
  if (!personalTemp.positionTitle?.trim())
    err.positionTitle = "Chức danh là bắt buộc";
  if (!personalTemp.department?.trim())
    err.department = "Phòng ban là bắt buộc";
  if (!personalTemp.workEmail?.trim())
    err.workEmail = "Email công việc là bắt buộc";
  else if (!isValidEmail(personalTemp.workEmail))
    err.workEmail = "Email công việc không hợp lệ";
  return err;
};

const CompanyInfo = () => {
  const navigate = useNavigate();

  // UI States
  const [activeTab, setActiveTab] = useState("select"); // select | create
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [creatingEmployer, setCreatingEmployer] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);

  // Data states
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Form tạo company
  const [form, setForm] = useState({
    name: "",
    industry: "",
    description: "",
    logoUrl: "",
    coverUrl: "",
    website: "",
    address: "",
    city: "",
    size: "MEDIUM",
    foundedYear: "",
  });
  const [errors, setErrors] = useState({});

  // ===========================
  // 1) Khởi động: nếu đã có employer -> điều hướng phù hợp
  // ===========================
  useEffect(() => {
    // Kiểm tra localStorage trước cho nhanh
    const existingEmployerLS = JSON.parse(
      localStorage.getItem("employer") || "null"
    );

    if (existingEmployerLS?.employerId) {
      // Nếu đã gửi yêu cầu xác minh hoặc đã xác minh → đi thẳng trang HR
      if (
        existingEmployerLS.verificationStatus === "PENDING" ||
        existingEmployerLS.verified
      ) {
        navigate("/hr");
        return;
      }
      // Ngược lại, chuyển sang bước upload GPKD
      navigate("/hr/profile/business-registration");
      return;
    }

    // Nếu LS chưa có, có thể gọi API để sync (tuỳ nhu cầu)
    // (Bỏ qua để không gây thêm request)
  }, [navigate]);

  // ===========================
  // 2) Tải danh sách company ACTIVE
  // ===========================
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const res = await companyAPI.getAllActive();
        setCompanies(res.data || []);
      } catch (err) {
        toast.error("Không thể tải danh sách công ty");
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  // Lọc theo từ khoá tên trên FE
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    const key = searchTerm.trim().toLowerCase();
    return companies.filter((c) => c.name?.toLowerCase().includes(key));
  }, [companies, searchTerm]);

  // ===========================
  // 3) Tạo company mới
  // ===========================
  const handleCreateCompany = async () => {
    const validationErrors = validateCompanyForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập");
      return;
    }

    setCreatingCompany(true);
    try {
      const res = await companyAPI.create(form);
      const company = res.data;
      toast.success("Tạo công ty thành công!");
      // Lưu company vừa tạo và chuyển sang bước upload GPKD
      localStorage.setItem("selectedCompany", JSON.stringify(company));
      setSelectedCompany(company);
      // Sau khi tạo công ty, thường sẽ tạo Employer tiếp -> điều hướng sang upload GPKD
      navigate("/hr/profile/business-registration");
    } catch (err) {
      const apiMsg =
        err.response?.data?.message || "Tạo công ty thất bại. Vui lòng thử lại.";
      toast.error(apiMsg);
      // Nếu BE trả về errors theo field:
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setCreatingCompany(false);
    }
  };

  // ===========================
  // 4) Tạo Employer cho company đã chọn
  // ===========================
  const handleCreateEmployerProfile = async () => {
    if (!selectedCompany) {
      toast.error("Vui lòng chọn công ty");
      return;
    }

    setCreatingEmployer(true);
    try {
      const personalTemp = JSON.parse(
        localStorage.getItem("employer_personal_temp") || "{}"
      );

      const personalErrors = validateEmployerPersonal(personalTemp);
      if (Object.keys(personalErrors).length > 0) {
        setErrors(personalErrors);
        toast.error(
          "Thiếu hoặc sai định dạng thông tin cá nhân. Vui lòng quay lại bước 1."
        );
        navigate("/hr/profile"); // Trang điền thông tin cá nhân employer
        return;
      }

      const payload = {
        positionTitle: personalTemp.positionTitle,
        department: personalTemp.department,
        workEmail: personalTemp.workEmail,
        companyId: selectedCompany.companyId,
      };

      const res = await employerAPI.createEmployer(payload);
      const employerCreated = res.data;

      // Lưu employer + company vào localStorage
      localStorage.setItem("employer", JSON.stringify(employerCreated));
      localStorage.setItem("selectedCompany", JSON.stringify(selectedCompany));

      toast.success("Tạo hồ sơ nhà tuyển dụng thành công!");
      // Xoá dữ liệu tạm
      localStorage.removeItem("employer_personal_temp");
      // Sang bước upload GPKD
      navigate("/hr/profile/business-registration");
    } catch (err) {
      console.error("Lỗi tạo employer:", err);
      const msg =
        err.response?.data?.message ||
        "Tạo hồ sơ thất bại. Vui lòng thử lại.";
      toast.error(msg);
      // Gắn lỗi field từ BE (nếu có)
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setCreatingEmployer(false);
    }
  };

  // ===========================
  // 5) Render
  // ===========================
  return (
    <div className="company-info-wrapper">
      {!selectedCompany ? (
        <>
          {/* Tabs */}
          <div className="tab-header">
            <button
              className={activeTab === "select" ? "active" : ""}
              onClick={() => setActiveTab("select")}
            >
              Chọn công ty
            </button>
            <button
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
            >
              Tạo công ty
            </button>
          </div>

          {/* Tab: Chọn công ty */}
          {activeTab === "select" && (
            <div className="company-select-tab">
              <div className="search-bar1">
                <input
                  type="text"
                  placeholder="Nhập tên công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Nút này optional: vì filter chạy theo onChange */}
                <button onClick={() => {}}>Tìm kiếm</button>
              </div>

              {loadingCompanies ? (
                <div className="loading-spinner">
                  <div className="spinner" />
                  <p>Đang tải danh sách công ty...</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="no-data">Không tìm thấy công ty phù hợp</div>
              ) : (
                <div className="company-grid">
                  {filteredCompanies.map((c) => (
                    <div
                      key={c.companyId}
                      className="company-card"
                      onClick={() => {
                        setSelectedCompany(c);
                        localStorage.setItem("selectedCompany", JSON.stringify(c));
                      }}
                    >
                      <div className="cover">
                        <img
                          src={c.coverUrl || "/default-cover.jpg"}
                          alt="cover"
                        />
                      </div>
                      <div className="logo">
                        <img src={c.logoUrl || "/default-logo.png"} alt="logo" />
                      </div>
                      <h3>{c.name}</h3>
                      <p className="address">{c.address || "Chưa cập nhật địa chỉ"}</p>
                      <p className="desc">{c.description || "Chưa có mô tả"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Tạo công ty */}
          {activeTab === "create" && (
            <div className="company-create-tab">
              <form className="company-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-row">
                  <label>Tên công ty *</label>
                  <input
                    name="name"
                    placeholder="Ví dụ: CMC Global"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <div className="field-error1">{errors.name}</div>}
                </div>

                <div className="form-row">
                  <label>Ngành nghề *</label>
                  <input
                    name="industry"
                    placeholder="Ví dụ: IT Services"
                    value={form.industry}
                    onChange={(e) =>
                      setForm({ ...form, industry: e.target.value })
                    }
                  />
                  {errors.industry && (
                    <div className="field-error1">{errors.industry}</div>
                  )}
                </div>

                <div className="form-row">
                  <label>Mô tả *</label>
                  <textarea
                    name="description"
                    placeholder="Giới thiệu về công ty, văn hoá, sứ mệnh..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                  {errors.description && (
                    <div className="field-error1">{errors.description}</div>
                  )}
                </div>

                <div className="form-row">
                  <label>Logo URL *</label>
                  <input
                    name="logoUrl"
                    placeholder="https://example.com/logo.png"
                    value={form.logoUrl}
                    onChange={(e) =>
                      setForm({ ...form, logoUrl: e.target.value })
                    }
                  />
                  {errors.logoUrl && (
                    <div className="field-error1">{errors.logoUrl}</div>
                  )}
                </div>

                <div className="form-row">
                  <label>Ảnh bìa URL *</label>
                  <input
                    name="coverUrl"
                    placeholder="https://example.com/cover.jpg"
                    value={form.coverUrl}
                    onChange={(e) =>
                      setForm({ ...form, coverUrl: e.target.value })
                    }
                  />
                  {errors.coverUrl && (
                    <div className="field-error1">{errors.coverUrl}</div>
                  )}
                </div>

                <div className="form-row">
                  <label>Website *</label>
                  <input
                    name="website"
                    placeholder="https://example.com"
                    value={form.website}
                    onChange={(e) =>
                      setForm({ ...form, website: e.target.value })
                    }
                  />
                  {errors.website && (
                    <div className="field-error1">{errors.website}</div>
                  )}
                </div>

                <div className="form-row">
                  <label>Địa chỉ *</label>
                  <input
                    name="address"
                    placeholder="Số nhà, đường, phường/xã"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                  {errors.address && (
                    <div className="field-error1">{errors.address}</div>
                  )}
                </div>

                <div className="form-row">
                  <label>Thành phố *</label>
                  <input
                    name="city"
                    placeholder="Hà Nội, HCM..."
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                  {errors.city && (
                    <div className="field-error1">{errors.city}</div>
                  )}
                </div>

                <div className="form-row">
                  <label>Quy mô *</label>
                  <select
                    name="size"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                  >
                    <option value="SMALL">Nhỏ (dưới 50 người)</option>
                    <option value="MEDIUM">Trung bình (50–200)</option>
                    <option value="LARGE">Lớn (200–1000)</option>
                    <option value="ENTERPRISE">Doanh nghiệp (1000+)</option>
                  </select>
                  {errors.size && (
                    <div className="field-error1">{errors.size}</div>
                  )}
                </div>

                <div className="form-row">
                  <label>Năm thành lập *</label>
                  <input
                    name="foundedYear"
                    type="number"
                    placeholder="Ví dụ: 2015"
                    value={form.foundedYear}
                    onChange={(e) =>
                      setForm({ ...form, foundedYear: e.target.value })
                    }
                  />
                  {errors.foundedYear && (
                    <div className="field-error1">{errors.foundedYear}</div>
                  )}
                </div>
              </form>

              <button
                className="btn-create"
                disabled={creatingCompany}
                onClick={handleCreateCompany}
              >
                {creatingCompany ? "Đang xử lý..." : "Tạo công ty"}
              </button>
            </div>
          )}
        </>
      ) : (
        // Chi tiết company đã chọn + tạo employer
        <div className="company-detail-page">
          <div className="detail-hero">
            <div className="detail-cover">
              <img
                src={selectedCompany.coverUrl || "/default-cover.jpg"}
                alt="cover"
                className="detail-cover-img"
              />
            </div>
            <div className="detail-hero-below">
              <div className="detail-logo-wrapper">
                <img
                  src={selectedCompany.logoUrl || "/default-logo.png"}
                  alt="logo"
                  className="detail-logo"
                />
              </div>
              <div className="detail-title">
                <h1>{selectedCompany.name}</h1>
                <p className="detail-subtitle">
                  {selectedCompany.industry || "Chưa rõ ngành"}
                </p>
                <p className="detail-city">
                  {selectedCompany.city || "Không rõ thành phố"}
                </p>
              </div>
            </div>
          </div>

          <div className="detail-info-section">
            <div className="detail-info-grid">
              <div className="info-card">
                <div className="info-icon">📍</div>
                <div>
                  <strong>Địa chỉ</strong>
                  <p>{selectedCompany.address || "Chưa cập nhật"}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">🌐</div>
                <div>
                  <strong>Website</strong>
                  <p>
                    {selectedCompany.website ? (
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {selectedCompany.website}
                      </a>
                    ) : (
                      "Chưa có"
                    )}
                  </p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">👥</div>
                <div>
                  <strong>Quy mô</strong>
                  <p>{selectedCompany.size}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">📅</div>
                <div>
                  <strong>Năm thành lập</strong>
                  <p>{selectedCompany.foundedYear || "Chưa cập nhật"}</p>
                </div>
              </div>
            </div>

            <div className="info-card description-card">
              <strong>Giới thiệu công ty</strong>
              <p className="company-desc">
                {selectedCompany.description || "Chưa có mô tả."}
              </p>
            </div>
          </div>

          <div className="detail-actions">
            <button
              className="btn-secondary"
              onClick={() => setSelectedCompany(null)}
            >
              Quay lại
            </button>
            <button
              className="btn-primary"
              onClick={handleCreateEmployerProfile}
              disabled={creatingEmployer}
            >
              {creatingEmployer ? "Đang tạo hồ sơ..." : "Tạo hồ sơ nhà tuyển dụng"}
            </button>
          </div>

          {/* Hiển thị lỗi từ BE/FE nếu có (ví dụ email công việc) */}
          {errors.workEmail && (
            <div className="field-error1" style={{ marginTop: 8 }}>
              {errors.workEmail}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default CompanyInfo;