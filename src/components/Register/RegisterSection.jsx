

import { useFormik } from "formik";
import "./RegisterSection.css";
import LoginSocial from "../../components/Login/LoginSocial";
import * as Yup from "yup";
import { useState } from "react";
import { register } from "../../services/auth.services";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const RegisterForm = useFormik({
    initialValues: {
      fullname: "",
      email: "",
      phone: "",
      password: "",
      verifypassword: "",
    },
    validationSchema: formRegisterSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          fullName: values.fullname,
          email: values.email,
          phone: values.phone,
          password: values.password,
        };
        const response = await register(payload);
        console.log("✅ Server response:", response.data);

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

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
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
