// src/components/admin/JobReviewModal.jsx
import React, { useState } from "react";
import { jobAPI } from "../../services/auth.services";
import "./JobReviewModal.css";
export default function JobReviewModal({ job, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!window.confirm("Duyệt tin tuyển dụng này?")) return;
    setLoading(true);
    try {
      await jobAPI.approveJob(job.jobId);
      alert("Đã duyệt thành công!");
      onSuccess(); // Cập nhật danh sách
      onClose();
    } catch {
      alert("Lỗi khi duyệt!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Hủy (xóa) tin này?")) return;
    setLoading(true);
    try {
      await jobAPI.deleteJob(job.jobId);
      alert("Đã hủy tin!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi hủy job:", error);
      alert("Lỗi khi hủy!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content review-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Duyệt tin: {job.title}</h3>
        <div className="job-details">
          <p>
            <strong>Công ty:</strong> {job.companyName || "Không rõ"}
          </p>
          <p>
            <strong>Địa điểm:</strong> {job.location}
          </p>
          <p>
            <strong>Lương:</strong> {job.salaryMin} - {job.salaryMax} đ
          </p>
          <p>
            <strong>Mô tả:</strong> {job.description}
          </p>
          <p>
            <strong>Yêu cầu:</strong> {job.requirements}
          </p>
        </div>

        <div className="action-buttons">
          <button
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Hủy tin
          </button>
          <button
            className="btn-approve"
            onClick={handleApprove}
            disabled={loading}
          >
            Duyệt
          </button>
        </div>

        <button className="close-btn" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}
