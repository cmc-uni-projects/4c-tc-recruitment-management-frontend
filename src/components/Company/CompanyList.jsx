import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { companyAPI } from "../../services/auth.services";
import "./CompanyList.css";
import Swal from "sweetalert2";

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await companyAPI.getAllActive();
        const activeCompanies = res.data
          .filter((c) => c.status === "ACTIVE")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCompanies(activeCompanies);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        Swal.fire("Lỗi", "Không thể tải danh sách công ty", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="company-list-page1">
      <header className="company-header1">
        <h1>Danh sách công ty đang hoạt động</h1>
        <input
          type="text"
          placeholder="Tìm kiếm công ty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input1"
        />
      </header>

      {loading ? (
        <p className="loading1">Đang tải dữ liệu...</p>
      ) : filteredCompanies.length === 0 ? (
        <p className="no-data1">Không tìm thấy công ty nào.</p>
      ) : (
        <div className="company-grid1">
          {filteredCompanies.map((c) => (
            <div key={c.companyId} className="company-card1">
              <div className="card-cover1">
                <img
                  src={c.coverUrl || "/default-cover.jpg"}
                  alt="Cover"
                  onError={(e) => (e.currentTarget.src = "/default-cover.jpg")}
                />
              </div>
              <div className="card-content1">
                <div className="card-logo1">
                  <img
                    src={c.logoUrl || "/default-logo.png"}
                    alt={c.name}
                    onError={(e) => (e.currentTarget.src = "/default-logo.png")}
                  />
                </div>
                <h3>{c.name}</h3>
                <p className="industry1">{c.industry || "Chưa cập nhật"}</p>
                <p className="city1">{c.city || "Không rõ"}</p>
                <Link to={`/company/public/${c.companyId}`} className="btn-detail1">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default CompanyList;