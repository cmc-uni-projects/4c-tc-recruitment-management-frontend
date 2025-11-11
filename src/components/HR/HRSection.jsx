import "./HRSection.css";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/hr/logo.png";
import avatar from "../../assets/hr/avatar.png";
import Bell from "../../assets/hr/bell.png";
import Setting from "../../assets/hr/setting.png";
import exploreJob from "../../assets/hr/explore_job.png";
import exploreCV from "../../assets/hr/exploreCV.png";
import exploreService from "../../assets/hr/explore_service.png";
import cvIcon from "../../assets/hr/CV.png";

const HRSection = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="hr-page">
      {/* Header */}
      <header className="hr-header">
        <div className="header-left">
          <img src={logo} alt="smarthire Logo" />
          <nav className="header-nav">
            <button className="header-btn">HR Insider</button>
            <button className="header-btn primary">Đăng tin</button>
            <button className="header-btn">Tìm CV</button>
            <button className="header-btn">Connect</button>
            <button className="header-btn">Insights</button>
          </nav>
        </div>

        <div className="header-right">
          <div className="header-icons">
            <img src={Bell} alt="Thông báo" className="icon-img" />
            <img src={Setting} alt="Cài đặt" className="icon-img" />
          </div>
          <div className="avatar">
            <img src={avatar} alt="Avatar" />
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="hr-layout">
        {/* Sidebar */}
        <aside className="hr-sidebar">
          <div className="sidebar-user">
            <img src={avatar} alt="User Avatar" />
            <div>
              <p className="sidebar-name">Phạm Khánh Linh</p>
              <p className="sidebar-role">Employer</p>
            </div>
          </div>
          <ul className="sidebar-menu">
            <li className="active">Bảng Tin</li>
            <li>Quản Lý Công Ty</li>
            <li onClick={() => navigate("/hr/jobs")}>Quản Lý Tin Tuyển Dụng</li>
            <li>Quản lý Ứng Viên</li>
            <li>TopCV AI (Đánh giá CV)</li>
            <li>Thống Kê Tuyển dụng</li>
            <li>Hoạt Động</li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="hr-content">
          {children ? (
            <div className="hr-page-body">{children}</div>
          ) : (
            <>
              {/* Greeting Card */}
              <div className="card greeting-card">
                <h2>Xin chào, Phạm Khánh Linh</h2>
                <p>
                  Hãy thực hiện các bước xác thực bảo mật để đảm bảo an toàn tài
                  khoản của bạn và nhận ngay{" "}
                  <span className="highlight">+8 Top Points</span>
                </p>
                <div className="action-buttons">
                  <button>Xác thực số điện thoại</button>
                  <button>Cập nhật thông tin công ty</button>
                  <button>Đăng tin tuyển dụng</button>
                </div>
              </div>

              {/* Explore TopCV */}
              <div className="card explore-card">
                <h3>Khám phá TopCV dành cho nhà tuyển dụng</h3>
                <div className="explore-options">
                  <div className="explore-item">
                    <img src={exploreJob} alt="Đăng tin" />
                    <p>Đăng tin tuyển dụng</p>
                    <button>Thử ngay</button>
                  </div>
                  <div className="explore-item">
                    <img src={exploreCV} alt="Tìm CV" />
                    <p>Tìm kiếm CV</p>
                    <button>Thử ngay</button>
                  </div>
                  <div className="explore-item">
                    <img src={exploreService} alt="Mua dịch vụ" />
                    <p>Mua dịch vụ</p>
                    <button>Thử ngay</button>
                  </div>
                </div>
              </div>

              {/* CV Suggestion */}
              <div className="card cv-card">
                <h3>CV đề xuất</h3>
                <div className="cv-content">
                  <img src={cvIcon} alt="CV Icon" />
                  <div className="cv-info">
                    <p>
                      Kích hoạt CV đề xuất bởi TopCV AI để được:
                      <br />✔ Gợi ý ứng viên tiềm năng
                      <br />✔ Lọc danh sách ứng viên phù hợp
                      <br />✔ Tự động đề xuất ứng viên theo mô tả
                    </p>
                    <button className="buy-btn">Mua ngay</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default HRSection;
