// src/services/api.js
import axios from "axios";

const API_BASE = "http://localhost:8080"; // ĐÚNG với backend

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// === INTERCEPTOR: TỰ ĐỘNG THÊM TOKEN ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === INTERCEPTOR: XỬ LÝ LỖI CHUNG ===
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      alert("Không kết nối được server!");
    } else if (error.response.status === 401) {
      alert("Phiên đăng nhập hết hạn!");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// === CÁC HÀM AUTH & QUÊN MẬT KHẨU ===
export const requestPasswordReset = (email) =>
  api.post("/users/request-reset", { email });

export const validateResetToken = (token) =>
  api.get("/users/validate-reset-token", { params: { token } });

export const resetPassword = (token, newPassword) =>
  api.post("/users/reset-password", { token, newPassword });

// Thêm các hàm khác: login, register, logout,...
// export const login = (email, password) => api.post("/auth/login", { email, password });

export default api;