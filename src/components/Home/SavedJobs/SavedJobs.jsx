import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SavedJobs.css";
import axios from "axios";
import emptyBoxImage from "../../../assets/empty-box.png";


export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");


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
  

 const handleRemove = async (jobId) => {
    try {
      if (!token || !userId) {
        alert("Bạn chưa đăng nhập!");
        return;
      }

      await axios.delete(`http://localhost:8080/api/saved-jobs/${jobId}`, {
        params: { userId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Cập nhật lại danh sách sau khi xóa
      setJobs(jobs.filter((job) => job.jobId !== jobId));
    } catch (error) {
      console.error("Lỗi khi xóa công việc:", error);
      alert("Không thể xóa công việc. Vui lòng thử lại!");
    }
  };




  

useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    const fetchSavedJobs = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/saved-jobs`, {
          params: { userId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setJobs(response.data); // Dữ liệu từ backend
      } catch (error) {
        console.error("Lỗi khi tải danh sách việc làm đã lưu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [token, userId]);



  if (loading) {
    return <div className="saved-jobs-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="saved-jobs-container">
      <h1 className="page-title">Việc làm đã lưu</h1>

      {jobs.length === 0 ? (
        <div className="empty-saved-jobs">
          <img src={emptyBoxImage} alt="Empty Box" className="empty-image" />
          <p>Bạn chưa lưu công việc nào!</p>
          <Link to="/jobs">
            <button className="btn-find-jobs">Tìm việc ngay</button>
          </Link>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.jobId} className="job-card">
              <div className="job-left">
                <img src={job.logo} alt={job.companyName} className="job-logo" />
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <p>{job.companyName}</p>
                  <p className="job-location">{job.location}</p>
                  <p className="job-salary">{job.salaryRange}</p>
                </div>
              </div>
              <div className="job-actions">
                <Link to={`/jobs/${job.jobId}`} className="btn-view">Xem chi tiết</Link>
                <button className="btn-remove" onClick={() => handleRemove(job.jobId)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

 
}