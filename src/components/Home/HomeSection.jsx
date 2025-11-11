import "./HomeSection.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import iconSales from "../../assets/icons/kinh-doanh-ban-hang.png";
import iconIT from "../../assets/icons/cong-nghe-thong-tin.png";
import iconcustomer from "../../assets/icons/dich-vu-khach-hang.png";
import iconhr from "../../assets/icons/hanh-chinh-van-phong.png";
import iconrealestate from "../../assets/icons/bat-dong-san.png";
import iconfinance from "../../assets/icons/ngan-hang-tai-chinh.png";
import iconaccounting from "../../assets/icons/ke-toan-kiem-toan.png";
import iconmarketing from "../../assets/icons/marketing-truyen-thong-quang-cao.png";
import { jobCategoryAPI } from "../../services/auth.services.js";
import LatestJobsSection from "./Job/LatestJobsSection.jsx";
import {companyAPI } from "../../services/auth.services.js";
import featuredBanner from "../../assets/featured-banner.jpg";
import { Link } from "react-router-dom";
import LatestJobsSection from "../Job/LatestJobsSection.jsx";
const brands = [
  {
    name: "Bee Logistics Corporation",
    jobs: 28,
    category: "Logistics",
    logo: "/bee.png",
  },
  {
    name: "Công ty TNHH Thương mại - Dịch vụ Điện Mạnh",
    jobs: 4,
    category: "Điện lạnh",
    logo: "/mpe.png",
  },
  {
    name: "Công ty CP Đầu tư Thương mại và Dịch vụ",
    jobs: 1,
    category: "Xuất nhập khẩu",
    logo: "/viettel.png",
  },
  {
    name: "Công ty CP Xây dựng BCONS",
    jobs: 19,
    category: "Xây dựng",
    logo: "/bcons.png",
  },
  {
    name: "Công ty TNHH SX HTD Bình Tiên (BITI'S)",
    jobs: 5,
    category: "Bán lẻ - FMCG",
    logo: "/bitis.png",
  },
  {
    name: "Công ty TNHH CJ VINA AGRI",
    jobs: 12,
    category: "Sản xuất",
    logo: "/cj.png",
  },
  {
    name: "Trường Cao đẳng FPT Polytechnic",
    jobs: 1,
    category: "Giáo dục / Đào tạo",
    logo: "/fpt.png",
  },
];
const industries = [
  { name: "Kinh doanh - Bán hàng", jobs: "11.254 việc làm", icon: iconSales },
  {
    name: "Marketing - PR - Quảng cáo",
    jobs: "7.808 việc làm",
    icon: iconmarketing,
  },
  { name: "Chăm sóc khách hàng", jobs: "2.678 việc làm", icon: iconcustomer },
  { name: "Nhân sự - Hành chính", jobs: "3.099 việc làm", icon: iconhr },
  { name: "Công nghệ Thông tin", jobs: "2.519 việc làm", icon: iconIT },
  { name: "Tài chính - Ngân hàng", jobs: "1.388 việc làm", icon: iconfinance },
  { name: "Bất động sản", jobs: "435 việc làm", icon: iconrealestate },
  {
    name: "Kế toán - Kiểm toán - Thuế",
    jobs: "5.841 việc làm",
    icon: iconaccounting,
  },
];
export default function HomeSection() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();
  const videoId = "E2AEQlU4QLI";
  const [popularCategories, setPopularCategories] = useState([]);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        const response = await jobCategoryAPI.getPopular();
        setPopularCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải ngành nghề phổ biến:", error);
        setPopularCategories(
          industries.map((ind) => ({
            categoryId: null,
            name: ind.name,
            description: ind.jobs,
            popular: true,
          }))
        );
      }
    };
    fetchPopularCategories();
  }, []);
  useEffect(() => {
    const fetchFeaturedCompanies = async () => {
      try {
        const response = await companyAPI.getFeatured();
        setFeaturedCompanies(response.data);
      } catch (error) {
        console.error("Lỗi khi tải công ty nổi bật:", error);
      }
    };

    fetchFeaturedCompanies();
  }, []);
  const handleSearch = () => {
    const query = `?keyword=${encodeURIComponent(
      keyword
    )}&location=${encodeURIComponent(location)}`;
    navigate(`/search-results${query}`);
  };
  const openVideoModal = () => {
    setIsVideoLoading(true);
    setIsVideoOpen(true);
    setTimeout(() => setIsVideoLoading(false), 800);
  };
  const closeVideoModal = () => {
    setIsVideoOpen(false);
    setIsVideoLoading(false);
  };
  const locationsVN = [
    "An Giang",
    "Bắc Ninh",
    "Cà Mau",
    "Cao Bằng",
    "TP. Cần Thơ",
    "TP. Đà Nẵng",
    "Đắk Lắk",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "TP. Hà Nội",
    "Hà Tĩnh",
    "TP. Hải Phòng",
    "TP. Hồ Chí Minh",
    "TP. Huế",
    "Hưng Yên",
    "Khánh Hoà",
    "Lai Châu",
    "Lạng Sơn",
    "Lào Cai",
    "Lâm Đồng",
    "Nghệ An",
    "Ninh Bình",
    "Phú Thọ",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sơn La",
    "Tây Ninh",
    "Thái Nguyên",
    "Thanh Hóa",
    "Tuyên Quang",
    "Vĩnh Long",
  ];
  return (
    <div className="home-section">
      {/* === BANNER === */}
      <section className="banner">
        <h2>Smart Hire - Tạo CV, Tìm việc làm, Tuyển dụng hiệu quả</h2>
        <div className="search-bar">
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
        <div className="banner-content">
          <img src="/banner.jpg" alt="Banner" />
          <div className="job-stats">
            <span>Thị trường việc làm hôm nay</span>
            <p>
              Việc làm đang tuyển: <strong>51,925</strong> | Việc làm mới hôm
              nay: <strong>722</strong>
            </p>
          </div>
        </div>
        <section className="hero-video-section">
        <div className="hero-video-container">
          <div className="hero-video-thumbnail" onClick={openVideoModal}>
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Giới thiệu Smart Hire"
              className="video-thumb"
            />
            <div className="video-play-overlay">
              <button className="video-play-btn">
                <i className="fa-solid fa-play"></i>
              </button>
              <p>Xem video giới thiệu</p>
            </div>
          </div>
          <div className="hero-video-text">
            <h3>Tiếp lợi thế, nối thành công</h3>
            <p>
              Smart Hire - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ
              tại Việt Nam
            </p>
          </div>
        </div>
      </section>
      </section>
      {/* === HERO VIDEO SECTION === */}
      
      {/* === TIN TUYỂN DỤNG MỚI NHẤT === */}
      <LatestJobsSection />
      {/* === NGÀNH NGHỀ NỔI BẬT === */}
      <section className="industry-section">
        <div className="industry-header">
          <h2>Top ngành nghề nổi bật</h2>
          <p>
            Bạn muốn tìm việc mới? Xem danh sách việc làm <a href="#">tại đây</a>
          </p>
        </div>
        <div className="industry-grid">
          {popularCategories.length > 0
            ? popularCategories.map((item, index) => (
              <div key={item.categoryId || index} className="industry-card">
                <div className="industry-icon-placeholder">
                  <i className="fa-solid fa-briefcase"></i>
                </div>
                <h3>{item.name}</h3>
                <span>
                  {item.description
                    ? item.description.length > 50
                      ? item.description.substring(0, 50) + "..."
                      : item.description
                    : "Nhiều việc làm"}
                </span>
              </div>
            ))
            : [...Array(8)].map((_, i) => (
              <div key={i} className="industry-card skeleton">
                <div className="skeleton-icon"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-subtext"></div>
              </div>
            ))}
        </div>
      </section>
      {/* === THƯƠNG HIỆU LỚN === */}
      <section className="brand-section">
        <div className="brand-header">
          <div>
            <h2>Thương hiệu lớn tiêu biểu</h2>
            <p>
              Hàng trăm thương hiệu lớn tiêu biểu đang tuyển dụng trên TopCV Pro
            </p>
          </div>
           <button
  className="btn-pro"
  onClick={() => navigate("/companies")}
>
  Xem tất cả công ty
</button>
        </div>
        <div className="brand-subtitle">
  <h3>Danh sách công ty tiêu biểu của top ngành nghề</h3>
</div>
        <div className="brand-grid-wrapper">
<div className="banner-wrapper">
  <img src={featuredBanner} className="featured-banner-img"/>
</div>


{/* Danh sách công ty nổi bật */}

<div className="company-grid">
  {featuredCompanies.slice(0, 6).map((company) => (
    <Link to={`/company/public/${company.companyId}`} className="brand-card" key={company.companyId}>
      <div
        className="company-cover"
        style={{ backgroundImage: `url(${company.coverUrl})` }}
      >
        <img
          src={company.logoUrl || "/default-logo.png"}
          alt={company.name}
          className="company-logo"
        />
      </div>

      <div className="company-info">
        <h3 className="company-name">{company.name}</h3>
        <p className="company-address">
          <strong>Địa chỉ:</strong> {company.address}
        </p>
        <p className="company-description">{company.description}</p>
      </div>
    </Link>
  ))}
</div>
</div>
      </section>

      {/* === MODAL VIDEO === */}
      {isVideoOpen && (
        <div className="video-modal-backdrop" onClick={closeVideoModal}>
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="video-close-btn" onClick={closeVideoModal}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="video-wrapper">
              {isVideoLoading && (
                <div className="video-loading">
                  <div className="spinner"></div>
                </div>
              )}
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Smart Hire - Video giới thiệu"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsVideoLoading(false)}
                style={{ display: isVideoLoading ? "none" : "block" }}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}