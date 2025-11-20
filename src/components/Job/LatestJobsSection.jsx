import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI, companyAPI } from "../../services/auth.services";
import "./LatestJobsSection.css";
import { FaHeart, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LatestJobsSection() {
  const [latestJobs, setLatestJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Lấy danh sách tin tuyển dụng mới nhất
  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        const response = await jobAPI.getLatestJobs();
        setLatestJobs(response.data);
      } catch (error) {
        console.error("Lỗi khi tải tin tuyển dụng mới nhất:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestJobs();
  }, []);

  // Lấy logo công ty cho từng job (có cache)
useEffect(() => {
  const fetchCompanyLogos = async () => {
    try {
      const logoCache = {};
      const updatedJobs = await Promise.all(
        latestJobs.map(async (job) => {
          if (job.companyId) {
            if (!logoCache[job.companyId]) {
              const companyRes = await companyAPI.getById(job.companyId);
              logoCache[job.companyId] = companyRes.data.logoUrl;
            }
            return { ...job, logoUrl: logoCache[job.companyId] };
          }
          return job;
        })
      );
      setLatestJobs(updatedJobs);
    } catch (error) {
      console.error("Lỗi khi lấy logo công ty:", error);
    }
  };

  if (latestJobs.length > 0) {
    fetchCompanyLogos();
  }
}, [latestJobs]);

  // Lấy danh sách việc làm đã lưu
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!token || !userId) return;
      try {
        const response = await axios.get(`http://localhost:8080/api/saved-jobs`, {
          params: { userId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const savedJobIds = response.data.map((job) => job.jobId);
        setSavedJobs(savedJobIds);
      } catch (error) {
        console.error("Lỗi khi tải danh sách việc làm đã lưu:", error);
      }
    };

    fetchSavedJobs();
  }, [token, userId]);

  const handleDetail = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleSaveJob = async (jobId, e) => {
    e.stopPropagation();
    if (!token || !userId) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }

    try {
      if (savedJobs.includes(jobId)) {
        await axios.delete(`http://localhost:8080/api/saved-jobs/${jobId}`, {
          params: { userId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSavedJobs(savedJobs.filter((id) => id !== jobId));
        toast.info("Đã bỏ lưu công việc!");
      } else {
        await axios.post(`http://localhost:8080/api/saved-jobs`, null, {
          params: { userId, jobId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSavedJobs([...savedJobs, jobId]);
        toast.success("Đã lưu công việc!");
      }
    } catch (error) {
      console.error("Lỗi khi lưu/bỏ lưu công việc:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
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
              {/* Logo công ty */}
              <div className="logo-container">
                <img
                  src={job.logoUrl || "https://img.icons8.com/carbon_copy/1200/company.jpg"}
                  alt={job.companyName}
                  className="company-logo1"
                />
              </div>

              {/* Nội dung */}
              <div className="job-info">
                <h3>{job.title}</h3>
                <p>{job.companyName || "Công ty chưa cập nhật"}</p>
                <div className="job-meta">
                  <span className="salary">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  <span>{job.location || "Chưa cập nhật"}</span>
                </div>
              </div>

              {/* Badge */}
              {job.isTop && <span className="badge top">TIN MỚI</span>}
              {job.isPro && !job.isTop && <span className="badge">PRO</span>}

              {/* Icon lưu việc làm */}
              <button
                className="save-icon"
                onClick={(e) => handleSaveJob(job.jobId, e)}
              >
                <FaHeart
                  className={`fa-regular ${savedJobs.includes(job.jobId) ? "saved" : ""}`}
                />
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
