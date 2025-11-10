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
        const response = await jobAPI.getLatestJobs(); // ✅ Sửa tên hàm
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
            <div key={job.jobId} className="job-card">
  <h3>{job.title}</h3>
  <p>{job.companyName || "Công ty chưa cập nhật"}</p>
  <span>Lương: {job.salary || "Thỏa thuận"}</span>
  <span>Địa điểm: {job.location || "Chưa cập nhật"}</span>
  <span>
    Ngày đăng: {new Date(job.createdAt).toLocaleDateString("vi-VN")}
  </span>
  <button
    className="btn-detail"
    onClick={() => handleDetail(job.jobId)}
  >
    Xem chi tiết
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