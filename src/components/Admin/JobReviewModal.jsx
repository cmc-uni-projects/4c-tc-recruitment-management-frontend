// src/components/admin/JobReviewModal.jsx
import React, { useState } from "react";
import { jobAPI } from "../../services/auth.services";
import "./JobReviewModal.css";
import Swal from "sweetalert2";
export default function JobReviewModal({ job, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!window.confirm("Duyệt tin tuyển dụng này?")) return;
    setLoading(true);
    try {
      await jobAPI.approveJob(job.jobId);
      Swal.fire("Thành công!", "Đã duyệt tin tuyển dụng.", "success");
      onSuccess(); // Cập nhật danh sách
      onClose();
    } catch {
      Swal.fire("Lỗi", "Không thể duyệt tin!", "error");
    } finally {
      setLoading(false);
    }
  };

  
const handleCancel = async () => {
    Swal.fire({
      title: "Xác nhận hủy tin?",
      text: "Tin này sẽ bị xóa khỏi hệ thống.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hủy tin",
      cancelButtonText: "Đóng",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await jobAPI.deleteJob(job.jobId);
          Swal.fire("Đã hủy!", "Tin tuyển dụng đã bị xóa.", "success");
          onSuccess();
          onClose();
        } catch (error) {
          console.error("Lỗi khi hủy job:", error);
          Swal.fire("Lỗi", "Không thể hủy tin!", "error");
        } finally {
          setLoading(false);
        }
      }
    });
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
