import "./HRSection.css";
const HRSection = () => {
 return (
<div className="hr-page">
     {/* Header */}
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
<div className="avatar">
<img src="https://via.placeholder.com/40" alt="Avatar" />
</div>
</div>
</header>
     {/* Layout */}
<div className="hr-layout">
       {/* Sidebar */}
<aside className="hr-sidebar">
<div className="sidebar-user">
<img src="https://via.placeholder.com/50" alt="User Avatar" />
<div>
<p className="sidebar-name">Phạm Khánh Linh</p>
<p className="sidebar-role">Employer</p>
</div>
</div>
<ul className="sidebar-menu">
<li className="active">Bảng tin</li>
<li>TopCV Insights</li>
<li>TopCV Rewards</li>
<li>Bộ câu hỏi</li>
<li>TopCV AI - Đề xuất</li>
<li>Chiến dịch tuyển dụng</li>
<li>Quản lý tin tuyển dụng</li>
<li>Quản lý yêu cầu kết nối CV</li>
<li>Báo cáo tuyển dụng</li>
<li>Mua dịch vụ</li>
</ul>
</aside>
       {/* Main Content */}
<main className="hr-content">
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
<img src="https://via.placeholder.com/60" alt="Đăng tin" />
<p>Đăng tin tuyển dụng</p>
<button>Thử ngay</button>
</div>
<div className="explore-item">
<img src="https://via.placeholder.com/60" alt="Tìm CV" />
<p>Tìm kiếm CV</p>
<button>Thử ngay</button>
</div>
<div className="explore-item">
<img src="https://via.placeholder.com/60" alt="Mua dịch vụ" />
<p>Mua dịch vụ</p>
<button>Thử ngay</button>
</div>
</div>
</div>
         {/* CV Suggestion */}
<div className="card cv-card">
<h3>CV đề xuất</h3>
<div className="cv-content">
<img src="https://via.placeholder.com/120" alt="CV Icon" />
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
</main>
</div>
</div>
 );
};
export default HRSection;