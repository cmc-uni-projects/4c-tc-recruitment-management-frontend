
import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { jobAPI, jobCategoryAPI, companyAPI } from "../../../services/auth.services.js";
import "./SearchSection.css";
import axios from "axios";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

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
  const [savedJobs, setSavedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [displayJobs, setDisplayJobs] = useState([]); // << dùng để render kèm logo
  const [loading, setLoading] = useState(false);
  const [locationsList, setLocationsList] = useState([]);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Cache logo theo companyId
  const logoCacheRef = useRef(new Map()); // Map<companyId, logoUrl|null>

  // ===== Load danh mục và location từ API =====
  useEffect(() => {
    jobCategoryAPI.getAll().then((res) => setCategories(res.data));

    jobAPI.getApprovedJobs().then((res) => {
      const allLocations = res.data
        .map((job) => job.location)
        .filter((loc) => loc && loc.trim() !== "");

      const uniqueLocations = [...new Set(allLocations)].sort();
      setLocationsList(uniqueLocations);
    });
  }, []);

  // ===== Lấy danh sách việc làm đã lưu =====
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

  // ===== Gọi API search ngay khi trang load =====
  useEffect(() => {
    fetchSearchResult(initialKeyword, initialLocation, initialCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      setJobs(res.data || []);
    } catch (e) {
      console.error("Lỗi tìm kiếm:", e);
      setJobs([]);
    }
    setLoading(false);
  };

  // ===== Enrich logoUrl cho từng job, dùng cache =====
  useEffect(() => {
    const enrichJobsWithLogo = async () => {
      if (!jobs || jobs.length === 0) {
        setDisplayJobs([]);
        return;
      }

      // Tìm các companyId chưa có trong cache (và job chưa có logoUrl từ backend)
      const missingCompanyIds = [];
      for (const job of jobs) {
        // Nếu backend đã trả sẵn logoUrl, bỏ qua
        if (job.logoUrl) continue;

        const cid = job.companyId;
        if (cid && !logoCacheRef.current.has(cid)) {
          missingCompanyIds.push(cid);
        }
      }

      // Gọi API getById cho các companyId còn thiếu (song song)
      if (missingCompanyIds.length > 0) {
        try {
          await Promise.all(
            missingCompanyIds.map(async (cid) => {
              try {
                const res = await companyAPI.getById(cid);
                const logoUrl = res?.data?.logoUrl || null;
                logoCacheRef.current.set(cid, logoUrl);
              } catch (err) {
                console.error(`Lỗi lấy logo công ty ${cid}:`, err);
                // Cache null để lần sau không gọi lại
                logoCacheRef.current.set(cid, null);
              }
            })
          );
        } catch (err) {
          // Không chặn hiển thị nếu một vài gọi API lỗi
          console.error("Lỗi khi lấy logo công ty:", err);
        }
      }

      // Tạo mảng render displayJobs từ jobs + logoCache
      const withLogo = jobs.map((job) => {
        const logoFromBackend = job.logoUrl;
        const logoFromCache =
          job.companyId ? logoCacheRef.current.get(job.companyId) : null;
        return { ...job, logoUrl: logoFromBackend ?? logoFromCache ?? null };
      });

      setDisplayJobs(withLogo);
    };

    enrichJobsWithLogo();
  }, [jobs]);

  // ===== Khi user nhấn nút tìm kiếm =====
  const handleSearch = () => {
    const params = new URLSearchParams({
      keyword,
      location,
      category,
    }).toString();

    window.history.replaceState({}, "", `/search-results?${params}`);
    fetchSearchResult(keyword, location, category);
  };

  // ===== Lưu / bỏ lưu job =====
  const handleSaveJob = async (jobId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !userId) {
      Swal.fire("Cảnh báo", "Bạn chưa đăng nhập!", "warning");
      return;
    }

    try {
      if (savedJobs.includes(jobId)) {
        await axios.delete(`http://localhost:8080/api/saved-jobs/${jobId}`, {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedJobs(savedJobs.filter((id) => id !== jobId));
        Swal.fire("Thông báo", "Đã bỏ lưu công việc!", "info");
      } else {
        await axios.post(`http://localhost:8080/api/saved-jobs`, null, {
          params: { userId, jobId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedJobs([...savedJobs, jobId]);
        Swal.fire("Thành công", "Đã lưu công việc!", "success");
      }
    } catch (error) {
      console.error("Lỗi khi lưu/bỏ lưu công việc:", error);
      Swal.fire("Lỗi", "Có lỗi xảy ra, vui lòng thử lại!", "error");
    }
  };

  return (
    <div className="search-section">
      {/* ========== SEARCH BAR ========== */}
      <div className="search-bar">
        {/* Category */}
        <select className="category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Danh mục Nghề</option>
          {categories.map((cat) => (
            <option key={cat.categoryId || cat.name} value={cat.categoryId}>
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
        {!loading && displayJobs.length === 0 && <p>Không tìm thấy việc làm.</p>}

        {!loading &&
          displayJobs.map((job) => (
            <Link
              to={`/jobs/${job.jobId}`}
              className="job-card-search"
              key={job.jobId}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {/* Logo công ty */}
                <div className="logo-container-search">
                  <img
                    src={
                      job.logoUrl ||
                      "https://img.icons8.com/carbon_copy/1200/company.jpg" // fallback
                    }
                    alt={job.companyName || "Công ty"}
                    className="company-logo-search"
                    loading="lazy"
                  />
                </div>
              <div className="job-info-search">
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.companyName}</p>
                <p className="job-location">{job.location}</p>
              </div>

              <div className="job-salary">
                {job.salaryMin && job.salaryMax
                  ? `${(job.salaryMin / 1_000_000).toFixed(0)} - ${(job.salaryMax / 1_000_000).toFixed(0)} triệu`
                  : "Thoả thuận"}
              </div>

              <button
                className="save-icon-search"
                onClick={(e) => handleSaveJob(job.jobId, e)}
                type="button"
                aria-label={savedJobs.includes(job.jobId) ? "Bỏ lưu" : "Lưu công việc"}
              >
                <i className={`fa-heart ${savedJobs.includes(job.jobId) ? "fa-solid" : "fa-regular"}`}></i>
              </button>
            </Link>
          ))}
      </div>
    </div>
  );
}
