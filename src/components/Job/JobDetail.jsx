import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!token || !userId) return;
      try {
        const response = await axios.get(`http://localhost:8080/api/saved-jobs`, {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedJobs = response.data;
        const found = savedJobs.some((savedJob) => savedJob.jobId === jobId);
        setIsSaved(found);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái lưu:", error);
      }
    };
    checkSavedStatus();
  }, [jobId, token, userId]);

  const formatSalary = (min, max) => {
    if (min && max) {
      return `${(min / 1_000_000).toFixed(0)} - ${(max / 1_000_000).toFixed(0)} triệu`;
    }
    return "Thỏa thuận";
  };

  const calculateDaysLeft = (expiredAt) => {
    const endDate = new Date(expiredAt);
    const today = new Date();
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

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
                    <p className="value">{job.experience || "Không yêu cầu"}</p>
                  </div>
                </div>
              </div>

              <div className="deadline-info">
                <p>
                  <strong>Hạn nộp:</strong> {new Date(job.expiredAt).toLocaleDateString("vi-VN")}
                </p>
                <p className="days-left">
                  {calculateDaysLeft(job.expiredAt) > 0
                    ? `Còn ${calculateDaysLeft(job.expiredAt)} ngày để ứng tuyển`
                    : "Hết hạn ứng tuyển"}
                </p>
              </div>

              <div className="job-actions">
                <button className="apply-btn" onClick={() => setShowApplyForm(true)}>
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
                {job.description?.split("\n").map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <h3>Yêu cầu công việc</h3>
              <ul>
                {job.requirements?.split("\n").map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
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
              <a href={`/company/public/${company?.companyId}`} className="view-company-link">
                Xem trang công ty
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal hiển thị form ứng tuyển */}
      
      <Modal open={showApplyForm} onClose={() => setShowApplyForm(false)}>
      <ApplyForm jobId={job.jobId} jobTitle={job.title} onClose={() => setShowApplyForm(false)} />
      </Modal>

    </>
  );
}
