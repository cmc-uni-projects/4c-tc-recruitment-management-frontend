// src/pages/hr/profile/ProfileLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./ProfileLayout.css";

const ProfileLayout = () => {
  return (
    <div className="profile-wrapper">
      <aside className="profile-mini-sidebar">
        <h3>Cài đặt tài khoản</h3>
        <nav>
          <NavLink to="/hr/profile" end className={({ isActive }) => isActive ? "active" : ""}>
            Thông tin cá nhân
          </NavLink>
          <NavLink to="/hr/profile/company" className={({ isActive }) => isActive ? "active" : ""}>
            Thông tin công ty
          </NavLink>
          <NavLink to="/hr/profile/business-registration" className={({ isActive }) => isActive ? "active" : ""}>
            Giấy đăng ký doanh nghiệp
          </NavLink>
          <NavLink to="/hr/profile/business-license" className={({ isActive }) => isActive ? "active" : ""}>
            Giấy phép kinh doanh
          </NavLink>
          <NavLink to="/hr/profile/settings" className={({ isActive }) => isActive ? "active" : ""}>
            Cài đặt
          </NavLink>
        </nav>
      </aside>

      <div className="profile-main-area">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;