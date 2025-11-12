import React, { useEffect, useState } from "react";
import "./ManageJobSection.css";
import {
  jobAPI,
  jobCategoryAPI,
  companyAPI,
} from "../../services/auth.services";

function ManageJobSection() {
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // ✅ Load danh sách Job
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getAllJobs();
      setJobs(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách job:", err);
      alert("Không thể tải danh sách công việc!");
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

      console.log("Danh mục nghề:", catRes.data);
      console.log("Công ty:", comRes.data);

      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setCompanies(Array.isArray(comRes.data) ? comRes.data : []);
    } catch (err) {
      console.error("Lỗi khi tải dropdown:", err);
      alert("Không thể tải danh sách công ty/danh mục!");
      setCategories([]);
      setCompanies([]);
    } finally {
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchDropdownData(); // ← Thêm dòng này
  }, []);

  // ✅ Mở modal
  const openModal = async (job = null) => {
  // Tải lại dropdown mỗi khi mở modal (để cập nhật công ty/danh mục mới)
  await fetchDropdownData();
  console.log("openModal - job:", job); // THÊM DÒNG NÀY
  console.log("editingId sẽ là:", job?.id);
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
    setIsModalOpen(true);
  };

  // ✅ Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // ✅ Gửi form (thêm/sửa)
 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (editingId) {
      // GIỮ companyId KHI SỬA → backend chấp nhận
      await jobAPI.updateJob(editingId, form);
      alert("Cập nhật thành công!");
    } else {
      await jobAPI.createJob(form);
      alert("Thêm mới thành công!");
    }
    closeModal();
    fetchJobs();
  } catch (err) {
    console.error("Lỗi:", err.response?.data || err);
    alert("Thao tác thất bại!");
  }
};

  // ✅ Xóa Job
  const handleDelete = async (id) => {
  if (!window.confirm("Bạn có chắc muốn xóa công việc này?")) return;
  try {
    await jobAPI.deleteJob(id); // ← Xóa bất kỳ job nào
    fetchJobs();
  } catch (err) {
    console.error("Lỗi khi xóa job:", err);
    alert("Xóa thất bại!");
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
                  <tr key={job.id || job.jobId || index}>
                    <td>{job.title}</td>
                    <td>{job.location || "-"}</td>
                    <td>{job.jobType}</td>
                    <td>
                      {job.salaryMin?.toLocaleString()} -{" "}
                      {job.salaryMax?.toLocaleString()} đ
                    </td>
                    <td>{job.experienceRequired || 0} năm</td>
                    <td>
                      <small
                        className={`status-badge ${
                          job.status?.toLowerCase() || "pending"
                        }`}
                      >
                        {job.status || "PENDING"}
                      </small>
                    </td>
                    <td className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => openModal(job)}
                      >
                        Sửa
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(job.jobId)}
                      >
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

      {/* 🧩 Modal thêm/sửa Job */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Chỉnh sửa Job" : "Thêm Job mới"}</h3>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group full-width ">
                <label>Tên Vị Trí Tuyển Dụng *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Mô tả</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>Yêu cầu</label>
                <textarea
                  rows="2"
                  value={form.requirements}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      requirements: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>Địa điểm</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Loại công việc</label>
                <select
                  value={form.jobType}
                  onChange={(e) =>
                    setForm({ ...form, jobType: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({
                      ...form,
                      salaryMin: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Lương tối đa</label>
                <input
                  type="number"
                  value={form.salaryMax}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      salaryMax: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Kinh nghiệm yêu cầu (năm)</label>
                <input
                  type="number"
                  value={form.experienceRequired}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      experienceRequired: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Ngày hết hạn</label>
                <input
                  type="datetime-local"
                  value={form.expiredAt}
                  onChange={(e) =>
                    setForm({ ...form, expiredAt: e.target.value })
                  }
                />
              </div>

              {/* Dropdown Công ty - ĐÃ SỬA */}
              <div className="form-group">
                <label>Công ty *</label>
                {dropdownLoading ? (
                  <select disabled>
                    <option>Đang tải...</option>
                  </select>
                ) : (
                  <select
                    value={form.companyId}
                    onChange={(e) =>
                      setForm({ ...form, companyId: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Chọn công ty --</option>
                    {companies
                      .filter((comp) => comp && comp.companyId) // Chỉ lấy có id
                      .map((comp) => {
                        const shortId =
                          comp.companyId && String(comp.companyId).length > 8
                            ? String(comp.companyId).substring(0, 8)
                            : comp.companyId || "";
                        return (
                          <option key={comp.companyId} value={comp.companyId}>
                            {comp.name || "Không tên"} (ID: {shortId}...)
                          </option>
                        );
                      })}
                  </select>
                )}
              </div>

              {/* Dropdown Danh mục - ĐÃ SỬA */}
              <div className="form-group">
                <label>Danh mục nghề *</label>
                {dropdownLoading ? (
                  <select disabled>
                    <option>Đang tải...</option>
                  </select>
                ) : (
                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories
                      .filter((cat) => cat && cat.categoryId)
                      .map((cat) => {
                        const shortId =
                          cat.categoryId && String(cat.categoryId).length > 8
                            ? String(cat.categoryId).substring(0, 8)
                            : cat.categoryId || "";
                        return (
                          <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.name || "Không tên"} (ID: {shortId}...)
                          </option>
                        );
                      })}
                  </select>
                )}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Hủy
                </button>
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
