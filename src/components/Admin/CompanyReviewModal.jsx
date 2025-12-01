// src/components/Admin/CompanyReviewModal.jsx
import React, { useEffect, useState } from "react";
import { companyAPI } from "../../services/auth.services";
import Swal from "sweetalert2";
import "./EmployerReviewModal.css"; // dùng chung CSS với EmployerReviewModal (hoặc copy paste)

export default function CompanyReviewModal({ companyId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const res = await companyAPI.getByIdAdmin(companyId);
        setCompany(res.data);
      } catch (err) {
        console.error("Lỗi tải chi tiết công ty:", err);
        setError("Không thể tải chi tiết hồ sơ công ty.");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) loadDetail();
  }, [companyId]);

  // DUYỆT CÔNG TY – GỌI ĐÚNG API TRONG auth.services.js
  const handleApprove = async () => {
    const result = await Swal.fire({
      title: "Duyệt công ty này?",
      text: "Công ty sẽ được xác minh và hiển thị công khai.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Duyệt ngay",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#55ac58",
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(true);
      await companyAPI.approve(companyId); // ĐÚNG API: PATCH /companies/{id}/approve
      Swal.fire("Thành công!", "Công ty đã được duyệt thành công!", "success");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể duyệt công ty";
      Swal.fire("Lỗi", msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // TỪ CHỐI CÔNG TY – GỌI ĐÚNG API
  const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      title: "Từ chối duyệt công ty",
      input: "textarea",
      inputLabel: "Lý do từ chối (bắt buộc)",
      inputPlaceholder: "Nhập lý do rõ ràng để HR biết...",
      showCancelButton: true,
      confirmButtonText: "Từ chối",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      inputValidator: (value) => {
        if (!value?.trim()) return "Bạn phải nhập lý do từ chối!";
      },
    });

    if (!reason) return;

    try {
      setActionLoading(true);
      await companyAPI.reject(companyId); // ĐÚNG API: PATCH /companies/{id}/reject
      Swal.fire("Đã từ chối", "Công ty đã bị từ chối với lý do bạn nhập.", "info");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể từ chối công ty";
      Swal.fire("Lỗi", msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

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
            {/* Company Block */}
            <section className="block">
              <h5>Thông tin doanh nghiệp</h5>
              <div className="grid-2">
                <div>
                  <div><strong>Tên công ty:</strong> {company?.name || "—"}</div>
                  <div><strong>Mã số thuế:</strong> {company?.taxCode || "—"}</div>
                  <div><strong>Lĩnh vực:</strong> {company?.industry || "—"}</div>
                  <div><strong>Quy mô:</strong> {company?.size || "—"}</div>
                  <div><strong>Năm thành lập:</strong> {company?.foundedYear || "—"}</div>
                </div>
                <div>
                  <div><strong>Website:</strong> {company?.website ? <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a> : "—"}</div>
                  <div><strong>Địa chỉ:</strong> {company?.address || "—"}</div>
                  <div><strong>Thành phố:</strong> {company?.city || "—"}</div>
                  <div><strong>Mã công ty:</strong> {company?.companyId || "—"}</div>
                  <div><strong>Trạng thái:</strong> <span className="status-pending">PENDING</span></div>
                </div>
              </div>

              {/* GPKD */}
              {company?.businessRegistrationUrl && (
                <div className="file-box" style={{ marginTop: 24 }}>
                  <p><strong>Giấy phép kinh doanh:</strong></p>
                  <a href={company.businessRegistrationUrl} target="_blank" rel="noreferrer">
                    {company.businessRegistrationFileName || "Xem file GPKD"}
                  </a>
                </div>
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