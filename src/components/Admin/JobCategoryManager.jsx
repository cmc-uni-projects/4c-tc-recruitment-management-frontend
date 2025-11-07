import React, { useEffect, useState } from "react";
import { jobCategoryAPI } from "../../services/auth.services";
import "./JobCategoryManager.css";

export default function JobCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isPopular: false,
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await jobCategoryAPI.getAll();
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ngành nghề:", err);
      alert("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open modal
  const openModal = (category = null) => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description || "",
        isPopular: category.isPopular,
      });
      setEditingId(category.categoryId);
    } else {
      setForm({ name: "", description: "", isPopular: false });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ name: "", description: "", isPopular: false });
    setEditingId(null);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Tên ngành nghề không được để trống!");
      return;
    }

    try {
      if (editingId) {
        await jobCategoryAPI.update(editingId, form);
      } else {
        await jobCategoryAPI.create(form);
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      alert("Lưu thất bại. Vui lòng kiểm tra lại.");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa ngành nghề này?")) return;
    try {
      await jobCategoryAPI.delete(id);
      fetchCategories();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      alert("Xóa thất bại. Có thể ngành nghề đang được sử dụng.");
    }
  };

  return (
    <div className="job-category-manager">
      <div className="header">
        <h2>Quản lý ngành nghề</h2>
        <button className="add-btn" onClick={() => openModal()}>
          + Thêm ngành nghề
        </button>
      </div>

      {loading ? (
        <p className="loading">Đang tải dữ liệu...</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Tên ngành nghề</th>
              <th>Mô tả</th>
              <th>Phổ biến</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  Chưa có ngành nghề nào
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.categoryId}>
                  <td>{cat.name}</td>
                  <td>{cat.description || "-"}</td>
                  <td>{cat.isPopular ? "Có" : "Không"}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => openModal(cat)}>
                      Sửa
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(cat.categoryId)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingId ? "Chỉnh sửa ngành nghề" : "Thêm ngành nghề mới"}
            </h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tên ngành nghề *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ví dụ: Lập trình viên"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Mô tả ngắn về ngành nghề (tùy chọn)"
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) =>
                      setForm({ ...form, isPopular: e.target.checked })
                    }
                  />
                  Ngành nghề phổ biến
                </label>
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
