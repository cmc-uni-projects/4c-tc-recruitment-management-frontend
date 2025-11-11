// src/services/auth.services.js
import api from "../configs/axios.config.js";

// 🔹 Đăng ký tài khoản
export const register = (data) => api.post("/users/register", data);

// 🔹 Đăng nhập (trả về token)
export const login = (email, password) =>
  api.post("/users/login", { email, password });

// 🔹 Yêu cầu đặt lại mật khẩu (gửi email reset)
export const requestPasswordReset = (email) =>
  api.post("/users/request-reset", { email });

// 🔹 Xác thực token đặt lại mật khẩu
export const validateResetToken = (token) =>
  api.get("/users/validate-reset-token", { params: { token } });

// 🔹 Đặt lại mật khẩu
export const resetPassword = (token, newPassword) =>
  api.post("/users/reset-password", { token, newPassword });

// 🔹 Xác minh tài khoản qua email
export const verifyEmail = (token) =>
  api.get("/users/verify", { params: { token } });

// 🔹 Đăng xuất
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
// THÊM MỚI: API Job Category (dùng trong JobCategoryManager)
export const jobCategoryAPI = {
  getAll: () => api.get("/job-categories"),
  getPopular: () => api.get("/job-categories/popular"),
  create: (data) => api.post("/job-categories", data),
  update: (id, data) => api.put(`/job-categories/${id}`, data),
  delete: (id) => api.delete(`/job-categories/${id}`),
};
// 📦 Job API
export const jobAPI = {
  // 1. Lấy danh sách job đã được duyệt (cho ứng viên)
  getApprovedJobs: () => api.get("/jobs/approved"),
 
  // 2. Lấy tất cả job (cho HR, Admin)
  getAllJobs: () => api.get("/jobs"),
 
  // 3. HR tạo job mới (chờ duyệt)
  createJob: (data) => api.post("/jobs", data),
 
  // 4. HR cập nhật job (chờ duyệt lại)
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
 
  // 5. HR xóa job
  deleteJob: (id) => api.delete(`/jobs/${id}`),
 
  // 6. Admin duyệt job
  approveJob: (id) => api.put(`/jobs/${id}/approve`),
 
  // 7. Lấy 10 job mới nhất
  getLatestJobs: () => api.get("/jobs/latest"),
 
  // 8. Tìm kiếm job theo từ khóa, vị trí, ngành nghề
  searchJobs: (params) => api.get("/jobs/search", { params }),
};
export const companyAPI = {
  getFeatured: () => api.get("/companies/featured"),
  getAllActive: () => api.get("/companies/public"),
  getById: (id) => api.get(`/companies/public/${id}`),
}