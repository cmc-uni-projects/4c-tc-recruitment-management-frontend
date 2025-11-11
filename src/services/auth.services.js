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
export const companyAPI = {
  getFeatured: () => api.get("/companies/featured"),
  getAllActive: () => api.get("/companies/public"),
  getById: (id) => api.get(`/companies/public/${id}`),
};