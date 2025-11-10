import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import RequestResetPage from "./pages/ForgotPassword/RequestResetPage";
import ResetPasswordPage from "./pages/ForgotPassword/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmail/VerifyEmailPage";
import ResetSuccessPage from "./pages/ForgotPassword/ResetSuccessPage";
import HRPage from "./pages/HR/HRPage";
import AdminPage from "./pages/Admin/AdminPage";
import JobCategoryManagerPage from "./pages/Admin/JobCategoryManagerPage";
import ManageJobPage from "./pages/HR/ManageJobPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/request-reset" element={<RequestResetPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify" element={<VerifyEmailPage />} />
      <Route path="/reset-success" element={<ResetSuccessPage />} />
      <Route path="/hr-page" element={<HRPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/job-categories" element={<JobCategoryManagerPage />} />
      <Route path="/hr-page/jobs" element={<ManageJobPage />} />
    </Routes>
  );
}

export default App;
