import "./HomeSection.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import iconSales from "../../assets/icons/kinh-doanh-ban-hang.png";
import iconIT from "../../assets/icons/cong-nghe-thong-tin.png";
import iconcustomer from "../../assets/icons/dich-vu-khach-hang.png";
import iconhr from "../../assets/icons/hanh-chinh-van-phong.png";
import iconrealestate from "../../assets/icons/bat-dong-san.png";
import iconfinance from "../../assets/icons/ngan-hang-tai-chinh.png";
import iconaccounting from "../../assets/icons/ke-toan-kiem-toan.png";
import iconmarketing from "../../assets/icons/marketing-truyen-thong-quang-cao.png";


// === THÊM MỚI: Import API ===
import { jobCategoryAPI } from "../../services/auth.services.js";
import LatestJobsSection from "./Job/LatestJobsSection.jsx";

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

// DỮ LIỆU MẪU DỰ PHÒNG (nếu API lỗi)
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

  // === THÊM MỚI: State cho ngành nghề phổ biến ===
  const [popularCategories, setPopularCategories] = useState([]);

  // === THÊM MỚI: Gọi API khi component mount ===
  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        const response = await jobCategoryAPI.getPopular();
        setPopularCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải ngành nghề phổ biến:", error);
        // Fallback về dữ liệu tĩnh nếu API lỗi
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

  const handleSearch = () => {
    const query = `?keyword=${encodeURIComponent(
      keyword
    )}&location=${encodeURIComponent(location)}`;
    navigate(`/search-results${query}`);
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
      {/* Banner */}
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
      </section>

      {/* Tin tuyển dụng mới nhất */}
      <LatestJobsSection />

      
      {/* Top ngành nghề nổi bật - DỮ LIỆU ĐỘNG TỪ API */}
      <section className="industry-section">
        <div className="industry-header">
          <h2>Top ngành nghề nổi bật</h2>
          <p>
            Bạn muốn tìm việc mới? Xem danh sách việc làm{" "}
            <a href="#">tại đây</a>
          </p>
        </div>
        <div className="industry-grid">
          {popularCategories.length > 0
            ? popularCategories.map((item, index) => (
                <div key={item.categoryId || index} className="industry-card">
                  {/* Placeholder icon - có thể mở rộng sau */}
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
            : // Skeleton loading
              [...Array(8)].map((_, i) => (
                <div key={i} className="industry-card skeleton">
                  <div className="skeleton-icon"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-subtext"></div>
                </div>
              ))}
        </div>
      </section>

      {/* Brand Section giống TopCV */}
      <section className="brand-section">
        <div className="brand-header">
          <div>
            <h2>Thương hiệu lớn tiêu biểu</h2>
            <p>
              Hàng trăm thương hiệu lớn tiêu biểu đang tuyển dụng trên TopCV Pro
            </p>
          </div>
          <button className="btn-pro">Pro Company</button>
        </div>

        <div className="tabs">
          <button className="active">Tất cả</button>
          <button>Ngân hàng</button>
          <button>Xây dựng</button>
          <button>IT - Phần mềm</button>
          <button>Tài chính</button>
        </div>

        <div className="brand-grid">
          {brands.map((brand, index) => (
            <div
              key={index}
              className={`brand-card ${index === 0 ? "highlight" : ""}`}
            >
              <img src={brand.logo} alt={brand.name} />
              <h3>{brand.name}</h3>
              <p>{brand.category}</p>
              <span>{brand.jobs} việc làm</span>
              {brand.pro && (
                <button className="btn-pro-small">Pro Company</button>
              )}
              {index === 0 && (
                <button className="btn-follow">+ Theo dõi</button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
