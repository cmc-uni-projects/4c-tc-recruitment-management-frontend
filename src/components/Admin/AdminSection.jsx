import React, { useState, useEffect } from "react";import { Link } from "react-router-dom";
import "./AdminSection.css";
import logoutIcon from "../../assets/hr/logout.png";
import { FiLogOut } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import avatar from "../../assets/hr/avatar.png";
import Bell from "../../assets/hr/bell.png";
import Setting from "../../assets/hr/setting.png";
import { useNavigate } from "react-router-dom";
import { jobAPI } from "../../services/auth.services";
export default function AdminSection({ children }) {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const handleLogout = () =>{
    localStorage.clear();
    navigate("/"); 
  }
  // Lấy số job đang chờ duyệt
  const fetchPendingCount = async () => {
    try {
      const res = await jobAPI.getAllJobs();
      const pending = res.data.filter(j => j.status === "PENDING").length;
      setPendingCount(pending);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 10000); // Cập nhật mỗi 10s
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="hr-page">
      {/* === HEADER === */}
      <header className="hr-header">
        <div className="header-left">
          <img
            src="https://landingpage.live/wp-content/uploads/2023/04/Smart-Hire-01-copy.png"
            alt="TopCV Logo"
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
<div className="notification-wrapper" onClick={() => navigate("/admin/notifications")}>
              <img src={Bell} alt="Thông báo" className="icon-img" />
              {pendingCount > 0 && (
                <span className="notification-badge">{pendingCount}</span>
              )}
            </div>    <img src={Setting} alt="Cài đặt" className="icon-img" />
  </div>
          <div className="avatar" onClick={() => setShowLogout(!showLogout)}>
            <img src={avatar} alt="Avatar"onClick={() => setShowLogout(!showLogout)}></img>
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
      {/* === BODY === */}
      <div className="hr-layout">
        {/* SIDEBAR */}
        <aside className="hr-sidebar">
          <div className="sidebar-user">
            <img src={avatar} alt="Admin Avatar" />
            <div>
              <p className="sidebar-name">Admin</p>
              <p className="sidebar-role">Super Admin</p>
            </div>
          </div>
          <ul className="sidebar-menu">
  <li>
    <NavLink
      to="/admin"
      end
      className={({ isActive }) => isActive ? "active" : ""}
    >
      Báo cáo thống kê
    </NavLink>
  </li>
  <li>
    <NavLink
      to="/admin/employers"
      className={({ isActive }) => isActive ? "active" : ""}
    >
      Quản lý nhà tuyển dụng
    </NavLink>
  </li>
  <li>
    <NavLink
      to="/admin/candidates"
      className={({ isActive }) => isActive ? "active" : ""}
    >
      Quản lý ứng viên
    </NavLink>
  </li>
  <li>
    <NavLink
      to="/admin/job-categories"
      className={({ isActive }) => isActive ? "active" : ""}
    >
      Quản lý ngành nghề
    </NavLink>
  </li>
  <li>
    <NavLink
      to="/admin/job-positions"
      className={({ isActive }) => isActive ? "active" : ""}
    >
      Quản lý các vị trí công việc
    </NavLink>
  </li>
  <li>
    <NavLink
      to="/admin/ai"
      className={({ isActive }) => isActive ? "active" : ""}
    >
      🤖 Toppy AI
    </NavLink>
  </li>
  <li>
    <NavLink
      to="/admin/notifications"
      className={({ isActive }) => isActive ? "active" : ""}
    >
      Thông báo
    </NavLink>
  </li>
</ul>
        </aside>
        {/* MAIN CONTENT */}
        <main className="hr-content">{children}</main>
      </div>
    </div>
  );
}
