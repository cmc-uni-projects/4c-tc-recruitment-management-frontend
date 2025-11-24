import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import RequestResetPage from "./pages/ForgotPassword/RequestResetPage";
import ResetPasswordPage from "./pages/ForgotPassword/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmail/VerifyEmailPage";
import ResetSuccessPage from "./pages/ForgotPassword/ResetSuccessPage";
import AboutPage from "./pages/About/AboutPage";
import BlogDetail from "./pages/Blog/BlogDetail";
import CompanyDetailPage from "./pages/Company/CompanyDetailPage";
import JobDetail from "./components/Job/JobDetail";
import SearchPage from "./pages/Search/SearchPage";
import CompanyListPage from "./pages/Company/CompanyListPage";

// Protected Pages
import HRPage from "./pages/HR/HRPage";
import AdminPage from "./pages/Admin/AdminPage";
import JobCategoryManagerPage from "./pages/Admin/JobCategoryManagerPage";
import ManageJobPage from "./pages/HR/ManageJobPage";
import NotificationsPage from "./pages/Notification/NotificationsPage";
import CompanyManagerPage from "./pages/Admin/CompanyManagerPage";

import SavedJobsPage from "./pages/SavedJobs/SavedJobsPage";
import AppliedJobsPage from "./pages/AppliedJobs/AppliedJobsPage";
import MyCVPage from "./pages/MyCV/MyCVPage";
import PersonalSettingsPage from "./pages/PersonalSettings/PersonalSettingsPage";
import CreateCVPage from "./pages/MyCV/CreateCVPage";
import UploadCVPage from "./pages/MyCV/UploadCVPage";
import CVBuilderPage from "./pages/MyCV/CVBuilderPage";
import EditCVPage from "./pages/MyCV/EditCVPage";

import HRProfilePage from "./pages/HR/HRProfilePage";
import ProfileLayout from "./components/HR/ProfileLayout";
import PersonalInfo from "./components/HR/PersonalInfo";
import CompanyInfo from "./components/HR/CompanyInfo";
import BusinessRegistration from "./components/HR/BusinessRegistration";

// Component bảo vệ
import ProtectedRoute, { ForbiddenPage } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* ============================= PUBLIC ROUTES ============================= */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/request-reset" element={<RequestResetPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify" element={<VerifyEmailPage />} />
      <Route path="/reset-success" element={<ResetSuccessPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/company/public/:id" element={<CompanyDetailPage />} />
      <Route path="/jobs/:jobId" element={<JobDetail />} />
      <Route path="/search-results" element={<SearchPage />} />
      <Route path="/companies/public" element={<CompanyListPage />} />

      {/* Trang lỗi 403 */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* ============================= ADMIN ROUTES - Chỉ ADMIN ============================= */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/job-categories" element={<JobCategoryManagerPage />} />
        <Route path="/admin/companies" element={<CompanyManagerPage />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
      </Route>

      {/* ============================= HR ROUTES - HR + ADMIN ============================= */}
      <Route element={<ProtectedRoute allowedRoles={["HR", "ADMIN"]} />}>
        <Route path="/hr" element={<HRPage />} />
        <Route path="/hr/jobs" element={<ManageJobPage />} />

        {/* HR Profile (có layout lồng nhau) */}
        <Route path="/hr/profile" element={<HRProfilePage />}>
          <Route element={<ProfileLayout />}>
            <Route index element={<PersonalInfo />} />
            <Route path="company" element={<CompanyInfo />} />
            <Route path="business-registration" element={<BusinessRegistration />} />
          </Route>
        </Route>

        {/* Các route /hr/profile/* khác nếu có */}
        <Route path="/hr/profile/*" element={<HRProfilePage />} />
      </Route>

      {/* ============================= CANDIDATE ROUTES - CANDIDATE + ADMIN ============================= */}
      <Route element={<ProtectedRoute allowedRoles={["CANDIDATE", "ADMIN"]} />}>
        <Route path="/saved-jobs" element={<SavedJobsPage />} />
        <Route path="/applied-jobs" element={<AppliedJobsPage />} />
        <Route path="/my-cv" element={<MyCVPage />} />
        <Route path="/personal-settings" element={<PersonalSettingsPage />} />
      </Route>
      <Route path="/my-cv/create" element={<CreateCVPage />} />
      <Route path="/my-cv/upload" element={<UploadCVPage />} />
      <Route path="/my-cv/builder" element={<CVBuilderPage />} />
      <Route path="/my-cv/edit/:cvId" element={<EditCVPage />} />
    </Routes>
  );
}

export default App;