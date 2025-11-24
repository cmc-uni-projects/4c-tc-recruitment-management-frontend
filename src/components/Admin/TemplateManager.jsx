
import React, { useEffect, useState } from "react";
import { templateAPI } from "../../services/auth.services";
import "./TemplateManager.css";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [form, setForm] = useState({ name: "", previewImage: "", htmlLayout: "" });
  const [previewHtml, setPreviewHtml] = useState("");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await templateAPI.getAll();
      setTemplates(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách template:", err);
      alert("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openModal = () => {
    setForm({ name: "", previewImage: "", htmlLayout: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.htmlLayout.trim()) {
      alert("Tên và HTML layout không được để trống!");
      return;
    }
    try {
      await templateAPI.create(form);
      closeModal();
      fetchTemplates();
    } catch (err) {
      console.error("Lỗi khi lưu template:", err);
      alert("Lưu thất bại. Vui lòng kiểm tra lại.");
    }
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
        <button className="add-btn" onClick={openModal}>+ Thêm Template</button>
      </div>

      {loading ? (
        <p className="loading">Đang tải dữ liệu...</p>
      ) : (
        <table className="template-table">
          <thead>
            <tr>
              <th>Tên Template</th>
              <th>Thumbnail</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-data">Chưa có template nào</td>
              </tr>
            ) : (
              templates.map((tpl) => (
                <tr key={tpl.id}>
                  <td>{tpl.name}</td>
                  <td>
                    {tpl.previewImage ? (
                      <img src={tpl.previewImage} alt="Preview" className="thumbnail" />
                    ) : (
                      "Không có ảnh"
                    )}
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => openPreview(tpl.htmlLayout)}>Xem chi tiết</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Modal thêm template */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Thêm Template mới</h3>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Template *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Link ảnh thumbnail</label>
                <input
                  type="text"
                  value={form.previewImage}
                  onChange={(e) => setForm({ ...form, previewImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group">
                <label>HTML Layout *</label>
                <CodeMirror
                  value={form.htmlLayout}
                  height="300px"
                  extensions={[html()]}
                  onChange={(value) => setForm({ ...form, htmlLayout: value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Hủy</button>
                <button type="submit" className="submit-btn">Thêm mới</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal preview HTML */}
      {isPreviewOpen && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Xem chi tiết Template</h3>
            <div className="preview-container" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closePreview}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
