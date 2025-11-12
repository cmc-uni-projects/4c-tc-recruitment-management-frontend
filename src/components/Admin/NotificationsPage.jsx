import React, { useEffect, useState } from "react";
import { jobAPI } from "../../services/auth.services";
import "./NotificationsPage.css";

export default function NotificationsPage() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getAllJobs();
      const pending = res.data.filter((j) => j.status === "PENDING");
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
      <h2>Duyệt tin tuyển dụng mới</h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : pendingJobs.length === 0 ? (
        <p>Không có tin nào đang chờ duyệt.</p>
      ) : (
        <div className="pending-list">
          {pendingJobs.map((job) => (
            <div
              key={job.jobId}
              className="pending-card"
              onClick={() => openReview(job)}
            >
              <h4>{job.title}</h4>
              <p>
                <strong>Công ty:</strong> {job.companyName || "Không rõ"}
              </p>
              <p>
                <strong>Địa điểm:</strong> {job.location}
              </p>
              <p>
                <strong>Lương:</strong> {job.salaryMin} - {job.salaryMax} đ
              </p>
              <span className="status-pending">Chờ duyệt</span>
            </div>
          ))}
        </div>
      )}

      {/* Modal Duyệt */}
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
