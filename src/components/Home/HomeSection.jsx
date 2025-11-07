
import "./HomeSection.css";
import iconSales from "../../assets/icons/kinh-doanh-ban-hang.png";
import iconIT from "../../assets/icons/cong-nghe-thong-tin.png";
import iconcustomer from "../../assets/icons/dich-vu-khach-hang.png";
import iconhr from "../../assets/icons/hanh-chinh-van-phong.png";
import iconrealestate from "../../assets/icons/bat-dong-san.png";
import iconfinance from "../../assets/icons/ngan-hang-tai-chinh.png";
import iconaccounting from "../../assets/icons/ke-toan-kiem-toan.png";
import iconmarketing from "../../assets/icons/marketing-truyen-thong-quang-cao.png";





const brands = [
  { name: "Bee Logistics Corporation", jobs: 28, category: "Logistics", logo: "/bee.png" },
  { name: "Công ty TNHH Thương mại - Dịch vụ Điện Mạnh", jobs: 4, category: "Điện lạnh", logo: "/mpe.png" },
  { name: "Công ty CP Đầu tư Thương mại và Dịch vụ", jobs: 1, category: "Xuất nhập khẩu", logo: "/viettel.png" },
  { name: "Công ty CP Xây dựng BCONS", jobs: 19, category: "Xây dựng", logo: "/bcons.png" },
  { name: "Công ty TNHH SX HTD Bình Tiên (BITI'S)", jobs: 5, category: "Bán lẻ - FMCG", logo: "/bitis.png" },
  { name: "Công ty TNHH CJ VINA AGRI", jobs: 12, category: "Sản xuất", logo: "/cj.png" },
  { name: "Trường Cao đẳng FPT Polytechnic", jobs: 1, category: "Giáo dục / Đào tạo", logo: "/fpt.png" },
];

const industries = [
  { name: "Kinh doanh - Bán hàng", jobs: "11.254 việc làm", icon: iconSales },
  { name: "Marketing - PR - Quảng cáo", jobs: "7.808 việc làm", icon: iconmarketing },
  { name: "Chăm sóc khách hàng", jobs: "2.678 việc làm", icon: iconcustomer },
  { name: "Nhân sự - Hành chính", jobs: "3.099 việc làm", icon: iconhr },
  { name: "Công nghệ Thông tin", jobs: "2.519 việc làm", icon: iconIT },
  { name: "Tài chính - Ngân hàng", jobs: "1.388 việc làm", icon: iconfinance },
  { name: "Bất động sản", jobs: "435 việc làm", icon: iconrealestate },
  { name: "Kế toán - Kiểm toán - Thuế", jobs: "5.841 việc làm", icon: iconaccounting },
];


export default function HomeSection() {
  return (
    <div className="home-section">
      {/* Banner */}
      <section className="banner">
        <h2>Smart Hire - Tạo CV, Tìm việc làm, Tuyển dụng hiệu quả</h2>
        <div className="search-bar">
          <input type="text" placeholder="Vị trí tuyển dụng, tên công ty" />

          <select>
            <option>Địa điểm</option>
          </select>
          <button className="btn-search">Tìm kiếm</button>
        </div>
        <div className="banner-content">
          <img src="/banner.jpg" alt="Banner" />
          <div className="job-stats">
            <span>Thị trường việc làm hôm nay</span>
            <p>
              Việc làm đang tuyển: <strong>51,925</strong> | Việc làm mới hôm nay: <strong>722</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ✅ Top ngành nghề nổi bật */}
<section className="industry-section">
  <div className="industry-header">
    <h2>Top ngành nghề nổi bật</h2>
    <p>
      Bạn muốn tìm việc mới? Xem danh sách việc làm <a href="#">tại đây</a>
    </p>
  </div>
  <div className="industry-grid">
    {industries.map((item, index) => (
      <div key={index} className="industry-card">
        <img src={item.icon} alt={item.name} />
        <h3>{item.name}</h3>
        <span>{item.jobs}</span>
      </div>
    ))}
  </div>
</section>



      {/* ✅ Brand Section giống TopCV */}
      <section className="brand-section">
        <div className="brand-header">
          <div>
            <h2>Thương hiệu lớn tiêu biểu</h2>
            <p>Hàng trăm thương hiệu lớn tiêu biểu đang tuyển dụng trên TopCV Pro</p>
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
            <div key={index} className={`brand-card ${index === 0 ? "highlight" : ""}`}>
              <img src={brand.logo} alt={brand.name} />
              <h3>{brand.name}</h3>
              <p>{brand.category}</p>
              <span>{brand.jobs} việc làm</span>
              {brand.pro && <button className="btn-pro-small">Pro Company</button>}
              {index === 0 && <button className="btn-follow">+ Theo dõi</button>}
            </div>
          ))}
        </div>
      </section>
    </div>

  );
}
