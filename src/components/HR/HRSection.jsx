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
import clockIcon from "../../assets/hr/padlock.png";
import shieldIcon from "../../assets/hr/shield.png";
import { FiLogOut } from "react-icons/fi"; // Icon logout
import React, { useState, useEffect } from "react";
import axios from "axios";
import { employerAPI } from "../../services/auth.services";
import NotificationsPageHR from "../../pages/Notification/NotificationsPageHR.jsx";

const HRSection = ({ children }) => {
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ fullName: "Đang tải...", role: "HR" });
  const [employer, setEmployer] = useState(null); // ← Quan trọng: trạng thái xác thực
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [showNotifications, setShowNotifications] = useState(false); // mở page dưới header
  const [unreadCount, setUnreadCount] = useState(0);
  const LS_NOTI_KEY = "hr_notifications";

  // MỚI: State cho popup xác thực
  const [showVerifyBlocker, setShowVerifyBlocker] = useState(false);
  const [blockerStatus, setBlockerStatus] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Thay thế hàm fetchUnreadCount:
  const fetchUnreadCount = async () => {
    try {
      const raw = localStorage.getItem(LS_NOTI_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const unread = arr.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      setUnreadCount(0);
    }
  };

  // Polling giữ nguyên
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // 4) click chuông => mở page thông báo và giữ URL /hr
  const handleBellClick = (e) => {
  e.preventDefault();
  setShowNotifications(prev => !prev); // Toggle mở/đóng
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
        const userRes = await axios.get(
          `http://localhost:8080/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(userRes.data);

        // 2. Lấy thông tin Employer để kiểm tra verified

        try {
          const employerRes = await employerAPI.getMyEmployer();
          const employerData = employerRes.data;

          setEmployer(employerData);
          localStorage.setItem("employer", JSON.stringify(employerData));
          localStorage.setItem(
            "selectedCompany",
            JSON.stringify(employerData.company)
          );
        } catch (err) {
          const code = err?.response?.status;

          if (code === 404) {
            setEmployer(null);
          } else if (code === 403) {
            const selectedCompanyRaw = localStorage.getItem("selectedCompany");
            if (!selectedCompanyRaw) {
              const employerRaw = localStorage.getItem("employer");
              if (employerRaw) {
                try {
                  const empObj = JSON.parse(employerRaw);
                  if (empObj?.company) {
                    localStorage.setItem(
                      "selectedCompany",
                      JSON.stringify(empObj.company)
                    );
                  }
                } catch (error) {
                  console.warn("Lỗi parse employer từ localStorage:", error);
                }
              }
            }
          } else {
            console.warn("[HRSection] getMyEmployer error:", err);
          }
        }
      } catch (err) {
        console.warn(
          "[HRSection] Tải dữ liệu HR gặp lỗi, UI vẫn tiếp tục.",
          err?.response?.status
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, userId]);
  const requireVerification = (e) => {
  if (employer?.verified) return true;

  e.preventDefault(); // luôn chặn trước

  if (!employer) {
    setBlockerStatus("NOT_CREATED");
    setShowVerifyBlocker(true);
    return false;
  }

  if (employer.verificationStatus === "PENDING") {
    setBlockerStatus("PENDING");
    setShowVerifyBlocker(true);
    return false;
  }

  if (!employer.verified && employer.verificationStatus !== "APPROVED") {
    setBlockerStatus("NOT_VERIFIED");
    setShowVerifyBlocker(true);
    return false;
  }

  return true;
};
  return (
    <div className="hr-page">
      {/* Header */}
      <header className="hr-header">
        <div className="header-left">
          <img
            src="https://tse3.mm.bing.net/th/id/OIP.oE2SOiMAVel-yjTAu-i-egHaE5?rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="smarthire Logo"
          />
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
            <div
              className="icon-wrap"
              onClick={handleBellClick}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <img src={Bell} alt="Thông báo" className="icon-img" />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#ff3b30",
                    color: "#fff",
                    borderRadius: 999,
                    fontSize: 12,
                    padding: "2px 6px",
                    border: "2px solid #0b0b0c",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>

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
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
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
                  onClick={() => navigate("/hr/profile/company")}
                  style={{ cursor: "pointer" }}
                >
                  Xác Thực Ngay
                </div>
              )}

              {/* POPUP ĐẸP NHƯ TOPCV */}
              {showPendingPopup && (
                <div
                  className="pending-popup-overlay"
                  onClick={() => setShowPendingPopup(false)}
                >
                  <div
                    className="pending-popup"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="pending-icon">Clock</div>
                    <h3>Yêu cầu xác thực đã được gửi!</h3>
                    <p>Chúng tôi đang xem xét hồ sơ doanh nghiệp của bạn.</p>
                    <p>
                      Thời gian xử lý: <strong>1-3 ngày làm việc</strong>
                    </p>
                    <p>Bạn sẽ nhận email thông báo khi hoàn tất.</p>
                    <button
                      className="btn-close-popup"
                      onClick={() => setShowPendingPopup(false)}
                    >
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
                onClick={requireVerification}
              >
                Quản Lý Công Ty
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hr/jobs"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={requireVerification}
              >
                Quản Lý Tin Tuyển Dụng
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/hr/statistics"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={requireVerification}
              >
                Thống Kê Tuyển dụng
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hr/activities"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={requireVerification}
              >
                Hoạt Động
              </NavLink>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="hr-content">
          {showNotifications ? (
            <div className="notifications-fullscreen">
      <div className="noti-header-bar">
        <h2>Thông báo duyệt công ty</h2>
        <button 
          className="close-noti-btn"
          onClick={() => setShowNotifications(false)}
        >
          ×
        </button>
      </div>
      <NotificationsPageHR />
    </div>
          ) : children ? (
            <div className="hr-page-body">{children}</div>
          ) : (
            <>
              {/* Greeting Card */}
              <div className="card greeting-card">
                <h2>
                  Xin chào
                  {loading ? (
                    "..."
                  ) : user?.fullName ? (
                    <>
                      {" "}
                      {user.fullName}
                      <span style={{ fontWeight: 400, opacity: 0.9 }}>!</span>
                    </>
                  ) : (
                    "!"
                  )}
                </h2>
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

      {/* POPUP XÁC THỰC NHỎ XINH - HIỆN TRÊN GIAO DIỆN */}
      {showVerifyBlocker && (
        <div
          className="verification-blocker-overlay"
          onClick={() => setShowVerifyBlocker(false)}
        >
          <div
            className="verification-blocker-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="blocker-icon">
              {blockerStatus === "PENDING" ? (
                <img
                  src={clockIcon}
                  alt="Đang chờ duyệt"
                  style={{ width: 64, height: 64 }}
                />
              ) : (
                <img
                  src={shieldIcon}
                  alt="Cần xác thực"
                  style={{ width: 64, height: 64 }}
                />
              )}
            </div>

            {blockerStatus === "NOT_CREATED" && (
              <>
                <h3>Bạn chưa tạo hồ sơ doanh nghiệp</h3>
                <p>
                  Vui lòng tạo và xác thực thông tin công ty để sử dụng tính
                  năng này.
                </p>
                <div className="blocker-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowVerifyBlocker(false)}
                  >
                    Để sau
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowVerifyBlocker(false);
                      navigate("/hr/profile/company");
                    }}
                  >
                    Tạo hồ sơ ngay
                  </button>
                </div>
              </>
            )}

            {blockerStatus === "PENDING" && (
              <>
                <h3>Hồ sơ đang chờ duyệt</h3>
                <p>
                  Chúng tôi đang xem xét hồ sơ doanh nghiệp của bạn (1-3 ngày
                  làm việc).
                </p>
                <div className="blocker-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowVerifyBlocker(false)}
                  >
                    Để sau
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowVerifyBlocker(false);
                      navigate("/hr/profile/business-registration");
                    }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </>
            )}

            {blockerStatus === "NOT_VERIFIED" && (
              <>
                <h3>Xác thực doanh nghiệp chưa hoàn tất</h3>
                <p>
                  Hồ sơ của bạn chưa được duyệt hoặc bị từ chối. Vui lòng bổ
                  sung lại.
                </p>
                <div className="blocker-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowVerifyBlocker(false)}
                  >
                    Để sau
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowVerifyBlocker(false);
                      navigate("/hr/profile/business-registration");
                    }}
                  >
                    Tiếp tục xác thực
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HRSection;
