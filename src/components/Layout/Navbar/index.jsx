import { FaSearch, FaRegBookmark, FaClipboardList, FaRegCheckCircle } from "react-icons/fa";
import { MdBusiness, MdStars } from "react-icons/md";

import avatar from "../../../assets/hr/avatar.png";
import logoutIcon from "../../../assets/hr/logout.png";
import "./Navbar.css";

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          name: response.data.fullName || response.data.name || "Người dùng",
          email: response.data.email,
        });
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

        {/* Menu với dropdown cho Việc làm */}
        <ul className="nav-links">

<li
  className="dropdown"
  onMouseEnter={() => setShowDropdown(true)}
  onMouseLeave={() => setShowDropdown(false)}
>
 Việc làm {showDropdown ? <FaChevronUp className="arrow-icon" /> : <FaChevronDown className="arrow-icon" />}            <div className="dropdown-menu">
              {/* Cột 1 */}
              <div className="dropdown-section">
                <h4>VIỆC LÀM</h4>
                <ul>
                  <li><FaSearch /> Tìm việc làm</li>
                  <li><FaRegBookmark /> Việc làm đã lưu</li>
                  <li><FaClipboardList /> Việc làm đã ứng tuyển</li>
                  <li><FaRegCheckCircle /> Việc làm phù hợp</li>
                </ul>

                <h4>CÔNG TY</h4>
                <ul>
                  <li><MdBusiness /> Danh sách công ty</li>
                  <li><MdStars /> Top công ty</li>
                </ul>
              </div>

              {/* Cột 2 */}
              <div className="dropdown-section">
                <h4>VIỆC LÀM THEO VỊ TRÍ</h4>
                <ul>
                  <li>Việc làm Nhân viên kinh doanh</li>
                  <li>Việc làm Kế toán</li>
                  <li>Việc làm Marketing</li>
                  <li>Việc làm Hành chính nhân sự</li>
                  <li>Việc làm Chăm sóc khách hàng</li>
                  <li>Việc làm Ngân hàng</li>
                  <li>Việc làm IT</li>
                </ul>
              </div>

              {/* Cột 3 */}
              <div className="dropdown-section">
                <h4>VIỆC LÀM THEO VỊ TRÍ</h4>
                <ul>
                  <li>Việc làm Lao động phổ thông</li>
                  <li>Việc làm Senior</li>
                  <li>Việc làm Kỹ sư xây dựng</li>
                  <li>Việc làm Thiết kế đồ họa</li>
                  <li>Việc làm Bất động sản</li>
                  <li>Việc làm Giáo dục</li>
                  <li>Việc làm telesales</li>
                </ul>
              </div>
            </div>
          </li>
          <li>Tạo CV</li>
          <li>Công cụ</li>
          <li>Cẩm nang nghề nghiệp</li>
          <li>TopCV Pro</li>
        </ul>
      </div>

      {/* User menu bên phải */}
      <div className="navbar-right">
        {loading ? (
          <div className="user-name">Đang tải...</div>
        ) : user ? (
          <div className="user-menu" onClick={() => setShowDropdown(!showDropdown)}>
            <img src={avatar} alt="Avatar" className="user-avatar" />
            <span className="user-name">{user.name}</span>

            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-item" onClick={handleLogout}>
                  <img src={logoutIcon} alt="Đăng xuất" className="logout-icon" />
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