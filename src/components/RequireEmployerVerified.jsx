
// src/guards/RequireEmployerVerified.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { employerAPI } from "../services/auth.services";

export default function RequireEmployerVerified({ children, requireVerified = true }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: true, allowed: false });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await employerAPI.getMyEmployer(); // dùng API có sẵn
        const emp = res?.data;
        const verified = !!(emp?.verified || emp?.verificationStatus === "APPROVED");
        const pending = emp?.verificationStatus === "PENDING";

        if (!emp) {
          // chưa có hồ sơ: chuyển về trang tạo hồ sơ
          navigate("/hr/profile", { replace: true });
          if (mounted) setStatus({ loading: false, allowed: false });
          return;
        }
        if (pending) {
          // chuyển tới trang thông báo PENDING hoặc hiển thị popup tuỳ trang
          navigate("/hr/profile/business-registration", { replace: true });
          if (mounted) setStatus({ loading: false, allowed: false });
          return;
        }
        if (requireVerified && !verified) {
          // chuyển tới trang upload GPKD/xác thực
          navigate("/hr/profile/business-registration", { replace: true });
          if (mounted) setStatus({ loading: false, allowed: false });
          return;
        }
        if (mounted) setStatus({ loading: false, allowed: true });
      } catch (err) {
        // 401 => về login; 404 => chưa có hồ sơ
        if (err?.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          navigate("/hr/profile", { replace: true });
        }
        if (mounted) setStatus({ loading: false, allowed: false });
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  if (status.loading) return null; // hoặc spinner
  return status.allowed ? children : null;
}
