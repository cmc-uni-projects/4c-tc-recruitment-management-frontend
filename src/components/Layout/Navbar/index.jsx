import avatarDefault from "../../../assets/hr/avatar.png";
import logoutIcon from "../../../assets/hr/logout.png";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [verified, setVerified] = useState(false);
  const [userIdDisplay, setUserIdDisplay] = useState("");
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
        const response = await axios.get(`http://localhost:8080/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser({
          name: response.data.fullName || response.data.name || "Người dùng",
          email: response.data.email,
          avatar: response.data.avatar || avatarDefault,
        });
        setVerified(response.data.verified || false);
        setUserIdDisplay(response.data.id || "");
      } catch (err) {
        console.error("Lỗi lấy thông tin user:", err);
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
          <li
            onClick={() => {
              const section = document.getElementById("latest-jobs");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/#latest-jobs");
                setTimeout(() => {
                  const el = document.getElementById("latest-jobs");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 300);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            Việc làm
          </li>

          <Link to="/companies/public" className="nav-link">Công ty</Link>
          <li>Cẩm nang nghề nghiệp</li>
        </ul>
      </div>

      <div className="navbar-right">
        {loading ? (
          <div className="user-name">Đang tải...</div>
        ) : user ? (
          <div className="user-menu" onClick={() => setShowDropdown(!showDropdown)}>
            <img src={user.avatar} alt="Avatar" className="user-avatar" />
            <span className="user-name">{user.name}</span>

            {showDropdown && (
              <div className="user-dropdown">
                {/* Header thông tin user */}
                <div className="dropdown-header">
                  <img src={user.avatar} alt="Avatar" className="dropdown-avatar" />
                  <div className="dropdown-info">
                    <p className="dropdown-name">{user.name}</p>
                   
<p className="verified-text">
  {verified ? "Tài khoản đã xác thực" : "Tài khoản chưa xác thực"} </p>

                    <p className="dropdown-email">ID {userIdDisplay} | {user.email}</p>
                  </div>
                </div>
                <hr />

                {/* Các mục menu */}
                <div className="dropdown-section">
                  <p className="section-title">Quản lý tìm việc</p>
                  <ul>
                    <li><Link to="/saved-jobs">Việc làm đã lưu</Link></li>
                    <li><Link to="/applied-jobs">Việc làm đã ứng tuyển</Link></li>
                    <li><Link to="/recommended-jobs">Gợi ý việc làm phù hợp với bạn</Link></li>
                  </ul>
                </div>

                <div className="dropdown-section">
                  <p className="section-title">Quản lý CV</p>
                  <ul>
                    <li><Link to="/my-cv">CV của tôi</Link></li>
                
                  </ul>
                </div>

                <div className="dropdown-section">
                  <p className="section-title">Cài đặt tài khoản</p>
                   <ul>
                    <li><Link to="/personal-settings">Cài đặt thông tin cá nhân</Link></li>
                
                  </ul>
                </div>

               

                {/* Nút đăng xuất */}
                <button className="logout-btn" onClick={handleLogout}>
                  <img src={logoutIcon} alt="Đăng xuất" className="logout-icon" />
                 <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">
              <button className="btn-outline">Đăng nhập</button>
            </Link>
            <Link to="/register">
              <button className="re-btn-primary">Đăng ký</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}