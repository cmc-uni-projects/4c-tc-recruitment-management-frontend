import { useFormik } from "formik";
import "./LoginSection.css";
import LoginSocial from "./LoginSocial";
import * as Yup from "yup";
import { login } from "../../services/auth.services";
import { useNavigate } from "react-router-dom";
import bannerImg from "../../assets/logo.jpg";
import { useState } from "react";

const formLoginSchema = Yup.object({
  password: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
});

export default function LoginSection() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ State hiển thị lỗi đỏ
  const [errorMessage, setErrorMessage] = useState("");

  const loginForm = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: formLoginSchema,
    onSubmit: async (values) => {
      try {
        const res = await login(values.email, values.password);

        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        // ✅ Xóa lỗi nếu có
        setErrorMessage("");

        alert("Đăng nhập thành công!");
        navigate("/");
      } catch {
        // ❌ Không alert nữa — hiển thị dưới form
        setErrorMessage("Sai email hoặc mật khẩu!");
      }
    },
  });

  return (
    <div className="login-section">
      {/* Banner */}
      <div className="login-banner">
        <img src={bannerImg} alt="Logo" className="logo" />
        <h1>SmartHire</h1>
        <p>
          SmartHire - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam
        </p>
      </div>

      {/* Form */}
      <div className="login-box">
        <h2>Chào mừng bạn đã quay trở lại</h2>
        <p>
          Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý tưởng
        </p>

        <form onSubmit={loginForm.handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              onChange={loginForm.handleChange}
              value={loginForm.values.email}
              placeholder="Email"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={loginForm.handleChange}
                value={loginForm.values.password}
                placeholder="Mật khẩu"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="form-options">
            <a href="/request-reset">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="btn-login">
            Đăng nhập
          </button>
        </form>

        {/* ✅ Hiển thị lỗi màu đỏ dưới nút Đăng nhập */}
        {errorMessage && (
          <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
        )}

        <LoginSocial />

        <p className="register-text">
          Bạn chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </p>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <p>
          Bạn gặp khó khăn khi tạo tài khoản? Vui lòng gọi số{" "}
          <strong>(024) 7107 6480</strong> (giờ hành chính).
        </p>
        <p>© 2016. All Rights Reserved. TopCV Vietnam JSC.</p>
      </footer>
    </div>
  );
}
