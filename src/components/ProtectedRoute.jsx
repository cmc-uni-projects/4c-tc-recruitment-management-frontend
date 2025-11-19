// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) return { isAuthenticated: false };

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role; // "ROLE_ADMIN", "ROLE_HR", "ROLE_CANDIDATE"
    const exp = payload.exp * 1000; // milliseconds

    if (Date.now() >= exp) {
      localStorage.removeItem("token");
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, role: role.replace("ROLE_", "") }; // trả về "ADMIN", "HR", ...
  } catch (err) {
    localStorage.removeItem("token");
    return { isAuthenticated: false };
  }
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Có đăng nhập nhưng role không đủ
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  // OK → cho vào
  return <Outlet />;
};

// Trang 403 đơn giản (tạo nhanh)
export const ForbiddenPage = () => (
  <div style={{ padding: "50px", textAlign: "center" }}>
    <h1>403 - Không có quyền truy cập</h1>
    <p>Bạn không có quyền vào trang này.</p>
    <button onClick={() => window.history.back()}>Quay lại</button>
  </div>
);

export default ProtectedRoute;