import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { employerAPI } from "../../services/auth.services";
import "./BusinessRegistration.css";

const BusinessRegistration = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState("business-license");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // NEW: Popup

  const employerData = JSON.parse(localStorage.getItem("employer") || "{}");
  const employerId = employerData.employerId;
  console.log("hsagdid: ", employerId);
  


  

  useEffect(() => {
    if (employerData?.verificationStatus === "PENDING" || employerData?.verified) {
      navigate("/hr");
      return;
    }

    if (!employerId) {
      Swal.fire("Lỗi", "Không tìm thấy thông tin nhà tuyển dụng.", "error");
      navigate("/hr/profile/company");
    }
  }, [employerData, employerId, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      Swal.fire("Lỗi", "Chỉ chấp nhận file: .jpg, .jpeg, .png, .pdf", "error");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      Swal.fire("Lỗi", "Dung lượng file không được vượt quá 5MB", "error");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview("/pdf-preview.png");
    }
  };

  const handleSubmitVerification = async () => {
    if (!file) {
      Swal.fire("Cảnh báo", "Vui lòng chọn file giấy tờ", "warning");
      return;
    }

    setLoading(true);

    try {
      // B1: Upload file
      await employerAPI.uploadBusinessRegistration(employerId, file);

      // B2: Gửi yêu cầu xác minh
      await employerAPI.requestVerification(employerId);

      // QUAN TRỌNG NHẤT: GỌI LẠI API ĐỂ LẤY DỮ LIỆU MỚI NHẤT TỪ SERVER
    const updatedRes = await employerAPI.getMyEmployer();
    const updatedEmployer = updatedRes.data;

    // CẬP NHẬT LẠI localStorage VỚI DỮ LIỆU MỚI (có verificationStatus: "PENDING")
    localStorage.setItem("employer", JSON.stringify(updatedEmployer));
    if (updatedEmployer.company) {
      localStorage.setItem("selectedCompany", JSON.stringify(updatedEmployer.company));
    }

      // HIỆN POPUP THÀNH CÔNG + CHUYỂN TRANG
      setShowSuccessPopup(true);

      // Sau 3.5 giây tự động về trang HR Dashboard
      setTimeout(() => {
        window.location.href = "/hr";
      }, 3500);

    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      Swal.fire("Lỗi", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="business-registration-wrapper">
        <h2>Thông tin Giấy đăng ký doanh nghiệp</h2>
        <p className="subtitle">
          Vui lòng lựa chọn phương thức đăng tải, xem hướng dẫn đăng tải{" "}
          <a href="#" className="link-guide">Tại đây</a>
        </p>

        <div className="upload-options">
          <label className={`upload-option ${uploadType === "business-license" ? "active" : ""}`}>
            <input type="radio" name="uploadType" checked={uploadType === "business-license"} onChange={() => setUploadType("business-license")} />
            <span className="radio-circle"></span>
            Giấy đăng ký doanh nghiệp hoặc Giấy tờ tương đương khác
          </label>

          <label className={`upload-option ${uploadType === "other" ? "active" : ""}`}>
            <input type="radio" name="uploadType" checked={uploadType === "other"} onChange={() => setUploadType("other")} />
            <span className="radio-circle"></span>
            Giấy ủy quyền và Giấy tờ định danh
          </label>
        </div>

        <div className="upload-box">
          <div className="upload-section">
            <label className="upload-label">
              Giấy tờ <span className="required">*</span>
            </label>

            <div className="drop-zone">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                id="file-input"
              />
              <label htmlFor="file-input" className="drop-label">
                {file ? (
                  <span className="file-name">{file.name}</span>
                ) : (
                  <>
                    <div className="upload-icon">Upload Icon</div>
                    <p>Chọn hoặc kéo file vào đây</p>
                    <p className="file-info">
                      Dung lượng tối đa 5MB, định dạng: jpeg, jpg, png, pdf
                    </p>
                    <button type="button" className="btn-choose-file">
                      Chọn file
                    </button>
                  </>
                )}
              </label>
            </div>

            <div className="warning-box">
              <strong>Các văn bản đăng tải cần đầy đủ các mặt và không có dấu hiệu chỉnh sửa / che / cắt thông tin</strong>
              <ul>
                <li>
                  Vui lòng đăng tải Giấy đăng ký doanh nghiệp có thông tin trùng khớp với dữ liệu của doanh nghiệp theo Trang thông tin điện tử của Cục Thuế
                </li>
              </ul>
            </div>
          </div>

          <div className="preview-section">
            <p className="preview-title">Minh họa</p>
            {preview ? (
              <img src={preview} alt="Preview giấy tờ" className="preview-image" />
            ) : (
              <div className="preview-placeholder">
                <img src="/sample-business-license.jpg" alt="Mẫu giấy đăng ký" />
              </div>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn-save"
            onClick={handleSubmitVerification}
            disabled={!file || loading}
          >
            {loading ? "Đang xử lý..." : "Gửi yêu cầu xác thực"}
          </button>
        </div>
      </div>

      {/* POPUP THÀNH CÔNG – ĐẸP NHƯ TOPCV */}
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-icon">Checkmark</div>
            <h3>Gửi yêu cầu thành công!</h3>
            <p>Yêu cầu xác minh hồ sơ của bạn đã được gửi đến Admin.</p>
            <p>Chúng tôi sẽ phản hồi trong vòng 1-3 ngày làm việc.</p>
            <small>Đang chuyển về trang chủ HR...</small>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessRegistration;