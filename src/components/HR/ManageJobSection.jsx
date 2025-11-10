import React, { useEffect, useState } from "react";
import "../../components/Admin/AdminSection.css"; // tái sử dụng style
import { jobAPI } from "../../services/auth.services";

function ManageJobSection() {
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

  useEffect(() => {
    fetchJobs();
  }, []);

  // ✅ Mở modal
  const openModal = (job = null) => {
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
        expiredAt: job.expiredAt
          ? job.expiredAt.slice(0, 16)
          : "",
        companyId: job.companyId || "",
        categoryId: job.categoryId || "",
      });
      setEditingId(job.id || job.jobId);
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
        await jobAPI.updateJob(editingId, form);
        alert("Cập nhật công việc thành công!");
      } else {
        await jobAPI.createJob(form);
        alert("Thêm công việc mới thành công!");
      }
      closeModal();
      fetchJobs();
    } catch (err) {
      console.error("Lỗi khi lưu công việc:", err);
      alert("Thao tác thất bại!");
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
                        onClick={() =>
                          handleDelete(job.id || job.jobId)
                        }
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
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editingId ? "Chỉnh sửa Job" : "Thêm Job mới"}</h3>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
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

              <div className="form-group">
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

              <div className="form-group">
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

              <div className="form-group">
                <label>ID Công ty</label>
                <input
                  type="text"
                  value={form.companyId}
                  onChange={(e) =>
                    setForm({ ...form, companyId: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>ID Danh mục</label>
                <input
                  type="text"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                />
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
