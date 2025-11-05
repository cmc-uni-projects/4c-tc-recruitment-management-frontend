// components/ForgotPassword/ResetPasswordSection.jsx
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSearchParams, useNavigate } from "react-router-dom";
import { validateResetToken, resetPassword } from "../../services/auth.services";
import "./ForgotPassword.css";

const validationSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "Mật khẩu ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

export default function ResetPasswordSection() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Không tìm thấy mã đặt lại.");
      setValidating(false);
      return;
    }

    validateResetToken(token)
      .then((res) => {
        if (res.data === "Token hợp lệ") {
          setIsValidToken(true);
        } else {
          setError("Liên kết không hợp lệ hoặc đã hết hạn.");
        }
      })
      .catch(() => {
        setError("Liên kết không hợp lệ hoặc đã hết hạn.");
      })
      .finally(() => setValidating(false));
  }, [token]);

  const formik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setMessage("");
      setError("");
      try {
        await resetPassword(token, values.newPassword);
        setMessage("Đặt lại mật khẩu thành công! Đang chuyển về đăng nhập...");
        setTimeout(() => navigate("/reset-success"), 2000);
      } catch (err) {
        setError(err.response?.data || "Đã có lỗi xảy ra.");
      }
    },
  });

  if (validating) {
    return (
      <div className="login-section">
        <div className="login-box">
          <p>Đang kiểm tra liên kết...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="login-section">
        <div className="login-box">
          <h2>Liên kết không hợp lệ</h2>
          <p style={{ color: "#e74c3c" }}>{error}</p>
          <p className="register-text">
            <a href="/request-reset">Gửi lại yêu cầu</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-section">
      <div className="login-banner">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1>SmartHire</h1>
      </div>

      <div className="login-box">
        <h2>Đặt lại mật khẩu</h2>
        <p>Nhập mật khẩu mới cho tài khoản của bạn</p>

        <form onSubmit={formik.handleSubmit} className="login-form">
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Ít nhất 6 ký tự"
              {...formik.getFieldProps("newPassword")}
            />
            {formik.touched.newPassword && formik.errors.newPassword ? (
              <div className="error-text">{formik.errors.newPassword}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              {...formik.getFieldProps("confirmPassword")}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="error-text">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>

          {message && <div className="success-text">{message}</div>}
          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="btn-login">
            Đặt lại mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}