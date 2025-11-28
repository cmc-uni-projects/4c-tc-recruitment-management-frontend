import React, { useEffect, useState } from "react";
import { templateAPI } from "../../services/auth.services";
import "./TemplateManager.css";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import Swal from "sweetalert2";

export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState(null); // để biết đang thêm hay sửa
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    previewImage: "",
    htmlLayout: "",
  });

  const [previewHtml, setPreviewHtml] = useState("");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await templateAPI.getAll();
      setTemplates(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách template:", err);
      Swal.fire("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openModal = (template = null) => {
    if (template) {
      setForm({
        name: template.name || "",
        previewImage: template.previewImage || "",
        htmlLayout: template.htmlLayout || "",
      });
      setCurrentEditingId(template.id);
    } else {
      setForm({ name: "", previewImage: "", htmlLayout: "" });
      setCurrentEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEditingId(null);
    setForm({ name: "", previewImage: "", htmlLayout: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire("Lỗi", "Tên template không được để trống!", "error");
      return;
    }
    if (!form.htmlLayout.trim()) {
      Swal.fire("Lỗi", "HTML layout không được để trống!", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (currentEditingId) {
        // Cập nhật
        await templateAPI.update(currentEditingId, form);
        Swal.fire("Thành công", "Cập nhật template thành công!", "success");
      } else {
        // Tạo mới
        await templateAPI.create(form);
        Swal.fire("Thành công", "Thêm template mới thành công!", "success");
      }
      closeModal();
      fetchTemplates();
    } catch (err) {
      console.error("Lỗi khi lưu template:", err);
      Swal.fire("Lỗi",err.response?.data?.message || "Lưu thất bại . Vui lòng thử lại.","error")
    } finally {
      setSubmitting(false);
    }
  };

  
const handleDelete = async (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa template này?",
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
          await templateAPI.delete(id);
          fetchTemplates();
          Swal.fire("Đã xóa!", "Template đã được xóa thành công.", "success");
        } catch (err) {
          console.error("Lỗi xóa template:", err);
          Swal.fire(
            "Lỗi",
            "Xóa thất bại. Có thể template đang được sử dụng.",
            "error"
          );
        }
      }
    });

  };

  const openPreview = (html) => {
    setPreviewHtml(html);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewHtml("");
  };

  return (
    <div className="template-manager">
      <div className="header">
        <h2>Quản lý mẫu Template CV</h2>
        <button className="add-btn" onClick={() => openModal()}>
          + Thêm Template
        </button>
      </div>

      {loading ? (
        <p className="loading">Đang tải dữ liệu...</p>
      ) : (
        <table className="template-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên Template</th>
              <th>Thumbnail</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  Chưa có template nào
                </td>
              </tr>
            ) : (
              templates.map((tpl, index) => (
                <tr key={tpl.id}>
                  <td>{index + 1}</td>
                  <td>{tpl.name}</td>
                  <td>
                    {tpl.previewImage ? (
                      <img
                        src={tpl.previewImage}
                        alt="Preview"
                        className="thumbnail"
                      />
                    ) : (
                      <span className="no-image">Không có ảnh</span>
                    )}
                  </td>
                  <td className="actions">
                    <button
                      className="view-btn"
                      onClick={() => openPreview(tpl.htmlLayout)}
                    >
                      Xem
                    </button>
                    <button className="edit-btn" onClick={() => openModal(tpl)}>
                      Sửa
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(tpl.id)}
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

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {currentEditingId ? "Chỉnh sửa Template" : "Thêm Template mới"}
            </h3>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Template *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ví dụ: Modern CV 2025"
                />
              </div>

              <div className="form-group">
                <label>Link ảnh thumbnail</label>
                <input
                  type="url"
                  value={form.previewImage}
                  onChange={(e) =>
                    setForm({ ...form, previewImage: e.target.value })
                  }
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="form-group">
                <label>HTML Layout *</label>
                <CodeMirror
                  value={form.htmlLayout}
                  height="400px"
                  extensions={[html()]}
                  onChange={(value) => setForm({ ...form, htmlLayout: value })}
                  theme="light"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Đang lưu..."
                    : currentEditingId
                    ? "Cập nhật"
                    : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {isPreviewOpen && (
        <div className="modal-overlay" onClick={closePreview}>
          <div
            className="modal-content preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Xem trước Template</h3>
            <div
              className="preview-container"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closePreview}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
