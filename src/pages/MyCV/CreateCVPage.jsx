// src/pages/MyCV/CreateCVPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyCVs,
  uploadCV,
  getAllTemplates,
  createCV,
  deleteCV,
} from "../../services/auth.services";
import Navbar from "../../components/Layout/Navbar";
import "./CreateCVPage.css";

export default function CreateCVPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await getAllTemplates();
      setTemplates(res.data || []);
    } catch (err) {
      alert("Không tải được mẫu CV");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    navigate("/my-cv/builder", { state: { template } });
  };

  return (
    <>
      <Navbar />
      <div className="create-cv-page">
        <div className="create-cv-header">
          <h1>Chọn mẫu CV phù hợp với bạn</h1>
          <p>72+ mẫu CV đẹp, chuyên nghiệp, dễ chỉnh sửa</p>
        </div>

        {loading ? (
          <div className="loading">Đang tải mẫu CV...</div>
        ) : (
          <div className="template-grid">
            {templates.map((template) => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => handleSelectTemplate(template)}
              >
                {template.previewImage ? (
                  <img src={template.previewImage} alt={template.name} />
                ) : (
                  <div className="template-placeholder">
                    <span>{template.name}</span>
                  </div>
                )}
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <button className="btn-use-template">Dùng mẫu</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
