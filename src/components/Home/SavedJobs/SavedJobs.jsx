
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SavedJobs.css";
import axios from "axios";
import { companyAPI, jobAPI } from "../../../services/auth.services";
import emptyBoxImage from "../../../assets/empty-box.png";

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const formatSalary = (min, max) => {
    if (min && max) {
      return `${(min / 1_000_000).toFixed(0)} - ${(max / 1_000_000).toFixed(0)} triệu`;
    }
    return "Thỏa thuận";
  };

  const handleRemove = async (jobId) => {
    try {
      if (!token || !userId) {
        alert("Bạn chưa đăng nhập!");
        return;
      }
      await axios.delete(`http://localhost:8080/api/saved-jobs/${jobId}`, {
        params: { userId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(jobs.filter((job) => job.jobId !== jobId));
    } catch (error) {
      console.error("Lỗi khi xóa công việc:", error);
      alert("Không thể xóa công việc. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    const fetchSavedJobs = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/saved-jobs", {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });

        const savedJobs = response.data;

        // Lấy chi tiết job + logo công ty
        const updatedJobs = await Promise.all(
          savedJobs.map(async (job) => {
            try {
              const jobDetailRes = await jobAPI.getJobDetail(job.jobId);
              const jobDetail = jobDetailRes.data;

              let logoUrl = "";
              if (jobDetail.companyId) {
                const companyRes = await companyAPI.getById(jobDetail.companyId);
                logoUrl = companyRes.data.logoUrl;
              }

              return {
                ...jobDetail,
                logoUrl,
              };
            } catch (err) {
              console.error("Lỗi khi lấy chi tiết job:", err);
              return job;
            }
          })
        );

        setJobs(updatedJobs);
      } catch (error) {
        console.error("Lỗi khi tải danh sách việc làm đã lưu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [token, userId]);

  if (loading) {
    return <div className="saved-jobs-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="saved-jobs-container">
      <h1 className="page-title">Việc làm đã lưu</h1>
      {jobs.length === 0 ? (
        <div className="empty-saved-jobs">
          <img src={emptyBoxImage} alt="Empty Box" className="empty-image" />
          <p>Bạn chưa lưu công việc nào!</p>
          <Link to="/jobs">
            <button className="btn-find-jobs">Tìm việc ngay</button>
          </Link>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.jobId} className="job-card">
              {/* Logo bên trái */}
              <img
                src={job.logoUrl || "https://img.icons8.com/carbon_copy/1200/company.jpg"}
                alt={job.companyName}
                className="job-logo"
              />
              {/* Thông tin công việc */}
              <div className="job-info">
                <h3>{job.title}</h3>
                <p>{job.companyName}</p>
                <div className="job-meta">
                  <span className="job-salary">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  <span className="job-location">{job.location}</span>
                </div>
              </div>
              {/* Nút hành động */}
              <div className="job-actions">
                <Link to={`/jobs/${job.jobId}`} className="btn-view">Xem chi tiết</Link>
                <button className="btn-remove" onClick={() => handleRemove(job.jobId)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
