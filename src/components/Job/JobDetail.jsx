import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Layout/Navbar";
import { jobAPI } from "../../services/auth.services";
import "./JobDetail.css";

export default function JobDetail() {
  const { jobId } = useParams();
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

  const formatSalary = (min, max) => {
    if (min && max) {
      return `${(min / 1_000_000).toFixed(0)} - ${(max / 1_000_000).toFixed(0)} triệu`;
    }
    return "Thỏa thuận";
  };

  const formatDateRelative = (dateString) => {
    const date = new Date(dateString);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Hôm nay" : `${diffDays} ngày trước`;
  };

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    alert(isSaved ? "Đã bỏ lưu công việc" : "Đã lưu công việc!");
  };

  if (!job) return <p>Đang tải thông tin công việc...</p>;

  return (
    <>
      <Navbar />
      <div className="job-detail-container">
        {/* Header */}
        <div className="job-header">
          <img
            src={job.logoUrl || "https://img.icons8.com/carbon_copy/1200/company.jpg"}
            alt={job.companyName}
            className="company-logo"
          />
          <div className="job-title-info">
            <h1>{job.title}</h1>
            <p className="company-name">{job.companyName}</p>
            <p className="location">{job.location}</p>
          </div>
          <button className="save-icon" onClick={handleSaveJob}>
            <i className={`fa-heart ${isSaved ? 'fa-solid' : 'fa-regular'}`}></i>
          </button>
        </div>

        {/* Thông tin cơ bản */}
        <div className="job-info-detail">
          <p><strong>Mức lương:</strong> {formatSalary(job.salaryMin, job.salaryMax)}</p>
          <p><strong>Ngày đăng:</strong> {formatDateRelative(job.createdAt)}</p>
        </div>

        {/* Mô tả công việc */}
        <div className="job-description">
          <h2>Mô tả công việc</h2>
          <p>{job.description || "Chưa có mô tả"}</p>
        </div>

        {/* Yêu cầu công việc */}
        <div className="job-requirements">
          <h2>Yêu cầu công việc</h2>
          <p>{job.requirements || "Chưa có yêu cầu"}</p>
        </div>

        {/* Nút ứng tuyển */}
        <button className="apply-btn">Ứng tuyển ngay</button>

        {/* Thông tin công ty */}
        <div className="company-info">
          <h3>Thông tin công ty</h3>
          <p><strong>Quy mô:</strong> {job.companySize}</p>
          <p><strong>Địa chỉ:</strong> {job.companyLocation}</p>
          <p><strong>Giới thiệu:</strong> {job.companyDescription}</p>
        </div>
      </div>
    </>
  );
}
