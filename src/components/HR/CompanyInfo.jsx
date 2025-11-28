
// src/pages/hr/CompanyInfo.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  companyAPI,
  employerAPI,
  fileAPI,
} from "../../services/auth.services";
import "./CompanyInfo.css";

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
const onlyDigits = (s) => (s || "").replace(/[^0-9]/g, "");
const isValidUrl = (value) => {
  if (!value) return false;
  try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol); }
  catch { return false; }
};
const isValidYear = (y) => /^\d{4}$/.test(String(y)) && y >= 1800 && y <= currentYear;
const isValidTaxCode = (tax) => /^\d{10,13}$/.test(onlyDigits(tax));

/* ========= Combobox City ========= */
function CitySelect({ value, onChange, options, label = "Thành phố (City)", placeholder = "Tìm kiếm tỉnh/thành...", error }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const ref = useRef(null);
  const filtered = options.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setHi(-1); } };
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
      <label>{label}</label>
      <input
        type="text"
        className={`combobox-input ${error ? "input-error" : ""}`}
        placeholder={placeholder}
        value={open ? query : (value || "")}
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
}

/* ========= Drag & Drop upload GPKD (click + drop + preview + validate) ========= */
function DragDropUpload({ onFileSelected, uploadedFile }) {
  
const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const MAX_MB = 10;
  const ACCEPTED_EXT = [".pdf", ".jpg", ".jpeg", ".png"];

  const validate = (file) => {
    if (!file) return "Vui lòng chọn file";
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_MB) return `Kích thước tối đa ${MAX_MB}MB`;
    const name = (file.name || "").toLowerCase();
    if (!ACCEPTED_EXT.some(ext => name.endsWith(ext))) return "Chỉ chấp nhận PDF/JPG/JPEG/PNG";
    return "";
  };

  const handleChooseClick = () => inputRef.current?.click();
  const handleFile = (file) => {
    const msg = validate(file);
    if (msg) {
      Swal.fire({ icon: "warning", title: "File không hợp lệ", text: msg });
      return;
    }
    onFileSelected(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div
      className={`dropzone ${dragOver ? "over" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={handleChooseClick}
      role="button"
      tabIndex={0}
      aria-label="Kéo & thả hoặc bấm để chọn file GPKD"
      title="Kéo & thả file GPKD vào đây, hoặc bấm để chọn file"
    >
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ display: "none" }}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      <div className="dz-icon">📄</div>
      <p className="dz-title">Kéo & thả file GPKD vào đây, hoặc <span className="dz-browse">bấm để chọn file</span></p>
      <p className="dz-sub">Hỗ trợ: PDF, JPG, JPEG, PNG (≤ 10MB)</p>

      
{uploadedFile && (
  <div className="dz-preview">
    {uploadedFile.preview ? (
      <img src={uploadedFile.preview} alt="preview" className="dz-preview-img" />
    ) : (
      <div className="dz-file-info">
        <span className="dz-file-name one-line">{uploadedFile.name}</span>
        <span className="dz-file-size">{uploadedFile.sizeMB} MB</span>
      </div>
    )}
    <button
      type="button"
      className="btn outline"
      style={{ marginLeft: 8 }}
      onClick={() => {
        setUploadedFile(null);
        setForm(prev => ({
          ...prev,
          businessRegistrationUrl: "",
          businessRegistrationFileName: ""
        }));
      }}
    >
      Xoá file
    </button>
  </div>
)}
    </div>
  );
}

const CompanyInfo = () => {
  const navigate = useNavigate();

  /* Tabs: select | create */
  const [activeTab, setActiveTab] = useState("select");

  /* Public companies */
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCompanies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [companies, searchTerm]);

  /* Selection */
  const [selectedCompany, setSelectedCompany] = useState(null);

  /* Create company form (HR) */
  const [form, setForm] = useState({
    name: "", taxCode: "", industry: "", description: "",
    logoUrl: "", coverUrl: "", website: "",
    address: "", city: "", size: "MEDIUM", foundedYear: "",
    businessRegistrationUrl: "",
    businessRegistrationFileName: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [creatingCompany, setCreatingCompany] = useState(false);

  /* Create wizard step */
  const [step, setStep] = useState(1);

  /* Pending company & polling verify */
  const [pendingCompany, setPendingCompany] = useState(null);
  const pollRef = useRef(null);

  /* Uploaded file (create mode) */
  const [uploadedFile, setUploadedFile] = useState(null);

  /* ========= Load public companies ========= */
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const res = await companyAPI.getAllActive();
        setCompanies(res.data || []);
      } catch {
        Swal.fire({ icon: "error", title: "Lỗi", text: "Không thể tải danh sách công ty public." });
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  /* ========= Validation ========= */
  const validate = (d) => {
    const e = {};
    // Step 1
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

    // Step 2 – GPKD:
    // Nếu đã upload (có URL từ upload) -> chỉ cần tên file
    if (d.businessRegistrationUrl?.trim()) {
      if (!d.businessRegistrationFileName?.trim()) e.businessRegistrationFileName = "Tên file GPKD là bắt buộc";
    } else {
      // Chưa upload -> bắt buộc URL + tên file
      if (!isValidUrl(d.businessRegistrationUrl)) e.businessRegistrationUrl = "URL GPKD (http/https)";
      if (!d.businessRegistrationFileName?.trim()) e.businessRegistrationFileName = "Tên file GPKD là bắt buộc";
    }

    return e;
  };
  const onField = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: k === "taxCode" ? onlyDigits(v) : v }));
    setTouched((prev) => ({ ...prev, [k]: true }));
  };
  useEffect(() => {
    setErrors(validate(form));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const isStep1Valid = () => {
    const e = validate(form);
    return !(
      e.name || e.taxCode || e.industry || e.description || e.logoUrl ||
      e.coverUrl || e.website || e.address || e.city || e.size || e.foundedYear
    );
  };
  const isStep2Valid = () => {
    const e = validate(form);
    return !(e.businessRegistrationUrl || e.businessRegistrationFileName);
  };
  const isAllValid = () => Object.keys(validate(form)).length === 0;

// Sửa handleUploadBR trong CompanyInfo.jsx
const handleUploadBR = async (file) => {
  if (!file) return;

  // (Tùy chọn) kiểm tra size/type trước khi upload — xem phần (C)
  const sizeMB = Math.round((file.size / (1024 * 1024)) * 10) / 10;

  try {
    const res = await fileAPI.upload(file); // upload storage -> URL
    const { url, fileName } = res.data || {};
    if (!url) throw new Error("Upload thất bại");

    // CHỈ set trạng thái uploadedFile khi upload thành công
    setUploadedFile({
      name: file.name,
      type: file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      sizeMB,
    });

    
setForm((prev) => ({
  ...prev,
  businessRegistrationUrl: url,
  businessRegistrationFileName: fileName || file.name, // <-- đảm bảo dùng "||"
}));

    Swal.fire({ icon: "success", title: "Đã upload GPKD", timer: 1200, showConfirmButton: false });
  } catch (err) {
    // Nếu thất bại: đảm bảo cho phép nhập URL thủ công (không disable)
    setUploadedFile(null);
    Swal.fire({ icon: "error", title: "Lỗi upload", text: "Không thể upload GPKD. Vui lòng thử lại." });
  }
};

  /* ========= Tạo company (HR) ========= */
  const submitCreateCompany = async () => {
    if (!isAllValid()) {
      setTouched(Object.keys(form).reduce((acc, k) => (acc[k] = true, acc), {}));
      Swal.fire({ icon: "warning", title: "Thông tin chưa hợp lệ", text: "Vui lòng kiểm tra các trường được đánh dấu." });
      return;
    }
    setCreatingCompany(true);
    try {
      const res = await companyAPI.create(form); // HR -> verify = PENDING (service yêu cầu có GPKD) [1](https://cmcglobalcompany-my.sharepoint.com/personal/nqlam1_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/CompanyService.java)
      const company = res.data;
      setPendingCompany(company);
      setActiveTab("create");
      setStep(3);
      Swal.fire({ icon: "success", title: "Đã gửi yêu cầu duyệt", text: "Admin sẽ sớm phản hồi yêu cầu của bạn." });

      startPolling(company.companyId);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err?.response?.data?.message || "Tạo công ty thất bại. Vui lòng thử lại.",
      });
    } finally {
      setCreatingCompany(false);
    }
  };

  /* ========= Poll verify ========= */
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
        }
        if (c.verify === "REJECT") {
          stopPolling();
          Swal.fire({
            icon: "error",
            title: "Yêu cầu bị từ chối",
            text: "Bạn có thể chọn lại công ty từ đầu hoặc tạo mới công ty khác.",
          });
        }
      } catch { /* im lặng */ }
    }, 8000);
  };
  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };
  useEffect(() => stopPolling, []);

  /* ========= Tiếp tục -> sang nhập thông tin cá nhân ========= */
  const goToPersonalInfo = () => {
    if (!selectedCompany) {
      Swal.fire({ icon: "info", title: "Vui lòng chọn công ty" }); return;
    }
    localStorage.setItem("selectedCompany", JSON.stringify(selectedCompany));
    localStorage.setItem("selectedCompanyId", selectedCompany.companyId);
    navigate("/hr/profile"); // trang nhập thông tin cá nhân Employer
  };

  /* ========= Reset flow ========= */
  const resetFlow = () => {
    stopPolling();
    setPendingCompany(null); setSelectedCompany(null);
    setActiveTab("select"); setStep(1);
    localStorage.removeItem("selectedCompany"); localStorage.removeItem("selectedCompanyId");
  };

  /* ========= Upload GPKD trực tiếp cho company đã có ID (nếu cần) ========= */
  const [selectedCompanyUpload, setSelectedCompanyUpload] = useState(null);
  const uploadBRForSelectedCompany = async (file) => {
    if (!selectedCompany) return;
    const sizeMB = Math.round((file.size / (1024 * 1024)) * 10) / 10;
    setSelectedCompanyUpload({
      name: file.name,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      sizeMB,
    });
    try {
      // Gọi đúng endpoint upload GPKD cho company có id (service kiểm tra owner HR) [1](https://cmcglobalcompany-my.sharepoint.com/personal/nqlam1_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/CompanyService.java)
      const res = await companyAPI.uploadBRForCompany(selectedCompany.companyId, file);
      const url = res.data?.businessRegistrationUrl;
      if (!url) throw new Error("Upload thất bại");
      Swal.fire({ icon: "success", title: "Đã upload GPKD vào công ty", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi upload",
        text: err?.response?.data?.message || "Không thể upload GPKD vào công ty. Kiểm tra quyền sở hữu hoặc thử lại.",
      });
    }
  };

  const requestVerificationSelectedCompany = async () => {
    if (!selectedCompany) return;
    try {
      const res = await companyAPI.requestVerification(selectedCompany.companyId); // HR request verify (service check owner & GPKD) [1](https://cmcglobalcompany-my.sharepoint.com/personal/nqlam1_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/CompanyService.java)
      Swal.fire({ icon: "success", title: "Đã gửi yêu cầu duyệt công ty", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err?.response?.data?.message || "Không thể gửi yêu cầu duyệt.",
      });
    }
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
      <div className="tabs">
        <button className={activeTab === "select" ? "active" : ""} onClick={() => setActiveTab("select")}>
          1) Chọn công ty
        </button>
        <button className={activeTab === "create" ? "active" : ""} onClick={() => setActiveTab("create")}>
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
                    <div key={c.companyId} className="company-card fancy" onClick={() => setSelectedCompany(c)}>
                      <div className="cover">
                        <img src={c.coverUrl || "/default-cover.jpg"} alt="cover" />
                      </div>
                      <div className="row">
                        <img className="logo" src={c.logoUrl || "/default-logo.png"} alt="logo" />
                        <div className="title">
                          <h3 className="one-line">{c.name}</h3>
                          <p className="one-line muted">{c.address || "Chưa cập nhật địa chỉ"}</p>
                          <span className="verify-badge approve">APPROVE</span>
                        </div>
                      </div>
                      <p className="desc">{c.description || "Chưa có mô tả"}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="selected-detail">
              <div className="detail-head">
                <img className="detail-cover" src={selectedCompany.coverUrl || "/default-cover.jpg"} alt="cover" />
                <div className="detail-info">
                  <img className="detail-logo" src={selectedCompany.logoUrl || "/default-logo.png"} alt="logo" />
                  <div>
                    <h2 className="one-line">{selectedCompany.name}</h2>
                    <p className="one-line muted">{selectedCompany.industry || "-"}</p>
                    <p className="one-line muted">{selectedCompany.city || "-"}</p>
                  </div>
                </div>
              </div>
              <div className="actions" style={{ marginTop: 12 }}>
                <button className="btn secondary" onClick={() => setSelectedCompany(null)}>Chọn lại</button>
                <button className="btn primary" onClick={goToPersonalInfo}>
                  Chuyển tiếp → Nhập thông tin cá nhân
                </button>
              </div>

              {/* (Tùy chọn) Nếu muốn HR upload GPKD trực tiếp vào company đã có id & gửi duyệt */}
              <div className="card glass" style={{ marginTop: 16 }}>
                <h3 style={{ marginTop: 0 }}>Upload GPKD vào công ty này (tuỳ chọn)</h3>
                <DragDropUpload onFileSelected={uploadBRForSelectedCompany} uploadedFile={selectedCompanyUpload} />
                <div className="actions">
                  <button className="btn outline" onClick={requestVerificationSelectedCompany}>
                    Gửi yêu cầu duyệt công ty này
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE TAB */}
      {activeTab === "create" && (
        <div className="card glass">
          {!pendingCompany ? (
            <>
              {/* Stepper */}
              <div className="stepper">
                {["Thông tin cơ bản", "Giấy phép kinh doanh", "Xem lại & Gửi duyệt"].map((label, i) => {
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

              {/* STEP 1 */}
              {step === 1 && (
                <form className="grid-2" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-row full">
                    <label>Tên công ty *</label>
                    <input
                      value={form.name}
                      onChange={(e) => onField("name", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      className={touched.name && errors.name ? "input-error" : ""}
                      placeholder="Ví dụ: CMC Global"
                    />
                    {touched.name && errors.name && <div className="error-text">{errors.name}</div>}
                  </div>

                  <div className="form-row">
                    <label>Mã số thuế (10–13 số) *</label>
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

                  <div className="form-row">
                    <label>Ngành nghề *</label>
                    <input
                      value={form.industry}
                      onChange={(e) => onField("industry", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, industry: true }))}
                      className={touched.industry && errors.industry ? "input-error" : ""}
                      placeholder="VD: IT Services"
                    />
                    {touched.industry && errors.industry && <div className="error-text">{errors.industry}</div>}
                  </div>

                  <div className="form-row full">
                    <label>Mô tả (≥ 30 ký tự) *</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => onField("description", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, description: true }))}
                      className={touched.description && errors.description ? "input-error" : ""}
                      placeholder="Giới thiệu về công ty, văn hoá, sứ mệnh..."
                    />
                    {touched.description && errors.description && <div className="error-text">{errors.description}</div>}
                  </div>

                  <div className="form-row full">
                    <label>Logo URL *</label>
                    <input
                      value={form.logoUrl}
                      onChange={(e) => onField("logoUrl", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, logoUrl: true }))}
                      className={touched.logoUrl && errors.logoUrl ? "input-error" : ""}
                      placeholder="https://example.com/logo.png"
                    />
                    {touched.logoUrl && errors.logoUrl && <div className="error-text">{errors.logoUrl}</div>}
                  </div>

                  <div className="form-row full">
                    <label>Ảnh bìa URL *</label>
                    <input
                      value={form.coverUrl}
                      onChange={(e) => onField("coverUrl", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, coverUrl: true }))}
                      className={touched.coverUrl && errors.coverUrl ? "input-error" : ""}
                      placeholder="https://example.com/cover.jpg"
                    />
                    {touched.coverUrl && errors.coverUrl && <div className="error-text">{errors.coverUrl}</div>}
                  </div>

                  <div className="form-row full">
                    <label>Website *</label>
                    <input
                      value={form.website}
                      onChange={(e) => onField("website", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, website: true }))}
                      className={touched.website && errors.website ? "input-error" : ""}
                      placeholder="https://example.com"
                    />
                    {touched.website && errors.website && <div className="error-text">{errors.website}</div>}
                  </div>

                  <div className="form-row full">
                    <label>Địa chỉ *</label>
                    <input
                      value={form.address}
                      onChange={(e) => onField("address", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                      className={touched.address && errors.address ? "input-error" : ""}
                      placeholder="Số nhà, đường, phường/xã..."
                    />
                    {touched.address && errors.address && <div className="error-text">{errors.address}</div>}
                  </div>

                  <CitySelect
                    value={form.city}
                    onChange={(val) => onField("city", val)}
                    options={VIETNAM_PROVINCES}
                    error={touched.city ? errors.city : ""}
                  />

                  <div className="form-row">
                    <label>Quy mô *</label>
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

                  <div className="form-row">
                    <label>Năm thành lập *</label>
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

                  <div className="form-actions">
                    <button className="btn secondary" type="button" onClick={() => setActiveTab("select")}>
                      Quay lại “Chọn công ty”
                    </button>
                    <button
                      className="btn primary"
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!isStep1Valid()}
                      title={!isStep1Valid() ? "Hoàn thành Step 1 trước khi tiếp tục" : ""}
                    >
                      Tiếp tục → GPKD
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <DragDropUpload onFileSelected={handleUploadBR} uploadedFile={uploadedFile} />
                  <div className="grid-2">
                    <div className="form-row full">
                      <label>URL GPKD (public) {uploadedFile ? "(đã upload, không cần nhập)" : "*"}</label>
                      <input
                        value={form.businessRegistrationUrl}
                        onChange={(e) => onField("businessRegistrationUrl", e.target.value)}
                        disabled={!!uploadedFile} // disable nếu đã upload
                        className={touched.businessRegistrationUrl && errors.businessRegistrationUrl ? "input-error" : ""}
                        placeholder="https://storage.example.com/BR.pdf"
                      />
                      {!uploadedFile && touched.businessRegistrationUrl && errors.businessRegistrationUrl && (
                        <div className="error-text">{errors.businessRegistrationUrl}</div>
                      )}
                    </div>
                    <div className="form-row full">
                      <label>Tên file GPKD *</label>
                      <input
                        value={form.businessRegistrationFileName}
                        onChange={(e) => onField("businessRegistrationFileName", e.target.value)}
                        className={touched.businessRegistrationFileName && errors.businessRegistrationFileName ? "input-error" : ""}
                        placeholder="VD: BR_CMC_Global.pdf"
                      />
                      {touched.businessRegistrationFileName && errors.businessRegistrationFileName && (
                        <div className="error-text">{errors.businessRegistrationFileName}</div>
                      )}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn secondary" onClick={() => setStep(1)}>Quay lại</button>
                    <button
                      className="btn primary"
                      onClick={() => setStep(3)}
                      disabled={!isStep2Valid()}
                    >
                      Tiếp tục → Xem lại
                    </button>
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <div className="review">
                    <h3>Tổng quan thông tin</h3>
                    <div className="review-grid">
                      <div>
                        <div className="kv"><span>Tên công ty:</span><b>{form.name}</b></div>
                        <div className="kv"><span>MST:</span><b>{form.taxCode}</b></div>
                        <div className="kv"><span>Ngành:</span><b>{form.industry}</b></div>
                        <div className="kv"><span>Quy mô:</span><b>{form.size}</b></div>
                        <div className="kv"><span>Năm thành lập:</span><b>{form.foundedYear}</b></div>
                        <div className="kv"><span>City:</span><b>{form.city}</b></div>
                      </div>
                      <div>
                        <div className="kv"><span>Logo:</span><a href={form.logoUrl} target="_blank" rel="noreferrer">{form.logoUrl}</a></div>
                        <div className="kv"><span>Cover:</span><a href={form.coverUrl} target="_blank" rel="noreferrer">{form.coverUrl}</a></div>
                        <div className="kv"><span>Website:</span><a href={form.website} target="_blank" rel="noreferrer">{form.website}</a></div>
                        <div className="kv"><span>Địa chỉ:</span><b className="one-line">{form.address}</b></div>
                        <div className="kv"><span>GPKD URL:</span><a href={form.businessRegistrationUrl} target="_blank" rel="noreferrer">{form.businessRegistrationUrl}</a></div>
                        <div className="kv"><span>GPKD file:</span><b className="one-line">{form.businessRegistrationFileName}</b></div>
                      </div>
                    </div>
                    <p className="muted small">Lưu ý: HR tạo công ty sẽ ở trạng thái <b>PENDING</b> đến khi Admin duyệt. (Service đã kiểm tra GPKD) [1](https://cmcglobalcompany-my.sharepoint.com/personal/nqlam1_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/CompanyService.java)</p>
                  </div>
                  <div className="form-actions">
                    <button className="btn secondary" onClick={() => setStep(2)}>Quay lại</button>
                    <button
                      className="btn primary"
                      onClick={submitCreateCompany}
                      disabled={!isAllValid() || creatingCompany}
                    >
                      {creatingCompany ? "Đang gửi..." : "Gửi duyệt công ty"}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="pending-card">
              <div className="pending-top">
                <div className="status">
                  <span className={`verify-badge ${String(pendingCompany.verify || "").toLowerCase()}`}>
                    {pendingCompany.verify || "-"}
                  </span>
                </div>
                <h3>Yêu cầu duyệt công ty đã được gửi</h3>
                <p className="muted">
                  Admin sẽ sớm phản hồi yêu cầu của bạn.
                  {pendingCompany.verify === "PENDING" && " (Trạng thái hiện tại: PENDING)"}
                </p>
              </div>
              <div className="timeline">
                <div className={`dot ${pendingCompany.verify === "PENDING" ? "active" : ""}`}>PENDING</div>
                <div className="line" />
                <div className={`dot ${pendingCompany.verify === "APPROVE" ? "active" : ""}`}>APPROVE</div>
                <div className="line" />
                <div className={`dot ${pendingCompany.verify === "REJECT" ? "active" : ""}`}>REJECT</div>
              </div>
              <div className="pending-actions">
                <button className="btn secondary" onClick={resetFlow}>
                  Chọn lại / Tạo mới công ty khác
                </button>
                {pendingCompany.verify === "APPROVE" && (
                  <button
                    className="btn primary"
                    onClick={() => {
                      localStorage.setItem("selectedCompany", JSON.stringify(pendingCompany));
                      localStorage.setItem("selectedCompanyId", pendingCompany.companyId);
                      navigate("/hr/profile");
                    }}
                  >
                    Tiếp tục → Nhập thông tin cá nhân
                  </button>
                )}
                {pendingCompany.verify === "REJECT" && (
                  <button className="btn outline" onClick={() => { setPendingCompany(null); setStep(1); }}>
                    Tạo công ty khác
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyInfo;