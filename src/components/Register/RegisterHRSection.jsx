// src/components/RegisterHRSection.jsx
import { useFormik } from "formik";
import "./RegisterHRSection.css";
import * as Yup from "yup";
import { useState } from "react";
import { register } from "../../services/auth.services";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Schema xác thực cho form đăng ký
const formRegisterSchema = Yup.object({
  fullname: Yup.string().required("Vui lòng nhập họ tên"),
  email: Yup.string()
    .email("Email không hợp lệ")
    .matches(
      /^[a-zA-Z0-9._%+-]+@(?!.*(company|companydomain|org))[^@]+$/, // Regex kiểm tra email công ty
      "Cảnh báo: Bạn đang sử dụng email cá nhân, khuyến khích dùng email công ty."
    )
    .required("Vui lòng nhập email"),
  password: Yup.string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
  verifypassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

export default function RegisterHRSection() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const navigate = useNavigate();

  const RegisterForm = useFormik({
    initialValues: {
      fullname: "",
      email: "",
      phone: "",
      password: "",
      verifypassword: "",
      role: "HR", // Đặt mặc định là HR
    },
    validationSchema: formRegisterSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Thêm role vào payload
        const payload = {
          fullName: values.fullname,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: values.role, // Gửi vai trò HR
        };
        const response = await register(payload); // Đăng ký với cùng một endpoint
        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: "Vui lòng kiểm tra email để xác minh tài khoản.",
          timer: 3000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
          text: err.response?.data || "Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="login-section">
      {/* Banner */}
      <div className="login-banner">
        <h1>SmartHire</h1>
        <p>SmartHire - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam</p>
      </div>

      {/* Form */}
      <div className="login-box">
        <h2>Đăng ký Nhà Tuyển Dụng</h2>
        <form onSubmit={RegisterForm.handleSubmit} className="register-form">
          {/* Các trường thông tin đăng ký */}
          <div className="form-group">
            <label>Họ và Tên</label>
            <input
              type="text"
              name="fullname"
              onChange={RegisterForm.handleChange}
              placeholder="Nhập họ tên đầy đủ"
              value={RegisterForm.values.fullname}
            />
            {RegisterForm.touched.fullname && RegisterForm.errors.fullname && (
              <div className="error-text">{RegisterForm.errors.fullname}</div>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              onChange={RegisterForm.handleChange}
              placeholder="Nhập Email"
              value={RegisterForm.values.email}
            />
            <div className="warning-text">
                    Khuyến cáo sử dụng mail cá nhân
            </div>
            {RegisterForm.touched.email && RegisterForm.errors.email && (
              <div className="error-text">{RegisterForm.errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              onChange={RegisterForm.handleChange}
              placeholder="Nhập số điện thoại"
              value={RegisterForm.values.phone}
            />
            {RegisterForm.touched.phone && RegisterForm.errors.phone && (
              <div className="error-text">{RegisterForm.errors.phone}</div>
            )}
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={RegisterForm.handleChange}
                placeholder="Nhập mật khẩu"
                value={RegisterForm.values.password}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
              >
                {showPassword ? (
                  <i className="fa-sharp fa-regular fa-eye-slash password-icon"></i> // Mắt có gạch chéo
                ) : (
                  <i className="fa-sharp fa-regular fa-eye password-icon"></i> // Mắt bình thường
                )}
              </button>
            </div>
            {RegisterForm.touched.password && RegisterForm.errors.password && (
              <div className="error-text">{RegisterForm.errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label>Xác nhận Mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showVerifyPassword ? "text" : "password"}
                name="verifypassword"
                onChange={RegisterForm.handleChange}
                placeholder="Nhập lại mật khẩu"
                value={RegisterForm.values.verifypassword}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowVerifyPassword(!showVerifyPassword)} // Toggle showVerifyPassword state
              >
                {showVerifyPassword ? (
                  <i className="fa-sharp fa-regular fa-eye-slash password-icon"></i> // Mắt có gạch chéo
                ) : (
                  <i className="fa-sharp fa-regular fa-eye password-icon"></i> // Mắt bình thường
                )}
              </button>
            </div>
            {RegisterForm.touched.verifypassword && RegisterForm.errors.verifypassword && (
              <div className="error-text">{RegisterForm.errors.verifypassword}</div>
            )}
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
}
