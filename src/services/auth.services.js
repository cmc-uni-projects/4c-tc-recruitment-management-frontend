// src/services/auth.services.js
import api from "../configs/axios.config.js";

// Đăng ký tài khoản
export const register = (data) => api.post("/users/register", data);

// Đăng nhập (trả về token)
export const login = (email, password) =>
  api.post("/users/login", { email, password });

// Yêu cầu đặt lại mật khẩu (gửi email reset)
export const requestPasswordReset = (email) =>
  api.post("/users/request-reset", { email });

// Xác thực token đặt lại mật khẩu
export const validateResetToken = (token) =>
  api.get("/users/validate-reset-token", { params: { token } });

// Đặt lại mật khẩu
export const resetPassword = (token, newPassword) =>
  api.post("/users/reset-password", { token, newPassword });

// Xác minh tài khoản qua email
export const verifyEmail = (token) =>
  api.get("/users/verify", { params: { token } });

// Đăng xuất
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

// Job API
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

  getMyCompanyJobs: () => api.get("/jobs/my-company"),

    // ⭐ 11. Public: Lấy job theo companyId
  getJobsByCompany: (companyId) =>
    api.get(`/jobs/public/company/${companyId}`),
};


export const companyAPI = {
  // Public
  getFeatured: () => api.get("/companies/featured"),
  getAllActive: () => api.get("/companies/public"),
  getById: (id) => api.get(`/companies/public/${id}`),

  // Admin / HR (giữ nguyên)
  getAll: () => api.get("/companies"),
  create: (data) => api.post("/companies", data), // CHỈ Admin dùng
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
  getByIdAdmin: (id) => api.get(`/companies/${id}`),

  // Verify
  approve: (id) => api.patch(`/companies/${id}/approve`),
  reject: (companyId, reason) => api.patch(`/companies/${companyId}/reject`, { reason }),
  setFeatured: (id, featured) => api.patch(`/companies/${id}/featured?featured=${featured}`),
  requestVerification: (companyId) => api.post(`/companies/${companyId}/request-verification`),

  // ✅ NEW: HR tạo company qua multipart
createForHR: (formData) => api.post("/companies/hr", formData),           // multipart
  updateForHR: (id, formData) => api.put(`/companies/hr/${id}`, formData),  // multipart
};

export const employerAPI = {
  // CHỈ 1 tham số duy nhất: payload (có thể chứa cả data + file)
  createEmployer: (payload) => {
    const formData = new FormData();
    
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    // BÂY GIỜ DÙNG api instance → token tự động thêm + FormData hoạt động ngon!
    return api.post("/employers", formData);
  },

  // Tương tự cho update (nếu cần update + đổi file)
  updateEmployer: (employerId, payload) => {
  const formData = new FormData();
  Object.keys(payload).forEach(key => {
    if (payload[key] !== null && payload[key] !== undefined) {
      formData.append(key, payload[key]);
    }
  });
  return api.put(`/employers/${employerId}`, formData); // ← ĐÃ SỬA
},

 /** ADMIN: lấy tất cả nhà tuyển dụng */
  getAll: () => api.get("/employers"),

  // 3. HR/ADMIN: Lấy thông tin Employer theo ID
  getEmployerById: (employerId) => api.get(`/employers/${employerId}`),

  // 5. HR: Gửi yêu cầu duyệt hồ sơ (sau khi đã upload GPKD)
  requestVerification: (employerId) =>
    api.post(`/employers/${employerId}/request-verification`),

  // 6. ADMIN: Duyệt hồ sơ Employer (badge xanh hiện ngay!)
  approveVerification: (employerId) =>
    api.post(`/employers/${employerId}/approve-verification`),

  // 7. ADMIN: Từ chối duyệt (có thể kèm lý do)
  rejectVerification: (employerId, reason = "") =>
    api.post(`/employers/${employerId}/reject-verification`, { reason }),

// 8. HR: lấy danh sách HR thuộc công ty của HR hiện tại
  getMyCompanyEmployers: () => api.get("/employers/by-company/me"),

  getMyEmployer: () => api.get("/employers/me"), // ← ĐÃ SỬA
  getPendingVerificationEmployers: () =>
    api.get("/employers/pending-verification"),
};

// ====================================================================
// THÊM MỚI: CV & TEMPLATE API (KHÔNG SỬA GÌ PHẦN TRÊN)
// ====================================================================

// CV API
export const cvAPI = {
  // Lấy danh sách CV của user hiện tại (dùng token)
  getMyCVs: () => api.get("/api/cv/my"),

  // Tạo CV từ builder (gửi data + templateId)
  createWithData: (data) => api.post("/api/cv/create-with-data", data),

  // Upload file CV
  upload: (formData) =>
    api.post("/api/cv/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Xem trước CV (render HTML + data)
renderCV: (cvId) => {
  const token = localStorage.getItem("token"); // hoặc lấy từ Redux/context
  return api.get(`/api/cv/render/${cvId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
},

  // Xóa CV
  delete: (cvId) => api.delete(`/api/cv/${cvId}`),

  update: (cvId, data) => api.put(`/api/cv/update/${cvId}`, data),
};

// Template API
export const templateAPI = {
  getAll: () => api.get("/api/template/list"),
  create: (data) => api.post("/api/template/create", data),
  update: (id, data) => api.put(`/api/template/update/${id}`, data),
  delete: (id) => api.delete(`/api/template/delete/${id}`),
};

// Helper functions (dễ import)
export const getMyCVs = () => cvAPI.getMyCVs("/api/cv/my");
export const createCV = (data) => cvAPI.createWithData(data);
export const uploadCV = (formData) => cvAPI.upload(formData);
export const renderCV = (cvId) => cvAPI.renderCV(cvId);
export const deleteCV = (cvId) => cvAPI.delete(cvId);
export const getAllTemplates = () => templateAPI.getAll();
export const updateCV = (cvId, data) => cvAPI.update(cvId, data);

// Application API
export const applicationAPI = {
  // Ứng viên tạo ứng tuyển
  create: (data, token) =>
    api.post("/api/applications", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Xem danh sách ứng tuyển của ứng viên
  getMyApplications: (token) =>
    api.get("/api/applications/my", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // HR xem danh sách ứng viên theo JobId
  getByJobId: (jobId, page = 0, size = 10, status, token) =>
    api.get(`/api/applications/job/${jobId}`, {
      params: { page, size, ...(status ? { status } : {}) },
      headers: { Authorization: `Bearer ${token}` },
    }),

  // HR xem chi tiết ứng tuyển
  getDetail: (applicationId, token) =>
    api.get(`/api/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // HR cập nhật trạng thái ứng tuyển
  updateStatus: (applicationId, status, token) =>
    api.put(`/api/applications/${applicationId}/status`, null, {
      params: { status: status.toUpperCase() }, // ✅ Chuyển thành chữ hoa
      headers: { Authorization: `Bearer ${token}` },
  }),
};

export const fileAPI = {
  upload: (file) => {
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/files/upload", fd, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export const fetchCVBlobByUrl = (cvUrl) => {
  const token = localStorage.getItem("token");
  return api.get(cvUrl, {
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });
};

