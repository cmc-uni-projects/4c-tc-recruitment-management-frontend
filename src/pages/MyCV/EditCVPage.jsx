import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyCVs, renderCV, updateCV } from "../../services/auth.services";
import { toast } from "react-toastify";
import Navbar from "../../components/Layout/Navbar";
import "./EditCVPage.css";
import html2pdf from "html2pdf.js";
import Swal from "sweetalert2";

export default function EditCVPage() {
  const { cvId } = useParams();
  const navigate = useNavigate();

  const [cv, setCv] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [baseHtml, setBaseHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hàm merge HTML + Data
  const mergeHtml = (html, data) => {
    if (!html) return "";
    let temp = html;
    Object.keys(data || {}).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      temp = temp.replace(regex, data[key] || "");
    });
    return temp;
  };

  useEffect(() => {
    const loadCV = async () => {
      try {
        const res = await getMyCVs();
        const found = res.data.find((c) => c.id === cvId);

        if (!found) {
          Swal.fire("Lỗi", "Không tìm thấy CV này", "error");
          navigate("/my-cv");
          return;
        }

        setCv(found);

        // Gọi renderCV để lấy HTML + data
        const renderRes = await renderCV(cvId);
        const html = renderRes?.data?.htmlLayout || "";
        const data = renderRes?.data?.data || {};

        setBaseHtml(html);
        setFormData(data);
        setPreviewHtml(mergeHtml(html, data));
      } catch (err) {
        console.error("Lỗi tải CV:", err);
        Swal.fire("Lỗi", "Tải CV thất bại", "error");
        navigate("/my-cv");
      } finally {
        setLoading(false);
      }
    };

    if (cvId) loadCV();
  }, [cvId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    setPreviewHtml(mergeHtml(baseHtml, newData));
  };

  const handleSave = async () => {
    if (!formData.fullname?.trim()) {
      Swal.fire("Cảnh báo", "Vui lòng nhập họ tên", "warning");
      return;
    }

    setSaving(true);
    try {
      await updateCV(cvId, {
        title: `${formData.fullname} - ${formData.position || "CV"}`.trim(),
        templateId: cv.templateId,
        visibility: "PRIVATE",
        data: formData,
      });

      Swal.fire("Thành công", "Cập nhật CV thành công!", "success");

      // Render lại từ server
      const renderRes = await renderCV(cvId);
      const html = renderRes?.data?.htmlLayout || "";
      setBaseHtml(html);
      setPreviewHtml(mergeHtml(html, formData));
    } catch (err) {
      console.error("Lỗi lưu CV:", err);
      Swal.fire("Lỗi", "Lưu CV thất bại", "error");
    } finally {
      setSaving(false);
    }
  };
  
  // 👉👉 THÊM CHỨC NĂNG EXPORT PDF TẠI ĐÂY
  const handleExportPDF = () => {
    const element = document.querySelector(".cv-preview");

    const opt = {
      margin: 0,
      filename: `${formData.fullname || "cv"}_profile.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" }
    };

    html2pdf().from(element).set(opt).save();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", padding: "150px", fontSize: "20px" }}>
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

            {["fullname", "position", "email", "phone", "summary", "experience", "education", "skills"].map((field) => (
              <div className="form-group" key={field}>
                <label>{field}</label>
                {["summary", "experience", "education", "skills"].includes(field) ? (
                  <textarea
                    name={field}
                    rows="4"
                    value={formData[field] || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}

            <button onClick={handleSave} disabled={saving} className="btn-save">
              {saving ? "Đang lưu..." : "Lưu CV"}
            </button>
            <button
              onClick={handleExportPDF}
              className="btn-save"
              style={{ marginTop: "15px", backgroundColor: "#1e88e5" }}
            >
              Xuất PDF
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
