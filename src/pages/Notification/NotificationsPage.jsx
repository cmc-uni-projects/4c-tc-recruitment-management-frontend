import React, { useEffect, useState } from "react";
import { jobAPI } from "../../services/auth.services";
import JobReviewModal from "../../components/Admin/JobReviewModal";
import "./NotificationsPage.css";

export default function NotificationsPage() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Lấy danh sách job đang chờ duyệt
  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getAllJobs();
      const pending = res.data.filter(job => job.status === "PENDING");
      setPendingJobs(pending);
    } catch (error) {
      console.error("Lỗi tải danh sách chờ duyệt:", error);
      alert("Lỗi tải danh sách chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingJobs();
    // Cập nhật mỗi 15 giây
  }, []);

  const openReview = (job) => {
    setSelectedJob(job);
    setIsReviewOpen(true);
  };

  const closeReview = () => {
    setIsReviewOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h2>Duyệt tin tuyển dụng mới</h2>
        <p>Có <strong>{pendingJobs.length}</strong> tin đang chờ duyệt</p>
      </div>

      {loading ? (
        <div className="loading">Đang tải danh sách...</div>
      ) : pendingJobs.length === 0 ? (
        <div className="empty-state">
          <p>Không có tin tuyển dụng nào đang chờ duyệt.</p>
        </div>
      ) : (
        <div className="pending-list">
          {pendingJobs.map((job) => (
            <div
              key={job.jobId}
              className="pending-card"
              onClick={() => openReview(job)}
            >
              <h4>{job.title}</h4>
              <p><strong>Công ty:</strong> {job.companyName || "Không rõ"}</p>
              <p><strong>Địa điểm:</strong> {job.location || "Toàn quốc"}</p>
              <p><strong>Lương:</strong> 
                {job.salaryMin ? `${job.salaryMin.toLocaleString()} - ` : ""}
                {job.salaryMax ? `${job.salaryMax.toLocaleString()} đ` : "Thoả thuận"}
              </p>
              <span className="status-pending">Chờ duyệt</span>
            </div>
          ))}
        </div>
      )}

      {/* Modal duyệt job */}
      {isReviewOpen && selectedJob && (
        <JobReviewModal
          job={selectedJob}
          onClose={closeReview}
          onSuccess={fetchPendingJobs}
        />
      )}
    </div>
  );
}