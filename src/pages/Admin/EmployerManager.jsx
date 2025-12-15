
// src/pages/admin/EmployerManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { employerAPI } from "../../services/auth.services";
import "./EmployerManager.css";

/** ========================= Helpers ========================= **/

/**
 * Đọc giá trị theo danh sách "đường dẫn" an toàn.
 * Ví dụ: getByPaths(e, ['user.fullName', 'fullName'])
 */
function getByPaths(obj, paths) {
  for (const p of paths) {
    try {
      const val = p.split(".").reduce((acc, key) => {
        if (acc == null) return undefined;
        return acc[key];
      }, obj);
      if (val !== undefined && val !== null && val !== "") return val;
    } catch {
      // bỏ qua nếu không truy cập được
    }
  }
  return undefined;
}

/** Lấy tên hiển thị từ nhiều khả năng (user object / employer fields) */
function getDisplayName(e) {
  return (
    getByPaths(e, ["user.fullName", "user.name", "fullName", "name"]) ?? "-"
  );
}

/** Chữ cái đầu cho avatar */
function getInitial(e) {
  const name = getDisplayName(e);
  return ((name && name[0]) || "?").toUpperCase();
}

/** Email làm việc: ưu tiên workEmail theo entity Employer.java */
function getWorkEmail(e) {
  return getByPaths(e, ["workEmail", "email", "user.email"]) ?? "-";
}

/** SĐT: ưu tiên Employer.phone, fallback các key khác nếu payload khác */
function getPhone(e) {
  return (
    getByPaths(e, ["phone", "tel", "sdt", "user.phone", "user.tel", "user.phoneNumber"]) ??
    "-"
  );
}

/** Tên công ty: company.name hoặc companyName */
function getCompanyName(e) {
  return getByPaths(e, ["company.name", "companyName"]) ?? "-";
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
  if (typeof raw === "number") {
    return raw === 1 ? "APPROVED" : raw === 2 ? "REJECTED" : "PENDING";
  }
  const s = String(raw ?? "").trim().toUpperCase();
  if (!s) return "";
  if (s === "APPROVE") return "APPROVED";
  if (s === "REJECT") return "REJECTED";
  return s; // PENDING/APPROVED/REJECTED/...
}

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

/** Format ngày theo vi-VN (trả null nếu không parse được) */
function formatDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toLocaleString("vi-VN");
}

/**
 * Lấy Ngày tạo:
 * Employer.java không có createdAt, nên đọc theo fallback
 * Nếu DTO đã thêm, sẽ hiện ngay; nếu không, có thể hiện createdAt của user/company.
 */
function getCreatedAt(e) {
  const raw =
    getByPaths(e, [
      "createdAt",
      "created_at",
      "createdDate",
      "created_date",
      "createAt",
      "createdTime",
    ]) ??
    getByPaths(e, ["user.createdAt", "user.created_at"]) ??
    getByPaths(e, ["company.createdAt", "company.created_at"]);
  return formatDate(raw);
}

/** Lấy employerId (UUID) an toàn */
function getEmployerId(e) {
  return getByPaths(e, ["employerId", "id"]) ?? null;
}

/** ========================= Component ========================= **/

export default function EmployerManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tìm kiếm + phân trang (client-side)
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // Modal chi tiết
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /** Lấy TẤT CẢ nhà tuyển dụng từ BE (Admin) */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await employerAPI.getAll();
      const data = Array.isArray(res?.data) ? res.data : [];
      setItems(data);

      // Log kiểm tra để thấy chính xác payload, giúp debug triệt để
      console.table(
        data.map((i) => ({
          employerId: String(getEmployerId(i) ?? ""),
          name: getDisplayName(i),
          workEmail: getWorkEmail(i),
          phone: getPhone(i),
          company: getCompanyName(i),
          verify: normalizeVerify(i),
          createdAt: getCreatedAt(i),
        }))
      );
    } catch (err) {
      console.error("fetchAll employers failed:", err);
      Swal.fire({ icon: "error", title: "Lỗi", text: "Tải danh sách thất bại" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAll();
  }, []);

  /** Lọc theo họ tên/email/công ty/sđt/mã */
  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return items;
    return (items ?? []).filter((e) => {
      const name = getDisplayName(e).toLowerCase();
      const email = getWorkEmail(e).toLowerCase();
      const comp = getCompanyName(e).toLowerCase();
      const phone = getPhone(e).toLowerCase();
      const code = String(getEmployerId(e) ?? "").toLowerCase();
      return (
        name.includes(key) ||
        email.includes(key) ||
        comp.includes(key) ||
        phone.includes(key) ||
        code.includes(key)
      );
    });
  }, [items, q]);

  /** Phân trang (client-side) */
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pageItems = useMemo(() => {
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  }, [filtered, page, size]);
  useEffect(() => {
    setPage(1);
  }, [q, size]);

  /** Xem chi tiết (gọi BE theo employerId) */
  const openDetail = async (employerId) => {
    if (!employerId) return;
    setDetailLoading(true);
    try {
      const res = await employerAPI.getEmployerById(employerId);
      setDetail(res?.data ?? null);
    } catch (err) {
      console.error("getEmployerById failed:", err);
      Swal.fire({ icon: "error", title: "Lỗi", text: "Tải chi tiết thất bại" });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="employer-manager">
      <div className="header">
        <h2>Quản lý nhà tuyển dụng</h2>
      </div>

      {/* Tìm kiếm + chọn số dòng/trang */}
      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Tìm theo tên, email, công ty, SĐT…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Tìm kiếm"
        />
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          aria-label="Số dòng/trang"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/trang
            </option>
          ))}
        </select>
      </div>

      {/* Bảng hiển thị tất cả nhà tuyển dụng – chỉ hành động 'Xem' */}
      {loading ? (
        <p className="loading">Đang tải dữ liệu…</p>
      ) : (
        <table className="company-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Công ty</th>
              <th>Kiểm duyệt</th>
              
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              pageItems.map((e, idx) => {
                const stt = (page - 1) * size + idx + 1;
                const verify = normalizeVerify(e);
                const created = getCreatedAt(e) ?? "-";
                const employerId = getEmployerId(e);

                return (
                  <tr key={String(employerId ?? idx)}>
                    <td>{stt}</td>
                    <td>
                      <div className="cell-name">
                        <div className="avatar">{getInitial(e)}</div>
                        <div>
                          <div className="name">{getDisplayName(e)}</div>
                          <div className="muted">
                            ID: {String(employerId ?? "-")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{getWorkEmail(e)}</td>
                    <td>{getPhone(e)}</td>
                    <td>{getCompanyName(e)}</td>
                    <td>
                      <span
                        className={`verify-badge verify-${String(
                          verify || "pending"
                        ).toLowerCase()}`}
                      >
                        {verifyLabel(verify)}
                      </span>
                    </td>
                   
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* Phân trang */}
      <div className="pagination" style={{ marginTop: 12 }}>
        <span>Tổng: {total}</span>
        <div className="pager">
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ←
          </button>
          <span>
            Trang {page}/{totalPages}
          </span>
          <button
            className="btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            →
          </button>
        </div>
      </div>

      {/* Modal xem chi tiết */}
      {detail !== null && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Nhà tuyển dụng</h3>
            {detailLoading ? (
              <p className="loading">Đang tải chi tiết…</p>
            ) : (
              <div className="detail-grid">
                {/* Cột trái: thông tin nhà tuyển dụng */}
                <div className="detail-card">
                  <div className="detail-title">Nhà tuyển dụng</div>
                  <div className="detail-row">
                    <span>Họ tên:</span>
                    <strong>
                      {getByPaths(detail, ["user.fullName", "user.name"]) ?? "-"}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Email làm việc:</span>
                    <strong>{getWorkEmail(detail)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Chức vụ:</span>
                    <strong>{detail?.positionTitle ?? "-"}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Phòng ban:</span>
                    <strong>{detail?.department ?? "-"}</strong>
                  </div>
                  <div className="detail-row">
                    <span>SĐT:</span>
                    <strong>{getPhone(detail)}</strong>
                  </div>
                </div>

                {/* Cột phải: thông tin công ty & trạng thái */}
                <div className="detail-card">
                  <div className="detail-title">Thông tin công ty</div>
                  <div className="detail-row">
                    <span>Thuộc công ty:</span>
                    <strong>
                      {getByPaths(detail, ["company.name"]) ?? "-"}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Trạng thái kiểm duyệt:</span>
                    <strong>{verifyLabel(normalizeVerify(detail))}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Ngày duyệt:</span>
                    <strong>
                      {formatDate(detail?.verifiedAt) ?? "—"}
                    </strong>
                  </div>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setDetail(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
