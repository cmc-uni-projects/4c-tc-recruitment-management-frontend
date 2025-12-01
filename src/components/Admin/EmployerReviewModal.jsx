
// src/components/admin/BusinessRegistrationReviewModal.jsx
import React, { useEffect, useState } from "react";
import { employerAPI, companyAPI } from "../../services/auth.services";
import "./EmployerReviewModal.css"; // tạo CSS nếu cần
import Swal from "sweetalert2";

/**
 * Props:
 *  - employerId: string | number
 *  - onClose: () => void
 *  - onSuccess: () => void   // gọi lại để refresh danh sách pending
 *
 * Modal này hiển thị chi tiết Employer + Company + GPKD đã upload,
 * và có nút "Duyệt" / "Từ chối" (có lý do).
 */
export default function EmployerReviewModal({ employerId, onClose, onSuccess }) {
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
    Swal.fire({
      title: "Xác nhận duyệt hồ sơ?",
      text: "Hồ sơ doanh nghiệp này sẽ được xác minh.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Duyệt",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(true);
          await employerAPI.approveVerification(employerId);
          Swal.fire("Thành công!", "Đã duyệt hồ sơ doanh nghiệp.", "success");
          onSuccess?.();
          onClose?.();
        } catch (err) {
          console.error("Lỗi duyệt hồ sơ:", err);
          Swal.fire("Lỗi", "Không thể duyệt hồ sơ!", "error");
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  
const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      title: "Nhập lý do từ chối",
      input: "text",
      inputPlaceholder: "Nhập lý do (tùy chọn)",
      showCancelButton: true,
      confirmButtonText: "Tiếp tục",
      cancelButtonText: "Hủy",
    });

    if (reason === undefined) return; // Người dùng bấm Hủy

    Swal.fire({
      title: "Xác nhận từ chối hồ sơ?",
      text: "Hồ sơ sẽ bị từ chối và yêu cầu cập nhật lại.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Từ chối",
      cancelButtonText: "Đóng",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(true);
          await employerAPI.rejectVerification(employerId, reason || "");
          Swal.fire("Đã từ chối!", "Hồ sơ doanh nghiệp đã bị từ chối.", "success");
          onSuccess?.();
          onClose?.();
        } catch (err) {
          console.error("Lỗi từ chối hồ sơ:", err);
          Swal.fire("Lỗi", "Không thể từ chối hồ sơ!", "error");
        } finally {
          setActionLoading(false);
        }
      }
    });

  };



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4>Duyệt hồ sơ nhà tuyển dụng</h4>
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
