
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyAPI } from "../../services/auth.services";
import "./CompanySection.css";
import Swal from "sweetalert2";


const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    companyAPI
      .getById(id)
      .then((res) => {
        setCompany(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải công ty:", err);
        Swal.fire("Lỗi", "Không thể tải thông tin công ty", "error");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="detail-skeleton">Đang tải...</div>;
  if (!company) return <div className="detail-error">Không tìm thấy công ty.</div>;

  return (
    <div className="company-detail-page">
      {/* ==================== HERO ==================== */}
      <section className="detail-hero">
        {/* Ảnh cover */}
        <div className="detail-cover-company">
          <img
            className="detail-cover-img"
            src={company.coverUrl || "/default-cover.jpg"}
            alt={`Cover ${company.name}`}
            onError={(e) => (e.currentTarget.src = "/default-cover.jpg")}
          />
        </div>

        {/* Logo + Tiêu đề bên dưới */}
        <div className="detail-hero-below">
          <div className="detail-logo-wrapper">
            <img
              className="detail-logo"
              src={company.logoUrl || "/default-logo.png"}
              alt={`Logo ${company.name}`}
              onError={(e) => (e.currentTarget.src = "/default-logo.png")}
            />
          </div>

          <div className="detail-title">
            <h1>{company.name}</h1>

            {/* Ngành nghề */}
            {company.industry && (
              <p className="detail-subtitle">
                {/* dùng ký tự • để đơn giản, giống style cũ */}
                {company.industry}
              </p>
            )}

            {/* Thành phố */}
            {company.city && (
              <p className="detail-city">
                {/* dấu chấm vị trí */}
                {company.city}, Việt Nam
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ==================== INFO GRID ==================== */}
      <section className="detail-info-section">
        <div className="detail-info-grid">
          {/* Cột trái */}
          <div className="info-card">
            <div className="info-icon" aria-hidden="true">📍</div>
            <div>
              <strong>Địa chỉ</strong>
              <p>{company.address || "Chưa cập nhật"}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon" aria-hidden="true">🌐</div>
            <div>
              <strong>Website</strong>
              <p>
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noreferrer">
                    {company.website}
                  </a>
                ) : (
                  "Chưa có"
                )}
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon" aria-hidden="true">👥</div>
            <div>
              <strong>Quy mô</strong>
              <p>{company.size || "Không xác định"}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon" aria-hidden="true">📅</div>
            <div>
              <strong>Năm thành lập</strong>
              <p>{company.foundedYear || "Chưa cập nhật"}</p>
            </div>
          </div>

          {/* ✅ MÃ SỐ THUẾ - trường mới */}
          <div className="info-card">
            <div className="info-icon" aria-hidden="true">🧾</div>
            <div>
              <strong>Mã số thuế</strong>
              <p>{company.taxCode || "Chưa cập nhật"}</p>
            </div>
          </div>

          {/* Mô tả công ty */}
          <div className="info-card description-card">
            <div className="info-icon" aria-hidden="true">ℹ️</div>
            <div>
              <strong>Giới thiệu công ty</strong>
              <p className="company-desc">{company.description || "Chưa có mô tả."}</p>
            </div>
          </div>
        </div>

        {/* ==================== ACTIONS ==================== */}
        <div className="detail-actions">
          <Link className="btn-primary" to={`/company/${company.companyId}/jobs`}>
            <span aria-hidden="true">💼</span>&nbsp;Xem việc làm tại {company.name}
          </Link>

          <button className="btn-secondary" onClick={() => navigate(-1)}>
            <span aria-hidden="true"></span>Quay lại
          </button>
        </div>
      </section>
    </div>
  );
};

export default CompanyDetail;
``
