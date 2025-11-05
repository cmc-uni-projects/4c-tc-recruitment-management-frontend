import { useFormik } from "formik";
import "./LoginSection.css";
import LoginSocial from "./LoginSocial";
 import * as Yup from 'yup';
 import bannerImg from '../../assets/logo.jpg';
 


const formLoginSchema =  Yup.object({
       password: Yup.string()
         .required('Required'),
       email: Yup.string().email('Invalid email address').required('Required'),
     });

export default function LoginSection() {

     const loginForm = useFormik({
          initialValues: {
               email: "",
               password: ""
          },
          validationSchema: formLoginSchema,
          onSubmit: (values => {
               console.log(values)
          })
     })


     return (
          <div className="login-section">
               {/* Banner */}
               <div className="login-banner">
                   
                    <h1>SmartHire</h1>
                    <p>SmartHire - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam</p>
               </div>
               {/* Form */}
               <div className="login-box">
                    <h2>Chào mừng bạn đã quay trở lại</h2>
                    <p>Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý tưởng</p>
                    <form onSubmit={loginForm.handleSubmit} className="login-form">
                         <div className="form-group">
                              <label>Email</label>
                              <input type="email" name="email" onChange={loginForm.handleChange} placeholder="Email" required />
                         </div>
                         <div className="form-group">
                              <label>Mật khẩu</label>
                              <input type="password"  name="password" onChange={loginForm.handleChange} placeholder="Mật khẩu" required />
                         </div>
                         <div className="form-options">
                              <a href="/request-reset">Quên mật khẩu?</a>
                         </div>
                         <button type="submit" className="btn-login">
                              Đăng nhập
                         </button>
                    </form>
                    <LoginSocial/>
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