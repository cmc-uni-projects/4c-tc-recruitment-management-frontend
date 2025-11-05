import { useFormik } from "formik";
import "./RegisterSection.css";
import LoginSocial from "../../components/Login/LoginSocial";
import * as Yup from "yup";
import { useState } from "react";
import { register } from "../../services/auth.services";
import { useNavigate } from "react-router-dom";

const formRegisterSchema = Yup.object({
  fullname: Yup.string().required("Vui lòng nhập họ tên"),
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  password: Yup.string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
  verifypassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

export default function RegisterSection() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const RegisterForm = useFormik({
    initialValues: {
      fullname: "",
      email: "",
      password: "",
      verifypassword: "",
    },
    validationSchema: formRegisterSchema,
    onSubmit: async (values) => {
      try {
        setError("");
        setMessage("");
        const payload = {
          fullName: values.fullname, // ⚡ tên field đúng theo DTO
          email: values.email,
          phone: values.phone,
          password: values.password, // ⚡ phải là 'password' chứ không phải 'matKhau'
        };
        const response = await register(payload);
        console.log("✅ Server response:", response.data);
        setMessage(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
        );
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setError(err.response?.data || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    },
  });

  return (
    <div className="login-section">
      {/* Banner */}
      <div className="login-banner">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1>SmartHire</h1>
        <p>
          SmartHire - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại
          Việt Nam
        </p>
      </div>
      {/* Form */}
      <div className="login-box">
        <h2>Chào mừng bạn đến với SmartHire</h2>
        <p>
          Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý
          tưởng
        </p>
        <form onSubmit={RegisterForm.handleSubmit} className="register-form">
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
            <input
              type="password"
              name="password"
              onChange={RegisterForm.handleChange}
              placeholder="Nhập mật khẩu"
              value={RegisterForm.values.password}
            />
            {RegisterForm.touched.password && RegisterForm.errors.password && (
              <div className="error-text">{RegisterForm.errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label>Xác nhận Mật khẩu</label>
            <input
              type="password"
              name="verifypassword"
              onChange={RegisterForm.handleChange}
              placeholder="Nhập lại mật khẩu"
              value={RegisterForm.values.verifypassword}
            />
            {RegisterForm.touched.verifypassword &&
              RegisterForm.errors.verifypassword && (
                <div className="error-text">
                  {RegisterForm.errors.verifypassword}
                </div>
              )}
          </div>

          {message && <div className="success-text">{message}</div>}
          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="btn-login">
            Đăng kí
          </button>
        </form>
        <LoginSocial />
        <p className="register-text">
          Bạn đã có tài khoản? <a href="/login">Đăng Nhập ngay</a>
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
