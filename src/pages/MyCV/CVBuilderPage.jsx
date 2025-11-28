
// src/pages/MyCV/CVBuilderPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Layout/Navbar";
import { getAllTemplates, createCV } from "../../services/auth.services";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "./CVBuilderPage.css";

export default function CVBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const templateId = queryParams.get("template");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    position: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
    linkedin: "",
    website: "",
  });
  const [previewHtml, setPreviewHtml] = useState("");
  const [saving, setSaving] = useState(false);

  // Load danh sách template
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getAllTemplates();
        setTemplates(res.data);
        if (templateId && res.data.length > 0) {
          const template = res.data.find((t) => t.id === templateId);
          if (template) {
            setSelectedTemplate(template);
            updatePreview(template.htmlLayout, formData);
          }
        }
      } catch (err) {
        Swal.fire("Lỗi", "Không tải được mẫu CV", "error");
      }
    };
    fetchTemplates();
  }, [templateId]);

  // Cập nhật preview khi thay đổi form hoặc template
  const updatePreview = (
    htmlLayout = selectedTemplate?.htmlLayout,
    data = formData
  ) => {
    if (!htmlLayout) return;
    let html = htmlLayout;
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, data[key] || "");
    });
    setPreviewHtml(html);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    updatePreview(selectedTemplate?.htmlLayout, newData);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    updatePreview(template.htmlLayout, formData);
    Swal.fire("Đã chọn mẫu", template.name, "info");
  };

  const handleSaveCV = async () => {
    
if (!selectedTemplate) {
      Swal.fire("Cảnh báo", "Vui lòng chọn mẫu CV", "warning");
      return;
    }
    if (!formData.fullname) {
      Swal.fire("Cảnh báo", "Vui lòng nhập họ tên", "warning");
      return;
    }


    setSaving(true);
    try {
      const cvData = {
        templateId: selectedTemplate.id,
        title: `${formData.fullname} - ${formData.position || "CV"}`,
        visibility: "PRIVATE",
        data: formData,
      };
      await createCV(cvData);
      Swal.fire("Thành công", "Lưu CV thành công! Đi đến danh sách CV của bạn", "success");
      setTimeout(() => {
        window.location.href = "/my-cv";
      }, 1200);
    } catch (err) {
      
Swal.fire(
        "Lỗi",
        "Lưu CV thất bại: " + (err.response?.data?.message || err.message),
        "error"
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="cv-builder-container">
        <div className="builder-header">
          <h1>Tạo CV chuyên nghiệp chỉ trong 5 phút</h1>
          <p>Chọn mẫu → Nhập thông tin → Xem trước → Lưu CV</p>
        </div>

        <div className="builder-content">
          {/* Cột trái: Form nhập liệu */}
          <div className="form-section">
            <h2>Nhập thông tin của bạn</h2>

            <div className="form-grid">
              <input
                type="text"
                name="fullname"
                placeholder="Họ và tên *"
                value={formData.fullname}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="position"
                placeholder="Vị trí ứng tuyển"
                value={formData.position}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="address"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={handleInputChange}
              />
              <textarea
                name="summary"
                placeholder="Tóm tắt bản thân"
                rows="4"
                value={formData.summary}
                onChange={handleInputChange}
              />
              <textarea
                name="experience"
                placeholder="Kinh nghiệm làm việc"
                rows="6"
                value={formData.experience}
                onChange={handleInputChange}
              />
              <textarea
                name="education"
                placeholder="Học vấn"
                rows="4"
                value={formData.education}
                onChange={handleInputChange}
              />
              <textarea
                name="skills"
                placeholder="Kỹ năng (cách nhau bằng dấu phẩy)"
                rows="3"
                value={formData.skills}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Cột phải: Preview + Chọn mẫu */}
          <div className="preview-section">
            <div className="template-selector">
              <h3>Chọn mẫu CV ({templates.length} mẫu)</h3>
              <div className="template-grid">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`template-item ${
                      selectedTemplate?.id === template.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <img src={template.previewImage} alt={template.name} />
                    <p>{template.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="preview-box">
              <h3>Xem trước CV</h3>
              {selectedTemplate ? (
                <div
                  className="cv-preview"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="no-preview">Chọn một mẫu CV để xem trước</div>
              )}
            </div>

            <button
              onClick={handleSaveCV}
              disabled={saving || !selectedTemplate}
              className="save-cv-btn"
            >
              {saving ? "Đang lưu..." : "Lưu CV này"}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
