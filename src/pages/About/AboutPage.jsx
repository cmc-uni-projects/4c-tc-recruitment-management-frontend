import React, { useEffect } from "react";
import "./AboutPage.css";

// ✅ Import ảnh đúng cách (vì bạn để trong src/assets/)
import missionImg from "../../assets/mission.webp";
import teamworkImg from "../../assets/teamwork.jpg";

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // luôn cuộn lên đầu khi load trang
  }, []);

  return (
    <div className="about-page">
      <header className="about-header">
        <h1> Smart Recruitment by Ai</h1>
        <p>
          Nền tảng tuyển dụng thông minh ứng dụng trí tuệ nhân tạo giúp doanh nghiệp
          tìm đúng người, ứng viên tìm đúng việc — nhanh hơn, hiệu quả hơn.
        </p>
      </header>

      {/* --- Sứ mệnh --- */}
      <section className="about-section fade-in">
        <div className="about-content">
          <div className="about-text">
            <h2>Sứ mệnh của chúng tôi</h2>
            <p>
              Chúng tôi mang đến giải pháp AI giúp tự động hoá quy trình tuyển dụng,
              phân tích CV và đề xuất ứng viên phù hợp nhất cho từng vị trí.
            </p>
          </div>
          <div className="about-image">
            <img src={missionImg} alt="Sứ mệnh của Smart Recruitment" />
          </div>
        </div>
      </section>

      {/* --- Giá trị cốt lõi --- */}
      <section className="about-section reverse fade-in">
        <div className="about-content">
          <div className="about-image">
            <img src={teamworkImg} alt="Giá trị cốt lõi" />
          </div>
          <div className="about-text">
            <h2>Giá trị cốt lõi</h2>
            <ul>
              <li>💡 Ứng dụng AI để tối ưu quy trình tuyển dụng.</li>
              <li>🤝 Cầu nối giữa nhà tuyển dụng và ứng viên.</li>
              <li>🚀 Hiệu quả, minh bạch và hiện đại.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="about-cta fade-in">
        <h2>Sẵn sàng trải nghiệm tuyển dụng thông minh?</h2>
        <a href="/" className="btn primary">
          Quay lại Trang Chủ
        </a>
      </section>

      <footer className="about-footer">
        <p>© 2025 Smart Recruitment by AI  | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default AboutPage;
