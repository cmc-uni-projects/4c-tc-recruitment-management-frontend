
// src/pages/hr/CompanyInfo.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { companyAPI } from "../../services/auth.services";
import "./CompanyInfo.css";
// Reuse visual layout classes from ManageCompanySection
import "./ManageCompanySection.css";
// Enhanced styles to fix overlapping and beautify preview/pending sections
import "./CompanyInfo.enhanced.css";

/* ========= Danh sách tỉnh/thành ========= */
const VIETNAM_PROVINCES = [
  "Hà Nội","Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ","An Giang","Bà Rịa - Vũng Tàu","Bắc Giang","Bắc Kạn","Bắc Ninh",
  "Bến Tre","Bình Dương","Bình Định","Bình Phước","Bình Thuận","Cà Mau","Cao Bằng","Đắk Lắk","Đắk Nông","Điện Biên",
  "Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Tĩnh","Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa",
  "Kiên Giang","Kon Tum","Lai Châu","Lâm Đồng","Lạng Sơn","Long An","Nam Định","Nghệ An","Ninh Bình","Ninh Thuận",
  "Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh",
  "Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên Huế","Tiền Giang","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"
];
/* ========= Helpers ========= */
const currentYear = new Date().getFullYear();
const onlyDigits = (s) => (s ?? "").replace(/[^\d]/g, "");
const isValidUrl = (value) => {
  if (!value) return false;
  try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol); }
  catch { return false; }
};
const isValidYear = (y) => /^\d{4}$/.test(String(y)) && y >= 1800 && y <= currentYear;
const isValidTaxCode = (tax) => /^\d{10,13}$/.test(onlyDigits(tax));
/* ========= Combobox City (responsive + a11y) ========= */
function CitySelect({ value, onChange, options, label = "Thành phố (City)", placeholder = "Tìm kiếm tỉnh/thành...", error }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const ref = useRef(null);
  const listId = "city-listbox";
  const filtered = options.filter((c) =>
    c.toLowerCase().includes(query.trim().toLowerCase())
  );
  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setHi(-1);
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
    <div className="form-row full" ref={ref}>
      <label>
        {label} <span className="required">*</span>
      </label>
      <input
        type="text"
        className={`combobox-input ${error ? "input-error" : ""}`}
        placeholder={placeholder}
        value={open ? query : (value ?? "")}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKey}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        aria-invalid={!(!error)}
        aria-describedby={error ? "city-error" : undefined}
      />
      {error && <div id="city-error" className="error-text">{error}</div>}
      {open && (
        <div className="combobox-list" role="listbox" id={listId}>
          {filtered.length === 0 ? (
            <div className="combobox-item combobox-empty">Không có kết quả</div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item}
                role="option"
                aria-selected={idx === hi}
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
}
const CompanyInfo = () => {
  const navigate = useNavigate();
  /* Tabs */
  const [activeTab, setActiveTab] = useState("select");
  /* Public companies */
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCompanies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [companies, searchTerm]);
  /* Selection */
  const [selectedCompany, setSelectedCompany] = useState(null);
  /* Create form (HR) */
  const [form, setForm] = useState({
    name: "", taxCode: "", industry: "", description: "",
    logoUrl: "", coverUrl: "", website: "", address: "", city: "", size: "MEDIUM", foundedYear: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [creatingCompany, setCreatingCompany] = useState(false);
  /* Stepper */
  const [step, setStep] = useState(1); // 1: nhập, 2: xem trước, 3: chờ duyệt
  /* Pending company & polling */
  const [pendingCompany, setPendingCompany] = useState(null);
  const pollRef = useRef(null);
  /* Upload GPKD */
  const [brFile, setBrFile] = useState(null);
  const [brPreview, setBrPreview] = useState(null);
  const [brFileUrl, setBrFileUrl] = useState(null); // object URL để xem ngay
  const fileInputRef = useRef(null);
  /* ========= Load public companies ========= */
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const res = await companyAPI.getAllActive();
        setCompanies(res.data ?? []);
      } catch {
        Swal.fire({ icon: "error", title: "Lỗi", text: "Không thể tải danh sách công ty public." });
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  /* ========= Khôi phục công ty PENDING khi mở màn ========= */
  useEffect(() => {
    const restorePending = async () => {
      const pendingId = localStorage.getItem("pendingCompanyId");
      if (!pendingId) return;
      try {
        const res = await companyAPI.getByIdAdmin(pendingId);
        const c = res.data;
        if (c?.verify === "PENDING") {
          setPendingCompany(c);
          setActiveTab("create");
          setStep(3); // chuyển thẳng tới Chờ duyệt nếu còn pending
          startPolling(c.companyId);
        } else {
          localStorage.removeItem("pendingCompanyId");
        }
      } catch {
        // im lặng
      }
    };
    restorePending();
  }, []);

  /* ========= Validation ========= */
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
    // NEW: file GPKD
    if (!brFile) e.businessRegistrationFile = "Vui lòng upload file GPKD (PDF/Ảnh)";
    return e;
  };
  const onField = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: k === "taxCode" ? onlyDigits(v) : v }));
    setTouched((prev) => ({ ...prev, [k]: true }));
  };
  useEffect(() => { setErrors(validate(form)); }, [form, brFile]);
  const isStep1Valid = () => {
    const e = validate(form);
    return !(e.name || e.taxCode || e.industry || e.description || e.logoUrl || e.coverUrl || e.website || e.address || e.city || e.size || e.foundedYear || e.businessRegistrationFile);
  };
  /* ========= Upload handlers ========= */
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setBrFile(null);
      setBrPreview(null);
      if (brFileUrl) { URL.revokeObjectURL(brFileUrl); setBrFileUrl(null); }
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      Swal.fire("Lỗi", "Chỉ chấp nhận file: JPG, PNG, PDF", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Lỗi", "File không được vượt quá 10MB", "error");
      return;
    }
    // Tạo object URL mới, revoke cái cũ nếu có
    if (brFileUrl) URL.revokeObjectURL(brFileUrl);
    const objUrl = URL.createObjectURL(file);
    setBrFileUrl(objUrl);
    setBrFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setBrPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      // Preview bằng ảnh đại diện PDF
      setBrPreview("/pdf-preview.png");
    }
  };
  // Cleanup object URL khi unmount
  useEffect(() => {
    return () => {
      if (brFileUrl) URL.revokeObjectURL(brFileUrl);
    };
  }, [brFileUrl]);

  /* ========= GỬI DUYỆT (ở Step 2) ========= */
  const confirmAndCreateCompany = async () => {
    // Guard: chặn tạo mới khi đang có yêu cầu PENDING
    if (pendingCompany?.verify === "PENDING") {
      Swal.fire({
        icon: "info",
        title: "Đang có yêu cầu chờ duyệt",
        text: "Bạn không thể tạo công ty mới khi yêu cầu hiện tại đang ở trạng thái CHỜ DUYỆT.",
      });
      setActiveTab("create");
      setStep(3);
      return;
    }

    // Chạm tất cả để hiện lỗi nếu có
    setTouched(Object.keys(form).reduce((acc, k) => (acc[k] = true, acc), {}));
    if (!isStep1Valid()) {
      Swal.fire({ icon: "warning", title: "Thông tin chưa hợp lệ", text: "Vui lòng kiểm tra các trường được đánh dấu." });
      setStep(1);
      return;
    }

    setCreatingCompany(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      fd.append("businessRegistrationFile", brFile);
      const res = await companyAPI.createForHR(fd);
      const company = res.data;
      setPendingCompany(company);
      localStorage.setItem("pendingCompanyId", company.companyId);
      setActiveTab("create");
      setStep(3); // bước chờ duyệt
      Swal.fire({
        icon: "success",
        title: "Đã gửi yêu cầu duyệt",
        text: "Thông tin của bạn đang ở trạng thái CHỜ DUYỆT. Admin sẽ sớm phản hồi.",
        timer: 2000,
        showConfirmButton: false,
      });
      startPolling(company.companyId);
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Tạo công ty thất bại. Vui lòng thử lại.";
      Swal.fire({ icon: "error", title: "Lỗi", text: msg });
    } finally {
      setCreatingCompany(false);
    }
  };

  const startPolling = (companyId) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await companyAPI.getByIdAdmin(companyId);
        const c = res.data;
        setPendingCompany(c);
        if (c.verify === "APPROVE") {
          stopPolling();
          Swal.fire({ icon: "success", title: "Công ty đã được duyệt!", timer: 1200, showConfirmButton: false });
          localStorage.setItem("selectedCompany", JSON.stringify(c));
          localStorage.setItem("selectedCompanyId", c.companyId);
          localStorage.removeItem("pendingCompanyId");
        }
        if (c.verify === "REJECT") {
          stopPolling();
          Swal.fire({
            icon: "error",
            title: "Yêu cầu bị từ chối",
            text: "Bạn có thể chỉnh sửa thông tin và gửi tạo lại.",
          });
          localStorage.removeItem("pendingCompanyId");
        }
      } catch { /* im lặng */ }
    }, 8000);
  };
  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  useEffect(() => stopPolling, []);

  /* ========= Chỉnh sửa & tạo lại sau khi REJECT ========= */
  const editRejectedAndRetry = () => {
    if (!pendingCompany) return;
    setForm((prev) => ({
      name: pendingCompany?.name ?? prev.name,
      taxCode: pendingCompany?.taxCode ?? prev.taxCode,
      industry: pendingCompany?.industry ?? prev.industry,
      description: pendingCompany?.description ?? prev.description,
      logoUrl: pendingCompany?.logoUrl ?? prev.logoUrl,
      coverUrl: pendingCompany?.coverUrl ?? prev.coverUrl,
      website: pendingCompany?.website ?? prev.website,
      address: pendingCompany?.address ?? prev.address,
      city: pendingCompany?.city ?? prev.city,
      size: pendingCompany?.size ?? prev.size,
      foundedYear: pendingCompany?.foundedYear ?? prev.foundedYear,
    }));
    setActiveTab("create");
    setStep(1);
    if (!brFile && !brFileUrl && !pendingCompany?.businessRegistrationFileUrl) {
      Swal.fire({
        icon: "info",
        title: "Chỉnh sửa & tạo lại",
        text: "Bạn có thể chỉnh sửa các trường. Vui lòng tải lại GPKD nếu hệ thống không còn lưu file.",
      });
    }
  };
  const goToPersonalInfo = () => {
    const c = selectedCompany ?? pendingCompany;
    if (!c) {
      Swal.fire({ icon: "info", title: "Vui lòng chọn/đợi công ty được duyệt" });
      return;
    }
    localStorage.setItem("selectedCompany", JSON.stringify(c));
    localStorage.setItem("selectedCompanyId", c.companyId);
    navigate("/hr/profile");
  };
  const resetFlow = () => {
    stopPolling();
    setPendingCompany(null);
    setSelectedCompany(null);
    setActiveTab("select");
    setStep(1);
    localStorage.removeItem("selectedCompany");
    localStorage.removeItem("selectedCompanyId");
    localStorage.removeItem("pendingCompanyId");
  };

  /* ========= Render ========= */
  return (
    <div className="hr-company-wrap">
      {/* Header */}
      <div className="hero">
        <div className="hero-content">
          <h1>Thiết lập công ty (HR)</h1>
          <p>Chọn công ty public để tiếp tục, hoặc tạo công ty mới và gửi duyệt đến Admin.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist" aria-label="Chọn chế độ">
        <button
          className={activeTab === "select" ? "active" : ""}
          onClick={() => setActiveTab("select")}
          role="tab"
          aria-selected={activeTab === "select"}
        >
          1) Chọn công ty
        </button>
        <button
          className={activeTab === "create" ? "active" : ""}
          onClick={() => {
            if (pendingCompany?.verify === "PENDING") return; // chặn khi đang pending
            setActiveTab("create");
          }}
          disabled={pendingCompany?.verify === "PENDING"}
          role="tab"
          aria-selected={activeTab === "create"}
        >
          2) Tạo công ty mới
        </button>
      </div>

      {/* SELECT TAB */}
      {activeTab === "select" && (
        <div className="card glass">
          {!selectedCompany ? (
            <>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Nhập tên công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Tìm kiếm công ty theo tên"
                />
              </div>
              {loadingCompanies ? (
                <div className="skeleton-grid">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div className="skeleton-card" key={i}>
                      <div className="sk-cover shimmer" />
                      <div className="sk-line shimmer" />
                      <div className="sk-line small shimmer" />
                      <div className="sk-line small shimmer" />
                    </div>
                  ))}
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="empty">Không tìm thấy công ty phù hợp.</div>
              ) : (
                <div className="company-grid">
                  {filteredCompanies.map((c) => (
                    <div
                      key={c.companyId}
                      className="company-card fancy"
                      onClick={() => setSelectedCompany(c)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedCompany(c)}
                      aria-label={`Chọn công ty ${c.name}`}
                    >
                      <div className="cover">
                        <img src={c.coverUrl ?? "/default-cover.jpg"} alt="cover" />
                      </div>
                      <div className="row">
                        <img className="logo" src={c.logoUrl ?? "/default-logo.png"} alt="logo" />
                        <div className="title">
                          <h3 className="one-line">{c.name}</h3>
                          <p className="one-line muted">{c.address ?? "Chưa cập nhật địa chỉ"}</p>
                          <span className="verify-badge approve">APPROVE</span>
                        </div>
                      </div>
                      <p className="desc">{c.description ?? "Chưa có mô tả"}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="selected-detail">
              <div className="detail-head">
                <img className="detail-cover" src={selectedCompany.coverUrl ?? "/default-cover.jpg"} alt="cover" />
                <div className="detail-info">
                  <img className="detail-logo" src={selectedCompany.logoUrl ?? "/default-logo.png"} alt="logo" />
                  <div>
                    <h2 className="one-line">{selectedCompany.name}</h2>
                    <p className="one-line muted">{selectedCompany.industry ?? "-"}</p>
                    <p className="one-line muted">{selectedCompany.city ?? "-"}</p>
                  </div>
                </div>
              </div>
              <div className="actions" style={{ marginTop: 12 }}>
                <button className="btn secondary" onClick={() => setSelectedCompany(null)}>Chọn lại</button>
                <button className="btn primary" onClick={goToPersonalInfo}>
                  Chuyển tiếp → Nhập thông tin cá nhân
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE TAB */}
      {activeTab === "create" && (
        <div className="card glass">
          {/* Stepper */}
          <div className="stepper">
            {["Thông tin cơ bản", "Xem trước & Xác nhận", "Chờ duyệt"].map((label, i) => {
              const idx = i + 1;
              const state = idx < step ? "done" : (idx === step ? "active" : "next");
              return (
                <div key={label} className={`step ${state}`}>
                  <div className="bubble">{idx}</div>
                  <div className="label">{label}</div>
                </div>
              );
            })}
          </div>

          {/* STEP 1: Form (nhập) */}
          {step === 1 && (
            <form className="grid-2" onSubmit={(e) => e.preventDefault()}>
              {/* Tên công ty */}
              <div className="form-row">
                <label>Tên công ty <span className="required">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => onField("name", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  className={touched.name && errors.name ? "input-error" : ""}
                  placeholder="Ví dụ: CMC Global"
                />
                {touched.name && errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              {/* MST */}
              <div className="form-row">
                <label>Mã số thuế (10–13 số) <span className="required">*</span></label>
                <input
                  value={form.taxCode}
                  onChange={(e) => onField("taxCode", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, taxCode: true }))}
                  className={touched.taxCode && errors.taxCode ? "input-error" : ""}
                  inputMode="numeric"
                  placeholder="VD: 0312345678"
                />
                {touched.taxCode && errors.taxCode && <div className="error-text">{errors.taxCode}</div>}
              </div>
              {/* Ngành nghề */}
              <div className="form-row">
                <label>Ngành nghề <span className="required">*</span></label>
                <input
                  value={form.industry}
                  onChange={(e) => onField("industry", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, industry: true }))}
                  className={touched.industry && errors.industry ? "input-error" : ""}
                  placeholder="VD: IT Services"
                />
                {touched.industry && errors.industry && <div className="error-text">{errors.industry}</div>}
              </div>
              {/* Mô tả */}
              <div className="form-row">
                <label>Mô tả (≥ 30 ký tự) <span className="required">*</span></label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => onField("description", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, description: true }))}
                  className={touched.description && errors.description ? "input-error" : ""}
                  placeholder="Giới thiệu về công ty, văn hóa, sứ mệnh..."
                />
                {touched.description && errors.description && <div className="error-text">{errors.description}</div>}
              </div>
              {/* Logo URL */}
              <div className="form-row">
                <label>Logo URL <span className="required">*</span></label>
                <input
                  value={form.logoUrl}
                  onChange={(e) => onField("logoUrl", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, logoUrl: true }))}
                  className={touched.logoUrl && errors.logoUrl ? "input-error" : ""}
                  placeholder="https://example.com/logo.png"
                />
                {touched.logoUrl && errors.logoUrl && <div className="error-text">{errors.logoUrl}</div>}
              </div>
              {/* Cover URL */}
              <div className="form-row">
                <label>Ảnh bìa URL <span className="required">*</span></label>
                <input
                  value={form.coverUrl}
                  onChange={(e) => onField("coverUrl", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, coverUrl: true }))}
                  className={touched.coverUrl && errors.coverUrl ? "input-error" : ""}
                  placeholder="https://example.com/cover.jpg"
                />
                {touched.coverUrl && errors.coverUrl && <div className="error-text">{errors.coverUrl}</div>}
              </div>
              {/* Website */}
              <div className="form-row">
                <label>Website <span className="required">*</span></label>
                <input
                  value={form.website}
                  onChange={(e) => onField("website", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, website: true }))}
                  className={touched.website && errors.website ? "input-error" : ""}
                  placeholder="https://example.com"
                />
                {touched.website && errors.website && <div className="error-text">{errors.website}</div>}
              </div>
              {/* Địa chỉ */}
              <div className="form-row">
                <label>Địa chỉ <span className="required">*</span></label>
                <input
                  value={form.address}
                  onChange={(e) => onField("address", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                  className={touched.address && errors.address ? "input-error" : ""}
                  placeholder="Số nhà, đường, phường/xã..."
                />
                {touched.address && errors.address && <div className="error-text">{errors.address}</div>}
              </div>
              {/* City combobox */}
              <CitySelect
                value={form.city}
                onChange={(val) => onField("city", val)}
                options={VIETNAM_PROVINCES}
                error={touched.city ? errors.city : ""}
              />
              {/* Quy mô */}
              <div className="form-row">
                <label>Quy mô <span className="required">*</span></label>
                <select
                  value={form.size}
                  onChange={(e) => onField("size", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, size: true }))}
                  className={touched.size && errors.size ? "input-error" : ""}
                >
                  <option value="SMALL">Nhỏ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="LARGE">Lớn</option>
                  <option value="ENTERPRISE">Doanh nghiệp</option>
                </select>
                {touched.size && errors.size && <div className="error-text">{errors.size}</div>}
              </div>
              {/* Năm thành lập */}
              <div className="form-row">
                <label>Năm thành lập <span className="required">*</span></label>
                <input
                  type="number"
                  value={form.foundedYear}
                  onChange={(e) => onField("foundedYear", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, foundedYear: true }))}
                  className={touched.foundedYear && errors.foundedYear ? "input-error" : ""}
                  placeholder="Ví dụ: 2015"
                />
                {touched.foundedYear && errors.foundedYear && <div className="error-text">{errors.foundedYear}</div>}
              </div>
              {/* Upload Giấy phép kinh doanh */}
              <div className="form-row full">
                <label>Giấy phép kinh doanh (PDF/Ảnh) <span className="required">*</span></label>
                <div className="upload-section">
                  <div className="drop-zone">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={onFileChange}
                      id="br-file-input"
                    />
                    <label htmlFor="br-file-input" className="drop-label">
                      {brFile && brPreview ? (
                        <div className="file-preview">
                          <span className="file-name">{brFile?.name ?? "Đã tải lên GPKD"}</span>
                          {brPreview && <img src={brPreview} alt="Preview" className="preview-img" />}
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon">Upload</div>
                          <p>Kéo & thả file vào đây hoặc nhấn để chọn</p>
                          <p className="file-info">Tối đa 10MB • JPG, PNG, PDF</p>
                          <button type="button" className="btn-choose-file">Chọn file</button>
                        </>
                      )}
                    </label>
                  </div>
                  {errors.businessRegistrationFile && <div className="error-text">{errors.businessRegistrationFile}</div>}
                </div>
              </div>
              {/* Actions */}
              <div className="form-actions">
                <button className="btn secondary" type="button" onClick={() => setActiveTab("select")}>Quay lại “Chọn công ty”</button>
                <button
                  className="btn primary"
                  type="button"
                  onClick={() => {
                    if (!isStep1Valid()) {
                      Swal.fire({ icon: "warning", title: "Thông tin chưa hợp lệ", text: "Vui lòng kiểm tra các trường được đánh dấu." });
                      return;
                    }
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={pendingCompany?.verify === "PENDING"}
                  title={
                    pendingCompany?.verify === "PENDING"
                      ? "Đang có yêu cầu CHỜ DUYỆT — không thể tạo công ty mới"
                      : (!isStep1Valid() ? "Hoàn thành thông tin trước khi xem trước" : "")
                  }
                >
                  Xem trước
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Xem trước (ManageCompany layout, enhanced) */}
          {step === 2 && (
            <div className="company-preview">
              {/* Cover + Logo nổi */}
              <div className="cover-photo-wrapper">
                <div className="cover-photo">
                  <img
                    src={form.coverUrl || "/default-cover.jpg"}
                    alt="Ảnh bìa công ty"
                    onError={(e) => { e.currentTarget.src = "/default-cover.jpg"; }}
                  />
                </div>
                <div className="company-logo-floating">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo công ty" onError={(e) => { e.currentTarget.src = "/default-logo.png"; }} />
                  ) : (
                    <div className="logo-placeholder">
                      <span>{form.name?.[0]?.toUpperCase() || "C"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Header info */}
              <div className="company-main-info preview">
                <div className="company-header">
                  <div>
                    <h1 className="company-name">{form.name || "Tên công ty"}</h1>
                    <div className="company-meta-info">
                      <span className="industry">{form.industry || "Chưa cập nhật ngành nghề"}</span>
                      {form.city && <span className="location"> • {form.city}</span>}
                    </div>
                  </div>
                  <div className="header-actions">
                    <span className="status-badge active">Xem trước</span>
                  </div>
                </div>
              </div>

              {/* Details preview section */}
              <div className="company-details-section">
                <div className="detail-columns">
                  <div className="detail-card">
                    <h3>Thông tin chung</h3>
                    <div className="kv"><span>Tên công ty:</span><b>{form.name}</b></div>
                    <div className="kv"><span>Mã số thuế:</span><b>{form.taxCode}</b></div>
                    <div className="kv"><span>Ngành nghề:</span><b>{form.industry}</b></div>
                    <div className="kv"><span>Quy mô:</span><b>{form.size}</b></div>
                    <div className="kv"><span>Năm thành lập:</span><b>{form.foundedYear}</b></div>
                    <div className="kv"><span>Thành phố:</span><b>{form.city}</b></div>
                  </div>
                  <div className="detail-card">
                    <h3>Liên kết & địa chỉ</h3>
                    <div className="kv"><span>Website:</span><a href={form.website} target="_blank" rel="noreferrer">{form.website}</a></div>
                    <div className="kv"><span>Logo URL:</span><a href={form.logoUrl} target="_blank" rel="noreferrer">{form.logoUrl}</a></div>
                    <div className="kv"><span>Cover URL:</span><a href={form.coverUrl} target="_blank" rel="noreferrer">{form.coverUrl}</a></div>
                    <div className="kv"><span>Địa chỉ:</span><b className="one-line">{form.address}</b></div>
                  </div>
                </div>

                <div className="desc-block">
                  <h3>Mô tả</h3>
                  <p>{form.description}</p>
                </div>

                {/* BR preview */}
                <div className="review-br-box" style={{ marginTop: 12 }}>
                  <div className="media-label">Giấy phép kinh doanh</div>
                  <img
                    className="review-br"
                    src={brPreview ?? "/pdf-preview.png"}
                    alt="GPKD (preview)"
                    onError={(e) => { e.currentTarget.src = "/pdf-preview.png"; }}
                  />
                </div>

                <div className="form-actions">
                  <button className="btn secondary" type="button" onClick={() => setStep(1)}>Quay lại chỉnh sửa</button>
                  <button
                    className="btn primary"
                    type="button"
                    onClick={confirmAndCreateCompany}
                    disabled={creatingCompany || pendingCompany?.verify === "PENDING"}
                    title={
                      pendingCompany?.verify === "PENDING"
                        ? "Đang có yêu cầu CHỜ DUYỆT — không thể tạo công ty mới"
                        : (!isStep1Valid() ? "Hoàn thành thông tin trước khi gửi duyệt" : "")
                    }
                  >
                    {creatingCompany ? "Đang gửi..." : "Xác nhận gửi duyệt"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Chờ duyệt (ManageCompany layout, giữ nội dung cũ, bổ sung mô tả) */}
          {step === 3 && (
            <div className="company-pending">
              {/* Cover + Logo nổi */}
              <div className="cover-photo-wrapper">
                <div className="cover-photo">
                  <img
                    src={pendingCompany?.coverUrl ?? form.coverUrl ?? "/default-cover.jpg"}
                    alt="Ảnh bìa công ty"
                    onError={(e) => { e.currentTarget.src = "/default-cover.jpg"; }}
                  />
                </div>
                <div className="company-logo-floating">
                  {pendingCompany?.logoUrl || form.logoUrl ? (
                    <img
                      src={pendingCompany?.logoUrl ?? form.logoUrl}
                      alt="Logo công ty"
                      onError={(e) => { e.currentTarget.src = "/default-logo.png"; }}
                    />
                  ) : (
                    <div className="logo-placeholder">
                      <span>{(pendingCompany?.name ?? form.name)?.[0]?.toUpperCase() || "C"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Header info + badge verify */}
              <div className="company-main-info preview">
                <div className="company-header">
                  <div>
                    <h1 className="company-name">{pendingCompany?.name ?? form.name ?? "Tên công ty"}</h1>
                    <div className="company-meta-info">
                      <span className="industry">{pendingCompany?.industry ?? form.industry ?? "Chưa cập nhật ngành nghề"}</span>
                      {(pendingCompany?.city ?? form.city) && (
                        <span className="location"> • {pendingCompany?.city ?? form.city}</span>
                      )}
                    </div>
                  </div>
                  <div className="header-actions">
                    <span className={`verify-badge ${String(pendingCompany?.verify ?? "PENDING").toLowerCase()}`}>
                      {pendingCompany?.verify ?? "PENDING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chi tiết tổng quan */}
              <div className="company-details-section">
                <div className="detail-columns">
                  <div className="detail-card">
                    <h3>Tổng quan</h3>
                    <div className="kv"><span>Tên công ty:</span><b>{pendingCompany?.name ?? form.name}</b></div>
                    <div className="kv"><span>MST:</span><b>{pendingCompany?.taxCode ?? form.taxCode}</b></div>
                    <div className="kv"><span>Ngành:</span><b>{pendingCompany?.industry ?? form.industry}</b></div>
                    <div className="kv"><span>Quy mô:</span><b>{pendingCompany?.size ?? form.size}</b></div>
                    <div className="kv"><span>Năm thành lập:</span><b>{pendingCompany?.foundedYear ?? form.foundedYear}</b></div>
                    <div className="kv"><span>City:</span><b>{pendingCompany?.city ?? form.city}</b></div>
                  </div>
                  <div className="detail-card">
                    <h3>Liên kết & địa chỉ</h3>
                    <div className="kv"><span>Website:</span>
                      <a href={pendingCompany?.website ?? form.website ?? "#"} target="_blank" rel="noreferrer" onClick={(e) => { if (!(pendingCompany?.website ?? form.website)) e.preventDefault(); }}>
                        {pendingCompany?.website ?? form.website ?? "Chưa có"}
                      </a>
                    </div>
                    <div className="kv"><span>Logo:</span>
                      <a href={pendingCompany?.logoUrl ?? form.logoUrl ?? "#"} target="_blank" rel="noreferrer" onClick={(e) => { if (!(pendingCompany?.logoUrl ?? form.logoUrl)) e.preventDefault(); }}>
                        {pendingCompany?.logoUrl ?? form.logoUrl ?? "Chưa có"}
                      </a>
                    </div>
                    <div className="kv"><span>Cover:</span>
                      <a href={pendingCompany?.coverUrl ?? form.coverUrl ?? "#"} target="_blank" rel="noreferrer" onClick={(e) => { if (!(pendingCompany?.coverUrl ?? form.coverUrl)) e.preventDefault(); }}>
                        {pendingCompany?.coverUrl ?? form.coverUrl ?? "Chưa có"}
                      </a>
                    </div>
                    <div className="kv"><span>Địa chỉ:</span><b className="one-line">{pendingCompany?.address ?? form.address}</b></div>
                    <div className="kv"><span>GPKD:</span><b className="one-line">{pendingCompany?.businessRegistrationFileName ?? (brFile?.name ?? "Chưa có")}</b></div>
                  </div>
                </div>

                <div className="desc-block">
                  <h3>Mô tả</h3>
                  <p>{pendingCompany?.description ?? form.description ?? "Chưa có mô tả"}</p>
                </div>

                {/* GPKD preview */}
                <div className="review-br-box" style={{ marginTop: 12 }}>
                  <div className="media-label">Giấy phép kinh doanh</div>
                  <img
                    className="review-br"
                    src={pendingCompany?.businessRegistrationPreviewUrl ?? (brPreview ?? "/pdf-preview.png")}
                    alt="GPKD (preview)"
                    onError={(e) => { e.currentTarget.src = "/pdf-preview.png"; }}
                  />
                </div>

                {/* Actions */}
                <div className="pending-actions">
                  {pendingCompany?.verify === "APPROVE" ? (
                    <button
                      className="btn primary"
                      onClick={() => {
                        localStorage.setItem("selectedCompany", JSON.stringify(pendingCompany));
                        localStorage.setItem("selectedCompanyId", pendingCompany.companyId);
                        localStorage.removeItem("pendingCompanyId");
                        navigate("/hr/profile");
                      }}
                    >
                      Tiếp tục → Nhập thông tin cá nhân
                    </button>
                  ) : pendingCompany?.verify === "REJECT" ? (
                    <>
                      <button className="btn primary" onClick={editRejectedAndRetry}>Chỉnh sửa & tạo lại</button>
                      <button className="btn outline" disabled>Bị từ chối — vui lòng xem góp ý từ Admin</button>
                    </>
                  ) : (
                    <button className="btn secondary" disabled>Đang chờ kết quả duyệt...</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optional reset */}
      {/* <div className="actions">
        <button className="btn outline" onClick={resetFlow}>Reset flow</button>
      </div> */}
    </div>
  );
};
export default CompanyInfo;