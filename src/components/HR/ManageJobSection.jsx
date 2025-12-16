
import React, { useEffect, useState } from "react";
import "./ManageJobSection.css";
import {
  jobAPI,
  jobCategoryAPI,
  companyAPI,
  applicationAPI,
  employerAPI,
  renderCV,
} from "../../services/auth.services";
import { replaceTemplate } from "../../untils/replaceTemplate";

// ★ Rich Text Editor (React 19 friendly)
import ReactQuill from "react-quill-new";                // nếu dùng react-quill: import ReactQuill from "react-quill";
import "react-quill-new/dist/quill.snow.css";            // nếu dùng react-quill: import "react-quill/dist/quill.snow.css";

// ★ Sanitize HTML chống XSS
import DOMPurify from "dompurify";

function ManageJobSection() {
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companyDisplayName, setCompanyDisplayName] = useState("Đang tải công ty...");
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const [editingId, setEditingId] = useState(null);

  // ★ Form state (description/requirements là HTML từ editor)
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    jobType: "FULL_TIME",
    salaryMin: "",
    salaryMax: "",
    experienceRequired: "",
    expiredAt: "",
    companyId: "",
    categoryId: "",
  });

  const [errors, setErrors] = useState({});

  // Modal CV
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);

  const token = localStorage.getItem("token");

  // ===== Xem CV ứng viên =====
  const handleViewCV = async (app) => {
    setLoadingCV(true);
    try {
      const res = await renderCV(app.cvId);
      const { data } = res;
      const { htmlLayout, cvUrl } = data;
      const cvHtml = replaceTemplate(htmlLayout, data.data);
      setSelectedCV({
        candidateName: app.candidateName,
        cvUrl: cvUrl ?? null,
        cvHtml: cvHtml ?? null,
        cvData: data.data ?? null,
      });
      setIsCVModalOpen(true);
    } catch (error) {
      console.error("Lỗi lấy CV:", error);
      setSelectedCV({ candidateName: app.candidateName, cvUrl: null });
      setIsCVModalOpen(true);
    } finally {
      setLoadingCV(false);
    }
  };
  const closeCVModal = () => {
    setIsCVModalOpen(false);
    setSelectedCV(null);
  };

  // ===== Cập nhật trạng thái ứng viên =====
  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await applicationAPI.updateStatus(applicationId, newStatus, token);
      const updatedApplications = applications.map((app) =>
        applicationId == app.applicationId ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApplications);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  // ===== Modal xem Job =====
  const openViewModal = async (job) => {
    setViewJob(job);
    setIsViewModalOpen(true);
    setLoadingApplications(true);
    try {
      const res = await applicationAPI.getByJobId(job.jobId, 0, 10, null, token);
      const apps = res.data.content ? res.data.content : res.data;
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      console.error("Lỗi khi tải ứng viên:", err);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewJob(null);
    setApplications([]);
  };

  // ===== City combobox =====
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

  function CitySelect({
    value,
    onChange,
    options,
    placeholder = "Tìm kiếm tỉnh/thành...",
    label = "Địa điểm",
    required = true,
    error
  }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);

    const filtered = options.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    const selectValue = (val) => {
      onChange(val);
      setQuery(val);
      setOpen(false);
    };

    const onInputFocus = () => {
      setOpen(true);
      setHighlightIndex(0);
    };

    const onKeyDown = (e) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        setHighlightIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        setHighlightIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[highlightIndex]) selectValue(filtered[highlightIndex]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    return (
      <div className="form-group full-width">
        <label>{label}</label>
        <input
          type="text"
          className={`combobox-input ${error ? "input-error" : ""}`}
          placeholder={placeholder}
          value={open ? query : (value ?? "")}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onInputFocus}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          required={required && !value}
          aria-invalid={!!error}
          aria-describedby={error ? "city-error" : undefined}
        />
        {open && (
          <div className="combobox-list">
            {filtered.length === 0 ? (
              <div className="combobox-item combobox-empty">Không có kết quả</div>
            ) : (
              filtered.map((item, idx) => (
                <div
                  key={item}
                  className={
                    "combobox-item" +
                    (idx === highlightIndex ? " combobox-item--active" : "")
                  }
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectValue(item);
                  }}
                >
                  {item}
                </div>
              ))
            )}
          </div>
        )}
        {error && <p id="city-error" className="error-text">{error}</p>}
      </div>
    );
  }

  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await jobAPI.getApprovedJobs();
        const jobs = res.data;
        const dynamicLocations = jobs.map(job => job.location).filter(Boolean);
        const uniqueLocations = [...new Set([...vietnamProvinces, ...dynamicLocations])];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Lỗi khi tải danh sách địa điểm:", error);
        setLocations(vietnamProvinces);
      }
    };
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter(loc =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== Jobs list & dropdown =====
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getMyCompanyJobs();
      setJobs(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách job:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      setDropdownLoading(true);
      const [catRes, comRes] = await Promise.all([
        jobCategoryAPI.getAll(),
        companyAPI.getAllActive(),
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setCompanies(Array.isArray(comRes.data) ? comRes.data : []);
    } catch (err) {
      console.error("Lỗi khi tải dropdown:", err);
      setCategories([]);
      setCompanies([]);
    } finally {
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setCompanyDisplayName("Đang tải công ty...");
        let companyName = null;
        let companyId = null;

        // 1) Ưu tiên từ job đã đăng
        try {
          const jobRes = await jobAPI.getMyCompanyJobs();
          const jobsList = jobRes.data ?? [];
          if (jobsList.length > 0) {
            const job = jobsList[0];
            companyName = job.companyName ?? "Công ty của bạn";
            companyId = job.companyId;
            localStorage.setItem("myCompany", JSON.stringify({ companyId, name: companyName }));
            localStorage.setItem("companyName", companyName);
            setCompanyDisplayName(companyName);
            setForm((prev) => ({ ...prev, companyId }));
            setJobs(jobsList);
            await fetchDropdownData();
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Chưa có job nào hoặc lỗi nhẹ:", err);
        }

        // 2) Nếu chưa có job → lấy từ employer
        try {
          const res = await employerAPI.getMyEmployer();
          const company = res.data?.company ?? res.data;
          if (company?.companyId ?? company?.id) {
            companyId = company.companyId ?? company.id;
            companyName = company.name ?? company.companyName ?? "Công ty của bạn";
            localStorage.setItem("myCompany", JSON.stringify({ companyId, name: companyName }));
            localStorage.setItem("companyName", companyName);
            setCompanyDisplayName(companyName);
            setForm((prev) => ({ ...prev, companyId }));
          } else {
            setCompanyDisplayName("Chưa liên kết công ty");
          }
        } catch (err) {
          console.error("Không lấy được thông tin công ty từ employerAPI:", err);
          setCompanyDisplayName("Chưa liên kết công ty");
        }

        // Jobs + dropdown
        try {
          const jobRes = await jobAPI.getMyCompanyJobs();
          setJobs(jobRes.data ?? []);
        } catch { /* bình thường nếu chưa có job */ }

        await fetchDropdownData();
        setLoading(false);
      } catch (err) {
        console.error("Lỗi tải dữ liệu trang:", err);
        setCompanyDisplayName("Lỗi hệ thống");
        setLoading(false);
      }
    };
    loadCompanyInfo();
  }, []);

  // ===== Modal Add/Edit =====
  const openModal = async (job = null) => {
    await fetchDropdownData();
    const myCompany = JSON.parse(localStorage.getItem("myCompany") ?? "null");
    if (myCompany?.name) {
      localStorage.setItem("companyName", myCompany.name);
    }

    if (job) {
      setForm({
        title: job.title,
        description: job.description,                 // HTML từ editor
        requirements: job.requirements ?? "",
        location: job.location ?? "",
        jobType: job.jobType ?? "FULL_TIME",
        salaryMin: job.salaryMin ?? "",
        salaryMax: job.salaryMax ?? "",
        experienceRequired: job.experienceRequired ?? "",
        expiredAt: job.expiredAt ? job.expiredAt.slice(0, 16) : "",
        companyId: job.companyId ?? myCompany?.companyId ?? "",
        categoryId: job.categoryId ?? "",
      });
      setEditingId(job.jobId);
    } else {
      setForm({
        title: "",
        description: "",
        requirements: "",
        location: "",
        jobType: "FULL_TIME",
        salaryMin: "",
        salaryMax: "",
        experienceRequired: "",
        expiredAt: "",
        companyId: myCompany?.companyId ?? "",
        categoryId: "",
      });
      setEditingId(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setErrors({});
  };

  // ===== Validate =====
  const plainText = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    return (tmp.textContent || "").replace(/\s+/g, " ").trim();
  };

  const validateForm = () => {
    const newErrors = {};
    const salaryMin = Number(form.salaryMin);
    const salaryMax = Number(form.salaryMax);
    const expiredDate = new Date(form.expiredAt);
    const now = new Date();

    if (!form.title.trim()) newErrors.title = "Tên vị trí không được để trống!";
    if (!form.categoryId) newErrors.categoryId = "Vui lòng chọn danh mục!";
    if (salaryMin <= 0) newErrors.salaryMin = "Lương tối thiểu phải > 0!";
    if (salaryMax <= 0) newErrors.salaryMax = "Lương tối đa phải > 0!";
    if (salaryMin >= salaryMax) newErrors.salaryMax = "Lương tối đa phải lớn hơn lương tối thiểu!";
    if (!form.expiredAt) newErrors.expiredAt = "Vui lòng chọn ngày hết hạn!";
    if (expiredDate <= now) newErrors.expiredAt = "Ngày hết hạn phải lớn hơn hiện tại!";
    if (!plainText(form.description)) newErrors.description = "Mô tả không được để trống!";
    if (!plainText(form.requirements)) newErrors.requirements = "Yêu cầu không được để trống!";

    return newErrors;
  };

  // ===== Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // ★ Sanitize trước khi gửi backend
      const payload = {
        ...form,
        description: DOMPurify.sanitize(form.description),
        requirements: DOMPurify.sanitize(form.requirements),
      };

      if (editingId) {
        await jobAPI.updateJob(editingId, payload);
      } else {
        await jobAPI.createJob(payload);
      }
      closeModal();
      fetchJobs();
    } catch (err) {
      console.error("Lỗi:", err.response?.data ?? err);
      setErrors({ api: "Thao tác thất bại, vui lòng thử lại!" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa công việc này?")) return;
    try {
      await jobAPI.deleteJob(id);
      fetchJobs();
    } catch (err) {
      console.error("Lỗi khi xóa job:", err);
    }
  };

  // ===== Cấu hình React Quill =====
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };
  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "indent",
    "align",
    "link",
  ];
  // (modules/formats theo tài liệu ReactQuill/Quill)  // [2](https://basicutils.com/learn/quilljs/react-quill-tutorial)[5](https://www.npmjs.com/package/react-quill-new)

  return (
    <div className="admin-content">
      <div className="job-category-manager">
        <div className="header">
          <h2>Quản lý Tin Tuyển Dụng - Đăng Tin</h2>
          <button className="add-btn" onClick={() => openModal()}>
            + Thêm Job
          </button>
        </div>

        {loading ? (
          <p className="loading">Đang tải dữ liệu...</p>
        ) : (
          <table className="category-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Địa điểm</th>
                <th>Loại</th>
                <th>Lương</th>
                <th>Kinh nghiệm</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">Chưa có công việc nào</td>
                </tr>
              ) : (
                jobs.map((job, index) => (
                  <tr key={job.jobId ?? index}>
                    <td>{job.title}</td>
                    <td>{job.location ?? "-"}</td>
                    <td>{job.jobType}</td>
                    <td>
                      {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()} đ
                    </td>
                    <td>{job.experienceRequired ?? 0} năm</td>
                    <td className="actions">
                      <button className="job-view-btn" onClick={() => openViewModal(job)}>
                        Xem
                      </button>
                      <button className="job-edit-btn" onClick={() => openModal(job)}>
                        Sửa
                      </button>
                      <button className="job-delete-btn" onClick={() => handleDelete(job.jobId)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal xem Job (hiển thị HTML đã sanitize) */}
      {isViewModalOpen && viewJob && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chi tiết công việc</h3>
            <div className="job-detail">
              <p><strong>Tiêu đề:</strong> {viewJob.title}</p>

              <p><strong>Mô tả:</strong></p>
              <div
                className="html-view"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(viewJob.description ?? "Không có"),
                }}
              />

              <p><strong>Yêu cầu:</strong></p>
              <div
                className="html-view"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(viewJob.requirements ?? "Không có"),
                }}
              />

              <p><strong>Địa điểm:</strong> {viewJob.location ?? "-"}</p>
              <p><strong>Loại công việc:</strong> {viewJob.jobType}</p>
              <p>
                <strong>Lương:</strong> {viewJob.salaryMin?.toLocaleString()} -{" "}
                {viewJob.salaryMax?.toLocaleString()} đ
              </p>
              <p><strong>Kinh nghiệm:</strong> {viewJob.experienceRequired ?? 0} năm</p>
              <p><strong>Ngày hết hạn:</strong> {viewJob.expiredAt}</p>
              <p><strong>Công ty:</strong> {viewJob.companyName ?? viewJob.companyId}</p>
              <p><strong>Danh mục:</strong> {viewJob.categoryName ?? viewJob.categoryId}</p>
            </div>

            <h4>Danh sách ứng viên</h4>
            {loadingApplications ? (
              <p>Đang tải ứng viên...</p>
            ) : applications.length === 0 ? (
              <p>Chưa có ứng viên nào ứng tuyển.</p>
            ) : (
              <table className="application-table">
                <thead>
                  <tr>
                    <th>Tên ứng viên</th>
                    <th>Email</th>
                    <th>Ngày ứng tuyển</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id ?? app.cvId}>
                      <td>{app.candidateName}</td>
                      <td>{app.email ?? "Không có email"}</td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.applicationId, e.target.value)}
                        >
                          <option value="PENDING">Đang xử lý</option>
                          <option value="REVIEWED">NTD đã xem</option>
                          <option value="HIRED">Được chấp nhận</option>
                          <option value="REJECTED">Từ chối</option>
                        </select>
                      </td>
                      <td>{app.notes ?? "-"}</td>
                      <td>
                        <button onClick={() => handleViewCV(app)}>Xem CV</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeViewModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit (React Quill + CSS đẹp) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Chỉnh sửa Job" : "Thêm Job mới"}</h3>

            <form className="modal-form" onSubmit={handleSubmit}>
              {/* Tên vị trí */}
              <div className="form-group full-width">
                <label>Tên Vị Trí *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {errors.title && <p className="error-text">{errors.title}</p>}
              </div>

              {/* ★ Mô tả (Rich Text) */}
              <div className="form-group full-width">
                <label>Mô tả *</label>
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Nhập mô tả chi tiết công việc..."
                />
                {errors.description && <p className="error-text">{errors.description}</p>}
              </div>

              {/* ★ Yêu cầu (Rich Text) */}
              <div className="form-group full-width">
                <label>Yêu cầu *</label>
                <ReactQuill
                  theme="snow"
                  value={form.requirements}
                  onChange={(val) => setForm({ ...form, requirements: val })}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Nhập các yêu cầu đối với ứng viên..."
                />
                {errors.requirements && <p className="error-text">{errors.requirements}</p>}
              </div>

              {/* Địa điểm */}
              <CitySelect
                value={form.location}
                onChange={(val) => setForm({ ...form, location: val })}
                options={locations}
                placeholder="Tìm kiếm tỉnh/thành..."
                label="Địa điểm"
                required
                error={errors.location}
              />

              {/* Loại công việc */}
              <div className="form-group">
                <label>Loại công việc</label>
                <select
                  value={form.jobType}
                  onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                >
                  <option value="FULL_TIME">FULL_TIME</option>
                  <option value="PART_TIME">PART_TIME</option>
                  <option value="INTERN">INTERN</option>
                  <option value="REMOTE">REMOTE</option>
                </select>
              </div>

              {/* Lương */}
              <div className="form-group">
                <label>Lương tối thiểu</label>
                <input
                  type="number"
                  value={form.salaryMin}
                  onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                />
                {errors.salaryMin && <p className="error-text">{errors.salaryMin}</p>}
              </div>

              <div className="form-group">
                <label>Lương tối đa</label>
                <input
                  type="number"
                  value={form.salaryMax}
                  onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                />
                {errors.salaryMax && <p className="error-text">{errors.salaryMax}</p>}
              </div>

              {/* Kinh nghiệm */}
              <div className="form-group">
                <label>Kinh nghiệm yêu cầu (năm)</label>
                <input
                  type="number"
                  value={form.experienceRequired}
                  onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })}
                />
              </div>

              {/* Hạn nộp */}
              <div className="form-group">
                <label>Ngày hết hạn</label>
                <input
                  type="datetime-local"
                  value={form.expiredAt}
                  onChange={(e) => setForm({ ...form, expiredAt: e.target.value })}
                />
                {errors.expiredAt && <p className="error-text">{errors.expiredAt}</p>}
              </div>

              {/* Công ty (readonly) */}
              <div className="form-group">
                <label>Công ty *</label>
                <div className="readonly-field">{companyDisplayName}</div>
                <input type="hidden" name="companyId" value={form.companyId} />
              </div>

              {/* Danh mục */}
              <div className="form-group">
                <label>Danh mục nghề *</label>
                {dropdownLoading ? (
                  <select disabled>
                    <option>Đang tải...</option>
                  </select>
                ) : (
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.categoryId && <p className="error-text">{errors.categoryId}</p>}
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>

              {errors.api && <p className="error-text">{errors.api}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Modal CV */}
      {isCVModalOpen && selectedCV && (
        <div className="modal-overlay" onClick={closeCVModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chi tiết CV của {selectedCV.candidateName}</h3>
            {loadingCV ? (
              <p>Đang tải CV...</p>
            ) : selectedCV.cvUrl ? (
              <iframe src={selectedCV.cvUrl} width="100%" height="500px" title="CV"></iframe>
            ) : selectedCV.cvHtml ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedCV.cvHtml),
                }}
              />
            ) : (
              <p>Không có CV được tải lên.</p>
            )}
            <button onClick={closeCVModal}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageJobSection;
