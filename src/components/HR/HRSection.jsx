import "./HRSection.css";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import avatar from "../../assets/hr/avatar.png";
import Bell from "../../assets/hr/bell.png";
import Setting from "../../assets/hr/setting.png";
import exploreJob from "../../assets/hr/explore_job.png";
import exploreCV from "../../assets/hr/exploreCV.png";
import exploreService from "../../assets/hr/explore_service.png";
import cvIcon from "../../assets/hr/CV.png";
import logoutIcon from "../../assets/hr/logout.png";
import { FiLogOut } from "react-icons/fi"; // Icon logout
import React, { useState, useEffect } from "react";
import axios from "axios";
import { employerAPI } from "../../services/auth.services";

const HRSection = ({ children }) => {
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ fullName: "Đang tải...", role: "HR" });
  const [employer, setEmployer] = useState(null); // ← Quan trọng: trạng thái xác thực
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // THÊM: popup bắt buộc xác thực
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [verifyPopupMessage, setVerifyPopupMessage] = useState("Bạn cần xác thực doanh nghiệp trước khi sử dụng chức năng này.");
  const userId = localStorage.getItem("userId");


  const getEmployerFromCache = () => {
    // ưu tiên state, fallback localStorage (vì bạn đã set ở useEffect)
    // HRSection.jsx có set: localStorage.setItem("employer", JSON.stringify(employerData));
    // và localStorage.setItem("selectedCompany", JSON.stringify(employerData.company));
    // [1](https://cmcglobalcompany-my.sharepoint.com/personal/pklinh3_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/HRSection.jsx)
    if (employer) return employer;
    try {
      const cached = localStorage.getItem("employer");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };


  const isVerified = (emp) => {
    // Theo cách bạn render: emp?.verified === true hoặc verificationStatus === "APPROVED"
    // và nếu === "PENDING" thì coi như chưa thể dùng chức năng.
    return !!(emp?.verified || emp?.verificationStatus === "APPROVED");
  };

  const checkEmployerBeforeNavigate = async (requireVerified = true) => {
    const emp = getEmployerFromCache();

    // chưa có hồ sơ employer
    if (!emp) {
      setVerifyPopupMessage("Bạn chưa có hồ sơ doanh nghiệp. Vui lòng tạo hồ sơ và xác thực trước khi sử dụng chức năng này.");
      setShowVerifyPopup(true);
      return false;
    }
    // đang chờ duyệt
    if (emp?.verificationStatus === "PENDING") {
      setShowPendingPopup(true);
      return false;
    }
    // chưa verified
    if (requireVerified && !isVerified(emp)) {
      setVerifyPopupMessage("Hồ sơ doanh nghiệp chưa được xác thực. Hãy hoàn tất xác thực để tiếp tục.");
      setShowVerifyPopup(true);
      return false;
    }
    return true; // ok cho phép điều hướng
  };


  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Lấy thông tin User
        const userRes = await axios.get(`http://localhost:8080/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);


        // 2. Lấy thông tin Employer để kiểm tra verified
        try {
          const employerRes = await employerAPI.getMyEmployer();
          const employerData = employerRes.data;

          setEmployer(employerData);

          // THÊM 2 DÒNG NÀY - QUAN TRỌNG NHẤT
          localStorage.setItem("employer", JSON.stringify(employerData));
          localStorage.setItem("selectedCompany", JSON.stringify(employerData.company));

        } catch (err) {
          if (err.response?.status === 404) {
            setEmployer(null); // Chưa tạo hồ sơ Employer
          }
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu HR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, userId]);
  return (
    <div className="hr-page">
      {/* Header */}
      <header className="hr-header">
        <div className="header-left">
          <img src="https://tse3.mm.bing.net/th/id/OIP.oE2SOiMAVel-yjTAu-i-egHaE5?rs=1&pid=ImgDetMain&o=7&rm=3" alt="smarthire Logo" />
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

          <div className="avatar" onClick={() => setShowLogout(!showLogout)}>
            <img src={avatar} alt="Avatar" />
            {showLogout && (
              <div className="logout-dropdown">
                <button className="logout-btn" onClick={handleLogout}>
                  <img src={logoutIcon} alt="Logout" className="logout-icon" />
                  Đăng xuất
                </button>
              </div>
            )}
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
              <p className="sidebar-name">
                {loading ? "Đang tải..." : user.fullName || "HR User"}
              </p>

              {loading ? (
                <div className="verified-status loading">Đang kiểm tra...</div>
              ) : employer?.verified ? (
                <div className="verified-status verified">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Đã Xác Thực
                </div>
              ) : employer?.verificationStatus === "PENDING" ? (
                <div
                  className="verified-status pending"
                  onClick={() => setShowPendingPopup(true)}
                  style={{ cursor: "pointer" }}
                >
                  Clock Đang chờ duyệt
                </div>
              ) : employer ? (
                <div
                  className="verified-status not-verified"
                  onClick={() => navigate("/hr/profile/business-registration")}
                  style={{ cursor: "pointer" }}
                >
                  Tiếp tục xác thực
                </div>
              ) : (
                <div
                  className="verified-status not-verified"
                  onClick={() => navigate("/hr/profile")}
                  style={{ cursor: "pointer" }}
                >
                  Xác Thực Ngay
                </div>
              )}


              {showVerifyPopup && (
                <div className="pending-popup-overlay" onClick={() => setShowVerifyPopup(false)}>
                  <div className="pending-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="pending-icon">Shield</div>
                    <h3>Yêu cầu xác thực doanh nghiệp</h3>
                    <p>{verifyPopupMessage}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        className="btn-close-popup"
                        onClick={() => {
                          setShowVerifyPopup(false);
                        }}
                      >
                        Đóng
                      </button>
                      <button
                        className="btn-close-popup"
                        onClick={() => {
                          setShowVerifyPopup(false);
                          // điều hướng tới trang upload GPKD / gửi xác thực
                          navigate("/hr/profile/business-registration");
                        }}
                      >
                        Xác thực ngay
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {/* POPUP ĐẸP NHƯ TOPCV */}
              {showPendingPopup && (
                <div className="pending-popup-overlay" onClick={() => setShowPendingPopup(false)}>
                  <div className="pending-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="pending-icon">Clock</div>
                    <h3>Yêu cầu xác thực đã được gửi!</h3>
                    <p>Chúng tôi đang xem xét hồ sơ doanh nghiệp của bạn.</p>
                    <p>Thời gian xử lý: <strong>1-3 ngày làm việc</strong></p>
                    <p>Bạn sẽ nhận email thông báo khi hoàn tất.</p>
                    <button className="btn-close-popup" onClick={() => setShowPendingPopup(false)}>
                      Đóng
                    </button>
                  </div>
                </div>
              )}
              <p className="sidebar-role">{user.role || "HR"}</p>
            </div>
          </div>
          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/hr"
                end
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Bảng Tin
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hr/companies"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={async (e) => {
                  const canGo = await checkEmployerBeforeNavigate(true); // yêu cầu verified
                  if (!canGo) e.preventDefault();
                }}
              >
                Quản Lý Công Ty
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/hr/jobs"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={async (e) => {
                  const canGo = await checkEmployerBeforeNavigate(true); // yêu cầu verified
                  if (!canGo) e.preventDefault();
                }}
              >
                Quản Lý Tin Tuyển Dụng
              </NavLink>
            </li>


            <li>
              <NavLink
                to="/hr/candidates"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={async (e) => {
                  const canGo = await checkEmployerBeforeNavigate(true); // yêu cầu verified
                  if (!canGo) e.preventDefault();
                }}
              >
                Quản lý Ứng Viên
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/hr/ai"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                🤖 TopCV AI (Đánh giá CV)
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/hr/statistics"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={async (e) => {
                  const canGo = await checkEmployerBeforeNavigate(true);
                  if (!canGo) e.preventDefault();
                }}
              >
                Thống Kê Tuyển dụng
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/hr/activities"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={async (e) => {
                  const canGo = await checkEmployerBeforeNavigate(true);
                  if (!canGo) e.preventDefault();
                }}
              >
                Hoạt Động
              </NavLink>
            </li>


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
