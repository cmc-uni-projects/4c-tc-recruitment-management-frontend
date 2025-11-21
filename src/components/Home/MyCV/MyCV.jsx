// src/pages/MyCV/MyCV.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./MyCV.css";
import { getMyCVs } from "../../../services/auth.services";
import EmptyCreatedCV from "../../../assets/empty-cv-created.png";
import EmptyUploadedCV from "../../../assets/empty-cv-upload.png";
import { deleteCV } from "../../../services/auth.services";

export default function MyCV() {
  const [createdCVs, setCreatedCVs] = useState([]);
  const [uploadedCVs, setUploadedCVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCVs();
  }, []);

  const fetchMyCVs = async () => {
    try {
      setLoading(true);
      console.log("Đang gọi API lấy CV..."); // <<< THÊM DÒNG NÀY
      const response = await getMyCVs();
      console.log("Dữ liệu CV từ server:", response.data); // <<< THÊM DÒNG NÀY

      const cvs = response.data || [];
      const created = cvs.filter((cv) => cv.templateId !== null);
      const uploaded = cvs.filter((cv) => cv.templateId === null && cv.cvUrl);

      setCreatedCVs(created);
      setUploadedCVs(uploaded);
    } catch (err) {
      console.error("Lỗi API /api/cv/my:", err.response || err);
      toast.error("Không tải được CV");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Chưa cập nhật";
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };
  const handleDelete = async (cvId) => {
    if (!window.confirm("Xóa CV này?")) return;
    try {
      await deleteCV(cvId);
      toast.success("Đã xóa CV");
      fetchMyCVs();
    } catch (err) {
      toast.error("Xóa thất bại");
    }
  };
  if (loading) {
    return (
      <div className="mycv-loading">
        <div className="spinner"></div>
        <p>Đang tải CV của bạn...</p>
      </div>
    );
  }

  return (
    <div className="mycv-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mycv-header"
      >
        <h1>CV của tôi</h1>
        <p>Quản lý và tạo CV chuyên nghiệp để ứng tuyển nhanh hơn</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mycv-grid"
      >
        {/* CV đã tạo trên SmartHire */}
        <motion.div variants={itemVariants} className="cv-section">
          <div className="cv-section-header">
            <div>
              <h2>CV đã tạo trên SmartHire</h2>
              <span className="cv-count">{createdCVs.length} CV</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-create-cv"
              onClick={() => navigate("/my-cv/create")}
            >
              + Tạo CV mới
            </motion.button>
          </div>

          <div className="cv-list">
            {createdCVs.length === 0 ? (
              <motion.div className="empty-state">
                <img
                  src={EmptyCreatedCV}
                  alt="Chưa tạo CV"
                  className="empty-image"
                />
                <p>Bạn chưa tạo CV nào bằng mẫu có sẵn</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-create-first"
                  onClick={() => navigate("/my-cv/create")}
                >
                  Tạo CV đầu tiên
                </motion.button>
              </motion.div>
            ) : (
              createdCVs.map((cv, index) => (
                <motion.div
                  key={cv.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="cv-card created"
                  onClick={() => navigate(`/my-cv/edit/${cv.id}`)}
                >
                  <div className="cv-preview">
                    <div className="template-preview">
                      <span role="img" aria-label="template">
                        Template
                      </span>
                    </div>
                  </div>
                  <div className="cv-info">
                    <h3>{cv.title || "CV chưa đặt tên"}</h3>
                    <p>Cập nhật: {formatDate(cv.updatedAt)}</p>
                  </div>
                  <div className="cv-actions">
                    <span className="edit-hint">Click để chỉnh sửa</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cv.id);
                    }}
                    className="delete-btn"
                  >
                    Xóa
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* CV đã tải lên */}
        <motion.div variants={itemVariants} className="cv-section">
          <div className="cv-section-header">
            <div>
              <h2>CV đã tải lên</h2>
              <span className="cv-count">{uploadedCVs.length} tệp</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-upload-cv"
              onClick={() => navigate("/my-cv/upload")}
            >
              + Tải CV lên
            </motion.button>
          </div>

          <div className="cv-list">
            {uploadedCVs.length === 0 ? (
              <motion.div className="empty-state">
                <img
                  src={EmptyUploadedCV}
                  alt="Chưa tải lên CV"
                  className="empty-image"
                />
                <p>Bạn chưa tải lên CV nào</p>
              </motion.div>
            ) : (
              uploadedCVs.map((cv, index) => (
                <motion.div
                  key={cv.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="cv-card uploaded"
                >
                  <a
                    href={cv.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-uploaded-content"
                  >
                    <img src="/images/pdf-icon-large.png" alt="PDF" />
                    <div className="cv-info">
                      <h3>{cv.title || "CV tải lên"}</h3>
                      <p>Tải lên: {formatDate(cv.updatedAt)}</p>
                    </div>
                  </a>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}