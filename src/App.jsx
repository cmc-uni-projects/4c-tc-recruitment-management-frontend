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
import AboutPage from "./pages/About/AboutPage";
import BlogDetail from "./pages/Blog/BlogDetail";
import CompanyDetailPage from "./pages/Company/CompanyDetailPage";
import JobDetail from "./components/Job/JobDetail";
import SearchPage from "./pages/Search/SearchPage";
import NotificationsPage from "./pages/Notification/NotificationsPage";
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
      <Route path="/hr" element={<HRPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="/admin/job-categories"
        element={<JobCategoryManagerPage />}
      />
      <Route path="/hr/jobs" element={<ManageJobPage />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/company/public/:id" element={<CompanyDetailPage />} />
      <Route path="/jobs/:jobId" element={<JobDetail />} />
      <Route path="/search-results" element={<SearchPage />} />
      <Route path="/admin/notifications" element={<NotificationsPage />} />
    </Routes>
  );
}

export default App;
