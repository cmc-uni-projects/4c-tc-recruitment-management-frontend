
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Layout/Navbar";
import { jobAPI, companyAPI, applicationAPI } from "../../services/auth.services";
import "./JobDetail.css";
import axios from "axios";
import ApplyForm from "../Applications/ApplyForm";
import { Modal } from "@mui/material";
import Swal from "sweetalert2";

export default function JobDetail() {
  const { jobId } = useParams();
  const [company, setCompany] = useState(null);
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // --- Load chi tiết job ---
  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await jobAPI.getJobDetail(jobId);
        setJob(response.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết công việc:", error);
      }
    };
    fetchJobDetail();
  }, [jobId]);

  // --- Load thông tin công ty ---
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await companyAPI.getById(job.companyId);
        setCompany(response.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin công ty:", error);
      }
    };
    if (job?.companyId) {
      fetchCompanyInfo();
    }
  }, [job]);

  // --- Kiểm tra trạng thái đã lưu ---
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!token || !userId) return;
      try {
        const response = await axios.get(`http://localhost:8080/api/saved-jobs`, {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedJobs = response.data;
        const found = (savedJobs || []).some((savedJob) => savedJob.jobId === jobId);
        setIsSaved(found);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái lưu:", error);
      }
    };
    checkSavedStatus();
  }, [jobId, token, userId]);

  // --- Kiểm tra đã ứng tuyển ---
  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok || !jobId) return;
    applicationAPI
      .getMyApplications(tok)
      .then((res) => {
        const applied = (res.data || []).some((app) => app.jobId === jobId);
        setIsApplied(applied);
      })
      .catch((err) => console.error("Lỗi kiểm tra đã ứng tuyển:", err));
  }, [jobId]);

  // --- Format lương ---
  const formatSalary = (min, max) => {
    if (min && max) {
      return `${(min / 1_000_000).toFixed(0)} - ${(max / 1_000_000).toFixed(0)} triệu`;
    }
    return "Thỏa thuận";
  };

  // --- Tính ngày còn lại ---
  const calculateDaysLeft = (expiredAt) => {
    const endDate = new Date(expiredAt);
    const today = new Date();
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Khi chưa có job, render loading
  if (!job) return <p>Đang tải thông tin công việc...</p>;

  // Sử dụng lại biến, tránh tính toán lặp
  const daysLeft = calculateDaysLeft(job.expiredAt);
  const isExpired = daysLeft <= 0;

  // --- Handler Lưu/Bỏ lưu tin ---
  const handleSaveJob = async () => {
    try {
      if (!token || !userId) {
        Swal.fire("Cảnh báo", "Bạn chưa đăng nhập!", "warning");
        return;
      }
      if (!isSaved) {
        await axios.post(`http://localhost:8080/api/saved-jobs`, null, {
          params: { userId, jobId },
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Thành công", "Đã lưu công việc!", "success");
      } else {
        await axios.delete(`http://localhost:8080/api/saved-jobs/${jobId}`, {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Thông báo", "Đã bỏ lưu công việc!", "info");
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Lỗi khi lưu/bỏ lưu công việc:", error);
      Swal.fire("Lỗi", "Có lỗi xảy ra, vui lòng thử lại!", "error");
    }
  };

  // --- Helper mở form ứng tuyển (có chặn hết hạn) ---
  const openApplyForm = () => {
    if (isExpired) return; // Chặn mở form khi hết hạn
    setShowApplyForm(true);
  };

  // --- Hiển thị ---
  return (
    <>
      <Navbar />
      <div className="job-detail-wrapper">
        <div className="job-detail-container">
          {/* Left Column */}
          <div className="job-left">
            <div className="breadcrumb">Trang chủ &gt; Việc làm &gt; {job.title}</div>

            <div className="job-header">
              <h1>{job.title}</h1>

              <div className="job-info-icons">
                <div className="info-item">
                  <div className="icon-circle">
                    <i className="fa-solid fa-dollar-sign"></i>
                  </div>
                  <div>
                    <p className="label">Mức lương</p>
                    <p className="value">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon-circle">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <p className="label">Địa điểm</p>
                    <p className="value">{job.location}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon-circle">
                    <i className="fa-solid fa-hourglass-half"></i>
                  </div>
                  <div>
                    <p className="label">Kinh nghiệm</p>
                    <p className="value">
                      {job.experienceRequired ? `${job.experienceRequired} năm` : "Không yêu cầu"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="deadline-info">
                <p>
                  <strong>Hạn nộp:</strong>{" "}
                  {new Date(job.expiredAt).toLocaleDateString("vi-VN")}
                </p>
                <p className={`days-left ${isExpired ? "expired" : ""}`}>
                  {isExpired ? "Hết hạn ứng tuyển" : `Còn ${daysLeft} ngày để ứng tuyển`}
                </p>
              </div>

              {/* Actions */}
              <div className="job-actions">
                {/* Ẩn/chặn ứng tuyển khi hết hạn */}
                {isExpired ? (
                  <button className="apply-btn" disabled>
                    Hết hạn ứng tuyển
                  </button>
                ) : (
                  <>
                    {isApplied ? (
                      <>
                        <button className="applied-btn" disabled>
                          Đã ứng tuyển
                        </button>
                        <button className="reapply-btn" onClick={openApplyForm}>
                          Ứng tuyển lại
                        </button>
                      </>
                    ) : (
                      <button className="apply-btn" onClick={openApplyForm}>
                        Ứng tuyển ngay
                      </button>
                    )}
                  </>
                )}

                {/* Nút Lưu tin */}
                <button className="save-btn" onClick={handleSaveJob}>
                  <i className={`fa-heart ${isSaved ? "fa-solid" : "fa-regular"}`}></i>
                  <span>{isSaved ? "Đã lưu" : "Lưu tin"}</span>
                </button>
              </div>
            </div>

            {/* Chi tiết tin */}
            <div className="job-detail-section">
              <h2>Chi tiết tin tuyển dụng</h2>

              <h3>Mô tả công việc</h3>
              <div className="job-description">
                {job.description
                  ?.split("\n")
                  .filter((item) => item.trim() !== "")
                  .map((item, idx) => (
                    <p key={`${item}-${idx}`}>{item}</p>
                  ))}
              </div>

              <h3>Yêu cầu công việc</h3>
              <div className="job-requirements">
                {job.requirements
                  ?.split("\n")
                  .filter((item) => item.trim() !== "")
                  .map((item, idx) => (
                    <p key={`${item}-${idx}`}>{item}</p>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="job-right">
            <div className="company-card compact">
              <img
                src={company?.logoUrl || "/icons/company.svg"}
                alt="Logo công ty"
                className="company-logo-injob"
              />
              <h3 className="company-name">{company?.name}</h3>

              <div className="company-info-item">
                <i className="fa-solid fa-users"></i>
                <span>{company?.size || "Đang cập nhật"}</span>
              </div>

              <div className="company-info-item">
                <i className="fa-solid fa-briefcase"></i>
                <span>{company?.industry || "Đang cập nhật"}</span>
              </div>

              <div className="company-info-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>{company?.address || "Đang cập nhật"}</span>
              </div>

              <a
                href={`/company/public/${company?.companyId}`}
                className="view-company-link"
              >
                Xem trang công ty
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal hiển thị form ứng tuyển */}
      <Modal open={showApplyForm} onClose={() => setShowApplyForm(false)}>
        <ApplyForm
          jobId={job.jobId}
          jobTitle={job.title}
          onClose={() => setShowApplyForm(false)}
          onApplied={() => setIsApplied(true)} // cập nhật ngay sau khi nộp
        />
      </Modal>
    </>
  );
}
``
