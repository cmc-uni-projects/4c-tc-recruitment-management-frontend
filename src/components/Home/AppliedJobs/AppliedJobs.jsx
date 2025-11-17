import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AppliedJobs.css";

export default function AppliedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");

  // Dữ liệu mẫu (mock data)
  const mockAppliedJobs = [
    {
      id: 1,
      title: "Kế Toán Trưởng 1991, 1992 (Thu Nhập Upto 26 Triệu) Đi Làm Ngay",
      companyName: "Công Ty TNHH All Logistics Việt Nam",
      location: "Hà Nội",
      salary: "25 - 30 triệu",
      status: "Đã ứng tuyển",
    },
    {
      id: 2,
      title: "Kế Toán Trưởng - Đi Làm Ngay - Thu Nhập Từ 30 - 40 Triệu/ Tháng",
      companyName: "Công Ty TNHH Phong Vân",
      location: "Hà Nội",
      salary: "30 - 40 triệu",
      status: "NTD đã xem hồ sơ",
    },
    {
      id: 3,
      title: "Chuyên Viên Tài Chính",
      companyName: "Techcombank",
      location: "Hà Nội",
      salary: "20 - 25 triệu",
      status: "Hồ sơ phù hợp",
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setJobs(mockAppliedJobs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredJobs =
    filter === "Tất cả" ? jobs : jobs.filter((job) => job.status === filter);

  if (loading) {
    return <div className="applied-jobs-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="applied-jobs-layout">
      {/* Cột trái */}
      <div className="applied-jobs-left">
        <h1 className="page-title">Việc làm đã ứng tuyển</h1>

        {/* Bộ lọc */}
        <div className="filter-container">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option>Tất cả</option>
            <option>Đã ứng tuyển</option>
            <option>NTD đã xem hồ sơ</option>
            
          </select>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="empty-applied-jobs">
            /images/empty-box.png
            <p>Bạn chưa ứng tuyển công việc nào!</p>
            <Link to="/jobs">
              <button className="btn-find-jobs">Tìm việc ngay</button>
            </Link>
          </div>
        ) : (
          <div className="applied-jobs-list">
            {filteredJobs.map((job) => (
              <div key={job.id} className="applied-job-card">
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <p className="company-name">{job.companyName}</p>
                  <p className="job-location">{job.location}</p>
                  <span className="job-status">{job.status}</span>
                </div>
                <div className="job-salary">{job.salary}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cột phải */}
      <div className="applied-jobs-right">
        <div className="profile-management">
          <h3>Quản lý hồ sơ</h3>
          <p>Cập nhật CV để tăng cơ hội được Nhà Tuyển Dụng xem xét</p>
          <Link to="/my-cv">
            <button className="btn-update-cv">Cập nhật CV ngay</button>
          </Link>
        </div>

       
      </div>
    </div>
  );
}