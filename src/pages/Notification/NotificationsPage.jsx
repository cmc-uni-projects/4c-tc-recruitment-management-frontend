import React, { useEffect, useState } from "react";
import { jobAPI, employerAPI } from "../../services/auth.services";
import BusinessRegistrationReviewModal from "../../components/Admin/BusinessRegistrationReviewModal";
import "./NotificationsPage.css";
import Navbar from "../../components/Layout/Navbar";

export default function NotificationsPage() {

  
 // --- COMPANY pending (mới) ---
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);


  // --- EMPLOYER pending (mới) ---
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(true);
  const [selectedEmployerId, setSelectedEmployerId] = useState(null);
  const [isBRReviewOpen, setIsBRReviewOpen] = useState(false);


  
// ====== FETCH DOANH NGHIỆP ======
  const fetchPendingCompanies = async () => {
    try {
      setLoadingCompanies(true);
      // Đổi tên API này cho đúng với service hiện có của bạn nếu cần.
      const res = await jobAPI.getPendingVerificationCompanies();
      console.log("[Company Pending] status:", res.status);
      console.log("[Company Pending] data:", res.data);
      setPendingCompanies(res.data || []);
    } catch (error) {
      console.error("[Company Pending] error:", error);
      const code = error?.response?.status;
      const msg = error?.response?.data?.message;
      alert(
        msg ??
          `Lỗi tải danh sách hồ sơ doanh nghiệp (company) chờ duyệt (HTTP ${
            code ?? "?"
          })`
      );
      setPendingCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

 

  const fetchPendingEmployers = async () => {
    try {
      setLoadingEmployers(true);
      const res = await employerAPI.getPendingVerificationEmployers();
      console.log("[Employer Pending] status:", res.status);
      console.log("[Employer Pending] data:", res.data);
      setPendingEmployers(res.data || []);
    } catch (error) {
      console.error("[Employer Pending] error:", error);
      const code = error?.response?.status;
      const msg = error?.response?.data?.message;
      alert(
        code === 403
          ? "Bạn cần quyền ADMIN để xem hồ sơ doanh nghiệp chờ duyệt."
          : msg ??
              `Lỗi tải danh sách hồ sơ doanh nghiệp chờ duyệt (HTTP ${
                code ?? "?"
              })`
      );
      setPendingEmployers([]);
    } finally {
      setLoadingEmployers(false);
    }
  };

  useEffect(() => {
    fetchPendingCompanies();
    fetchPendingEmployers();
  }, []);


  const openBRReview = (employerId) => {
    setSelectedEmployerId(employerId);
    setIsBRReviewOpen(true);
  };
  const closeBRReview = () => {
    setIsBRReviewOpen(false);
    setSelectedEmployerId(null);
  };

  return (
    <div className="notifications-page">

<div className="notifications-grid">
        {/* --------- CỘT TRÁI: DOANH NGHIỆP (COMPANY) --------- */}
        <section className="column">
          <div className="column-header">
            <h3>Hồ Sơ Doanh Nghiệp Chờ Duyệt</h3>
          </div>

          <div className="column-body">
            {loadingCompanies ? (
              <div className="loading">Đang tải...</div>
            ) : pendingCompanies.length === 0 ? (
              <div className="no-data">Không có hồ sơ doanh nghiệp nào đang chờ duyệt.</div>
            ) : (
              <div className="pending-list">
                {pendingCompanies.map((comp) => (
                  <div className="pending-card company-card" key={comp.companyId || comp.id}>
                    {/* Giữ nguyên nội dung card của bạn – đây chỉ là ví dụ khung */}
                    <div className="card-title">
                      {comp.companyName || comp.name || "Doanh nghiệp không rõ"}
                    </div>
                    <div className="card-sub">
                      Người liên hệ: {comp.contactName || "—"} • Email: {comp.contactEmail || "—"} • Trạng thái:{" "}
                      {comp.verificationStatus || (comp.verified ? "VERIFIED" : "PENDING")}
                    </div>
                    <span className="status-pending">Chờ duyệt hồ sơ</span>
                    {/* Nếu có modal doanh nghiệp riêng, bạn đặt nút ở đây.
                        Yêu cầu ban đầu: không chỉnh nội dung card, nên mình không thêm handler. */}
                    <button className="btn">Xem hồ sơ</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      {/* ==================== EMPLOYER PENDING ==================== */}
      
<section className="column">
          <div className="column-header">
            <h3>Hồ Sơ Nhà Tuyển Dụng Chờ Duyệt</h3>
          </div>

      
<div className="column-body">
            {loadingEmployers ? (
              <div className="loading">Đang tải...</div>
            ) : pendingEmployers.length === 0 ? (
              <div className="no-data">Không có hồ sơ nhà tuyển dụng nào đang chờ duyệt.</div>
            ) : (
              <div className="pending-list">
                {pendingEmployers.map((emp) => (
                  <div className="pending-card employer-card" key={emp.employerId}>
                    <div className="card-title">
                      {emp.companyName || emp.company?.name || "Doanh nghiệp không rõ"}
                    </div>
                    <div className="card-sub">
                      Người liên hệ: {emp.fullName || emp.name || "—"} • Email: {emp.email || "—"} • Trạng thái:{" "}
                      {emp.verificationStatus || (emp.verified ? "VERIFIED" : "PENDING")}
                    </div>
                    <button className="btn" onClick={() => openBRReview(emp.employerId)}>
                      Xem hồ sơ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>


      {/* Modal Duyệt */}
     

      {isBRReviewOpen && selectedEmployerId && (
        <BusinessRegistrationReviewModal
          employerId={selectedEmployerId}
          onClose={closeBRReview}
          onSuccess={fetchPendingEmployers}
        />
      )}
    </div>
  );
}
