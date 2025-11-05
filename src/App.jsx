// App.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import RequestResetPage from "./pages/ForgotPassword/RequestResetPage";
import ResetPasswordPage from "./pages/ForgotPassword/ResetPasswordPage";
import ResetSuccessPage from "./pages/ForgotPassword/ResetSuccessPage";
import VerifyEmailPage from "./pages/VerifyEmail/VerifyEmailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/request-reset" element={<RequestResetPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-success" element={<ResetSuccessPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
    </Routes>
  );
}

export default App;