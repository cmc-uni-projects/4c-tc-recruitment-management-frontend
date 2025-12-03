import axios from "axios";

const API_BASE_URL = "http://localhost:8080"; // Đúng với backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR DUY NHẤT – SIÊU SẠCH – SIÊU ỔN ĐỊNH
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Chỉ thêm token nếu:
    // - Có token
    // - Chưa có Authorization (tránh ghi đè khi gọi thủ công)
    // - Không phải endpoint public
    const publicEndpoints = [
      "/users/login",
      "/users/register",
      "/users/request-reset",
      "/users/verify",
      "/users/validate",
      "/job-categories/popular",
      "/companies/public",
      "/companies/featured",
      "/jobs/approved",
      "/jobs/search",
      "/jobs/latest",
    ];

    const isPublic = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (token && !isPublic && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // QUAN TRỌNG NHẤT: Không để axios tự set Content-Type khi gửi FormData
    if (config.data instanceof FormData) {
      // Xóa Content-Type để browser tự set boundary
      delete config.headers["Content-Type"];
      // Nếu có set thủ công Authorization rồi thì giữ nguyên
      // Nếu chưa có thì thêm token (phòng trường hợp gọi từ employerAPI)
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Fix double slash
    if (config.url?.startsWith("/")) {
      config.url = config.url.replace(/^\/+/, "/");
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
