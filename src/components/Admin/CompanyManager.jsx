import React, { useEffect, useState } from "react";
import { companyAPI } from "../../services/auth.services";
import Swal from "sweetalert2";
import "./CompanyManager.css";

export default function AdminCompanyManager() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
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
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
        setLoading(true);
        const res = await companyAPI.getAll();
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCompanies(sorted);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải dữ liệu. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Open modal
  const openModal = (company = null) => {
    if (company) {
      setForm({
        name: company.name || "",
        industry: company.industry || "",
        description: company.description || "",
        logoUrl: company.logoUrl || "",
        coverUrl: company.coverUrl || "",
        website: company.website || "",
        address: company.address || "",
        city: company.city || "",
        size: company.size || "MEDIUM",
        foundedYear: company.foundedYear || "",
        status: company.status || "ACTIVE",
        featured: company.featured || false,
      });
      setEditingId(company.companyId);
    } else {
      setForm({
        name: "",
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
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Tên công ty không được để trống!",
      });
      return;
    }
    try {
      if (editingId) {
        await companyAPI.update(editingId, form);
        Swal.fire({
          icon: "success",
          title: "Cập nhật thành công",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await companyAPI.create(form);
        Swal.fire({
          icon: "success",
          title: "Thêm mới thành công",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      closeModal();
      fetchCompanies();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lưu thất bại. Vui lòng kiểm tra lại.",
      });
    }
  };

  // Handle delete
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
        Swal.fire({
          icon: "success",
          title: "Đã xóa thành công",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchCompanies();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Xóa thất bại. Có thể công ty đang được sử dụng.",
        });
      }
    }
  };

  return (
    <div className="company-manager">
      <div className="header">
        <h2>Quản lý công ty</h2>
        <button className="add-btn" onClick={() => openModal()}>
          + Thêm công ty
        </button>
      </div>

      {loading ? (
        <p className="loading">Đang tải dữ liệu...</p>
      ) : (
        <table className="company-table">
          <thead>
            <tr>
              <th>Tên công ty</th>
              <th>Ngành nghề</th>
              <th>Trạng thái</th>
              <th>Nổi bật</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  Chưa có công ty nào
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c.companyId}>
                  <td>{c.name}</td>
                  <td>{c.industry || "-"}</td>
                  <td>{c.status}</td>
                  <td>{c.featured ? "Có" : "Không"}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => openModal(c)}>
                      Sửa
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(c.companyId)}
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
            <h3>{editingId ? "Chỉnh sửa công ty" : "Thêm công ty mới"}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group full-width">
                <label>Tên công ty</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows="5"
                />
              </div>
              <div className="form-group full-width">
                <label>Logo URL</label>
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm({ ...form, logoUrl: e.target.value })
                  }
                />
              </div>
              <div className="form-group full-width">
                <label>Ảnh bìa (Cover URL)</label>
                <input
                  type="text"
                  value={form.coverUrl}
                  onChange={(e) =>
                    setForm({ ...form, coverUrl: e.target.value })
                  }
                />
              </div>
              <div className="form-group full-width">
                <label>Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                />
              </div>
              <div className="form-group full-width">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Ngành nghề</label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) =>
                    setForm({ ...form, industry: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Thành phố</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Quy mô</label>
                <select
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                >
                  <option value="SMALL">Nhỏ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="LARGE">Lớn</option>
                  <option value="ENTERPRISE">Doanh nghiệp</option>
                </select>
              </div>
              <div className="form-group">
                <label>Năm thành lập</label>
                <input
                  type="number"
                  value={form.foundedYear}
                  onChange={(e) =>
                    setForm({ ...form, foundedYear: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>
              <div className="form-group checkbox-group full-width">
                <label>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                  />
                  Công ty nổi bật
                </label>
              </div>
              <div className="modal-actions full-width">
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