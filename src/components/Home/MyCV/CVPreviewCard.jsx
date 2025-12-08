// src/components/CVPreviewCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { renderCV } from "../../../services/auth.services";
import Swal from "sweetalert2";
import "./MyCV.css";

const CVPreviewCard = ({ cv, onDelete }) => {
  const navigate = useNavigate();
  const [previewHtml, setPreviewHtml] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setLoadingPreview(true);
        const res = await renderCV(cv.id);
        const html = res?.data?.htmlLayout || "";
        const data = res?.data?.data || {};

        // Merge đơn giản như trong EditCVPage
        let merged = html;
        Object.keys(data).forEach((key) => {
          const regex = new RegExp(`{{${key}}}`, "g");
          merged = merged.replace(regex, data[key] || "");
        });

        // Chỉ lấy phần nội dung chính (tránh full page HTML gây lỗi layout)
        const cleaned = merged
          .replace(/<html.*?>|<\/html>|<head.*?>.*?<\/head>|<body.*?>/gi, "")
          .replace(/<\/body>/gi, "");

        setPreviewHtml(cleaned);
      } catch (err) {
        console.error("Lỗi render preview CV:", err);
        setPreviewHtml(
          "<div style='padding:20px; text-align:center; color:#999;'>Không tải được xem trước</div>"
        );
      } finally {
        setLoadingPreview(false);
      }
    };

    loadPreview();
  }, [cv.id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Chưa cập nhật";
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(cv.id);
  };

  return (
    <div
      className="cv-card created"
      onClick={() => navigate(`/my-cv/edit/${cv.id}`)}
      style={{ cursor: "pointer", position: "relative" }}
    >
      {/* PHẦN XEM TRƯỚC CV – CLASS MỚI HOÀN TOÀN */}
      <div className="mycv-preview-box">
        {loadingPreview ? (
          <div className="mycv-skeleton" />
        ) : (
          <div className="mycv-preview-outer">
            <div
              className="mycv-preview-inner"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}
      </div>

      <div className="cv-info">
        <h3>{cv.title || "CV chưa đặt tên"}</h3>
        <p>Cập nhật: {formatDate(cv.updatedAt)}</p>
      </div>

      <div className="cv-actions">
        <span className="edit-hint">Click để chỉnh sửa và tải xuống</span>
      </div>

      <button onClick={handleDelete} className="delete-btn1">
        Xóa
      </button>
    </div>
  );
};

export default CVPreviewCard;
