import React from "react";
import "./Navbar.css"
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
                <button className="btn-outline">Đăng nhập</button>
                <button className="btn-primary">Đăng ký</button>
            </div>
        </nav>
    );
}