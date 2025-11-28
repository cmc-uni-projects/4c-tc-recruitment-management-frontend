
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyCVs, renderCV, updateCV } from "../../services/auth.services";
import { toast } from "react-toastify";
import Navbar from "../../components/Layout/Navbar";
import "./EditCVPage.css";
import html2pdf from "html2pdf.js";

export default function EditCVPage() {
  const { cvId } = useParams();
  const navigate = useNavigate();

  const [cv, setCv] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [baseHtml, setBaseHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          toast.error("Không tìm thấy CV này");
          navigate("/my-cv");
          return;
        }

        setCv(found);

        const renderRes = await renderCV(cvId);
        const html = renderRes?.data?.htmlLayout || "";
        const data = renderRes?.data?.data || {};

        setBaseHtml(html);
        setFormData(data);
        setPreviewHtml(mergeHtml(html, data));
      } catch (err) {
        console.error("Lỗi tải CV:", err);
        toast.error("Tải CV thất bại");
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
      toast.warn("Vui lòng nhập họ tên");
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

      toast.success("Cập nhật CV thành công!");

      const renderRes = await renderCV(cvId);
      const html = renderRes?.data?.htmlLayout || "";
      setBaseHtml(html);
      setPreviewHtml(mergeHtml(html, formData));
    } catch (err) {
      console.error("Lỗi lưu CV:", err);
      toast.error("Lưu CV thất bại");
    } finally {
      setSaving(false);
    }
  };

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
            <h2>Nhập thông tin của bạn</h2>
            
<div className="form-group">
    <label>Ảnh đại diện</label>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          const newData = { ...formData, avatarUrl: imageUrl };
          setFormData(newData);
          setPreviewHtml(mergeHtml(baseHtml, newData));
        }
      }}
    />
    {formData.avatarUrl && (
      <div className="avatar-preview">
        <img src={formData.avatarUrl} alt="Avatar Preview" />
      </div>
    )}
  </div>


            {[
              { name: "fullname", label: "Họ và tên *", placeholder: "Nhập họ và tên" },
              { name: "position", label: "Vị trí ứng tuyển", placeholder: "Nhập vị trí mong muốn" },
              { name: "email", label: "Email", placeholder: "Nhập email" },
              { name: "phone", label: "Số điện thoại", placeholder: "Nhập số điện thoại" },
              { name: "address", label: "Địa chỉ", placeholder: "Nhập địa chỉ" },
              { name: "summary", label: "Tóm tắt bản thân", placeholder: "Giới thiệu ngắn gọn về bạn" },
              { name: "experience", label: "Kinh nghiệm làm việc", placeholder: "Mô tả kinh nghiệm làm việc" },
              { name: "education", label: "Học vấn", placeholder: "Mô tả quá trình học tập" },
              { name: "skills", label: "Kỹ năng (cách nhau bằng dấu phẩy)", placeholder: "VD: Java, React, SQL" }
            ].map((field) => (
              <div className="form-group" key={field.name}>
                <label>{field.label}</label>
                {["summary", "experience", "education", "skills"].includes(field.name) ? (
                  <textarea
                    name={field.name}
                    rows="4"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
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
