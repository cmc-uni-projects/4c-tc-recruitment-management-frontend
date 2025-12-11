
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { employerAPI } from "../../services/auth.services";
import "./EmployerManager.css";

/** Nhãn hiển thị trạng thái kiểm duyệt */
function verifyLabel(v) {
  switch (String(v || "").toUpperCase()) {
    case "PENDING": return "Chờ duyệt";
    case "APPROVE": return "Đã duyệt";
    case "REJECT":  return "Từ chối";
    default:        return v || "-";
  }
}

export default function EmployerManager() {
  // Dữ liệu + UI state
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
      setItems(res?.data ?? []);
    } catch (err) {
      console.error("fetchAll employers failed:", err);
      Swal.fire({ icon: "error", title: "Lỗi", text: "Tải danh sách thất bại" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  /** Lọc theo họ tên/email/công ty/sđt/mã */
  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return items;
    return (items || []).filter((e) => {
      const name  = (e.fullName || e.name || "").toLowerCase();
      const email = (e.email || "").toLowerCase();
      const comp  = (e.companyName || e.company?.name || "").toLowerCase();
      const phone = (e.phone || "").toLowerCase();
      const code  = (e.code || e.employerCode || "").toLowerCase();
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

  useEffect(() => { setPage(1); }, [q, size]);

  /** Xem chi tiết (gọi BE theo ID) */
  const openDetail = async (employerId) => {
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
        <select value={size} onChange={(e) => setSize(Number(e.target.value))} aria-label="Số dòng/trang">
          {[10, 20, 50].map(n => <option key={n} value={n}>{n}/trang</option>)}
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
              <th>Ngày tạo</th>
              <th style={{ width: 160 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr><td colSpan={8} className="no-data">Không có dữ liệu</td></tr>
            ) : (
              pageItems.map((e, idx) => {
                const stt = (page - 1) * size + idx + 1;
                const v = String(e.verificationStatus || e.verify || "-").toUpperCase();
                const created = e.createdAt ? new Date(e.createdAt).toLocaleString() : "-";
                return (
                  <tr key={e.id || e.employerId}>
                    <td>{stt}</td>
                    <td>
                      <div className="cell-name">
                        <div className="avatar">
                          {((e.fullName || e.name || "?")[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <div className="name">{e.fullName || e.name || "-"}</div>
                          <div className="muted">ID: {e.id || e.employerId || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{e.email || "-"}</td>
                    <td>{e.phone || "-"}</td>
                    <td>{e.companyName || e.company?.name || "-"}</td>
                    <td>
                      <span className={`verify-badge verify-${String(v).toLowerCase()}`}>
                        {verifyLabel(v)}
                      </span>
                    </td>
                    <td>{created}</td>
                    <td className="actions">
                      <button className="edit-btn" onClick={() => openDetail(e.id || e.employerId)}>
                        Xem
                      </button>
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
          <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
          <span>Trang {page}/{totalPages}</span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>→</button>
        </div>
      </div>

      {/* Modal xem chi tiết – layout theo form ở ảnh bạn gửi */}
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
                  <div className="detail-row"><span>Họ tên:</span><strong>{detail.fullName || detail.name || "-"}</strong></div>
                  <div className="detail-row"><span>Email:</span><strong>{detail.email || "-"}</strong></div>
                  <div className="detail-row"><span>Chức vụ:</span><strong>{detail.title || detail.position || "-"}</strong></div>
                  <div className="detail-row"><span>Phòng ban:</span><strong>{detail.department || detail.dept || "-"}</strong></div>
                </div>

                {/* Cột phải: thông tin công ty & trạng thái */}
                <div className="detail-card">
                  <div className="detail-title">Thông tin công ty</div>
                  <div className="detail-row"><span>Thuộc công ty:</span><strong>{detail.companyName || detail.company?.name || "-"}</strong></div>
                  <div className="detail-row"><span>Trạng thái:</span><strong>{verifyLabel(detail.verificationStatus || detail.verify)}</strong></div>
                  <div className="detail-row"><span>Ngày gửi yêu cầu:</span><strong>{detail.requestedAt ? new Date(detail.requestedAt).toLocaleString() : "—"}</strong></div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
