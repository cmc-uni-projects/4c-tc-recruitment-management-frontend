// src/components/Layout/Navbar.jsx
import avatar from "../../../assets/hr/avatar.png";
import logoutIcon from "../../../assets/hr/logout.png";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // giả sử bạn lưu userId khi login

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser({
          name: response.data.fullName || response.data.name || "Người dùng",
          email: response.data.email,
        });
      } catch (err) {
        console.error("Lỗi lấy thông tin user:", err);
        // Nếu lỗi token → tự động logout
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    setShowDropdown(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <span className="top">Smart</span>
          <span className="cv">Hire</span>
        </Link>
        <ul className="nav-links">
          <li>Việc làm</li>
          <Link to="/companies/public" className="nav-link">Công ty</Link>
          <li>Cẩm nang nghề nghiệp</li>
          <li>TopCV Pro</li>
        </ul>
      </div>

      <div className="navbar-right">
        {loading ? (
          <div className="user-name">Đang tải...</div>
        ) : user ? (
          <div
            className="user-menu"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img src={avatar} alt="Avatar" className="user-avatar" />
            <span className="user-name">{user.name}</span>

            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-item" onClick={handleLogout}>
                  <img
                    src={logoutIcon}
                    alt="Đăng xuất"
                    className="logout-icon"
                  />
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">
              <button className="btn-outline">Đăng nhập</button>
            </Link>
            <Link to="/register">
              <button className="btn-primary">Đăng ký</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
