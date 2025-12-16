
import React, { useEffect, useState } from "react";
import "./HRSetting.css";
import { employerAPI } from "../../services/auth.services"; // GET /employers/me

/** ==== Helpers (dựa theo EmployerManager.jsx) ==== */
/** Đọc giá trị an toàn theo danh sách "đường dẫn" */
function getByPaths(obj, paths) {
  for (const p of paths) {
    try {
      const val = p.split(".").reduce((acc, key) => {
        if (acc == null) return undefined;
        return acc[key];
      }, obj);
      if (val !== undefined && val !== null && val !== "") return val;
    } catch {}
  }
  return undefined;
}
/** Tên hiển thị: ưu tiên user.fullName → user.name → fullName → name */
function getDisplayName(e) {
  return getByPaths(e, ["user.fullName", "user.name", "fullName", "name"]) ?? "-";
}
/** Email làm việc: workEmail → email → user.email */
function getWorkEmail(e) {
  return getByPaths(e, ["workEmail", "email", "user.email"]) ?? "-";
}
/** SĐT: phone → tel → sdt → user.phone → user.tel → user.phoneNumber */
function getPhone(e) {
  return (
    getByPaths(e, ["phone", "tel", "sdt", "user.phone", "user.tel", "user.phoneNumber"]) ?? "-"
  );
}
/** Công ty: company.name → companyName */
function getCompanyName(e) {
  return getByPaths(e, ["company.name", "companyName"]) ?? "-";
}
/** Lấy employerId an toàn */
function getEmployerId(e) {
  return getByPaths(e, ["employerId", "id"]) ?? "-";
}
/** Chuẩn hóa trạng thái kiểm duyệt */
function normalizeVerify(e) {
  const raw = getByPaths(e, [
    "verified",
    "isVerified",
    "verificationStatus",
    "status",
    "approvalStatus",
    "approved",
    "verify",
    "verifyStatus",
  ]);
  if (typeof raw === "boolean") return raw ? "APPROVED" : "PENDING";
  if (typeof raw === "number") return raw === 1 ? "APPROVED" : raw === 2 ? "REJECTED" : "PENDING";
  const s = String(raw ?? "").trim().toUpperCase();
  if (!s) return "";
  if (s === "APPROVE") return "APPROVED";
  if (s === "REJECT") return "REJECTED";
  return s;
}
/** Nhãn trạng thái (vi-VN) */
function verifyLabel(v) {
  switch (String(v ?? "").toUpperCase()) {
    case "PENDING":
      return "Chờ duyệt";
    case "APPROVED":
      return "Đã duyệt";
    case "REJECTED":
      return "Từ chối";
    default:
      return "-";
  }
}
/** Format ngày theo vi-VN */
function formatDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toLocaleString("vi-VN");
}

function HRSetting() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emp, setEmp] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dữ liệu thật từ BE
        const res = await employerAPI.getMyEmployer();
        const data = res?.data ?? null;
        setEmp(data);

        // (Tuỳ chọn) giữ convention cho trang khác dùng
        const companyObj = getByPaths(data, ["company"]) ?? null;
        const companyName = companyObj?.name ?? companyObj?.companyName ?? "";
        const companyId = companyObj?.companyId ?? companyObj?.id ?? "";
        if (companyName) localStorage.setItem("companyName", companyName);
        if (companyId || companyName) {
          localStorage.setItem("myCompany", JSON.stringify({ companyId, name: companyName }));
        }
      } catch (e) {
        setError(e?.message || "Không tải được thông tin HR");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Avatar (read-only)
  const renderAvatar = () => {
    const url = getByPaths(emp, ["avatarUrl", "avatar"]);
    const name = getDisplayName(emp);
    const initial = (name && name[0]) ? name[0].toUpperCase() : "H";
    return url ? (
      <img className="hrset-avatar" src={url} alt="Avatar HR" />
    ) : (
      <div className="hrset-avatar hrset-avatar--placeholder">{initial}</div>
    );
  };

  // Trạng thái kiểm duyệt
  const vRaw = normalizeVerify(emp);
  const vLabel = verifyLabel(vRaw);

  return (
    <div className="hrset-root">
      <div className="hrset-card">
        {/* Header – chỉ tiêu đề, không nút lưu */}
        <div className="hrset-header">
          <h2 className="hrset-title">Thiết lập HR</h2>
        </div>

        {/* State */}
        {loading && <p className="hrset-loading">Đang tải dữ liệu...</p>}
        {error && <div className="hrset-error">{error}</div>}

        {/* Content */}
        {!loading && !error && (
          <div className="hrset-grid">
            {/* Trái: avatar + công ty + trạng thái */}
            <div className="hrset-left">
              <div className="hrset-avatarWrap">{renderAvatar()}</div>

              <div className="hrset-verify">
                <span
                  className={
                    "hrset-badge " +
                    (vRaw === "APPROVED"
                      ? "hrset-badge--approved"
                      : vRaw === "REJECTED"
                      ? "hrset-badge--rejected"
                      : "hrset-badge--pending")
                  }
                >
                  {vLabel}
                </span>
              </div>

              <div className="hrset-company">
                <div className="hrset-company__title">Công ty</div>
                <div className="hrset-company__value">{getCompanyName(emp)}</div>
                <div className="hrset-company__sub">
                  ID: {getByPaths(emp, ["company.companyId", "company.id"]) ?? "-"}
                </div>
              </div>
            </div>

            {/* Phải: thông tin chữ (read-only) */}
            <div className="hrset-info">
              <div className="hrset-row hrset-row--title">Thông tin nhà tuyển dụng</div>

              <div className="hrset-row">
                <span className="hrset-row__label">Họ và tên:</span>
                <span className="hrset-row__value">{getDisplayName(emp)}</span>
              </div>

              <div className="hrset-row">
                <span className="hrset-row__label">Email làm việc:</span>
                <span className="hrset-row__value">{getWorkEmail(emp)}</span>
              </div>

              <div className="hrset-row">
                <span className="hrset-row__label">Số điện thoại:</span>
                <span className="hrset-row__value">{getPhone(emp)}</span>
              </div>

              <div className="hrset-row">
                <span className="hrset-row__label">Chức danh:</span>
                <span className="hrset-row__value">
                  {getByPaths(emp, ["position", "positionTitle", "title"]) ?? "-"}
                </span>
              </div>

              <div className="hrset-row">
                <span className="hrset-row__label">Mã HR:</span>
                <span className="hrset-row__value">{getEmployerId(emp)}</span>
              </div>

              <div className="hrset-row hrset-row--title">Trạng thái hệ thống</div>

              <div className="hrset-row">
                <span className="hrset-row__label">Kiểm duyệt:</span>
                <span className="hrset-row__value">{vLabel}</span>
              </div>

              <div className="hrset-row">
                <span className="hrset-row__label">Ngày duyệt:</span>
                <span className="hrset-row__value">
                  {formatDate(getByPaths(emp, ["verifiedAt"])) ?? "—"}
                </span>
              </div>

              <div className="hrset-actions">
                <button
                  type="button"
                  className="hrset-btn hrset-btn--secondary"
                  onClick={() => window.history.back()}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



export default HRSetting;

