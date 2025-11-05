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
    if (token) {
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

export default api;
