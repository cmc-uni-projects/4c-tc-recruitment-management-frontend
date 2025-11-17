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

  // 9. Lấy chi tiết job theo ID
  getJobDetail: (id) => api.get(`/jobs/${id}`),
};
// 📦 Company API
export const companyAPI = {
  getFeatured: () => api.get("/companies/featured"),
  getAllActive: () => api.get("/companies/public"),
  getById: (id) => api.get(`/companies/public/${id}`),
  getAll: () => api.get("/companies"),
  create: (data) => api.post("/companies", data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

export const employerAPI = {
  // 1. HR: Tạo hồ sơ Employer (lần đầu)
  createEmployer: (data) =>
    api.post("/employers", data),

  // 2. HR: Cập nhật hồ sơ Employer
  updateEmployer: (employerId, data) =>
    api.put(`/employers/${employerId}`, data),

  // 3. HR/ADMIN: Lấy thông tin Employer theo ID
  getEmployerById: (employerId) =>
    api.get(`/employers/${employerId}`),

  // 4. HR: Upload Giấy phép kinh doanh (GPKD) - FormData
  uploadBusinessRegistration: (employerId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/employers/${employerId}/business-registration`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 5. HR: Gửi yêu cầu duyệt hồ sơ (sau khi đã upload GPKD)
  requestVerification: (employerId) =>
    api.post(`/employers/${employerId}/request-verification`),

  // 6. ADMIN: Duyệt hồ sơ Employer (badge xanh hiện ngay!)
  approveVerification: (employerId) =>
    api.post(`/employers/${employerId}/approve-verification`),

  // 7. ADMIN: Từ chối duyệt (có thể kèm lý do)
  rejectVerification: (employerId, reason = "") =>
    api.post(`/employers/${employerId}/reject-verification`, { reason }),
};

// BONUS: Tiện nhất cho HR - Lấy hồ sơ Employer của chính mình (nếu bạn muốn thêm sau)
export const getMyEmployer = () => api.get("/employers/me"); // Có thể thêm sau nếu cần