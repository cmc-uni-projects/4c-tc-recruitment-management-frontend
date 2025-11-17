import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SavedJobs.css";

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dữ liệu mẫu (mock data)
  const mockJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      companyName: "CMC Global",
      location: "Hà Nội",
      salary: "15 - 20 triệu",
      logo: "https://via.placeholder.com/50",
    },
    {
      id: 2,
      title: "Java Backend Developer",
      companyName: "FPT Software",
      location: "Đà Nẵng",
      salary: "20 - 30 triệu",
      logo: "https://via.placeholder.com/50",
    },
    {
      id: 3,
      title: "AI Engineer",
      companyName: "VNG Corporation",
      location: "TP. Hồ Chí Minh",
      salary: "30 - 40 triệu",
      logo: "https://via.placeholder.com/50",
    },
  ];

  useEffect(() => {
    // Giả lập gọi API
    setTimeout(() => {
      setJobs(mockJobs); // Sau này thay bằng dữ liệu từ backend
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="saved-jobs-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="saved-jobs-container">
      <h1 className="page-title">Việc làm đã lưu</h1>

      {jobs.length === 0 ? (
        <div className="empty-saved-jobs">
          /images/empty-box.png
          <p>Bạn chưa lưu công việc nào!</p>
          <Link to="/jobs">
            <button className="btn-find-jobs">Tìm việc ngay</button>
          </Link>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-left">
                <img src={job.logo} alt={job.companyName} className="job-logo" />
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <p>{job.companyName}</p>
                  <p className="job-location">{job.location}</p>
                  <p className="job-salary">{job.salary}</p>
                </div>
              </div>
              <div className="job-actions">
                <Link to={`/jobs/${job.id}`} className="btn-view">Xem chi tiết</Link>
                <button className="btn-remove" onClick={() => handleRemove(job.id)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function handleRemove(id) {
    setJobs(jobs.filter((job) => job.id !== id));
  }
}