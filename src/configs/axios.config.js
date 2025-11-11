// src/services/axios.config.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080"; // Đúng với backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧠 Interceptor: tự động thêm token nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ⚠️ Không thêm token cho các API public
    const isPublicEndpoint =
      config.url.includes("/users/login") ||
      config.url.includes("/users/register") ||
      config.url.includes("/users/request-reset") ||
      config.url.includes("/users/verify") ||
      config.url.includes("/users/validate")||
      config.url.includes("/job-categories/popular")||
      config.url.includes("/companies/public")||
      config.url.includes("/companies/featured")||
      config.url.includes("jobs/latest");

    if (!isPublicEndpoint && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Interceptor: xử lý lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      alert("Không thể kết nối đến server!");
    } else if (error.response.status === 401) {
      alert("Phiên đăng nhập đã hết hạn!");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
// THÊM MỚI: Hỗ trợ UUID trong params (Spring dùng UUID)
api.defaults.paramsSerializer = (params) => {
  return Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
};

export default api;
