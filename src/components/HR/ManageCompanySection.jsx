
import React, { useEffect, useState } from "react";
import "./ManageCompanySection.css";
import { companyAPI, employerAPI } from "../../services/auth.services";
import Swal from "sweetalert2";

function ManageCompanySection() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [originalForm, setOriginalForm] = useState({});
  const [form, setForm] = useState({
    name: "",
    industry: "",
    description: "",
    logoUrl: "",
    coverUrl: "",
    website: "",
    address: "",
    city: "",
    size: "MEDIUM",
    foundedYear: "",
    status: "ACTIVE",
  });

  // NEW: danh sách HR cùng công ty
  const [hrList, setHrList] = useState([]);
  const [loadingHR, setLoadingHR] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  // Khi đã có company, gọi lấy HR danh sách
  useEffect(() => {
    if (!loading && company) {
      fetchHrOfMyCompany();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, company]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      // Lấy employer hiện tại (cache nếu có)
      let employer = JSON.parse(localStorage.getItem("employer"));
      if (!employer?.employerId) {
        const resMe = await employerAPI.getMyEmployer();
        employer = resMe.data;
        localStorage.setItem("employer", JSON.stringify(employer));
      }

      const companyId = employer.company?.companyId || employer.companyId;
      if (!companyId) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không tìm thấy công ty liên kết.",
          confirmButtonText: "Đóng",
        });
        setLoading(false);
        return;
      }

      // Lấy thông tin company bản đầy đủ (HR/ADMIN view)
      const resCompany = await companyAPI.getByIdAdmin(companyId);
      const data = resCompany.data;
      setCompany(data);

      const formData = {
        name: data.name || "",
        industry: data.industry || "",
        description: data.description || "",
        logoUrl: data.logoUrl || "",
        coverUrl: data.coverUrl || "",
        website: data.website || "",
        address: data.address || "",
        city: data.city || "",
        size: data.size || "MEDIUM",
        foundedYear: data.foundedYear || "",
        status: data.status || "ACTIVE",
      };

      setForm(formData);
      setOriginalForm(formData);

      const currentEmail =
        JSON.parse(localStorage.getItem("user"))?.email || employer.email;
      setCanEdit(data.createdBy === currentEmail);

      localStorage.setItem("selectedCompany", JSON.stringify(data));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi tải dữ liệu",
        text:
          err.response?.data?.message ||
          "Không thể tải thông tin công ty.",
        confirmButtonText: "Đóng",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHrOfMyCompany = async () => {
    setLoadingHR(true);
    try {
      const res = await employerAPI.getMyCompanyEmployers();
      setHrList(res.data || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Không tải được danh sách HR",
        text: err.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setLoadingHR(false);
    }
  };

  const startEditing = () => {
    setOriginalForm({ ...form });
    setEditing(true);
  };

  const cancelEditing = async () => {
    const result = await Swal.fire({
      title: "Hủy chỉnh sửa?",
      text: "Tất cả thay đổi sẽ bị mất.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, hủy",
      cancelButtonText: "Tiếp tục chỉnh sửa",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      setForm({ ...originalForm });
      setEditing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: "Lưu thay đổi?",
      text: "Thông tin công ty sẽ được cập nhật ngay.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Lưu thay đổi",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "swal-btn-confirm",
        cancelButton: "swal-btn-cancel",
      },
    });
    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Đang lưu...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await companyAPI.update(company.companyId, form);
      setCompany(res.data);
      setOriginalForm({ ...form });
      setEditing(false);
      localStorage.setItem("selectedCompany", JSON.stringify(res.data));
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật thông tin công ty thành công!",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text:
          err.response?.data?.message ||
          "Đã có lỗi xảy ra. Vui lòng thử lại.",
        confirmButtonText: "Đóng",
      });
    }
  };

  if (loading)
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Đang tải thông tin công ty...</p>
      </div>
    );

  if (!company)
    return (
      <div className="no-data">
        <p>Chưa có thông tin công ty.</p>
      </div>
    );

  return (
    <div className="company-profile-container">
      {/* Ảnh bìa + Logo nổi */}
      <div className="cover-photo-wrapper">
        <div className="cover-photo">
          {form.coverUrl ? (
            <img src={form.coverUrl} alt="Cover" />
          ) : (
            <div className="cover-placeholder"></div>
          )}
        </div>
        <div className="company-logo-floating">
          {form.logoUrl ? (
            <img src={form.logoUrl} alt="Logo công ty" />
          ) : (
            <div className="logo-placeholder">
              <span>{form.name?.[0]?.toUpperCase() || "C"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Thông tin chính */}
      <div className="company-main-info">
        <div className="company-header">
          <div>
            <h1 className="company-name">{form.name || "Tên công ty"}</h1>
            <div className="company-meta-info">
              <span className="industry">
                {form.industry || "Chưa cập nhật ngành nghề"}
              </span>
              {form.city && <span className="location"> • {form.city}</span>}
            </div>
          </div>

          <div className="header-actions">
            {form.status === "ACTIVE" ? (
              <span className="status-badge active">Đang hoạt động</span>
            ) : (
              <span className="status-badge inactive">Tạm dừng</span>
            )}
            {canEdit && !editing && (
              <button className="btn-edit" onClick={startEditing}>
                <i className="icon-edit"></i> Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {!canEdit && (
          <div className="permission-note">
            Chỉ người tạo công ty mới được chỉnh sửa thông tin
          </div>
        )}
      </div>

      {/* Form chỉnh sửa */}
      <div className="company-details-section">
        <form onSubmit={handleSave} className="company-form-modern">
          <div className="form-grid">
            <div className="form-column">
              <div className="form-group">
                <label>Tên công ty</label>
                <input
                  type="text"
                  value={form.name}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Ngành nghề</label>
                <input
                  type="text"
                  value={form.industry}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, industry: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={form.website}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Thành phố</label>
                <input
                  type="text"
                  value={form.city}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Quy mô công ty</label>
                <select
                  value={form.size}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, size: e.target.value })
                  }
                >
                  <option value="SMALL">Dưới 50 người</option>
                  <option value="MEDIUM">50 - 200 người</option>
                  <option value="LARGE">200 - 1000 người</option>
                  <option value="ENTERPRISE">Trên 1000 người</option>
                </select>
              </div>

              <div className="form-group">
                <label>Năm thành lập</label>
                <input
                  type="number"
                  value={form.foundedYear}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, foundedYear: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label>Logo URL</label>
                <input
                  type="url"
                  value={form.logoUrl}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, logoUrl: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="form-group">
                <label>Ảnh bìa URL</label>
                <input
                  type="url"
                  value={form.coverUrl}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, coverUrl: e.target.value })
                  }
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ trụ sở</label>
                <input
                  type="text"
                  value={form.address}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              {canEdit && (
                <div className="form-group">
                  <label>Trạng thái hoạt động</label>
                  <div className="radio-buttons">
                    <label
                      className={form.status === "ACTIVE" ? "active" : ""}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="ACTIVE"
                        checked={form.status === "ACTIVE"}
                        disabled={!editing}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      />
                      Đang hoạt động
                    </label>
                    <label
                      className={form.status === "INACTIVE" ? "active" : ""}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="INACTIVE"
                        checked={form.status === "INACTIVE"}
                        disabled={!editing}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      />
                      Tạm dừng
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group full-width">
            <label>Mô tả công ty</label>
            <textarea
              rows="6"
              value={form.description}
              disabled={!editing}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Giới thiệu về công ty, văn hóa, sứ mệnh..."
            ></textarea>
          </div>

          {editing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={cancelEditing}
              >
                Hủy bỏ
              </button>
              <button type="submit" className="btn-save">
                Lưu thay đổi
              </button>
            </div>
          )}
        </form>

        <div className="created-by">
          Người tạo: <strong>{company.createdBy || "Không rõ"}</strong>
        </div>
      </div>

      {/* Danh sách HR cùng công ty */}
      <div className="company-details-section">
        <div className="hr-section-header">
          <h2>Danh sách HR của công ty</h2>
          <button
            className="btn-refresh"
            onClick={fetchHrOfMyCompany}
            disabled={loadingHR}
            title="Làm mới danh sách"
          >
            ⟳ {loadingHR ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {loadingHR ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải danh sách HR...</p>
          </div>
        ) : hrList.length === 0 ? (
          <div className="no-data">Chưa có HR nào.</div>
        ) : (
          <div className="hr-list">
            {hrList.map((hr) => (
              <div key={hr.employerId} className="hr-card">
                <div className="hr-left">
                  <div className="hr-avatar">
                    {hr.user?.fullName?.[0]?.toUpperCase() ||
                      hr.user?.email?.[0]?.toUpperCase() ||
                      hr.workEmail?.[0]?.toUpperCase() ||
                      "H"}
                  </div>
                  <div className="hr-info">
                    <div className="hr-name">
                      {hr.user?.fullName ||
                        hr.user?.email ||
                        hr.workEmail ||
                        "HR"}
                    </div>
                    <div className="hr-meta">
                      {hr.positionTitle ? (
                        <span className="hr-title">{hr.positionTitle}</span>
                      ) : (
                        <span className="hr-title muted">Chưa có chức danh</span>
                      )}
                      {hr.department && (
                        <span className="hr-dept"> • {hr.department}</span>
                      )}
                    </div>
                    <div className="hr-contact">
                      {hr.workEmail && (
                        <a
                          href={`mailto:${hr.workEmail}`}
                          className="hr-mail"
                          title="Gửi email công việc"
                        >
                          {hr.workEmail}
                        </a>
                      )}
                      {hr.phone && (
                        <span className="hr-phone"> • {hr.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hr-right">
                  {hr.verified ? (
                    <span className="badge-verified">Đã xác minh</span>
                  ) : (
                    <span className="badge-unverified">Chưa xác minh</span>
                  )}

                  {/* Có thể thêm hành động khác: xem chi tiết HR, nhắn tin nội bộ... */}
                  <button
                    className="btn-outline"
                    onClick={() =>
                      Swal.fire({
                        icon: "info",
                        title: "Thông tin HR",
                        html: `
                          <div style="text-align:left">
                            <div><b>Email:</b> ${
                              hr.user?.email || hr.workEmail || "N/A"
                            }</div>
                            <div><b>Chức danh:</b> ${
                              hr.positionTitle || "N/A"
                            }</div>
                            <div><b>Phòng ban:</b> ${
                              hr.department || "N/A"
                            }</div>
                            <div><b>Số điện thoại:</b> ${hr.phone || "N/A"}</div>
                          </div>
                        `,
                      })
                    }
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageCompanySection;
