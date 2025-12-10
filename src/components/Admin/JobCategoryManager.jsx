import React, { useEffect, useState } from "react";
import { jobCategoryAPI } from "../../services/auth.services";
import "./JobCategoryManager.css";
import Swal from "sweetalert2";

export default function JobCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isPopular: false,
    iconUrl: "",
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
      Swal.fire("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.", "error");
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
        iconUrl: category.iconUrl || "",
      });
      setEditingId(category.categoryId);
    } else {
      setForm({ name: "", description: "", isPopular: false, iconUrl: "" });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ name: "", description: "", isPopular: false, iconUrl: "" });
    setEditingId(null);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire("Lỗi", "Tên ngành nghề không được để trống!", "error");
      return;
    }

    try {
      if (editingId) {
        await jobCategoryAPI.update(editingId, form);
        Swal.fire("Thành công", "Cập nhật ngành nghề thành công!", "success");
      } else {
        await jobCategoryAPI.create(form);
        Swal.fire("Thành công", "Thêm ngành nghề mới thành công!", "success");
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      Swal.fire("Lỗi", "Lưu thất bại. Vui lòng kiểm tra lại.", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Bạn có chắc muốn xóa ngành nghề này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await jobCategoryAPI.delete(id);
          fetchCategories();
          Swal.fire("Đã xóa!", "Ngành nghề đã được xóa thành công.", "success");
        } catch (err) {
          console.error("Lỗi xóa:", err);
          Swal.fire(
            "Lỗi",
            "Xoá thất bại.Có thể nghành đang được sử dụng.",
            "error"
          );
        }
      }
    });
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
              <th>Icon</th>
              <th>Tên ngành nghề</th>
              <th>Mô tả</th>
              <th>Nổi bật</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  Chưa có ngành nghề nào
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.categoryId}>
                  {/* THÊM CỘT ICON Ở ĐÂY – ĐẦU TIÊN */}
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    {cat.iconUrl ? (
                      <img
                        src={cat.iconUrl}
                        alt={cat.name}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "contain",
                          borderRadius: "8px",
                          border: "1px solid #eee",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/40/cccccc/666666?text=Icon";
                        }}
                      />
                    ) : (
                      <span style={{ color: "#ccc", fontSize: "20px" }}>-</span>
                    )}
                  </td>

                  <td>
                    <strong>{cat.name}</strong>
                  </td>
                  <td>{cat.description || "-"}</td>
                  <td>{cat.popular ? "Có" : "Không"}</td>
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

              {/* MỚI: Ô NHẬP LINK ẢNH ICON */}
              <div className="form-group">
                <label>Link ảnh icon (tùy chọn)</label>
                <input
                  type="url"
                  value={form.iconUrl}
                  onChange={(e) =>
                    setForm({ ...form, iconUrl: e.target.value })
                  }
                  placeholder="https://img.icons8.com/color/96/laptop-coding.png"
                  style={{ fontSize: "14px" }}
                />
                {form.iconUrl && (
                  <div style={{ marginTop: "8px", textAlign: "center" }}>
                    <img
                      src={form.iconUrl}
                      alt="Preview"
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "contain",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <small style={{ color: "#666", fontSize: "12px" }}>
                  Gợi ý: Dùng ảnh từ{" "}
                  <a href="https://icons8.com" target="_blank" rel="noreferrer">
                    icons8.com
                  </a>{" "}
                  hoặc{" "}
                  <a
                    href="https://heroicons.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    heroicons.com
                  </a>
                </small>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) =>
                      setForm({ ...form, popular: e.target.checked })
                    }
                  />
                  Ngành nghề nổi bật
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
