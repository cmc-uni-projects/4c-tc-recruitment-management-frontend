
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../Layout/Navbar";
import { jobAPI, companyAPI } from "../../services/auth.services";
import "./JobDetail.css";
import axios from "axios";
import ApplyForm from "../Applications/ApplyForm";
import { Modal, Box } from "@mui/material";
import Swal from "sweetalert2";

export default function JobDetail() {
  const { jobId } = useParams();
  const [company, setCompany] = useState(null);
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    let mounted = true;
    const fetchJobDetail = async () => {
      try {
        const response = await jobAPI.getJobDetail(jobId);
        if (mounted) setJob(response.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết công việc:", error);
      }
    };
    fetchJobDetail();
    return () => { mounted = false; };
  }, [jobId]);

  useEffect(() => {
    let mounted = true;
    const fetchCompanyInfo = async () => {
      try {
        const response = await companyAPI.getById(job.companyId);
        if (mounted) setCompany(response.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin công ty:", error);
      }
    };
    if (job?.companyId) {
      fetchCompanyInfo();
    }
    return () => { mounted = false; };
  }, [job]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!token || !userId || !jobId) return;
      try {
        const response = await axios.get(`http://localhost:8080/api/saved-jobs`, {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedJobs = response.data ?? [];
        // Chuẩn hoá kiểu id để so sánh
        const found = savedJobs.some((savedJob) => {
          const savedId = String(savedJob.jobId);
          const currentId = String(jobId);
          return savedId === currentId;
        });
        setIsSaved(Boolean(found));
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái lưu:", error);
      }
    };
    checkSavedStatus();
  }, [jobId, token, userId]);

  const formatSalary = (min, max) => {
    if (min != null && max != null) {
      return `${(min / 1_000_000).toFixed(0)} - ${(max / 1_000_000).toFixed(0)} triệu`;
    }
    return "Thỏa thuận";
  };

  const calculateDaysLeft = (expiredAt) => {
    if (!expiredAt) return 0;
    const endDate = new Date(expiredAt);
    const today = new Date();
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatExperience = (value) => {
    // Hỗ trợ số/chuỗi/null
    if (value == null || value === "") return "Không yêu cầu";
    if (typeof value === "number") {
      return value === 0 ? "Không yêu cầu" : `${value} năm`;
    }
    // Nếu backend trả chuỗi (ví dụ "0-1", "Junior")
    const str = String(value).trim();
    if (/^\d+(\.\d+)?$/.test(str)) {
      const num = Number(str);
      return num === 0 ? "Không yêu cầu" : `${num} năm`;
    }
    return str;
  };

  const isExpired = calculateDaysLeft(job?.expiredAt) <= 0;

  const handleSaveJob = async () => {
    try {
      if (!token || !userId) {
        await Swal.fire("Cảnh báo", "Bạn chưa đăng nhập!", "warning");
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

      setIsSaved((prev) => !prev);
    } catch (error) {
      console.error("Lỗi khi lưu/bỏ lưu công việc:", error);
      Swal.fire("Lỗi", "Có lỗi xảy ra, vui lòng thử lại!", "error");
    }
  };

  const openApplyForm = async () => {
    if (isExpired) {
      Swal.fire("Thông báo", "Tin đã hết hạn ứng tuyển.", "info");
      return;
    }
    if (!token || !userId) {
      await Swal.fire("Cảnh báo", "Bạn chưa đăng nhập!", "warning");
      return;
    }
    setShowApplyForm(true);
  };

  const renderLines = (text) =>
    text
      ?.split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

  if (!job) return <p>Đang tải thông tin công việc...</p>;

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
                      {/* Ưu tiên field đúng từ backend, ví dụ: experienceRequired */}
                      {formatExperience(job?.experienceRequired ?? job?.experience)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="deadline-info">
                <p>
                  <strong>Hạn nộp:</strong>{" "}
                  {job.expiredAt ? new Date(job.expiredAt).toLocaleDateString("vi-VN") : "—"}
                </p>
                <p className="days-left">
                  {isExpired
                    ? "Hết hạn ứng tuyển"
                    : `Còn ${calculateDaysLeft(job.expiredAt)} ngày để ứng tuyển`}
                </p>
              </div>

              <div className="job-actions">
                <button
                  className="apply-btn"
                  onClick={openApplyForm}
                  disabled={isExpired}
                  aria-disabled={isExpired}
                  title={isExpired ? "Tin đã hết hạn ứng tuyển" : "Ứng tuyển ngay"}
                >
                  Ứng tuyển ngay
                </button>
                <button className="save-btn" onClick={handleSaveJob}>
                  <i className={`fa-heart ${isSaved ? "fa-solid" : "fa-regular"}`}></i>
                  <span>{isSaved ? "Đã lưu" : "Lưu tin"}</span>
                </button>
              </div>
            </div>

            <div className="job-detail-section">
              <h2>Chi tiết tin tuyển dụng</h2>

              <h3>Mô tả công việc</h3>
              <ul>
                {renderLines(job.description)?.map((item, idx) => (
                  <li key={`desc-${idx}`}>{item}</li>
                ))}
              </ul>

              <h3>Yêu cầu công việc</h3>
              <ul>
                {renderLines(job.requirements)?.map((item, idx) => (
                  <li key={`req-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="job-right">
            <div className="company-card compact" role="complementary" aria-label="Thông tin công ty">
              <img
                src={company?.logoUrl || "/icons/company.svg"}
                alt={company?.name ? `Logo ${company.name}` : "Logo công ty"}
                className="company-logo-injob"
                onError={(e) => { e.currentTarget.src = "/icons/company.svg"; }}
              />
              <h3 className="company-name">{company?.name || "Đang tải tên công ty..."}</h3>
              <div className="company-info-item">
                <i className="fa-solid fa-users" aria-hidden="true"></i>
                <span>{company?.size || "Đang cập nhật"}</span>
              </div>
              <div className="company-info-item">
                <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
                <span>{company?.industry || "Đang cập nhật"}</span>
              </div>
              <div className="company-info-item">
                <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                <span className="company-address-text">{company?.address || "Đang cập nhật"}</span>
              </div>
              {company?.companyId ? (
                <Link
                  to={`/company/public/${company.companyId}`}
                  className="view-company-link"
                  aria-label={`Xem trang công ty ${company.name || ""}`}
                >
                  Xem trang công ty
                </Link>
              ) : (
                <span className="view-company-link disabled" aria-disabled="true" title="Chưa có dữ liệu công ty">
                  Xem trang công ty
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal hiển thị form ứng tuyển */}
      <Modal
        open={showApplyForm}
        onClose={() => setShowApplyForm(false)}
        aria-labelledby="apply-form-title"
        aria-describedby="apply-form-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90vw", sm: "600px" },
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 0,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <ApplyForm
            jobId={job.jobId ?? jobId}
            jobTitle={job.title}
            onClose={() => setShowApplyForm(false)}
          />
        </Box>
      </Modal>
    </>
  );
}
