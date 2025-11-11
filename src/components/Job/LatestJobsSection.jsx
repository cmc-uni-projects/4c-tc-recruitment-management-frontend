import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI } from "../../services/auth.services";
import "./LatestJobsSection.css";
import { FaHeart, FaSpinner } from "react-icons/fa";

export default function LatestJobsSection() {
  const [latestJobs, setLatestJobs] = useState([]);
  const [loading, setLoading] = useState(true);  // Thêm state loading
  const [savedJobs, setSavedJobs] = useState([]);  // Thêm state để lưu jobs đã được lưu
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        const response = await jobAPI.getLatestJobs();
        setLatestJobs(response.data);
        setLoading(false);  // Đặt loading thành false khi đã tải xong
      } catch (error) {
        console.error("Lỗi khi tải tin tuyển dụng mới nhất:", error);
        setLoading(false);  // Dù có lỗi hay không, cũng dừng loading
      }
    };

    fetchLatestJobs();
  }, []);

  const handleDetail = (jobId) => {
    navigate(`/jobs/${jobId}`); // Điều hướng tới trang chi tiết công việc
  };

  const handleSaveJob = (jobId, e) => {
    e.stopPropagation(); // Ngăn điều hướng khi click icon
    if (savedJobs.includes(jobId)) {
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
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
        
        {loading ? (
          <div className="loading-spinner">
            <FaSpinner className="spinner" />
            Đang tải tin tuyển dụng...
          </div>
        ) : latestJobs.length > 0 ? (
          latestJobs.map((job) => (
            <div
              key={job.jobId}
              className="job-card"
              onClick={() => handleDetail(job.jobId)}
            >
            {/* Container logo công ty */}
            <div className="logo-container">
            <img
              src={job.logoUrl || "https://img.icons8.com/carbon_copy/1200/company.jpg"}
              alt={job.companyName}
              className="company-logo"
            />
            </div>

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
                onClick={(e) => handleSaveJob(job.jobId, e)}
              >
                <FaHeart className={`fa-regular ${savedJobs.includes(job.jobId) ? 'saved' : ''}`} />
              </button>
            </div>
          ))
        ) : (
          <p>Không có công việc nào để hiển thị</p>
        )}
      </div>
    </section>
  );
}
