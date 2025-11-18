import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { employerAPI } from "../../services/auth.services";
import { toast } from "react-toastify";

const CompanyInfo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu tạm từ bước 1
  const tempData = JSON.parse(localStorage.getItem("employer_personal_temp") || "{}");

  const [companyData, setCompanyData] = useState({
    companyName: "",
    taxCode: "",
    address: "",
    website: "",
    size: "",
    industry: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!companyData.companyName.trim()) return toast.error("Vui lòng nhập tên công ty");

    setLoading(true);

    const formData = new FormData();

    // Dữ liệu từ bước 1
    formData.append("positionTitle", tempData.positionTitle);
    formData.append("department", tempData.department);
    formData.append("workEmail", tempData.workEmail);

    // Dữ liệu công ty
    formData.append("companyName", companyData.companyName);
    formData.append("taxCode", companyData.taxCode || "");
    formData.append("address", companyData.address || "");
    formData.append("website", companyData.website || "");
    formData.append("size", companyData.size || "");
    formData.append("industry", companyData.industry || "");
    formData.append("description", companyData.description || "");

    // Avatar nếu có
    if (tempData.avatarFile) {
      formData.append("avatar", tempData.avatarFile);
    }

    try {
      await employerAPI.createEmployer(formData);

      // Xóa dữ liệu tạm
      localStorage.removeItem("employer_personal_temp");

      toast.success("Tạo hồ sơ nhà tuyển dụng thành công!");
      navigate("/hr/dashboard"); // hoặc trang chính

    } catch (err) {
      toast.error(err.response?.data?.message || "Tạo hồ sơ thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="personal-info-container">
      <h2>Thông tin công ty</h2>
      <p className="step-hint">Bước 2/4 - Hoàn thiện hồ sơ nhà tuyển dụng</p>

      <form onSubmit={handleFinalSubmit} className="personal-info-form">
        <div className="form-group full-width">
          <label>Tên công ty <span className="required">*</span></label>
          <input
            type="text"
            name="companyName"
            value={companyData.companyName}
            onChange={handleChange}
            placeholder="VD: Công ty CP Samsung Electronics Việt Nam"
            required
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Mã số thuế</label>
            <input type="text" name="taxCode" value={companyData.taxCode} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input type="text" name="website" value={companyData.website} onChange={handleChange} placeholder="https://company.com" />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Địa chỉ công ty</label>
          <input type="text" name="address" value={companyData.address} onChange={handleChange} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/hr/profile")}>
            Quay lại
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Đang tạo..." : "Hoàn thành"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyInfo;