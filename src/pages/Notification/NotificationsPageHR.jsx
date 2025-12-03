// src/pages/Notification/NotificationsPageHR.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { companyAPI } from "../../services/auth.services";
import Swal from "sweetalert2";
import "./NotificationsPageHR.css";

const NotificationsPageHR = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.id || payload.sub;
    } catch {
      return null;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) return setNotifications([]);

      const res = await companyAPI.getAll();
      const filtered = (res.data || [])
        .filter(c => 
          (String(c.createdBy) === String(userId) || c.hrUserId === userId) &&
          ["PENDING", "APPROVE", "REJECT"].includes(c.verify)
        )
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

      setNotifications(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCompany = (company) => {
    localStorage.setItem("selectedCompany", JSON.stringify(company));
    localStorage.setItem("selectedCompanyId", company.companyId);
    localStorage.removeItem("pendingCompanyId");

    Swal.fire({
      icon: "success",
      title: "Đã chọn công ty!",
      text: company.name,
      toast: true,
      position: "top-end",
      timer: 2000,
      showConfirmButton: false,
      background: "#10b981",
      color: "white",
    }).then(() => navigate("/hr/profile"));
  };

  if (loading) {
    return (
      <div className="noti-loading-x">
        <div className="spinner-x"></div>
        <p>Đang tải thông báo...</p>
      </div>
    );
  }

  return (
    <div className="hr-notifications-x">
      <header className="noti-header-x">
        <h1>Thông báo hệ thống</h1>
        <p>Theo dõi trạng thái duyệt công ty của bạn</p>
      </header>

      <main className="noti-main-x">
        {notifications.length === 0 ? (
          <div className="noti-empty-x">
            <div className="empty-icon">NotificationImportant</div>
            <h2>Chưa có thông báo</h2>
            <p>Tất cả yêu cầu đã được xử lý hoặc bạn chưa gửi yêu cầu nào.</p>
            <button 
              className="btn-primary-x"
              onClick={() => navigate("/hr/profile/company")}
            >
              Tạo công ty mới
            </button>
          </div>
        ) : (
          <div className="noti-grid-x">
            {notifications.map((company) => (
              <article
                key={company.companyId}
                className={`noti-item-x ${company.verify.toLowerCase()} ${company.verify === "APPROVE" ? "clickable" : ""}`}
                onClick={() => company.verify === "APPROVE" && handleSelectCompany(company)}
              >
                <div className="noti-status-x">
                  <span className="status-dot"></span>
                  <span className="status-text">
                    {company.verify === "APPROVE" && "Đã duyệt"}
                    {company.verify === "REJECT" && "Bị từ chối"}
                    {company.verify === "PENDING" && "Đang xử lý"}
                  </span>
                </div>

                <div className="noti-body-x">
                  <h3>{company.name}</h3>
                  <div className="meta-x">
                    <span>MST: {company.taxCode || "—"}</span>
                    <span>•</span>
                    <span>{company.city || "Chưa xác định"}</span>
                  </div>

                  {company.verify === "REJECT" && company.rejectReason && (
                    <div className="reject-reason-x">
                      <strong>Lý do:</strong> {company.rejectReason}
                    </div>
                  )}

                  {company.verify === "PENDING" && (
                    <div className="hint-x pending">
                      Đang được xem xét • Dự kiến 1-3 ngày làm việc
                    </div>
                  )}

                  {company.verify === "APPROVE" && (
                    <div className="hint-x success">
                      Chúc mừng! Click để bắt đầu sử dụng
                    </div>
                  )}
                </div>

                {company.verify === "APPROVE" && (
                  <div className="noti-arrow-x"></div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPageHR;