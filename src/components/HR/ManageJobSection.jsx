
import React, { useEffect, useState } from "react";
import "./ManageJobSection.css";
import {
  jobAPI,
  jobCategoryAPI,
  companyAPI,
  applicationAPI,
} from "../../services/auth.services";

function ManageJobSection() {
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

const openViewModal = async (job) => {
  setViewJob(job);
  setIsViewModalOpen(true);
  setLoadingApplications(true);

  try {
    const token = localStorage.getItem("token");
    const res = await applicationAPI.getByJobId(job.jobId, 0, 10, null, token);
    console.log("Ứng viên:", res.data); // Kiểm tra dữ liệu trả về

    // Nếu API trả về dạng phân trang
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


  // ✅ Load danh sách Job
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getAllJobs();
      setJobs(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách job:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load danh mục và công ty cho dropdown
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
    fetchJobs();
    fetchDropdownData();
  }, []);

  // ✅ Mở modal
  const openModal = async (job = null) => {
    await fetchDropdownData();
    if (job) {
      setForm({
        title: job.title,
        description: job.description,
        requirements: job.requirements || "",
        location: job.location || "",
        jobType: job.jobType || "FULL_TIME",
        salaryMin: job.salaryMin || "",
        salaryMax: job.salaryMax || "",
        experienceRequired: job.experienceRequired || "",
        expiredAt: job.expiredAt ? job.expiredAt.slice(0, 16) : "",
        companyId: job.companyId || "",
        categoryId: job.categoryId || "",
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
        companyId: "",
        categoryId: "",
      });
      setEditingId(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  // ✅ Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setErrors({});
  };

  // ✅ Validate nâng cao
  const validateForm = () => {
    const newErrors = {};
    const salaryMin = Number(form.salaryMin);
    const salaryMax = Number(form.salaryMax);
    const expiredDate = new Date(form.expiredAt);
    const now = new Date();

    if (!form.title.trim()) newErrors.title = "Tên vị trí không được để trống!";
    if (!form.companyId) newErrors.companyId = "Vui lòng chọn công ty!";
    if (!form.categoryId) newErrors.categoryId = "Vui lòng chọn danh mục!";
    if (salaryMin <= 0) newErrors.salaryMin = "Lương tối thiểu phải > 0!";
    if (salaryMax <= 0) newErrors.salaryMax = "Lương tối đa phải > 0!";
    if (salaryMin >= salaryMax) newErrors.salaryMax = "Lương tối đa phải lớn hơn lương tối thiểu!";
    if (!form.expiredAt) newErrors.expiredAt = "Vui lòng chọn ngày hết hạn!";
    if (expiredDate <= now) newErrors.expiredAt = "Ngày hết hạn phải lớn hơn hiện tại!";

    return newErrors;
  };

  // ✅ Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      if (editingId) {
        await jobAPI.updateJob(editingId, form);
      } else {
        await jobAPI.createJob(form);
      }
      closeModal();
      fetchJobs();
    } catch (err) {
      console.error("Lỗi:", err.response?.data || err);
      setErrors({ api: "Thao tác thất bại, vui lòng thử lại!" });
    }
  };

  // ✅ Xóa Job
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa công việc này?")) return;
    try {
      await jobAPI.deleteJob(id);
      fetchJobs();
    } catch (err) {
      console.error("Lỗi khi xóa job:", err);
    }
  };

  return (
    <div className="admin-content">
      <div className="job-category-manager">
        <div className="header">
          <h2>Quản lý công việc</h2>
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
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Chưa có công việc nào
                  </td>
                </tr>
              ) : (
                jobs.map((job, index) => (
                  <tr key={job.jobId || index}>
                    <td>{job.title}</td>
                    <td>{job.location || "-"}</td>
                    <td>{job.jobType}</td>
                    <td>
                      {job.salaryMin?.toLocaleString()} -{" "}
                      {job.salaryMax?.toLocaleString()} đ
                    </td>
                    <td>{job.experienceRequired || 0} năm</td>
                    <td>
                      <small className={`status-badge ${job.status?.toLowerCase() || "pending"}`}>
                        {job.status || "PENDING"}
                      </small>
                    </td>
                    <td className="actions">
                      <button className="view-btn" onClick={() => openViewModal(job)}>Xem</button>
                      <button className="edit-btn" onClick={() => openModal(job)}>Sửa</button>
                      <button className="delete-btn" onClick={() => handleDelete(job.jobId)}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
{isViewModalOpen && viewJob && (
  <div className="modal-overlay" onClick={closeViewModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Chi tiết công việc</h3>
      <div className="job-detail">
        <p><strong>Tiêu đề:</strong> {viewJob.title}</p>
        <p><strong>Mô tả:</strong> {viewJob.description || "Không có"}</p>
        <p><strong>Yêu cầu:</strong> {viewJob.requirements || "Không có"}</p>
        <p><strong>Địa điểm:</strong> {viewJob.location || "-"}</p>
        <p><strong>Loại công việc:</strong> {viewJob.jobType}</p>
        <p><strong>Lương:</strong> {viewJob.salaryMin?.toLocaleString()} - {viewJob.salaryMax?.toLocaleString()} đ</p>
        <p><strong>Kinh nghiệm:</strong> {viewJob.experienceRequired || 0} năm</p>
        <p><strong>Ngày hết hạn:</strong> {viewJob.expiredAt}</p>
        <p><strong>Công ty:</strong> {viewJob.companyName || viewJob.companyId}</p>
        <p><strong>Danh mục:</strong> {viewJob.categoryName || viewJob.categoryId}</p>
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
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.candidateName}</td>
                <td>{app.email}</td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td>{app.status}</td>
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



      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Chỉnh sửa Job" : "Thêm Job mới"}</h3>

            <form className="modal-form" onSubmit={handleSubmit}>
              {/* Các input */}
              <div className="form-group full-width">
                <label>Tên Vị Trí *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {errors.title && <p className="error-text">{errors.title}</p>}
              </div>

              <div className="form-group full-width">
                <label>Mô tả</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Yêu cầu</label>
                <textarea
                  rows="2"
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Địa điểm</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Loại công việc</label>
                <select
                  value={form.jobType}
                  onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                >
                  <option value="FULL_TIME">FULL_TIME</option>
                  <option value="PART_TIME">PART_TIME</option>
                  <option value="INTERNSHIP">INTERNSHIP</option>
                  <option value="REMOTE">REMOTE</option>
                </select>
              </div>

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

              <div className="form-group">
                <label>Kinh nghiệm yêu cầu (năm)</label>
                <input
                  type="number"
                  value={form.experienceRequired}
                  onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Ngày hết hạn</label>
                <input
                  type="datetime-local"
                  value={form.expiredAt}
                  onChange={(e) => setForm({ ...form, expiredAt: e.target.value })}
                />
                {errors.expiredAt && <p className="error-text">{errors.expiredAt}</p>}
              </div>

              {/* Dropdown Công ty */}
              <div className="form-group">
                <label>Công ty *</label>
                {dropdownLoading ? (
                  <select disabled><option>Đang tải...</option></select>
                ) : (
                  <select
                    value={form.companyId}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                  >
                    <option value="">-- Chọn công ty --</option>
                    {companies.map((comp) => (
                      <option key={comp.companyId} value={comp.companyId}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.companyId && <p className="error-text">{errors.companyId}</p>}
              </div>

              {/* Dropdown Danh mục */}
              <div className="form-group">
                <label>Danh mục nghề *</label>
                {dropdownLoading ? (
                  <select disabled><option>Đang tải...</option></select>
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

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Hủy</button>
                <button type="submit" className="submit-btn">
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

export default ManageJobSection;
