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
    REVIEWED: "NTD đã xem",
    HIRED: "Được chấp nhận",
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
    <div className="applied-jobs-page">
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
              <option value="REVIEWED">NTD đã xem</option>
              <option value="HIRED">Được chấp nhận</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="empty-applied-jobs">
              <img
                src="/images/empty-box.png"
                alt="Empty"
                className="empty-image"
                onError={(e) => (e.target.style.display = "none")}
              />
              <p>Bạn chưa ứng tuyển công việc nào!</p>
              <Link to="/jobs">
                <button className="btn-find-jobs">Tìm việc ngay</button>
              </Link>
            </div>
          ) : (
            <div className="applied-jobs-list">
              {filteredApplications.map((app) => (
                <div className="applied-job-card" key={app.id}>
                  <div className="applied-job-header">
                    <div className="applied-job-title-info">
                      <h3 className="applied-job-title">{app.jobTitle}</h3>
                      <p className="company-name">CV: {app.cvTitle}</p>
                    </div>
                  </div>

                  <div className="applied-job-meta">
                    <span className="applied-pill">
                      <i className="fa-solid fa-pen-to-square"></i> Ghi chú:{" "}
                      {app.notes || "Không có"}
                    </span>
                    <span className="applied-pill">
                      <i className="fa-regular fa-clock"></i> Ngày ứng tuyển:{" "}
                      {formatDate(app.appliedAt)}
                    </span>
                  </div>

                  <div className="applied-job-footer">
                    <span
                      className={`job-status status-${app.status.toLowerCase()}`}
                    >
                      {statusMap[app.status]}
                    </span>

                    <div className="job-actions1">
                      <Link to={`/jobs/${app.jobId}`} className="btn-view-job">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cột phải */}
        <div className="applied-jobs-right">
          <div className="profile-management">
            <img
              src="/images/profile-banner.png"
              alt="Profile banner"
              className="banner-image"
              onError={(e) => (e.target.style.display = "none")}
            />
            <h4>Quản lý hồ sơ</h4>
            <p>Cập nhật CV để tăng cơ hội được Nhà Tuyển Dụng xem xét</p>
            <Link to="/my-cv">
              <button className="btn-update-cv">Cập nhật CV ngay</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
