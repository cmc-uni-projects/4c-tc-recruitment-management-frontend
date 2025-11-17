import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PersonalSettings.css";

export default function PersonalSettings() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFullName(response.data.fullName || "");
        setPhone(response.data.phone || "");
        setEmail(response.data.email || "");
      } catch (err) {
        console.error("Lỗi lấy thông tin người dùng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token, userId]);

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:8080/users/${userId}`,
        { fullName, phone, email }, // gửi đầy đủ thông tin
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("✅ Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật thông tin:", err.response?.data || err.message);
      alert(err.response?.data || "❌ Có lỗi xảy ra khi cập nhật thông tin.");
    }
  };

  if (loading) return <div className="settings-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="settings-layout">
      {/* Cột trái */}
      <div className="settings-left">
        <h1 className="page-title">Cài đặt thông tin cá nhân</h1>
        <div className="settings-form">
          <label>Họ và tên *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
          />

          <label>Số điện thoại</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
          />

          <label>Email</label>
          <input type="email" value={email} readOnly style={{ backgroundColor: "#f5f5f5" }} />

          <button className="btn-save" onClick={handleSave}>Lưu</button>
        </div>
      </div>

      
    </div>
  );
}