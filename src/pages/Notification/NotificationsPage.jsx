import React, { useEffect, useState } from "react";
import { companyAPI, employerAPI } from "../../services/auth.services";
import EmployerReviewModal from "../../components/Admin/EmployerReviewModal";
import CompanyReviewModal from "../../components/Admin/CompanyReviewModal";
import "./NotificationsPage.css";
import Navbar from "../../components/Layout/Navbar";
import Swal from "sweetalert2";

export default function NotificationsPage() {
  // --- COMPANY pending (mới) ---
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isCompanyReviewOpen, setIsCompanyReviewOpen] = useState(false);

  // --- EMPLOYER pending (mới) ---
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(true);
  const [selectedEmployerId, setSelectedEmployerId] = useState(null);
  const [isBRReviewOpen, setIsBRReviewOpen] = useState(false);

  // ====== FETCH DOANH NGHIỆP ======
  const fetchPendingCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const res = await companyAPI.getAll(); // DÙNG companyAPI, KHÔNG DÙNG jobAPI

      const pending = (res.data || []).filter(company => {
        if (company.verify === "PENDING") return true;
        if (company.verificationStatus === "PENDING") return true;
        if (!company.verify && company.businessRegistrationUrl) return true;
        return false;
      });

      console.log("[Company] Tổng:", res.data?.length, "| Chờ duyệt:", pending.length);
      setPendingCompanies(pending);
    } catch (error) {
      console.error("[Company Pending] Lỗi:", error);
      const code = error?.response?.status;

      Swal.fire({
        icon: "error",
        title: "Lỗi tải danh sách công ty",
        text: code === 403
          ? "Bạn cần quyền ADMIN để xem danh sách công ty chờ duyệt."
          : error?.response?.data?.message || "Không thể tải dữ liệu công ty.",
      });
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

      Swal.fire(
        "Lỗi",
        code === 403
          ? "Bạn cần quyền ADMIN để xem hồ sơ doanh nghiệp chờ duyệt."
          : msg ??
              `Lỗi tải danh sách hồ sơ doanh nghiệp chờ duyệt (HTTP ${
                code ?? "?"
              })`,
        "error"
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

  // Hàm mở modal công ty
  const openCompanyReview = (companyId) => {
    setSelectedCompanyId(companyId);
    setIsCompanyReviewOpen(true);
  };

  const closeCompanyReview = () => {
    setIsCompanyReviewOpen(false);
    setSelectedCompanyId(null);
  };

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
                  <div className="pending-card company-card" key={comp.companyId}>
                    <div className="card-title">
                      {comp.name || "Doanh nghiệp không tên"}
                    </div>
                    <div className="card-sub">
                      MST: <strong>{comp.taxCode || "—"}</strong> • {comp.city || "—"} • Trạng thái: PENDING
                    </div>
                    <button
                      className="btn"
                      onClick={() => openCompanyReview(comp.companyId)}
                    >
                      Xem hồ sơ
                    </button>
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
              <div className="no-data">
                Không có hồ sơ nhà tuyển dụng nào đang chờ duyệt.
              </div>
            ) : (
              <div className="pending-list">
                {pendingEmployers.map((emp) => (
                  <div
                    className="pending-card employer-card"
                    key={emp.employerId}
                  >
                    <div className="card-title">
                      {emp.companyName ||
                        emp.company?.name ||
                        "Doanh nghiệp không rõ"}
                    </div>
                    <div className="card-sub">
                      Người liên hệ: {emp.fullName || emp.name || "—"} • Email:{" "}
                      {emp.email || "—"} • Trạng thái:{" "}
                      {emp.verificationStatus ||
                        (emp.verified ? "VERIFIED" : "PENDING")}
                    </div>
                    <button
                      className="btn"
                      onClick={() => openBRReview(emp.employerId)}
                    >
                      Xem hồ sơ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal duyệt công ty */}
      {isCompanyReviewOpen && selectedCompanyId && (
        <CompanyReviewModal
          companyId={selectedCompanyId}
          onClose={closeCompanyReview}
          onSuccess={fetchPendingCompanies}
        />
      )}
      {/* Modal Duyệt */}
      {isBRReviewOpen && selectedEmployerId && (
        <EmployerReviewModal
          employerId={selectedEmployerId}
          onClose={closeBRReview}
          onSuccess={fetchPendingEmployers}
        />
      )}
    </div>
  );
}
