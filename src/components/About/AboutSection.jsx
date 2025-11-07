import React from 'react';
import './AboutSection.css';
import aboutIllustration from '../../assets/about-illustration.png'; // chỉnh đúng đường dẫn ảnh

const AboutSection = () => {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-media">
            <img src={aboutIllustration} alt="Giới thiệu nền tảng tuyển dụng" />
          </div>

          <div className="about-content">
            <span className="kicker">Về chúng tôi</span>
            <h2 className="title">
              Sàn tuyển dụng thông minh — kết nối nhanh, chính xác
            </h2>
            <p className="description">
              Chúng tôi giúp nhà tuyển dụng tiếp cận đúng ứng viên, giúp ứng viên tìm được công việc phù hợp nhanh chóng.
              Nền tảng sử dụng AI hỗ trợ lọc hồ sơ, thống kê, và quản lý tuyển dụng — tất cả trong một nơi.
            </p>

            <ul className="benefits">
              <li>
                <strong>Minh bạch</strong>
                <span>Quy trình tuyển dụng rõ ràng, theo dõi được tiến trình.</span>
              </li>
              <li>
                <strong>Tối ưu thời gian</strong>
                <span>AI lọc hồ sơ, đề xuất ứng viên phù hợp.</span>
              </li>
              <li>
                <strong>Dễ dùng</strong>
                <span>Giao diện thân thiện, tương thích di động.</span>
              </li>
            </ul>

            <div className="actions">
              <a href="/about" className="btn primary">
                Tìm hiểu thêm
              </a>
              <a href="/register" className="btn ghost">
                Đăng ký ngay
              </a>
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat">
            <div className="stat-num">+1,200</div>
            <div className="stat-label">Ứng viên</div>
          </div>
          <div className="stat">
            <div className="stat-num">+350</div>
            <div className="stat-label">Công ty</div>
          </div>
          <div className="stat">
            <div className="stat-num">98%</div>
            <div className="stat-label">Tỉ lệ phù hợp đề xuất</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
