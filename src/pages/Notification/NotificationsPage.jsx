import React, { useEffect, useState } from "react";
import { jobAPI, employerAPI } from "../../services/auth.services";
import JobReviewModal from "../../components/Admin/JobReviewModal";
import BusinessRegistrationReviewModal from "../../components/Admin/BusinessRegistrationReviewModal";
import "./NotificationsPage.css";
import Navbar from "../../components/Layout/Navbar";

export default function NotificationsPage() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // --- EMPLOYER pending (mới) ---
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(true);
  const [selectedEmployerId, setSelectedEmployerId] = useState(null);
  const [isBRReviewOpen, setIsBRReviewOpen] = useState(false);

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

  const fetchPendingEmployers = async () => {
    try {
      setLoadingEmployers(true);
      const res = await employerAPI.getPendingVerificationEmployers();
      console.log("[Employer Pending] status:", res.status);
      console.log("[Employer Pending] data:", res.data);
      setPendingEmployers(res.data || []);
    } catch (error) {
      console.error("[Employer Pending] error:", error);
      const code = error?.response?.status;
      const msg = error?.response?.data?.message;
      alert(
        code === 403
          ? "Bạn cần quyền ADMIN để xem hồ sơ doanh nghiệp chờ duyệt."
          : msg ??
              `Lỗi tải danh sách hồ sơ doanh nghiệp chờ duyệt (HTTP ${
                code ?? "?"
              })`
      );
      setPendingEmployers([]);
    } finally {
      setLoadingEmployers(false);
    }
  };

  useEffect(() => {
    fetchPendingJobs();
    fetchPendingEmployers();
  }, []);

  const openReview = (job) => {
    setSelectedJob(job);
    setIsReviewOpen(true);
  };

  const closeReview = () => {
    setIsReviewOpen(false);
    setSelectedJob(null);
  };

  const openBRReview = (employerId) => {
    setSelectedEmployerId(employerId);
    setIsBRReviewOpen(true);
  };
  const closeBRReview = () => {
    setIsBRReviewOpen(false);
    setSelectedEmployerId(null);
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
              className="pending-card job-card"
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

      {/* ==================== EMPLOYER PENDING ==================== */}
      <h3 style={{ marginTop: 24 }}>Hồ sơ doanh nghiệp cần duyệt</h3>
      {loadingEmployers ? (
        <div>Đang tải...</div>
      ) : pendingEmployers.length === 0 ? (
        <div>Không có hồ sơ doanh nghiệp nào đang chờ duyệt.</div>
      ) : (
        <div className="list">
          {pendingEmployers.map((emp) => (
            <div className="pending-card employer-card" key={emp.employerId}>
              <div className="card-title">
                {emp.companyName ||
                  emp.company?.name ||
                  "Doanh nghiệp không rõ"}
              </div>{" "}
              <div className="card-sub">
                Người liên hệ: {emp.fullName || emp.name || "—"} • Email:{" "}
                {emp.email || "—"} • Trạng thái:{" "}
                {emp.verificationStatus ||
                  (emp.verified ? "VERIFIED" : "PENDING")}
              </div>
              <span className="status-pending">Chờ duyệt hồ sơ</span>
              <button
                className="btn"
                onClick={() => openBRReview(emp.employerId)}
              >
                Xem hồ sơ
              </button>
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

      {isBRReviewOpen && selectedEmployerId && (
        <BusinessRegistrationReviewModal
          employerId={selectedEmployerId}
          onClose={closeBRReview}
          onSuccess={fetchPendingEmployers}
        />
      )}
    </div>
  );
}
