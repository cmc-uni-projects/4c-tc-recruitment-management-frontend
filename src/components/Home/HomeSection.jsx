
import "./HomeSection.css";
const brands = [
  { name: "Bee Logistics Corporation", jobs: 28, category: "Logistics", logo: "/bee.png" },
  { name: "Công ty TNHH Thương mại - Dịch vụ Điện Mạnh", jobs: 4, category: "Điện lạnh", logo: "/mpe.png" },
  { name: "Công ty CP Đầu tư Thương mại và Dịch vụ", jobs: 1, category: "Xuất nhập khẩu", logo: "/viettel.png" },
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
          /banner.jpg
          <div className="job-stats">
            <span>Thị trường việc làm hôm nay</span>
            <p>
              Việc làm đang tuyển: <strong>51,925</strong> | Việc làm mới hôm nay: <strong>722</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section className="brand-section">
        <h2>Thương hiệu lớn tiêu biểu</h2>
        <div className="tabs">
          <button className="active">Tất cả</button>
          <button>Ngân hàng</button>
          <button>Xây dựng</button>
          <button>IT - Phần mềm</button>
          <button>Tài chính</button>
        </div>
        <div className="brand-grid">
          {brands.map((brand, index) => (
            <div key={index} className="brand-card">
              <img src={brand.logo} alt={brand.name} />
              <h3>{brand.name}</h3>
              <p>{brand.category}</p>
              <span>{brand.jobs} việc làm</span>
            </div>
          ))}
        </div>
      </section>

      
    </div>
  );
}
