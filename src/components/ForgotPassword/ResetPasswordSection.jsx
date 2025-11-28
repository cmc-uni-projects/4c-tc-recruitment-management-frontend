
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSearchParams, useNavigate } from "react-router-dom";
import { validateResetToken, resetPassword } from "../../services/auth.services";
import "./ForgotPassword.css";
import Swal from "sweetalert2";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Không tìm thấy mã đặt lại.");
      setValidating(false);
      return;
    }

    validateResetToken(token)
      .then((res) => {
        if (
          res.data === "Token hợp lệ" ||
          res.data?.message === "Token hợp lệ" ||
          res.data?.valid === true
        ) {
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
        Swal.fire("Thành công", "Đặt lại mật khẩu thành công! Đang chuyển về đăng nhập...", "success");
        setTimeout(() => navigate("/reset-success"), 2000);
      } catch (err) {
        setError(err.response?.data || "Đã có lỗi xảy ra.");
        Swal.fire("Lỗi", err.response?.data || "Đã có lỗi xảy ra.", "error");
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
        /logo.png
        <h1>SmartHire</h1>
      </div>

      <div className="login-box">
        <h2>Đặt lại mật khẩu</h2>
        <p>Nhập mật khẩu mới cho tài khoản của bạn</p>

        <form onSubmit={formik.handleSubmit} className="login-form">
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Ít nhất 6 ký tự"
                {...formik.getFieldProps("newPassword")}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <div className="error-text">{formik.errors.newPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                {...formik.getFieldProps("confirmPassword")}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="error-text">{formik.errors.confirmPassword}</div>
            )}
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
