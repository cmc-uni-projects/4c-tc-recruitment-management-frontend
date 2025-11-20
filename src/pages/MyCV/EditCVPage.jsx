// src/pages/MyCV/EditCVPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyCVs, renderCV, createCV } from "../../services/auth.services"; // ← DÙNG renderCV NHƯ BẠN MUỐN
import { toast } from "react-toastify";
import Navbar from "../../components/Layout/Navbar";
import "./EditCVPage.css"; // ← Đảm bảo file này tồn tại cùng thư mục

export default function EditCVPage() {
  const { cvId } = useParams();
  const navigate = useNavigate();

  const [cv, setCv] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCV = async () => {
      try {
        // 1. Lấy danh sách CV của user
        const res = await getMyCVs();
        const found = res.data.find((c) => c.id === cvId);

        if (!found) {
          toast.error("Không tìm thấy CV này");
          navigate("/my-cv");
          return;
        }

        setCv(found);

        // Parse dữ liệu từ DB
        let data = found.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
            data = {};
          }
        }
        setFormData(data || {});

        // 2. Gọi renderCV → lấy HTML đã được merge sẵn từ backend
        const renderRes = await renderCV(cvId); // ← DÙNG renderCV NHƯ BẠN ĐANG DÙNG
        if (renderRes?.data?.htmlLayout) {
          setPreviewHtml(renderRes.data.htmlLayout);
        } else {
          setPreviewHtml(
            "<h3 style='text-align:center;padding:100px;color:#999'>Không có nội dung preview</h3>"
          );
        }
      } catch (err) {
        console.error("Lỗi tải CV:", err);
        if (err.response?.status === 403) {
          toast.error("Bạn không có quyền xem CV này");
        } else if (err.response?.status === 404) {
          toast.error("CV không tồn tại");
        } else {
          toast.error("Tải CV thất bại");
        }
        navigate("/my-cv");
      } finally {
        setLoading(false);
      }
    };

    if (cvId) loadCV();
  }, [cvId, navigate]);

  // Realtime preview khi gõ (dùng HTML từ server làm base)
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);

    if (previewHtml) {
      let temp = previewHtml;
      Object.keys(newData).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        temp = temp.replace(regex, newData[key] || "");
      });
      setPreviewHtml(temp);
    }
  };

  // Lưu CV
  const handleSave = async () => {
    if (!formData.fullname?.trim()) {
      toast.warn("Vui lòng nhập họ tên");
      return;
    }

    setSaving(true);
    try {
      await createCV({
        id: cvId,
        templateId: cv.templateId,
        title: `${formData.fullname} - ${formData.position || "CV"}`.trim(),
        visibility: "PRIVATE",
        data: formData,
      });

      toast.success("Cập nhật CV thành công!");

      // Tải lại preview mới nhất từ server
      const renderRes = await renderCV(cvId);
      setPreviewHtml(renderRes.data.htmlLayout || "");
    } catch (err) {
      console.error("Lỗi lưu CV:", err);
      if (err.response?.status === 403) {
        toast.error("Bạn không có quyền sửa CV này");
      } else {
        toast.error("Lưu CV thất bại");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div
          style={{ textAlign: "center", padding: "150px", fontSize: "20px" }}
        >
          Đang tải CV...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="edit-cv-container">
        <div className="edit-cv-header">
          <h1>Chỉnh sửa CV chuyên nghiệp</h1>
          <p>Cập nhật thông tin và xem trước ngay lập tức</p>
        </div>

        <div className="edit-cv-content">
          {/* Form bên trái */}
          <div className="form-section">
            <h2>Thông tin cá nhân</h2>

            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                name="fullname"
                value={formData.fullname || ""}
                onChange={handleChange}
                placeholder="Nguyễn Tiến Huy"
              />
            </div>

            <div className="form-group">
              <label>Chức danh</label>
              <input
                name="position"
                value={formData.position || ""}
                onChange={handleChange}
                placeholder="Backend Developer"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Tóm tắt bản thân</label>
              <textarea
                name="summary"
                rows="4"
                value={formData.summary || ""}
                onChange={handleChange}
                placeholder="Mình là lập trình viên..."
              />
            </div>

            <div className="form-group">
              <label>Kinh nghiệm làm việc</label>
              <textarea
                name="experience"
                rows="6"
                value={formData.experience || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Học vấn</label>
              <textarea
                name="education"
                rows="4"
                value={formData.education || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Kỹ năng</label>
              <textarea
                name="skills"
                rows="4"
                value={formData.skills || ""}
                onChange={handleChange}
                placeholder="Java, Spring Boot, React..."
              />
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-save">
              {saving ? "Đang lưu..." : "Lưu CV"}
            </button>
          </div>

          {/* Preview bên phải */}
          <div className="preview-section">
            <h2>Xem trước CV</h2>
            <div className="cv-preview">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
