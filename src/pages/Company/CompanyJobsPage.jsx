// src/pages/CompanyJobsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { companyAPI, jobAPI } from "../../services/auth.services";
import "./CompanyJobsPage.css"; // Tạo file CSS riêng
import Swal from "sweetalert2";
import emptyBoxImage from "../../assets/empty-box.png";
import Navbar from "../../components/Layout/Navbar";

const CompanyJobsPage = () => {
  const { id } = useParams(); // companyId
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy thông tin công ty
        const companyRes = await companyAPI.getById(id);
        setCompany(companyRes.data);

        // Lấy danh sách job của công ty này (dùng API có thể filter theo companyId)
        // Nếu backend chưa hỗ trợ: /jobs/my-company chỉ dành cho HR → ta sẽ gọi /jobs/approved + filter
        // Nhưng hiện tại backend đã hỗ trợ: thêm API mới hoặc dùng search
        // Giải pháp: dùng search với companyId (an toàn nhất)

        // Lấy danh sách job theo companyId (API public mới)
        const jobsRes = await jobAPI.getJobsByCompany(id);
        setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu công ty/job:", err);
        Swal.fire("Lỗi", "Không thể tải thông tin việc làm", "error");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="loading-jobs">Đang tải việc làm...</div>;
  if (!company) return <div>Không tìm thấy công ty.</div>;

  const formatSalary = (min, max) => {
    if (!min && !max) return "Thoả thuận";
    if (min && max)
      return `${(min / 1e6).toFixed(1)} - ${(max / 1e6).toFixed(1)} triệu`;
    if (min) return `Từ ${(min / 1e6).toFixed(1)} triệu`;
    return `Đến ${(max / 1e6).toFixed(1)} triệu`;
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffMs = now - posted;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return posted.toLocaleDateString("vi-VN");
  };

  return (
    <>
      <Navbar />
      <div className="company-detail-page">
        {/* Hero giống CompanyDetail */}

        <section className="detail-hero">
          {/* Ảnh cover */}
          <div className="detail-cover-company">
            <img
              className="detail-cover-img"
              src={company.coverUrl || "/default-cover.jpg"}
              alt={`Cover ${company.name}`}
              onError={(e) => (e.currentTarget.src = "/default-cover.jpg")}
            />
          </div>

          {/* Logo + Tiêu đề bên dưới */}
          <div className="detail-hero-below">
            <div className="detail-logo-wrapper">
              <img
                className="detail-logo"
                src={company.logoUrl || "/default-logo.png"}
                alt={`Logo ${company.name}`}
                onError={(e) => (e.currentTarget.src = "/default-logo.png")}
              />
            </div>

            <div className="detail-title">
              <h1>{company.name}</h1>

              {/* Ngành nghề (giữ kiểu code cũ: bullet) */}
              {company.industry && (
                <p className="detail-subtitle">{company.industry}</p>
              )}

              {/* Thành phố (emoji giống CompanyDetail) */}
              {company.city && (
                <p className="detail-city">{company.city}, Việt Nam</p>
              )}
            </div>
          </div>
        </section>

        {/* Nội dung chính */}
        <div className="cjp-container">
          <div className="cjp-header">
            <h2>
              {jobs.length > 0
                ? `${jobs.length} việc làm đang tuyển dụng `
                : "Hiện chưa có việc làm nào "}
              tại {company.name}
            </h2>
          </div>

          <div className="cjp-jobs-list">
            {jobs.length === 0 ? (
              <div className="cjp-no-jobs">
                <img src={emptyBoxImage} alt="Empty Box" className="empty-image" />
                <i>Nhà tuyển dụng sẽ sớm cập nhật việc làm!</i>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.jobId} className="cjp-job-card">
                  <div className="cjp-job-header">
                    <img
                      src={company.logoUrl || "/default-logo.png"}
                      alt={company.name}
                      className="cjp-job-logo"
                    />
                    <div className="cjp-job-title-info">
                      <Link to={`/jobs/${job.jobId}`} className="cjp-job-title">
                        {job.title}{" "}
                      </Link>
                      <p></p>
                      <Link
                        to={`/company/public/${company.companyId}`}
                        className="cjp-company-name"
                      >
                        {company.name}{" "}
                      </Link>
                    </div>
                  </div>

                  <div className="cjp-job-meta">
                    <span className="cjp-salary">
                      <i className="fa-solid fa-dollar-sign"></i>
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                    <span className="cjp-location">
                      <i className="fa-solid fa-map-marker-alt"></i>
                      {job.location || "Toàn quốc"}
                    </span>
                  </div>

                  <div className="cjp-job-tags">
                    {job.jobType && (
                      <span className="cjp-tag">
                        {job.jobType.replace("_", " ")}
                      </span>
                    )}
                    {job.experienceRequired > 0 && (
                      <span className="cjp-tag">
                        {job.experienceRequired} năm kinh nghiệm
                      </span>
                    )}
                  </div>

                  <div className="cjp-job-footer">
                    <span className="cjp-posted-time">
                      <i className="fa-regular fa-clock"></i>{" "}
                      {timeAgo(job.createdAt || job.postedAt)}
                    </span>
                    <Link to={`/jobs/${job.jobId}`} className="cjp-btn-apply">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Nút quay lại */}
          <div className="cjp-back-action">
            <button
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              <i></i> Quay lại
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyJobsPage;
