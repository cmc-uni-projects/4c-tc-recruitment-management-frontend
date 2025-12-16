// components/ForgotPassword/ResetSuccessSection.jsx
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

export default function ResetSuccessSection() {
  return (
    <div className="login-section">
      <div className="login-banner">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1>SmartHire</h1>
      </div>



      

      <div className="login-box">
        <h2>Đặt lại mật khẩu thành công!</h2>
        <p>Bạn có thể đăng nhập với mật khẩu mới.</p>
        <Link to="/login">
          <button className="btn-login">Đi đến đăng nhập</button>
        </Link>
      </div>

      <footer className="login-footer">
        <p>© 2016. All Rights Reserved. TopCV Vietnam JSC.</p>
      </footer>
    </div>
  );
}