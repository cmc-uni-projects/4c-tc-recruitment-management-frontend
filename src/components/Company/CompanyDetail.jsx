import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyAPI } from "../../services/auth.services";
import "./CompanySection.css";

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyAPI.getById(id)
      .then(res => {
        setCompany(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi tải công ty:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="detail-skeleton">Đang tải...</div>;
  if (!company) return <p className="detail-error">Không tìm thấy công ty.</p>;

  return (
    <div className="company-detail-page">
      {/* ==================== HERO ==================== */}
<section className="detail-hero">
  {/* Ảnh cover */}
  <div className="detail-cover">
    <img
      src={company.coverUrl || "/default-cover.jpg"}
      alt="Cover"
      className="detail-cover-img"
      onError={e => e.currentTarget.src = "/default-cover.jpg"}
    />
  </div>

  {/* Logo nổi + Nội dung bên dưới */}
  <div className="detail-hero-below">
    <div className="detail-logo-wrapper">
      <img
        src={company.logoUrl || "/default-logo.png"}
        alt={company.name}
        className="detail-logo"
        onError={e => e.currentTarget.src = "/default-logo.png"}
      />
    </div>

    <div className="detail-title">
      <h1>{company.name}</h1>
      <p className="detail-subtitle">
        <i className="fa-solid fa-briefcase"></i> {company.industry}
      </p>
      {company.city && (
        <p className="detail-city">
          <i className="fa-solid fa-map-marker-alt"></i> {company.city}, Việt Nam
        </p>
      )}
    </div>
  </div>
</section>

      {/* ==================== INFO GRID ==================== */}
      <section className="detail-info-section">
        <div className="detail-info-grid">
          {/* Cột trái */}
          <div className="detail-info-col">
            <div className="info-card">
              <i className="fa-solid fa-location-dot info-icon"></i>
              <div>
                <strong>Địa chỉ</strong>
                <p>{company.address || "Chưa cập nhật"}</p>
              </div>
            </div>

            <div className="info-card">
              <i className="fa-solid fa-globe info-icon"></i>
              <div>
                <strong>Website</strong>
                <p>
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      {company.website}
                    </a>
                  ) : (
                    "Chưa có"
                  )}
                </p>
              </div>
            </div>

            <div className="info-card">
              <i className="fa-solid fa-users info-icon"></i>
              <div>
                <strong>Quy mô</strong>
                <p>{company.size || "Không xác định"}</p>
              </div>
            </div>

            <div className="info-card">
              <i className="fa-solid fa-calendar-alt info-icon"></i>
              <div>
                <strong>Năm thành lập</strong>
                <p>{company.foundedYear || "Chưa cập nhật"}</p>
              </div>
            </div>
          </div>

          {/* Cột phải - Mô tả */}
          <div className="detail-info-col">
            <div className="info-card description-card">
              <i className="fa-solid fa-file-lines info-icon"></i>
              <div>
                <strong>Giới thiệu công ty</strong>
                <p className="company-desc">{company.description || "Chưa có mô tả."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="detail-actions">
          <Link to={`/jobs?company=${company.companyId}`} className="btn-primary">
            Xem việc làm tại {company.name}
          </Link>
          <Link to="/" className="btn-secondary">
            Quay lại
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CompanyDetail;