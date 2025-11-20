import React, { useEffect, useState } from "react";
import { companyAPI, employerAPI } from "../../services/auth.services";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./CompanyInfo.css";

const CompanyInfo = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creatingEmployer, setCreatingEmployer] = useState(false);

  const [activeTab, setActiveTab] = useState("select");
  const [form, setForm] = useState({
    name: "",
    industry: "",
    description: "",
    logoUrl: "",
    coverUrl: "",
    website: "",
    address: "",
    city: "",
    size: "MEDIUM",
    foundedYear: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await companyAPI.getAllActive();
      setCompanies(res.data);
      setFilteredCompanies(res.data);
    } catch {
      toast.error("Không thể tải danh sách công ty");
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
    } else {
      const result = companies.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(result);
    }
  };

  const handleCreateCompany = async () => {
    if (!Object.values(form).every((val) => val.trim() !== "")) {
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    }
    setLoading(true);
    try {
      const res = await companyAPI.create(form);
      localStorage.setItem("selectedCompany", JSON.stringify(res.data));
      toast.success("Tạo công ty thành công!");
      navigate("/hr/profile/business-registration");
    } catch (err) {
      toast.error(err.response?.data?.message || "Tạo công ty thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployerProfile = async () => {
    if (!selectedCompany) return toast.error("Vui lòng chọn công ty");

    setCreatingEmployer(true);

    try {
      // Lấy thông tin cá nhân đã lưu tạm ở bước 1
      const personalTemp = JSON.parse(localStorage.getItem("employer_personal_temp") || "{}");

      if (!personalTemp.positionTitle || !personalTemp.department || !personalTemp.workEmail) {
        toast.error("Thiếu thông tin cá nhân. Vui lòng quay lại bước 1.");
        navigate("/hr/profile/personal");
        return;
      }

      // Dữ liệu gửi lên đúng chuẩn như Postman bạn test
      const payload = {
        positionTitle: personalTemp.positionTitle,
        department: personalTemp.department,
        workEmail: personalTemp.workEmail,
        companyId: selectedCompany.companyId, // bắt buộc
      };
      

      const res = await employerAPI.createEmployer(payload);

      // Lưu thông tin employer vừa tạo (nếu cần dùng sau)
      localStorage.setItem("employer", JSON.stringify(res.data));
      localStorage.setItem("selectedCompany", JSON.stringify(selectedCompany));

      toast.success("Tạo hồ sơ nhà tuyển dụng thành công!");
      
      // Xóa dữ liệu tạm
      localStorage.removeItem("employer_personal_temp");

      // Chuyển sang bước upload giấy phép kinh doanh
      navigate("/hr/profile/business-registration");

    } catch (err) {
      console.error("Lỗi tạo employer:", err);
      const msg = err.response?.data?.message || "Tạo hồ sơ thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setCreatingEmployer(false);
    }
  };

  return (
    <div className="company-info-wrapper">
      {/* Nếu chưa chọn công ty → hiển thị danh sách */}
      {!selectedCompany ? (
        <>
          <div className="tab-header">
            <button
              className={activeTab === "select" ? "active" : ""}
              onClick={() => setActiveTab("select")}
            >
              Chọn công ty
            </button>
            <button
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
            >
              Tạo công ty
            </button>
          </div>

          {activeTab === "select" && (
            <div className="company-select-tab">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Nhập tên công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Tìm kiếm</button>
              </div>
              <div className="company-grid">
                {filteredCompanies.map((c) => (
                  <div
                    key={c.companyId}
                    className="company-card"
                    onClick={() => setSelectedCompany(c)}
                  >
                    <div className="cover">
                      <img src={c.coverUrl || "/default-cover.jpg"} alt="cover" />
                    </div>
                    <div className="logo">
                      <img src={c.logoUrl || "/default-logo.png"} alt="logo" />
                    </div>
                    <h3>{c.name}</h3>
                    <p className="address">{c.address || "Chưa cập nhật địa chỉ"}</p>
                    <p className="desc">{c.description || "Chưa có mô tả"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <div className="company-create-tab">
              <form className="company-form">
                <input name="name" placeholder="Tên công ty *" onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input name="industry" placeholder="Ngành nghề *" onChange={(e) => setForm({ ...form, industry: e.target.value })} />
                <textarea name="description" placeholder="Mô tả *" onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
                <input name="logoUrl" placeholder="Logo URL *" onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
                <input name="coverUrl" placeholder="Ảnh bìa URL *" onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} />
                <input name="website" placeholder="Website *" onChange={(e) => setForm({ ...form, website: e.target.value })} />
                <input name="address" placeholder="Địa chỉ *" onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <input name="city" placeholder="Thành phố *" onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <select name="size" onChange={(e) => setForm({ ...form, size: e.target.value })}>
                  <option value="SMALL">Nhỏ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="LARGE">Lớn</option>
                  <option value="ENTERPRISE">Doanh nghiệp</option>
                </select>
                <input name="foundedYear" type="number" placeholder="Năm thành lập *" onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} />
              </form>
              <button
                className="btn-create"
                disabled={!Object.values(form).every((val) => val.trim() !== "") || loading}
                onClick={handleCreateCompany}
              >
                {loading ? "Đang xử lý..." : "Tạo hồ sơ"}
              </button>
            </div>
          )}
        </>
      ) : (
        // Hiển thị chi tiết công ty
        <div className="company-detail-page">
          <div className="detail-hero">
            <div className="detail-cover">
              <img
                src={selectedCompany.coverUrl || "/default-cover.jpg"}
                alt="cover"
                className="detail-cover-img"
              />
            </div>
            <div className="detail-hero-below">
              <div className="detail-logo-wrapper">
                <img
                  src={selectedCompany.logoUrl || "/default-logo.png"}
                  alt="logo"
                  className="detail-logo"
                />
              </div>
              <div className="detail-title">
                <h1>{selectedCompany.name}</h1>
                <p className="detail-subtitle">{selectedCompany.industry}</p>
                <p className="detail-city">{selectedCompany.city || "Không rõ"}</p>
              </div>
            </div>
          </div>

          <div className="detail-info-section">
            <div className="detail-info-grid">
              <div className="info-card">
                <div className="info-icon">📍</div>
                <div>
                  <strong>Địa chỉ</strong>
                  <p>{selectedCompany.address || "Chưa cập nhật"}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">🌐</div>
                <div>
                  <strong>Website</strong>
                  <p>
                    {selectedCompany.website ? (
                      <a href={selectedCompany.website} target="_blank" rel="noreferrer">
                        {selectedCompany.website}
                      </a>
                    ) : (
                      "Chưa có"
                    )}
                  </p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">👥</div>
                <div>
                  <strong>Quy mô</strong>
                  <p>{selectedCompany.size}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">📅</div>
                <div>
                  <strong>Năm thành lập</strong>
                  <p>{selectedCompany.foundedYear || "Chưa cập nhật"}</p>
                </div>
              </div>
            </div>
            <div className="info-card description-card">
              <strong>Giới thiệu công ty</strong>
              <p className="company-desc">{selectedCompany.description || "Chưa có mô tả."}</p>
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn-secondary" onClick={() => setSelectedCompany(null)}>
              Quay lại
            </button>
            <button
              className="btn-primary"
              onClick={handleCreateEmployerProfile}
              disabled={creatingEmployer}
            >
              {creatingEmployer ? "Đang tạo hồ sơ..." : "Tạo hồ sơ nhà tuyển dụng"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInfo;