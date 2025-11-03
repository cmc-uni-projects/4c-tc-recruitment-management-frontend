import { useFormik } from "formik";
import "./RegisterSection.css";
import LoginSocial from "../../components/Login/LoginSocial";
import * as Yup from 'yup';

const formRegisterSchema = Yup.object({
     password: Yup.string()
          .required('Required'),
     verifypassword: Yup.string()
          .required('Required'),
     email: Yup.string().email('Invalid email address').required('Required'),
     fullname: Yup.string().required('Required'),

});

export default function RegisterSection() {

     const RegisterForm = useFormik({
          initialValues: {
               fullname: "",
               email: "",
               password: "",
               verifypassword: ""
          },
          validationSchema: formRegisterSchema,
          onSubmit: (values => {
               console.log(values)
          })
     })


     return (
          <div className="login-section">
               {/* Banner */}
               <div className="login-banner">
                    <img src="/logo.png" alt="Logo" className="logo" />
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
                              <input type="fullname" name="fullname" onChange={RegisterForm.handleChange} placeholder="Nhập họ tên đầy đủ" required />
                         </div>
                         <div className="form-group">
                              <label>Email</label>
                              <input type="email" name="email" onChange={RegisterForm.handleChange} placeholder=" Nhập Email" required />
                         </div>
                         <div className="form-group">
                              <label>Mật khẩu</label>
                              <input type="password" name="password" onChange={RegisterForm.handleChange} placeholder="Nhập mật khẩu" required />
                         </div>
                         <div className="form-group">
                              <label>Xác nhận Mật khẩu</label>
                              <input type="password" name="password" onChange={RegisterForm.handleChange} placeholder="Nhập lại mật khẩu" required />
                         </div>

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