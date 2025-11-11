import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI } from "../../../services/auth.services";
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

  return (
    <section className="latest-job-section">
      <h2>Tin tuyển dụng mới nhất</h2>

      <div className="job-card-grid">
        {latestJobs.length > 0 ? (
          latestJobs.map((job) => (
            <div className="job-card">
  <img
    src={job.logoUrl || "/default-logo.png"}
    alt={job.companyName}
    className="company-logo"
  />

  <div className="job-info">
    <h3>{job.title}</h3>
    <p>{job.companyName || "Công ty chưa cập nhật"}</p>
    <div className="job-meta">
      <span className="salary">
        {job.salaryMin && job.salaryMax
          ? `${job.salaryMin} - ${job.salaryMax} triệu`
          : "Thỏa thuận"}
      </span>
      <span>{job.location || "Chưa cập nhật"}</span>
    </div>
  </div>

  <button className="save-icon">❤️</button>
</div>
          ))
        ) : (
          <p>Đang tải tin tuyển dụng...</p>
        )}
      </div>
    </section>
  );
}