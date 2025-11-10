import React, { useEffect, useState } from "react";
import "../../components/Admin/AdminSection.css"; // Tái sử dụng style admin
import { jobAPI } from "../../services/auth.services";

function ManageJobSection() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getAllJobs();
      setJobs(res.data);
    } catch (err) {
      alert("Không thể tải danh sách job!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Open modal
  const openModal = (job = null) => {
    if (job) {
      setForm({ title: job.title, description: job.description });
      setEditingId(job.id);
    } else {
      setForm({ title: "", description: "" });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ title: "", description: "" });
    setEditingId(null);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Tiêu đề không được để trống!");
      return;
    }
    try {
      if (editingId) {
        await jobAPI.updateJob(editingId, form);
      } else {
        await jobAPI.createJob(form);
      }
      closeModal();
      fetchJobs();
    } catch {
      alert("Lưu thất bại!");
    }
  };

  // Delete job
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa job này?")) return;
    try {
      await jobAPI.deleteJob(id);
      fetchJobs();
    } catch {
      alert("Xóa thất bại!");
    }
  };

  return (
    <div className="admin-content">
      <div className="job-category-manager">
        <div className="header">
          <h2>Quản lý tin tuyển dụng</h2>
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
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">
                    Chưa có job nào
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.description || "-"}</td>
                    <td className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => openModal(job)}
                      >
                        Sửa
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(job.id)}
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

      {/* Modal */}
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
                    setForm({ ...form, description: e.target.value })
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