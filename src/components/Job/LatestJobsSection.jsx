import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI } from "../../services/auth.services";
import "./LatestJobsSection.css";

export default function LatestJobsSection() {
  const [latestJobs, setLatestJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        const response = await jobAPI.getLatestJobs();
        setLatestJobs(response.data);
      } catch (error) {
        console.error("Lỗi khi tải tin tuyển dụng mới nhất:", error);
      }
    };

    fetchLatestJobs();
  }, []);

  const handleDetail = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  const formatSalary = (min, max) => {
    if (min && max) {
      return `${(min / 1_000_000).toFixed(0)} - ${(max / 1_000_000).toFixed(0)} triệu`;
    }
    return "Thỏa thuận";
  };

  return (
    <section className="latest-job-section">
      <h2>Tin tuyển dụng mới nhất</h2>

      <div className="job-card-grid">
        {latestJobs.length > 0 ? (
          latestJobs.map((job) => (
            <div
              key={job.jobId}
              className="job-card"
              onClick={() => handleDetail(job.jobId)}
            >
              {/* Logo công ty */}
              <img
                src={job.logoUrl || "/default-logo.png"}
                alt={job.companyName}
                className="company-logo"
              />

              {/* Nội dung chính */}
              <div className="job-info">
                <h3>{job.title}</h3>
                <p>{job.companyName || "Công ty chưa cập nhật"}</p>
                <div className="job-meta">
                  <span className="salary">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                  <span>{job.location || "Chưa cập nhật"}</span>
                </div>
              </div>

              {/* Badge nếu có */}
              {job.isTop && <span className="badge top">TIN MỚI</span>}
              {job.isPro && !job.isTop && <span className="badge">PRO</span>}

              {/* Icon lưu việc làm */}
              <button
                className="save-icon"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn điều hướng khi click icon
                  console.log("Đã lưu job:", job.jobId);
                }}
              >
                <i className="fa-regular fa-heart"></i>
              </button>
            </div>
          ))
        ) : (
          <p>Đang tải tin tuyển dụng...</p>
        )}
      </div>
    </section>
  );
}