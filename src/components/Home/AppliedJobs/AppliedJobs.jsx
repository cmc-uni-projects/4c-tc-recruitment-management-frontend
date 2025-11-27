
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AppliedJobs.css";
import { applicationAPI } from "../../../services/auth.services";

export default function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");

  // Map trạng thái sang tiếng Việt
  const statusMap = {
    PENDING: "Đang chờ xử lý",
    INTERVIEW: "NTD đã xem",
    APPROVED: "Được chấp nhận",
    REJECTED: "Từ chối",
  };

  // Format ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("Không tìm thấy token, vui lòng đăng nhập.");
          setApplications([]);
          setLoading(false);
          return;
        }

        const response = await applicationAPI.getMyApplications(token);
        setApplications(response.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ứng tuyển:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []);

  const filteredApplications =
    filter === "Tất cả"
      ? applications
      : applications.filter((app) => app.status === filter);

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
            <option value="PENDING">Đang chờ xử lý</option>
            <option value="INTERVIEW">NTD đã xem</option>
            <option value="APPROVED">Được chấp nhận</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="empty-applied-jobs">
            /images/empty-box.png
            <p>Bạn chưa ứng tuyển công việc nào!</p>
            <Link to="/jobs">
              <button className="btn-find-jobs">Tìm việc ngay</button>
            </Link>
          </div>
        ) : (
          <div className="applied-jobs-list">
            {filteredApplications.map((app) => (
              <div key={app.applicationId} className="applied-job-card">
                <div className="job-info">
                  <h3>{app.jobTitle}</h3>
                  <p className="cv-title">CV: {app.cvTitle}</p>
                  <p className="job-notes">Ghi chú: {app.notes}</p>
                  <p className="job-date">Ngày ứng tuyển: {formatDate(app.appliedAt)}</p>
                  <span className={`job-status status-${app.status.toLowerCase()}`}>
                    {statusMap[app.status] || app.status}
                  </span>
                </div>
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
