// components/ForgotPassword/RequestResetSection.jsx
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../../services/auth.services";
import "./ForgotPassword.css";

const validationSchema = Yup.object({
  email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
});

export default function RequestResetSection() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setMessage("");
      setError("");
      try {
        await requestPasswordReset(values.email);
        setMessage("Đã gửi liên kết đặt lại mật khẩu đến email của bạn!");
        setTimeout(() => navigate("/login"), 4000);
      } catch (err) {
        setError(err.response?.data || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="login-section">
      <div className="login-banner">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1>SmartHire</h1>
        <p>SmartHire - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam</p>
      </div>

      <div className="login-box">
        <h2>Quên mật khẩu?</h2>
        <p>Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>

        <form onSubmit={formik.handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="error-text">{formik.errors.email}</div>
            ) : null}
          </div>

          {message && <div className="success-text">{message}</div>}
          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi liên kết"}
          </button>
        </form>

        <p className="register-text">
          <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </div>

      <footer className="login-footer">
        <p>
          Bạn gặp khó khăn? Gọi <strong>(024) 7107 6480</strong> (giờ hành chính).
        </p>
        <p>© 2016. All Rights Reserved. TopCV Vietnam JSC.</p>
      </footer>
    </div>
  );
}