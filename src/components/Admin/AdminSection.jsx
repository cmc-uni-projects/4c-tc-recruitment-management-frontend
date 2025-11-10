import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./AdminSection.css";
export default function AdminSection({ children }) {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () =>{
    localStorage.clear();
    navigate("/login");
  }
  return (
    <div className="hr-page">
      {/* === HEADER === */}
      <header className="hr-header">
        <div className="header-left">
          <img
            src="https://www.topcv.vn/images/logo-topcv.svg"
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
            <span className="icon">🔔</span>
            <span className="icon">⚙️</span>
          </div>
          <div className="avatar" onClick={() => setShowLogout(!showLogout)}>
            <img src="https://via.placeholder.com/40" alt="Avatar" />
            {showLogout && (
              <div className="logout-dropdown">
                <button onClick={handleLogout}>Đăng xuất</button>
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
            <img src="https://via.placeholder.com/50" alt="Admin Avatar" />
            <div>
              <p className="sidebar-name">Admin</p>
              <p className="sidebar-role">Super Admin</p>
            </div>
          </div>
          <ul className="sidebar-menu">
            <li className="active">
              <Link to="/admin">📊 Báo cáo thống kê</Link>
            </li>
            <li>
              <Link to="/admin/employers">🏢 Quản lý nhà tuyển dụng</Link>
            </li>
            <li>
              <Link to="/admin/candidates">👤 Quản lý ứng viên</Link>
            </li>
            <li>
              <Link to="/admin/job-categories">📂 Quản lý ngành nghề</Link>
            </li>
            <li>
              <Link to="/admin/ai">🤖 Toppy AI</Link>
            </li>
            <li>
              <Link to="/admin/notifications">🔔 Thông báo</Link>
            </li>
          </ul>
        </aside>
        {/* MAIN CONTENT */}
        <main className="hr-content">{children}</main>
      </div>
    </div>
  );
}
