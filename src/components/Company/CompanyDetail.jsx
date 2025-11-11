import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyAPI } from "../../services/auth.services";
import "./CompanySection.css"; // nếu bạn muốn tách CSS riêng

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    companyAPI.getById(id)
      .then(res => setCompany(res.data))
      .catch(err => console.error("Lỗi khi tải công ty:", err));
  }, [id]);

  if (!company) return <p>Đang tải thông tin công ty...</p>;

  return (
    <div className="company-detail-container">
      <div className="cover-section">
        <img src={company.coverUrl} alt="Cover" className="cover-img" />
        <img src={company.logoUrl} alt="Logo" className="logo-img" />
      </div>
      <div className="info-section">
        <h1>{company.name}</h1>
        <p><strong>Ngành nghề:</strong> {company.industry}</p>
        <p><strong>Địa chỉ:</strong> {company.address}, {company.city}</p>
        <p><strong>Website:</strong> <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a></p>
        <p><strong>Quy mô:</strong> {company.size}</p>
        <p><strong>Năm thành lập:</strong> {company.foundedYear}</p>
        <p><strong>Mô tả:</strong> {company.description}</p>
      </div>
    </div>
  );
};

export default CompanyDetail;