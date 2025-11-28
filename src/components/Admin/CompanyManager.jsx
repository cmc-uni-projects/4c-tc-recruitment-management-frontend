
import React, { useEffect, useRef, useState } from "react";
import { companyAPI, jobAPI } from "../../services/auth.services";
import Swal from "sweetalert2";
import "./CompanyManager.css";

/** ===== Danh sách tỉnh/thành (có thể tách ra constants/provinces.js) ===== */
const vietnamProvinces = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh",
  "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận",
  "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên",
  "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam",
  "Hà Tĩnh", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa",
  "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn",
  "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận",
  "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi",
  "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh",
  "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang",
  "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

/** ===== Utils validation ===== */
const isValidUrl = (url) => {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};
const clampYear = (y) => {
  if (!y && y !== 0) return y;
  const year = Number(y);
  const current = new Date().getFullYear();
  if (Number.isNaN(year)) return null;
  if (year < 1800 || year > current) return null;
  return year;
};
const normalizeTax = (v) => (v || "").replace(/[^0-9]/g, "");

/** ===== Searchable Combobox cho city (không dùng lib) ===== */
function CitySelect({ value, onChange, options, placeholder = "Tìm kiếm tỉnh/thành...", label = "Thành phố (City)", required = true, error }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const filtered = options.filter((c) =>
    c.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectValue = (val) => {
    onChange(val);
    setOpen(false);
    setQuery("");
    setHighlightIndex(-1);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && highlightIndex >= 0 && filtered[highlightIndex]) {
        e.preventDefault();
        selectValue(filtered[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div className="form-group full-width" ref={containerRef}>
      <label>{label}</label>
      <input
        type="text"
        className={`combobox-input ${error ? "input-error" : ""}`}
        placeholder={placeholder}
        value={open ? query : (value || "")}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        required={required && !value}
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
                className={"combobox-item" + (idx === highlightIndex ? " combobox-item--active" : "")}
                onMouseEnter={() => setHighlightIndex(idx)}
                onMouseDown={(e) => { e.preventDefault(); selectValue(item); }}
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

export default function AdminCompanyManager() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /** ===== FORM STATE ===== */
  const [form, setForm] = useState({
    name: "",
    taxCode: "",
    industry: "",
    description: "",
    logoUrl: "",
    coverUrl: "",
    website: "",
    address: "",
    city: "",
    size: "MEDIUM",
    foundedYear: "",
    status: "ACTIVE",   // ACTIVE | INACTIVE
    featured: false,
    verify: undefined,  // chỉ dùng khi edit để ràng buộc Featured
  });

  /** ===== ERRORS ===== */
  const [errors, setErrors] = useState({});

  /** ===== CITY OPTIONS ===== */
  const [cities, setCities] = useState([]);

  /** ===== Fetch companies (tôn trọng orderNumber từ backend) ===== */
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await companyAPI.getAll();
      const data = res?.data ?? [];
      setCompanies(data);
      setFilteredCompanies(data);
    } catch {
      Swal.fire({ icon: "error", title: "Lỗi", text: "Không thể tải dữ liệu." });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchCompanies(); }, []);

  /** ===== Fetch city động & merge với vietnamProvinces ===== */
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await jobAPI.getApprovedJobs();
        const dynamicCities = (res?.data ?? [])
          .map((job) => (job.city || job.location || "").trim())
          .filter(Boolean);
        const unique = Array.from(
          new Set([...vietnamProvinces, ...dynamicCities].map((c) => c.trim()))
        ).sort((a, b) => a.localeCompare(b, "vi"));
        setCities(unique);
      } catch (error) {
        console.error("Lỗi khi tải city:", error);
        setCities(vietnamProvinces);
      }
    };
    fetchCities();
  }, []);

  /** ===== Filter bar ===== */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [featuredFilter, setFeaturedFilter] = useState("ALL");
  const [verifyFilter, setVerifyFilter] = useState("ALL");

  const statusLabel = (s) => (s === "ACTIVE" ? "Hoạt động" : "Ngừng hoạt động");
  const verifyLabel = (v) => {
    switch (v) {
      case "APPROVE": return "Đã duyệt";
      case "PENDING": return "Chờ duyệt";
      case "REJECT": return "Từ chối";
      default: return v || "-";
    }
  };

  const applyFilters = () => {
    const result = (companies || []).filter((c) => {
      const matchName = (c.name || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
      const matchFeatured =
        featuredFilter === "ALL" ||
        (featuredFilter === "YES" && c.featured) ||
        (featuredFilter === "NO" && !c.featured);
      const matchVerify = verifyFilter === "ALL" || c.verify === verifyFilter;
      return matchName && matchStatus && matchFeatured && matchVerify;
    });
    setFilteredCompanies(result);
  };

  // Tự động áp dụng mỗi khi filter thay đổi (bỏ nút tìm kiếm)
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, search, statusFilter, featuredFilter, verifyFilter]);

  /** ===== Validation ===== */
  const validateField = (field, value) => {
    switch (field) {
      case "name": {
        const v = (value || "").trim();
        if (!v) return "Tên công ty là bắt buộc";
        if (v.length < 2) return "Tên quá ngắn (tối thiểu 2 ký tự)";
        if (v.length > 150) return "Tên quá dài (tối đa 150 ký tự)";
        return null;
      }
      case "taxCode": {
        const raw = (value || "").trim();
        if (!raw) return "Mã số thuế là bắt buộc";
        const digits = normalizeTax(raw);
        if (digits.length < 10 || digits.length > 13) return "Mã số thuế phải từ 10 đến 13 chữ số";
        if (!/^\d+$/.test(digits)) return "Mã số thuế chỉ gồm chữ số";
        return null;
      }
      case "city": {
        const v = (value || "").trim();
        if (!v) return "Vui lòng chọn tỉnh/thành (city)";
        if (!cities.includes(v)) return "City không hợp lệ";
        return null;
      }
      case "industry": {
        const v = (value || "").trim();
        if (v && v.length > 100) return "Ngành nghề tối đa 100 ký tự";
        return null;
      }
      case "description": {
        const v = (value || "");
        if (v && v.length > 5000) return "Mô tả tối đa 5000 ký tự";
        return null;
      }
      case "website": {
        const v = (value || "").trim();
        if (v && !isValidUrl(v)) return "Website phải là URL hợp lệ (http/https)";
        if (v && v.length > 255) return "Website tối đa 255 ký tự";
        return null;
      }
      case "address": {
        const v = (value || "");
        if (v && v.length > 255) return "Địa chỉ tối đa 255 ký tự";
        return null;
      }
      case "foundedYear": {
        if (value === "" || value === null) return null;
        const year = clampYear(value);
        if (year === null) return "Năm thành lập không hợp lệ (1800 - hiện tại)";
        return null;
      }
      case "logoUrl":
      case "coverUrl": {
        const v = (value || "").trim();
        if (v && !isValidUrl(v)) return "URL không hợp lệ (http/https)";
        if (v && v.length > 255) return "URL tối đa 255 ký tự";
        return null;
      }
      case "size": {
        const allowed = ["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"];
        if (!allowed.includes(value)) return "Quy mô không hợp lệ";
        return null;
      }
      case "status": {
        const allowed = ["ACTIVE", "INACTIVE"];
        if (!allowed.includes(value)) return "Trạng thái không hợp lệ";
        return null;
      }
      case "featured":
      case "verify":
      default:
        return null;
    }
  };

  const validateForm = (data) => {
    const nextErrors = {};
    Object.keys(data).forEach((k) => {
      const err = validateField(k, data[k]);
      if (err) nextErrors[k] = err;
    });
    return nextErrors;
  };

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const msg = validateField(field, value);
      const { [field]: _, ...rest } = prev;
      return msg ? { ...rest, [field]: msg } : rest;
    });
  };

  /** ===== Modal control ===== */
  const openModal = (company = null) => {
    if (company) {
      const initial = {
        name: company.name || "",
        taxCode: company.taxCode || "",
        industry: company.industry || "",
        description: company.description || "",
        logoUrl: company.logoUrl || "",
        coverUrl: company.coverUrl || "",
        website: company.website || "",
        address: company.address || "",
        city: company.city || "",
        size: company.size || "MEDIUM",
        foundedYear: company.foundedYear ?? "",
        status: company.status || "ACTIVE",
        featured: !!company.featured,
        verify: company.verify, // dùng để ràng buộc featured
      };
      setForm(initial);
      setErrors(validateForm(initial));
      setEditingId(company.companyId);
    } else {
      const initial = {
        name: "",
        taxCode: "",
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
        featured: false,
        verify: "APPROVE", // Admin tạo -> mặc định approve theo service
      };
      setForm(initial);
      setErrors({});
      setEditingId(null);
    }
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setErrors({}); };

  /** ===== Ràng buộc Featured theo status + verify (ACTIVE + APPROVE) ===== */
  useEffect(() => {
    // Nếu chuyển INACTIVE thì tự tắt featured (đồng bộ rule backend/public)
    if (form.status === "INACTIVE" && form.featured) {
      setField("featured", false);
      Swal.fire({ icon: "info", text: "Công ty INACTIVE sẽ không được đánh dấu nổi bật/public." });
    }
    // Nếu verify không phải APPROVE thì featured cũng không được phép
    if (form.verify && form.verify !== "APPROVE" && form.featured) {
      setField("featured", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.status, form.verify]);

  /** ===== Submit ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu/nhập sai thông tin",
        text: "Vui lòng kiểm tra các trường được đánh dấu.",
      });
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...form, taxCode: normalizeTax(form.taxCode) };
      if (editingId) {
        await companyAPI.update(editingId, payload);
        Swal.fire({ icon: "success", title: "Cập nhật thành công", timer: 2000, showConfirmButton: false });
      } else {
        await companyAPI.create(payload); // Admin tạo -> verify=APPROVE (public)
        Swal.fire({ icon: "success", title: "Thêm mới thành công", timer: 2000, showConfirmButton: false });
      }
      closeModal();
      fetchCompanies();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err?.response?.data?.message ?? "Lưu thất bại. Vui lòng kiểm tra lại.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /** ===== Delete ===== */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      try {
        await companyAPI.delete(id);
        Swal.fire({ icon: "success", title: "Đã xóa thành công", timer: 2000, showConfirmButton: false });
        fetchCompanies();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: err?.response?.data?.message ?? "Xóa thất bại. Kiểm tra ràng buộc dữ liệu hoặc thử lại sau.",
        });
      }
    }
  };

  /** ===== Approve / Reject ===== */
  const handleApprove = async (id) => {
    try {
      await companyAPI.approve(id);
      Swal.fire({ icon: "success", title: "Đã duyệt công ty", timer: 1500, showConfirmButton: false });
      fetchCompanies();
    } catch {
      Swal.fire({ icon: "error", title: "Lỗi", text: "Duyệt thất bại." });
    }
  };
  const handleReject = async (id) => {
    const confirm = await Swal.fire({
      title: "Từ chối công ty?",
      text: "Công ty sẽ không public và bị ẩn khỏi danh sách nổi bật.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Từ chối",
      cancelButtonText: "Hủy",
    });
    if (!confirm.isConfirmed) return;
    try {
      await companyAPI.reject(id);
      Swal.fire({ icon: "success", title: "Đã từ chối công ty", timer: 1500, showConfirmButton: false });
      fetchCompanies();
    } catch {
      Swal.fire({ icon: "error", title: "Lỗi", text: "Từ chối thất bại." });
    }
  };

  /** ===== Toggle Featured row action ===== */
  const toggleFeatured = async (company) => {
    const allowed = company.status === "ACTIVE" && company.verify === "APPROVE";
    if (!allowed) {
      Swal.fire({
        icon: "info",
        text: "Chỉ công ty ACTIVE và đã APPROVE mới được đánh dấu nổi bật.",
      });
      return;
    }
    try {
      await companyAPI.setFeatured(company.companyId, !company.featured);
      fetchCompanies();
    } catch {
      Swal.fire({ icon: "error", title: "Lỗi", text: "Đổi nổi bật thất bại." });
    }
  };

  /** ===== Render ===== */
  return (
    <div className="company-manager">
      <div className="header">
        <h2>Quản lý công ty</h2>
        <button className="add-btn" onClick={() => openModal()}>+ Thêm công ty</button>
      </div>

      {/* Filter bar (KHÔNG có nút Tìm kiếm) */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm công ty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          aria-label="Tìm kiếm theo tên công ty"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Lọc theo trạng thái"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Ngừng hoạt động</option>
        </select>
        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          aria-label="Lọc theo nổi bật"
        >
          <option value="ALL">Tất cả nổi bật</option>
          <option value="YES">Nổi bật</option>
          <option value="NO">Không nổi bật</option>
        </select>
        {/* NEW: Verify filter */}
        <select
          value={verifyFilter}
          onChange={(e) => setVerifyFilter(e.target.value)}
          aria-label="Lọc theo kiểm duyệt"
        >
          <option value="ALL">Tất cả duyệt</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVE">Đã duyệt</option>
          <option value="REJECT">Từ chối</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Đang tải dữ liệu...</p>
      ) : (
        <table className="company-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên công ty</th>
              <th>Mã số thuế</th>
              <th>Ngành nghề</th>
              <th>Thành phố</th>
              <th>Trạng thái</th>
              <th>Kiểm duyệt</th>
              <th>Nổi bật</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr><td colSpan="9" className="no-data">Không tìm thấy công ty nào</td></tr>
            ) : (
              filteredCompanies.map((c, idx) => {
                const isPending = c.verify === "PENDING";
                const isApproved = c.verify === "APPROVE";
                const canFeatured = c.status === "ACTIVE" && isApproved;

                return (
                  <tr key={c.companyId}>
                    <td>{c.orderNumber ?? idx + 1}</td>
                    <td>{c.name}</td>
                    <td>{c.taxCode || "-"}</td>
                    <td>{c.industry || "-"}</td>
                    <td>{c.city || "-"}</td>
                    <td>{statusLabel(c.status)}</td>
                    <td>
                      <span className={`verify-badge verify-${(c.verify || '').toLowerCase()}`}>
                        {verifyLabel(c.verify)}
                      </span>
                      {/* Hiển thị link GPKD khi PENDING để Admin kiểm tra */}
                      {isPending && c.businessRegistrationUrl && (
                        <div style={{ marginTop: 6 }}>
                          <a
                            href={c.businessRegistrationUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={c.businessRegistrationFileName || "Xem GPKD"}
                          >
                            {c.businessRegistrationFileName || "Xem GPKD"}
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        className={`chip ${c.featured ? "chip-on" : "chip-off"} ${!canFeatured ? "chip-disabled" : ""}`}
                        onClick={() => toggleFeatured(c)}
                        disabled={!canFeatured}
                        title="Chỉ công ty ACTIVE + APPROVE mới bật được nổi bật"
                      >
                        {c.featured ? "Nổi bật" : "Cơ bản"}
                      </button>
                    </td>
                    <td className="actions">
                      {isPending ? (
                        <>
                          <button className="approve-btn" onClick={() => handleApprove(c.companyId)}>Duyệt</button>
                          <button className="reject-btn" onClick={() => handleReject(c.companyId)}>Từ chối</button>
                        </>
                      ) : (
                        <>
                          <button className="edit-btn" onClick={() => openModal(c)}>Sửa</button>
                          <button className="delete-btn" onClick={() => handleDelete(c.companyId)}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Chỉnh sửa công ty" : "Thêm công ty mới"}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              {/* Tên công ty */}
              <div className="form-group full-width">
                <label>Tên công ty</label>
                <input
                  type="text"
                  className={errors.name ? "input-error" : ""}
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  required
                />
                {errors.name && <div id="name-error" className="error-text">{errors.name}</div>}
              </div>

              {/* Mã số thuế */}
              <div className="form-group">
                <label>Mã số thuế</label>
                <input
                  type="text"
                  className={errors.taxCode ? "input-error" : ""}
                  value={form.taxCode}
                  onChange={(e) => setField("taxCode", e.target.value)}
                  aria-invalid={!!errors.taxCode}
                  aria-describedby={errors.taxCode ? "tax-error" : undefined}
                  required
                />
                {errors.taxCode && <div id="tax-error" className="error-text">{errors.taxCode}</div>}
              </div>

              {/* Ngành nghề */}
              <div className="form-group">
                <label>Ngành nghề</label>
                <input
                  type="text"
                  className={errors.industry ? "input-error" : ""}
                  value={form.industry}
                  onChange={(e) => setField("industry", e.target.value)}
                  aria-invalid={!!errors.industry}
                />
                {errors.industry && <div className="error-text">{errors.industry}</div>}
              </div>

              {/* Mô tả */}
              <div className="form-group full-width">
                <label>Mô tả</label>
                <textarea
                  className={errors.description ? "input-error" : ""}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows="5"
                  aria-invalid={!!errors.description}
                />
                {errors.description && <div className="error-text">{errors.description}</div>}
              </div>

              {/* Logo URL */}
              <div className="form-group full-width">
                <label>Logo URL</label>
                <input
                  type="text"
                  className={errors.logoUrl ? "input-error" : ""}
                  value={form.logoUrl}
                  onChange={(e) => setField("logoUrl", e.target.value)}
                  aria-invalid={!!errors.logoUrl}
                />
                {errors.logoUrl && <div className="error-text">{errors.logoUrl}</div>}
              </div>

              {/* Cover URL */}
              <div className="form-group full-width">
                <label>Ảnh bìa (Cover URL)</label>
                <input
                  type="text"
                  className={errors.coverUrl ? "input-error" : ""}
                  value={form.coverUrl}
                  onChange={(e) => setField("coverUrl", e.target.value)}
                  aria-invalid={!!errors.coverUrl}
                />
                {errors.coverUrl && <div className="error-text">{errors.coverUrl}</div>}
              </div>

              {/* Website */}
              <div className="form-group full-width">
                <label>Website</label>
                <input
                  type="text"
                  className={errors.website ? "input-error" : ""}
                  value={form.website}
                  onChange={(e) => setField("website", e.target.value)}
                  aria-invalid={!!errors.website}
                />
                {errors.website && <div className="error-text">{errors.website}</div>}
              </div>

              {/* Địa chỉ */}
              <div className="form-group full-width">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  className={errors.address ? "input-error" : ""}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  aria-invalid={!!errors.address}
                />
                {errors.address && <div className="error-text">{errors.address}</div>}
              </div>

              {/* CITY COMBOBOX */}
              <CitySelect
                value={form.city}
                onChange={(val) => setField("city", val)}
                options={cities}
                placeholder="Tìm kiếm tỉnh/thành..."
                label="Thành phố (City)"
                required
                error={errors.city}
              />

              {/* Quy mô */}
              <div className="form-group">
                <label>Quy mô</label>
                <select
                  className={errors.size ? "input-error" : ""}
                  value={form.size}
                  onChange={(e) => setField("size", e.target.value)}
                  aria-invalid={!!errors.size}
                >
                  <option value="SMALL">Nhỏ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="LARGE">Lớn</option>
                  <option value="ENTERPRISE">Doanh nghiệp</option>
                </select>
                {errors.size && <div className="error-text">{errors.size}</div>}
              </div>

              {/* Năm thành lập */}
              <div className="form-group">
                <label>Năm thành lập</label>
                <input
                  type="number"
                  className={errors.foundedYear ? "input-error" : ""}
                  value={form.foundedYear}
                  onChange={(e) => setField("foundedYear", e.target.value)}
                  aria-invalid={!!errors.foundedYear}
                />
                {errors.foundedYear && <div className="error-text">{errors.foundedYear}</div>}
              </div>

              {/* Trạng thái */}
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  className={errors.status ? "input-error" : ""}
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                  aria-invalid={!!errors.status}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
                {errors.status && <div className="error-text">{errors.status}</div>}
              </div>

              {/* Nổi bật */}
              <div className="form-group checkbox-group full-width">
                <label>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setField("featured", e.target.checked)}
                    disabled={!(form.status === "ACTIVE" && form.verify === "APPROVE")}
                    title="Chỉ cho phép đánh dấu nổi bật khi công ty đang ACTIVE và đã APPROVE"
                  />
                  {" "}Công ty nổi bật
                </label>
              </div>

              <div className="modal-actions full-width">
                <button type="button" className="cancel-btn" onClick={closeModal}>Hủy</button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
