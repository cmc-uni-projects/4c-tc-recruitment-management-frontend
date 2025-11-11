import React, { useState } from "react";
import "./SearchSection.css";

export default function SearchSection() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [filter, setFilter] = useState("Tên việc làm");
  const [sortBy, setSortBy] = useState("AI");

  const locationsVN = [
    "TP. Hồ Chí Minh",
    "TP. Hà Nội",
    "Đà Nẵng",
    "Cần Thơ",
    "Hải Phòng",
    "Nghệ An",
    "Khánh Hòa",
  ];

  const jobs = [
    {
      id: 1,
      title: "Kế Toán Trưởng 1991, 1992 (Thu Nhập Upto 26 Triệu) Đi Làm Ngay",
      company: "CÔNG TY TNHH ALI LOGISTICS VIỆT NAM",
      salary: "25 - 30 triệu",
      location: "Hà Nội",
      tags: ["Kế toán", "Tài chính", "Thuế"],
    },
    {
      id: 2,
      title: "Kế Toán Trưởng - Đi Làm Ngay - Thu Nhập Từ 30 - 40 Triệu / Tháng",
      company: "CÔNG TY CP XNK TIẾN PHONG VN",
      salary: "30 - 40 triệu",
      location: "Hà Nội",
      tags: ["Kế toán trưởng", "Cao đẳng", "3 năm kinh nghiệm"],
    },
  ];

  const handleSearch = () => {
    alert(`Tìm kiếm: ${keyword} tại ${location}`);
  };

  return (
    <div className="search-section">
      {/* Thanh tìm kiếm chính */}
      <div className="search-bar">
        <select className="category-select">
          <option>Danh mục Nghề</option>
          <option>Kế toán - Kiểm toán</option>
          <option>Kinh doanh - Bán hàng</option>
          <option>IT - Phần mềm</option>
        </select>

        <input
          type="text"
          placeholder="Vị trí tuyển dụng, tên công ty"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <div className="location-select-wrapper">
          <i className="fa-solid fa-location-dot select-multi-location__icon"></i>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Địa điểm</option>
            {locationsVN.map((loc, index) => (
              <option key={index} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <button className="btn-search" onClick={handleSearch}>
          Tìm kiếm
        </button>
      </div>

      {/* Thanh lọc tìm kiếm */}
      <div className="filter-bar">
        <div className="filter-left">
          <span>Tìm kiếm theo:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option>Tên việc làm</option>
            <option>Tên công ty</option>
          </select>
          <button className="btn-both">Cả hai</button>
        </div>

        <div className="filter-right">
          <span>Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option>Search by AI</option>
            <option>Mới nhất</option>
            <option>Mức lương cao nhất</option>
          </select>
        </div>
      </div>

      {/* Danh sách việc làm */}
      <div className="job-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-info">
              <h3 className="job-title">{job.title}</h3>
              <p className="job-company">{job.company}</p>
              <p className="job-location">{job.location}</p>
              <div className="job-tags">
                {job.tags.map((tag, i) => (
                  <span key={i}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="job-salary">{job.salary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
