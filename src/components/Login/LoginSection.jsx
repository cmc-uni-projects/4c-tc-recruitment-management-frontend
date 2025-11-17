
import { useFormik } from "formik";
import "./LoginSection.css";
import LoginSocial from "./LoginSocial";
import * as Yup from "yup";
import { login } from "../../services/auth.services";
import { useNavigate, useParams } from "react-router-dom";
import bannerImg from "../../assets/logo.jpg";
import { useState, useEffect } from "react";


const formLoginSchema = Yup.object({
  password: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
});

export default function LoginSection() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [_loginStatus, setLoginStatus] = useState("");
  const [_statusType, setStatusType] = useState("");
 



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
        localStorage.setItem("userId", res.data.user.userId);

        
// Hiển thị thông báo
      setLoginStatus("Đăng nhập thành công!");
      setStatusType("success");

      // Lấy role từ user object
      const rawRole = res.data.user?.role;
      console.log("User role:", rawRole); // Debug
      const userRole = rawRole?.toUpperCase();

      
setTimeout(() => {
        if (userRole === "HR") {
          navigate("/hr");
        } else if (userRole === "CANDIDATE") {
          navigate("/");
        } else if (userRole === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/"); // fallback
        }
      }, 1500);
    } catch {
      setLoginStatus("Sai email hoặc mật khẩu!");
      setStatusType("error");

    }
  },
});




  return (
    <div className="login-section">
      {/* Banner */}
      <div className="login-banner">
        <img src="https://landingpage.live/wp-content/uploads/2023/04/Smart-Hire-01-copy.png" alt="Logo" className="logo" />
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
