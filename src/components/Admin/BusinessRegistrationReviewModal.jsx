
// src/components/admin/BusinessRegistrationReviewModal.jsx
import React, { useEffect, useState } from "react";
import { employerAPI, companyAPI } from "../../services/auth.services";
import "./BusinessRegistrationReviewModal.css"; // tạo CSS nếu cần

/**
 * Props:
 *  - employerId: string | number
 *  - onClose: () => void
 *  - onSuccess: () => void   // gọi lại để refresh danh sách pending
 *
 * Modal này hiển thị chi tiết Employer + Company + GPKD đã upload,
 * và có nút "Duyệt" / "Từ chối" (có lý do).
 */
export default function BusinessRegistrationReviewModal({ employerId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [employer, setEmployer] = useState(null);
  const [company, setCompany] = useState(null); // <-- thêm state company
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);

        // 1) Lấy EmployerDTO
        const resEmp = await employerAPI.getEmployerById(employerId);
        const emp = resEmp.data;
        setEmployer(emp);

        // 2) Lấy Company (admin view) để có businessRegistrationUrl đầy đủ
        if (emp?.companyId) {
          const resComp = await companyAPI.getByIdAdmin(emp.companyId);
          setCompany(resComp.data);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết employer/company:", err);
        setError("Không thể tải chi tiết hồ sơ.");
      } finally {
        setLoading(false);
      }
    };

    if (employerId) loadDetail();
  }, [employerId]);

  const handleApprove = async () => {
    if (!window.confirm("Xác nhận DUYỆT hồ sơ doanh nghiệp này?")) return;
    try {
      setActionLoading(true);
      await employerAPI.approveVerification(employerId);
      alert("Đã duyệt hồ sơ thành công!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Lỗi duyệt hồ sơ:", err);
      alert("Lỗi khi duyệt!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Nhập lý do từ chối (optional):", "");
    if (reason === null) return; // user cancelled
    if (!window.confirm("Xác nhận TỪ CHỐI hồ sơ doanh nghiệp này?")) return;

    try {
      setActionLoading(true);
      await employerAPI.rejectVerification(employerId, reason || "");
      alert("Đã từ chối hồ sơ!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Lỗi từ chối hồ sơ:", err);
      alert("Lỗi khi từ chối!");
    } finally {
      setActionLoading(false);
    }
  };

  // URL file GPKD (lưu trong Company)
  const businessFileUrl = company?.businessRegistrationUrl || "";
  const isPdf = businessFileUrl?.toLowerCase().endsWith(".pdf");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4>Duyệt hồ sơ doanh nghiệp</h4>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="modal-body">Đang tải chi tiết...</div>
        ) : error ? (
          <div className="modal-body error">{error}</div>
        ) : (
          <div className="modal-body">
            {/* Company block */}
            <section className="block">
              <h5>Doanh nghiệp</h5>
              <div className="grid-2">
                <div>
                  <div><strong>Tên công ty:</strong> {company?.name || employer?.companyName || "—"}</div>
                  <div><strong>Lĩnh vực:</strong> {company?.industry || "—"}</div>
                  <div><strong>Quy mô:</strong> {company?.size || "—"}</div>
                  <div><strong>Website:</strong> {company?.website || "—"}</div>
                </div>
                <div>
                  <div><strong>Địa chỉ:</strong> {company?.address || "—"}</div>
                  <div><strong>Thành phố:</strong> {company?.city || "—"}</div>
                  <div><strong>Mã công ty:</strong> {company?.companyId || employer?.companyId || "—"}</div>
                </div>
              </div>
            </section>

            {/* Employer block */}
            <section className="block">
              <h5>Nhà tuyển dụng</h5>
              <div className="grid-2">
                <div>
                  <div><strong>Họ tên:</strong> {employer?.fullName || "—"}</div>
                  <div><strong>Email:</strong> {employer?.email || employer?.workEmail || "—"}</div>
                  <div><strong>Chức vụ:</strong> {employer?.positionTitle || "—"}</div>
                  <div><strong>Phòng ban:</strong> {employer?.department || "—"}</div>
                </div>
                <div>
                  <div><strong>Mã hồ sơ:</strong> {employer?.employerId || "—"}</div>
                  <div><strong>Thuộc công ty:</strong> {employer?.companyName || "—"}</div>
                  <div><strong>Trạng thái:</strong> {employer?.verified ? "VERIFIED" : "PENDING"}</div>
                  <div><strong>Ngày xác minh:</strong> {employer?.verifiedAt ? new Date(employer.verifiedAt).toLocaleString() : "—"}</div>
                </div>
              </div>
            </section>

            {/* Business registration file */}
            <section className="block">
              <h5>Giấy phép kinh doanh (GPKD) đã upload</h5>
              {businessFileUrl ? (
                isPdf ? (
                  <div className="file-box">
                    <a href={businessFileUrl} target="_blank" rel="noreferrer">Mở / Tải xuống file PDF</a>
                  </div>
                ) : (
                  <div className="image-box">
                    <img src={businessFileUrl} alt="GPKD đã upload" />
                  </div>
                )
              ) : (
                <div className="file-box muted">Chưa tìm thấy URL GPKD trong Company.</div>
              )}
            </section>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-danger" onClick={handleReject} disabled={actionLoading || loading}>
            {actionLoading ? "Đang xử lý..." : "Từ chối"}
          </button>
          <button className="btn-primary" onClick={handleApprove} disabled={actionLoading || loading}>
            {actionLoading ? "Đang xử lý..." : "Duyệt"}
          </button>
        </div>
      </div>
    </div>
  );
}
