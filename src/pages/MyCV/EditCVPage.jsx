
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMyCVs,
  renderCV,
  updateCV,
  getAllTemplates,
} from "../../services/auth.services";
import { toast } from "react-toastify";
import Navbar from "../../components/Layout/Navbar";
import "./EditCVPage.css";
import html2pdf from "html2pdf.js";
import Swal from "sweetalert2";

/** ====== Helpers ====== */

// Chuyển URL ảnh -> base64 dataURL để tránh CORS/taint canvas
async function toDataURL(url) {
  // Nếu đã là dataURL thì trả lại luôn
  if (!url || url.startsWith("data:")) return url;
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    // Nếu lỗi, trả lại URL cũ (vẫn hiển thị trên màn hình)
    return url;
  }
}

// Chờ tất cả <img> bên trong root load xong (tránh ảnh trắng)
function waitForImagesLoaded(root) {
  if (!root) return Promise.resolve();
  const imgs = Array.from(root.querySelectorAll("img"));
  if (!imgs.length) return Promise.resolve();
  return Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = () => res();
              img.onerror = () => res(); // đừng treo nếu ảnh lỗi
            })
    )
  );
}

// Đảm bảo các <img> trong HTML string có crossOrigin="anonymous"
function addCrossOriginToImg(html) {
  if (!html) return html;
  return html.replace(/<img(\s)/gi, '<img crossOrigin="anonymous"$1');
}

export default function EditCVPage() {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const [cv, setCv] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [baseHtml, setBaseHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Hàm thay biến {{key}} trong HTML + thêm crossOrigin cho <img>
  const mergeHtml = (html, data) => {
    if (!html) return "";
    let temp = html;
    Object.keys(data ?? {}).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      temp = temp.replace(regex, data[key] ?? "");
    });
    return addCrossOriginToImg(temp);
  };

  // Tải CV + render HTML hiện tại
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

        // Render layout hiện tại từ server (dựa theo templateId đang lưu)
        const renderRes = await renderCV(cvId);
        const html = renderRes?.data?.htmlLayout ?? "";
        let data = renderRes?.data?.data ?? {};

        // ✅ Nếu có avatarUrl là URL -> convert sang dataURL để export PDF không lỗi
        if (data.avatarUrl && !String(data.avatarUrl).startsWith("data:")) {
          try {
            const dataUrl = await toDataURL(data.avatarUrl);
            data = { ...data, avatarUrl: dataUrl };
          } catch {}
        }

        setBaseHtml(html);
        setFormData(data);
        setPreviewHtml(mergeHtml(html, data));

        // templates
        const tplRes = await getAllTemplates();
        setTemplates(tplRes.data ?? []);
        const currentTpl = (tplRes.data ?? []).find(
          (t) => t.id === found.templateId
        ) ?? null;
        setSelectedTemplate(currentTpl);
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

  // Thay đổi input → cập nhật form & preview
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    setPreviewHtml(mergeHtml(baseHtml, newData));
  };

  // Chọn template
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setBaseHtml(template?.htmlLayout ?? "");
    setPreviewHtml(mergeHtml(template?.htmlLayout ?? "", formData));
    if (template?.name) {
      Swal.fire("Đã chọn mẫu", template.name, "info");
    }
  };

  // Lưu CV
  const handleSave = async () => {
    if (!formData.fullname?.trim()) {
      Swal.fire("Cảnh báo", "Vui lòng nhập họ tên", "warning");
      return;
    }
    setSaving(true);
    try {
      await updateCV(cvId, {
        title: `${formData.fullname} - ${formData.position ?? "CV"}`.trim(),
        templateId: selectedTemplate?.id ?? cv.templateId,
        visibility: "PRIVATE",
        data: formData,
      });
      if (selectedTemplate?.id) {
        setCv((prev) => ({ ...prev, templateId: selectedTemplate.id }));
      }
      Swal.fire("Thành công", "Cập nhật CV thành công!", "success");
      const renderRes = await renderCV(cvId);
      const html = renderRes?.data?.htmlLayout ?? "";
      setBaseHtml(html);
      setPreviewHtml(mergeHtml(html, formData));
    } catch (err) {
      console.error("Lỗi lưu CV:", err);
      Swal.fire("Lỗi", "Lưu CV thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Upload avatar: đọc file -> upload -> nhận URL -> chuyển sang dataURL để tránh CORS
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("http://localhost:8080/api/cv/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: form,
      });
      const json = await res.json();

      // Convert sang dataURL
      const dataUrl = await toDataURL(json.url);
      const newData = { ...formData, avatarUrl: dataUrl };
      setFormData(newData);
      setPreviewHtml(mergeHtml(baseHtml, newData));
    } catch (err) {
      console.error("Upload avatar lỗi:", err);
      toast.error("Upload avatar thất bại");
    }
  };

  // ✅ Xuất PDF: chờ ảnh + bật useCORS + allowTaint:false
  const handleExportPDF = async () => {
    const element = document.querySelector(".cv-preview");

    // Chờ ảnh load, đặc biệt là avatar
    await waitForImagesLoaded(element);

    const opt = {
      margin: 0,
      filename: `${formData.fullname ?? "cv"}_profile.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,      // quan trọng
        allowTaint: false,  // an toàn hơn
        backgroundColor: null,
      },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
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
                onChange={handleAvatarUpload}
              />
              {formData.avatarUrl && (
                <div className="avatar-preview">
                  {/* Nếu template dùng {{avatarUrl}} cho <img>, phần này chỉ là preview bên trái */}
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
              { name: "skills", label: "Kỹ năng (cách nhau bằng dấu phẩy)", placeholder: "VD: Java, React, SQL" },
            ].map((field) => (
              <div className="form-group" key={field.name}>
                <label>{field.label}</label>
                {["summary", "experience", "education", "skills"].includes(field.name) ? (
                  <textarea
                    name={field.name}
                    rows="4"
                    placeholder={field.placeholder}
                    value={formData[field.name] ?? ""}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] ?? ""}
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

          {/* Bên phải: Selector mẫu + Preview */}
          <div className="preview-section">
            {/* Chọn mẫu */}
            <div className="template-selector">
              <h3>Chọn mẫu CV ({templates.length} mẫu)</h3>
              <div className="template-grid">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`template-item ${selectedTemplate?.id === tpl.id ? "selected" : ""}`}
                    onClick={() => handleSelectTemplate(tpl)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectTemplate(tpl)}
                    aria-pressed={selectedTemplate?.id === tpl.id}
                    aria-label={`Chọn mẫu ${tpl.name}`}
                  >
                    <img src={tpl.previewImage} alt={tpl.name} />
                    <p>{tpl.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
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
