import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { jobAPI, jobCategoryAPI } from "../../../services/auth.services.js";
import { Link } from "react-router-dom";
import "./SearchSection.css";

export default function SearchSection() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  // Lấy params từ URL
  const initialKeyword = query.get("keyword") || "";
  const initialLocation = query.get("location") || "";
  const initialCategory = query.get("category") || "";

  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(initialCategory);

  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationsList, setLocationsList] = useState([]);

  // ===== Load danh mục và location từ API =====
  useEffect(() => {
    jobCategoryAPI.getAll().then((res) => setCategories(res.data));

    // Load location từ tất cả job
    jobAPI.getApprovedJobs().then((res) => {
      const allLocations = res.data
        .map((job) => job.location)
        .filter((loc) => loc && loc.trim() !== "");

      const uniqueLocations = [...new Set(allLocations)].sort();

      setLocationsList(uniqueLocations);
    });
  }, []);

  // ===== Gọi API search ngay khi trang load =====
  useEffect(() => {
    fetchSearchResult(initialKeyword, initialLocation, initialCategory);
  }, [initialKeyword, initialLocation, initialCategory]);

  // ===== Hàm gọi API Search =====
  const fetchSearchResult = async (keyword, location, category) => {
    setLoading(true);
    try {
      const res = await jobAPI.searchJobs({
        keyword,
        location,
        category,
        page: 0,
        size: 20,
      });

      setJobs(res.data);
    } catch (e) {
      console.error("Lỗi tìm kiếm:", e);
    }
    setLoading(false);
  };

  // ===== Khi user nhấn nút tìm kiếm lại =====
  const handleSearch = () => {
    const params = new URLSearchParams({
      keyword,
      location,
      category,
    }).toString();

    window.history.replaceState({}, "", `/search-results?${params}`);

    fetchSearchResult(keyword, location, category);
  };

  return (
    <div className="search-section">

      {/* ========== SEARCH BAR ========== */}
      <div className="search-bar">

        {/* Category */}
        <select className="category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Danh mục Nghề</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Keyword */}
        <input
          type="text"
          placeholder="Vị trí tuyển dụng, tên công ty..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        {/* Location */}
      <div className="location-select-wrapper">
        <i className="fa-solid fa-location-dot select-multi-location__icon"></i>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Địa điểm</option>
          {locationsList.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

        <button className="btn-search" onClick={handleSearch}>
          Tìm kiếm
        </button>
      </div>

      {/* ========== SEARCH RESULTS ========== */}
      <div className="job-list">
        {loading && <p>Đang tải...</p>}
        {!loading && jobs.length === 0 && <p>Không tìm thấy việc làm.</p>}

        {!loading &&
          jobs.map((job) => (
            <Link 
              to={`/jobs/${job.jobId}`} 
              className="job-card"
              key={job.jobId}
              style={{ textDecoration: "none", color: "inherit" }}
            >


              <div className="job-info">
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.companyName}</p>
                <p className="job-location">{job.location}</p>
              </div>

              <div className="job-salary">
                {job.salaryMin && job.salaryMax
                  ? `${(job.salaryMin / 1_000_000).toFixed(1)} - ${(job.salaryMax / 1_000_000).toFixed(1)} triệu`
                  : "Thoả thuận"}
              </div>

            </Link>
          ))}
      </div>
    </div>
  );
}
