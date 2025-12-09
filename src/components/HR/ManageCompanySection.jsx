
// ManageCompanySection.jsx
import React, { useEffect, useRef, useState } from "react";
import "./ManageCompanySection.css";
import { companyAPI, employerAPI } from "../../services/auth.services";
import Swal from "sweetalert2";

/* ========= Danh sách tỉnh/thành (giống CompanyInfo) ========= */
const VIETNAM_PROVINCES = [
  "Hà Nội","Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ","An Giang","Bà Rịa - Vũng Tàu","Bắc Giang","Bắc Kạn","Bắc Ninh",
  "Bến Tre","Bình Dương","Bình Định","Bình Phước","Bình Thuận","Cà Mau","Cao Bằng","Đắk Lắk","Đắk Nông","Điện Biên",
  "Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Tĩnh","Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa",
  "Kiên Giang","Kon Tum","Lai Châu","Lâm Đồng","Lạng Sơn","Long An","Nam Định","Nghệ An","Ninh Bình","Ninh Thuận",
  "Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh",
  "Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên Huế","Tiền Giang","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"
]; // lấy theo mẫu CompanyInfo.jsx [1](https://cmcglobalcompany-my.sharepoint.com/personal/nqlam1_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/CompanyInfo.jsx)

/* ========= Helpers & Validation (bắt chước CompanyInfo) ========= */
const currentYear = new Date().getFullYear();
const onlyDigits = (s) => (s ?? "").replace(/[^0-9]/g, "");
const isValidUrl = (value) => {
  if (!value) return false; // bắt buộc
  try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol); }
  catch { return false; }
};
const isValidYear = (y) =>
  /^\d{4}$/.test(String(y)) && y >= 1800 && y <= currentYear; // theo mẫu CompanyInfo [1](https://cmcglobalcompany-my.sharepoint.com/personal/nqlam1_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/CompanyInfo.jsx)
const isValidTaxCode = (tax) => /^\d{10,13}$/.test(onlyDigits(tax));

/* ========= Combobox Thành phố (giống CompanyInfo) ========= */
function CitySelect({ value, onChange, options, label = "Thành phố", placeholder = "Tìm kiếm tỉnh/thành...", error }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const ref = useRef(null);
  const filtered = options.filter((c) =>
    c.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false); setHi(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const select = (val) => { onChange(val); setOpen(false); setQuery(""); setHi(-1); };
  const onKey = (e) => {
    if (!open && ["ArrowDown","ArrowUp"].includes(e.key)) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { if (open && hi >= 0 && filtered[hi]) { e.preventDefault(); select(filtered[hi]); } }
    else if (e.key === "Escape") { setOpen(false); setHi(-1); }
  };

  return (
    <div className="form-group full-width" ref={ref}>
      <label className={error ? "error" : ""}>{label}</label>
      <input
        type="text"
        className={`combobox-input ${error ? "input-error" : ""}`}
        placeholder={placeholder}
        value={open ? query : (value ?? "")}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKey}
        aria-invalid={!!error}
        aria-describedby={error ? "city-error" : undefined}
      />
      {error && <div id="city-error" className="error-text">{error}</div>}

      {open && (
        <div className="combobox-list">
          {filtered.length === 0 ? (
            <div className="combobox-item combobox-empty">Không có kết quả</div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item}
                className={"combobox-item" + (idx === hi ? " combobox-item--active" : "")}
                onMouseEnter={() => setHi(idx)}
                onMouseDown={(e) => { e.preventDefault(); select(item); }}
              >
                {item}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} // triển khai dựa theo CompanyInfo.jsx [1](https://cmcglobalcompany-my.sharepoint.com/personal/nqlam1_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/CompanyInfo.jsx)

function ManageCompanySection() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form + validate states (giống mẫu CompanyInfo)
  const [originalForm, setOriginalForm] = useState({});
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
    status: "ACTIVE",
    taxCode: "", // NEW
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // HR list (giữ nguyên)
  const [hrList, setHrList] = useState([]);
  const [loadingHR, setLoadingHR] = useState(true);

  useEffect(() => { fetchCompanyData(); }, []);

  useEffect(() => {
    if (!loading && company) { fetchHrOfMyCompany(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, company]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      let employer = JSON.parse(localStorage.getItem("employer"));
      if (!employer?.employerId) {
        const resMe = await employerAPI.getMyEmployer();
        employer = resMe.data;
        localStorage.setItem("employer", JSON.stringify(employer));
      }
      const companyId = employer.company?.companyId ?? employer.companyId;
      if (!companyId) {
        Swal.fire({ icon: "error", title: "Lỗi!", text: "Không tìm thấy công ty liên kết.", confirmButtonText: "Đóng" });
        setLoading(false);
        return;
      }
      const resCompany = await companyAPI.getByIdAdmin(companyId);
      const data = resCompany.data;
      setCompany(data);

      const formData = {
        name: data.name ?? "",
        industry: data.industry ?? "",
        description: data.description ?? "",
        logoUrl: data.logoUrl ?? "",
        coverUrl: data.coverUrl ?? "",
        website: data.website ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        size: data.size ?? "MEDIUM",
        foundedYear: data.foundedYear ?? "",
        status: data.status ?? "ACTIVE",
        taxCode: data.taxCode ?? "",
      };
      setForm(formData);
      setOriginalForm(formData);

      const currentEmail = JSON.parse(localStorage.getItem("user"))?.email ?? employer.email;
      setCanEdit(data.createdBy === currentEmail);

      localStorage.setItem("selectedCompany", JSON.stringify(data));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi tải dữ liệu",
        text: err.response?.data?.message ?? "Không thể tải thông tin công ty.",
        confirmButtonText: "Đóng",
      });
    } finally { setLoading(false); }
  };

  const fetchHrOfMyCompany = async () => {
    setLoadingHR(true);
    try {
      const res = await employerAPI.getMyCompanyEmployers();
      setHrList(res.data ?? []);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Không tải được danh sách HR", text: err.response?.data?.message ?? "Vui lòng thử lại sau." });
    } finally { setLoadingHR(false); }
  };

  const startEditing = () => { setOriginalForm({ ...form }); setEditing(true); };
  const cancelEditing = async () => {
    const result = await Swal.fire({
      title: "Hủy chỉnh sửa?",
      text: "Tất cả thay đổi sẽ bị mất.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, hủy",
      cancelButtonText: "Tiếp tục chỉnh sửa",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      setForm({ ...originalForm });
      setErrors({});
      setTouched({});
      setEditing(false);
    }
  };

  /* ==== VALIDATE giống CompanyInfo (trường bắt buộc + URL http/https + MST 10–13 số) ==== */
  const validate = (d) => {
    const e = {};
    if (!d.name?.trim()) e.name = "Tên công ty là bắt buộc";
    if (!isValidTaxCode(d.taxCode)) e.taxCode = "Mã số thuế 10–13 chữ số";
    if (!d.industry?.trim()) e.industry = "Ngành nghề là bắt buộc";
    if (!d.description?.trim() || d.description.length < 30) e.description = "Mô tả tối thiểu 30 ký tự";

    if (!isValidUrl(d.logoUrl)) e.logoUrl = "Logo URL (http/https)";
    if (!isValidUrl(d.coverUrl)) e.coverUrl = "Ảnh bìa URL (http/https)";
    if (!isValidUrl(d.website)) e.website = "Website (http/https)";

    if (!d.address?.trim()) e.address = "Địa chỉ là bắt buộc";
    if (!d.city?.trim()) e.city = "Thành phố là bắt buộc";

    if (!d.size) e.size = "Quy mô là bắt buộc";
    if (!isValidYear(Number(d.foundedYear))) e.foundedYear = `Năm thành lập phải từ 1800 đến ${currentYear}`;

    return e;
  }; // theo cách trong CompanyInfo.jsx [1](https://cmcglobalcompany-my.sharepoint.com/personal/nqlam1_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/CompanyInfo.jsx)

  // cập nhật form + bật touched + tính lỗi mỗi lần nhập (đỏ ngay)
  const onField = (key, val) => {
    const v = key === "taxCode" ? onlyDigits(val) : val;
    const next = { ...form, [key]: v };
    setForm(next);
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(next));
  };

  // cập nhật lỗi khi bật/chuyển editing
  useEffect(() => { setErrors(validate(form)); }, [editing]); // đảm bảo lỗi hiện khi vào chế độ sửa

  const isFormValid = () => {
    const e = validate(form);
    return !(
      e.name || e.taxCode || e.industry || e.description ||
      e.logoUrl || e.coverUrl || e.website ||
      e.address || e.city || e.size || e.foundedYear
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // chạm tất cả để show đỏ như file mẫu
    setTouched(Object.keys(form).reduce((acc, k) => (acc[k] = true, acc), {}));
    const fieldErrors = validate(form);
    setErrors(fieldErrors);

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Thông tin chưa hợp lệ",
        text: "Vui lòng kiểm tra các trường được đánh dấu.",
      });
      return; // KHÔNG gọi API nếu còn lỗi — giống CompanyInfo [1](https://cmcglobalcompany-my.sharepoint.com/personal/nqlam1_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/CompanyInfo.jsx)
    }

    const result = await Swal.fire({
      title: "Lưu thay đổi?",
      text: "Thông tin công ty sẽ được cập nhật ngay.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Lưu thay đổi",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: { confirmButton: "swal-btn-confirm", cancelButton: "swal-btn-cancel" },
    });
    if (!result.isConfirmed) return;

    Swal.fire({ title: "Đang lưu...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await companyAPI.update(company.companyId, form);
      setCompany(res.data);
      setOriginalForm({ ...form });
      setEditing(false);
      localStorage.setItem("selectedCompany", JSON.stringify(res.data));
      Swal.fire({ icon: "success", title: "Thành công!", text: "Cập nhật thông tin công ty thành công!", timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Cập nhật thất bại", text: err.response?.data?.message ?? "Đã có lỗi xảy ra. Vui lòng thử lại.", confirmButtonText: "Đóng" });
    }
  };

  if (loading)
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Đang tải thông tin công ty...</p>
      </div>
    );
  if (!company)
    return (
      <div className="no-data">
        <p>Chưa có thông tin công ty.</p>
      </div>
    );

  // helper class
  const errCls = (field) => (touched[field] && errors[field] ? "error input-error" : "");
  const labelErr = (field) => (touched[field] && errors[field] ? "error" : "");
  const saveDisabled = !isFormValid(); // chặn lưu khi còn lỗi

  return (
    <div className="company-profile-container">
      {/* Ảnh bìa + Logo nổi */}
      <div className="cover-photo-wrapper">
        <div className="cover-photo">
          {form.coverUrl ? (<img src={form.coverUrl} alt="Cover" />) : (<div className="cover-placeholder"></div>)}
        </div>
        <div className="company-logo-floating">
          {form.logoUrl ? (
            <img src={form.logoUrl} alt="Logo công ty" />
          ) : (
            <div className="logo-placeholder">
              <span>{form.name?.[0]?.toUpperCase() ?? "C"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Thông tin chính */}
      <div className="company-main-info">
        <div className="company-header">
          <div>
            <h1 className="company-name">{form.name ?? "Tên công ty"}</h1>
            <div className="company-meta-info">
              <span className="industry">{form.industry ?? "Chưa cập nhật ngành nghề"}</span>
              {form.city && <span className="location"> • {form.city}</span>}
            </div>
          </div>
          <div className="header-actions">
            {form.status === "ACTIVE" ? (
              <span className="status-badge active">Đang hoạt động</span>
            ) : (
              <span className="status-badge inactive">Tạm dừng</span>
            )}
            {canEdit && !editing && (
              <button className="btn-edit" onClick={startEditing}>
                <i className="icon-edit"></i> Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {!canEdit && (
          <div className="permission-note">Chỉ người tạo công ty mới được chỉnh sửa thông tin</div>
        )}
      </div>

      {/* Form chỉnh sửa */}
      <div className="company-details-section">
        <form onSubmit={handleSave} className="company-form-modern">
            {/* Cột trái (rộng hơn) */}
            <div className="form-row-2">
              <div className="form-group">
                <label className={labelErr("name")}>Tên công ty</label>
                <input
                  type="text"
                  value={form.name}
                  disabled={!editing}
                  onChange={(e) => onField("name", e.target.value)}
                  className={errCls("name")}
                  placeholder="Ví dụ: CMC Global"
                />
                {touched.name && errors.name && <div className="error-text">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className={labelErr("taxCode")}>Mã số thuế (10–13 số)</label>
                <input
                  type="text"
                  value={form.taxCode}
                  disabled={!editing}
                  onChange={(e) => onField("taxCode", e.target.value)}
                  className={errCls("taxCode")}
                  inputMode="numeric"
                  maxLength={13}
                  placeholder="VD: 0312345678"
                />
                {touched.taxCode && errors.taxCode && <div className="error-text">{errors.taxCode}</div>}
              </div>

              <div className="form-group">
                <label className={labelErr("industry")}>Ngành nghề</label>
                <input
                  type="text"
                  value={form.industry}
                  disabled={!editing}
                  onChange={(e) => onField("industry", e.target.value)}
                  className={errCls("industry")}
                  placeholder="VD: IT Services"
                />
                {touched.industry && errors.industry && <div className="error-text">{errors.industry}</div>}
              </div>

              <div className="form-group full-width">
                <label className={labelErr("description")}>Mô tả (≥ 30 ký tự)</label>
                <textarea
                  rows="6"
                  value={form.description}
                  disabled={!editing}
                  onChange={(e) => onField("description", e.target.value)}
                  className={errCls("description")}
                  placeholder="Giới thiệu về công ty, văn hóa, sứ mệnh..."
                ></textarea>
                {touched.description && errors.description && <div className="error-text">{errors.description}</div>}
              </div>
            </div>

            {/* Cột phải */}
            <div className="form-row-2">
              <div className="form-group">
                <label className={labelErr("logoUrl")}>Logo URL</label>
                <input
                  type="url"
                  value={form.logoUrl}
                  disabled={!editing}
                  onChange={(e) => onField("logoUrl", e.target.value)}
                  className={errCls("logoUrl")}
                  placeholder="https://example.com/logo.png"
                />
                {touched.logoUrl && errors.logoUrl && <div className="error-text">{errors.logoUrl}</div>}
              </div>

              <div className="form-group">
                <label className={labelErr("coverUrl")}>Ảnh bìa URL</label>
                <input
                  type="url"
                  value={form.coverUrl}
                  disabled={!editing}
                  onChange={(e) => onField("coverUrl", e.target.value)}
                  className={errCls("coverUrl")}
                  placeholder="https://example.com/cover.jpg"
                />
                {touched.coverUrl && errors.coverUrl && <div className="error-text">{errors.coverUrl}</div>}
              </div>

              <div className="form-group">
                <label className={labelErr("website")}>Website</label>
                <input
                  type="url"
                  value={form.website}
                  disabled={!editing}
                  onChange={(e) => onField("website", e.target.value)}
                  className={errCls("website")}
                  placeholder="https://example.com"
                />
                {touched.website && errors.website && <div className="error-text">{errors.website}</div>}
              </div>

              <div className="form-group full-width">
                <label className={labelErr("address")}>Địa chỉ trụ sở</label>
                <input
                  type="text"
                  value={form.address}
                  disabled={!editing}
                  onChange={(e) => onField("address", e.target.value)}
                  className={errCls("address")}
                  placeholder="Số nhà, đường, phường/xã..."
                />
                {touched.address && errors.address && <div className="error-text">{errors.address}</div>}
              </div>

              {/* Trạng thái */}
              {canEdit && (
                <div className="form-group">
                  <label>Trạng thái hoạt động</label>
                  <div className="radio-buttons">
                    <label className={form.status === "ACTIVE" ? "active" : ""}>
                      <input
                        type="radio"
                        name="status"
                        value="ACTIVE"
                        checked={form.status === "ACTIVE"}
                        disabled={!editing}
                        onChange={(e) => onField("status", e.target.value)}
                      />
                      Đang hoạt động
                    </label>
                    <label className={form.status === "INACTIVE" ? "active" : ""}>
                      <input
                        type="radio"
                        name="status"
                        value="INACTIVE"
                        checked={form.status === "INACTIVE"}
                        disabled={!editing}
                        onChange={(e) => onField("status", e.target.value)}
                      />
                      Tạm dừng
                    </label>
                  </div>
                </div>
              )}
            </div>

          {/* Hàng 2 cột: Năm thành lập & Thành phố (combobox) + MST đã ở cột trái */}
          <div className="form-group full-width">
            <div className="form-row-2">
              <div className="form-group">
                <label className={labelErr("foundedYear")}>Năm thành lập</label>
                <input
                  type="number"
                  value={form.foundedYear}
                  disabled={!editing}
                  onChange={(e) => onField("foundedYear", e.target.value)}
                  className={errCls("foundedYear")}
                  placeholder="Ví dụ: 2015"
                />
                {touched.foundedYear && errors.foundedYear && <div className="error-text">{errors.foundedYear}</div>}
              </div>

              {/* CitySelect: ô chọn thành phố */}
              <CitySelect
                value={form.city}
                onChange={(val) => onField("city", val)}
                options={VIETNAM_PROVINCES}
                error={touched.city ? errors.city : ""}
              />
            </div>
          </div>

          {editing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={cancelEditing}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={saveDisabled}
                title={!isFormValid() ? "Hoàn thành thông tin trước khi lưu" : ""}
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </form>

        <div className="created-by">
          Người tạo: <strong>{company.createdBy ?? "Không rõ"}</strong>
        </div>
      </div>

{/* Danh sách HR cùng công ty */}
      <div className="company-details-section">
        <div className="hr-section-header">
          <h2>Danh sách HR của công ty</h2>
          <button
            className="btn-refresh"
            onClick={fetchHrOfMyCompany}
            disabled={loadingHR}
            title="Làm mới danh sách"
          >
            ⟲ {loadingHR ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {loadingHR ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải danh sách HR...</p>
          </div>
        ) : hrList.length === 0 ? (
          <div className="no-data">Chưa có HR nào.</div>
        ) : (
          <div className="hr-list">
            {hrList.map((hr) => (
              <div key={hr.employerId} className="hr-card">
                <div className="hr-left">
                  <div className="hr-avatar">
                    {hr.user?.fullName?.[0]?.toUpperCase() ??
                      hr.user?.email?.[0]?.toUpperCase() ??
                      hr.workEmail?.[0]?.toUpperCase() ??
                      "H"}
                  </div>
                  <div className="hr-info">
                    <div className="hr-name">
                      {hr.user?.fullName ??
                        hr.user?.email ??
                        hr.workEmail ??
                        "HR"}
                    </div>
                    <div className="hr-meta">
                      {hr.positionTitle ? (
                        <span className="hr-title">{hr.positionTitle}</span>
                      ) : (
                        <span className="hr-title muted">
                          Chưa có chức danh
                        </span>
                      )}
                      {hr.department && (
                        <span className="hr-dept"> • {hr.department}</span>
                      )}
                    </div>
                    <div className="hr-contact">
                      {hr.workEmail && (
                        <a
                          href={`mailto:${hr.workEmail}`}
                          className="hr-mail"
                          title="Gửi email công việc"
                        >
                          {hr.workEmail}
                        </a>
                      )}
                      {hr.phone && (
                        <span className="hr-phone"> • {hr.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hr-right">
                  {hr.verified ? (
                    <span className="badge-verified">Đã xác minh</span>
                  ) : (
                    <span className="badge-unverified">Chưa xác minh</span>
                  )}
                  <button
                    className="btn-outline"
                    onClick={() =>
                      Swal.fire({
                        icon: "info",
                        title: "Thông tin HR",
                        html: `
                          <div style="text-align:left">
                            <div><b>Email:</b> ${
                              hr.user?.email ?? hr.workEmail ?? "N/A"
                            }</div>
                            <div><b>Chức danh:</b> ${
                              hr.positionTitle ?? "N/A"
                            }</div>
                            <div><b>Phòng ban:</b> ${
                              hr.department ?? "N/A"
                            }</div>
                            <div><b>Số điện thoại:</b> ${hr.phone ?? "N/A"}</div>
                          </div>
                        `,
                      })
                    }
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageCompanySection;
