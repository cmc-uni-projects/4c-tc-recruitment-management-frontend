
import { useFormik } from "formik";
import "./RegisterSection.css";
import LoginSocial from "../../components/Login/LoginSocial";
import * as Yup from "yup";
import { useState } from "react";
import { register } from "../../services/auth.services";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

/** Regex di động Việt Nam:
 *  - 0 + đầu số (3|5|7|8|9) + 8 số còn lại => 10 số (vd: 0912345678)
 *  - +84 + đầu số (3|5|7|8|9) + 8 số => (vd: +84912345678)
 */
const VN_MOBILE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const formRegisterSchema = Yup.object({
  fullname: Yup.string().required("Vui lòng nhập họ tên"),
  email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
  phone: Yup.string()
    // Loại khoảng trắng, '-', '.', '(', ')' trước khi kiểm tra
    .transform((value) => (value || "").trim().replace(/[\s\-.()]/g, ""))
    .matches(
      VN_MOBILE_REGEX,
      "Số điện thoại không hợp lệ. Ví dụ: 0912345678 hoặc +84912345678"
    )
    .required("Vui lòng nhập số điện thoại"),
  password: Yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
  verifypassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

export default function RegisterSection() {
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
      role: "CANDIDATE", // ✅ mặc định ứng viên; sẽ override bằng selectedRole
    },
    validationSchema: formRegisterSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const role = localStorage.getItem("selectedRole"); // ✅ lấy role từ popup (HR/CANDIDATE/...)
        if (!role) {
          Swal.fire({
            icon: "warning",
            title: "Thiếu thông tin",
            text: "Vui lòng chọn vai trò trước khi đăng ký.",
          });
          setLoading(false);
          return;
        }
        const payload = {
          fullName: values.fullname,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role, // ✅ gửi role lên backend
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
        <p>SmartHire - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam</p>
      </div>

      {/* Form */}
      <div className="login-box">
        <h2>Chào mừng bạn đến với SmartHire</h2>
        <p>Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý tưởng</p>

        <form onSubmit={RegisterForm.handleSubmit} className="register-form">
          <div className="form-group">
            <label>Họ và Tên</label>
            <input
              type="text"
              name="fullname"
              onChange={RegisterForm.handleChange}
              onBlur={RegisterForm.handleBlur}
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
              onBlur={RegisterForm.handleBlur}
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
              placeholder="VD: 0912345678 hoặc +84912345678"
              value={RegisterForm.values.phone}
              onBlur={RegisterForm.handleBlur}
              onChange={(e) => {
                const raw = e.target.value;
                // Giữ số và '+' ở đầu; loại ký tự khác
                const normalized = raw
                  .replace(/[^\d+]/g, "") // loại ký tự không phải số/+
                  .replace(/(?!^)\+/g, ""); // chỉ cho phép '+' ở đầu chuỗi
                RegisterForm.setFieldValue("phone", normalized);
              }}
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
                onBlur={RegisterForm.handleBlur}
                placeholder="Nhập mật khẩu"
                value={RegisterForm.values.password}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fa-sharp fa-regular fa-eye-slash password-icon"></i>
                ) : (
                  <i className="fa-sharp fa-regular fa-eye password-icon"></i>
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
                onBlur={RegisterForm.handleBlur}
                placeholder="Nhập lại mật khẩu"
                value={RegisterForm.values.verifypassword}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowVerifyPassword(!showVerifyPassword)}
              >
                {showVerifyPassword ? (
                  <i className="fa-sharp fa-regular fa-eye-slash password-icon"></i>
                ) : (
                  <i className="fa-sharp fa-regular fa-eye password-icon"></i>
                )}
              </button>
            </div>
            {RegisterForm.touched.verifypassword &&
              RegisterForm.errors.verifypassword && (
                <div className="error-text">{RegisterForm.errors.verifypassword}</div>
              )}
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

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
