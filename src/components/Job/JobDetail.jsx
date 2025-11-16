import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Layout/Navbar";
import { jobAPI } from "../../services/auth.services";
import { companyAPI } from "../../services/auth.services";
import "./JobDetail.css";

export default function JobDetail() {
  const { jobId } = useParams();
  const [company, setCompany] = useState(null);
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

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


  const formatSalary = (min, max) => {
    if (min && max) {
      return `${(min / 1_000_000).toFixed(0)} - ${(max / 1_000_000).toFixed(0)} triệu`;
    }
    return "Thỏa thuận";
  };

const calculateDaysLeft = (expiredAt) => {
  const endDate = new Date(expiredAt);
  const today = new Date();

  // Reset giờ về 00:00
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};



  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    alert(isSaved ? "Đã bỏ lưu công việc" : "Đã lưu công việc!");
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

          {/* Header */}
          <div className="job-header">
            <h1>{job.title}</h1>
            {/* Info with Icons */}
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
  <p><strong>Hạn nộp:</strong> {new Date(job.expiredAt).toLocaleDateString("vi-VN")}</p>
  <p className="days-left">
    {calculateDaysLeft(job.expiredAt) > 0
      ? `Còn ${calculateDaysLeft(job.expiredAt)} ngày để ứng tuyển`
      : "Hết hạn ứng tuyển"}
  </p>
</div>

          <div className="job-actions">
              <button className="apply-btn">Ứng tuyển ngay</button>
              <button className="save-btn" onClick={handleSaveJob}>
                <i className={`fa-heart ${isSaved ? 'fa-solid' : 'fa-regular'}`}></i>
                <span>{isSaved ? "Đã lưu" : "Lưu tin"}</span>
              </button>
            </div>
          </div>

          

          {/* Job Details */}
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
  <img src={company?.logoUrl || "/icons/company.svg"} alt="Logo công ty" className="company-logo-injob" />
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
  <a href={`/company/public/${company?.companyId}`} className="view-company-link">Xem trang công ty</a>
</div>
        </div>
      </div>
      </div>
    </>
  );
}