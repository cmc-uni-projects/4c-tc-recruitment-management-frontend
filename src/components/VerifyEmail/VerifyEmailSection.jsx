import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../../services/auth.services";
import "./VerifyEmail.css";

export default function VerifyEmailSection() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Không tìm thấy mã xác minh.");
      setLoading(false);
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus(res.data);
      })
      .catch((err) => {
        setError(err.response?.data || "Liên kết không hợp lệ hoặc đã hết hạn.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="login-section">
        <div className="login-box">
          <p>Đang kiểm tra liên kết xác minh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-section">
      <div className="login-banner">
        /logo.png
        <h1>SmartHire</h1>
      </div>

      <div className="login-box">
        {status ? (
          <>
            <h2>Xác minh thành công!</h2>
            <p>{status}</p>
            <Link to="/login">
              <button className="btn-login">Đi đến đăng nhập</button>
            </Link>
          </>
        ) : (
          <>
            <h2>Xác minh thất bại</h2>
            <p style={{ color: "#e74c3c" }}>{error}</p>
            <p className="register-text">
              <Link to="/register">Đăng ký lại</Link>
            </p>
          </>
        )}
      </div>
      

      <footer className="login-footer">
        <p>© 2016. All Rights Reserved. TopCV Vietnam JSC.</p>
      </footer>
    </div>
  );
}
