import "./Navbar.css"

import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="logo">
                    <span className="top">Smart</span>
                    <span className="cv">Hire</span>
                </div>
                <ul className="nav-links">
                    <li>Việc làm</li>
                    <li>Công ty</li>
                    <li>Cẩm nang nghề nghiệp</li>
                    <li>TopCV Pro</li>
                </ul>
            </div>
            <div className="navbar-right">
                <Link to="/login">
                    <button className="btn-outline">Đăng nhập</button>
                </Link>
                <Link to="/register">
                    <button className="btn-primary">Đăng ký</button>
                </Link>

            </div>
        </nav>
    );
}