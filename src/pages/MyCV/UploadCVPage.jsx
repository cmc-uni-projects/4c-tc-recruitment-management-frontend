// src/pages/MyCV/UploadCVPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Layout/Navbar";
import { uploadCV } from "../../services/auth.services";
import Swal from "sweetalert2";
import "./UploadCVPage.css";

export default function UploadCVPage() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Kiểm tra dung lượng (< 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      Swal.fire("Lỗi", "File không được vượt quá 5MB!", "error");
      return;
    }

    // Kiểm tra định dạng
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      Swal.fire("Lỗi", "Chỉ chấp nhận file .pdf, .doc hoặc .docx!", "error");
      return;
    }

    setFile(selectedFile);
    Swal.fire("Thành công", `Đã chọn: ${selectedFile.name}`, "success");
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadCV(formData);
      Swal.fire("Thành công", "Upload CV thành công! Nhà tuyển dụng sẽ sớm thấy bạn", "success");
      setTimeout(() => navigate("/my-cv"), 2000);
    } catch (err) {
      
Swal.fire(
        "Lỗi",
        "Upload thất bại: " + (err.response?.data?.message || err.message),
        "error"
      );
    }
  };


  return (
    <>
      <Navbar />
      <div className="upload-cv-container">
        <div className="upload-box">
          <h1>Upload CV để các cơ hội việc làm tự tìm đến bạn</h1>
          <p className="subtitle">
            Giảm đến <strong>50%</strong> thời gian tìm việc khi nhà tuyển dụng
            chủ động liên hệ bạn
          </p>

          {/* Khu vực kéo thả + chọn file */}
          <div
            className={`drop-zone ${dragging ? "dragging" : ""} ${
              file ? "has-file" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="cv-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {!file ? (
              <>
                <svg
                  className="upload-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="drop-text">
                  <label htmlFor="cv-upload" className="browse-link">
                    Nhấn để chọn file
                  </label>{" "}
                  hoặc kéo thả CV vào đây
                </p>
              </>
            ) : (
              <div className="file-preview">
                <svg className="file-icon" viewBox="0 0 24 24">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    fill="#e74c3c"
                  />
                  <polyline
                    points="14 2 14 8 20 8"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </svg>
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button onClick={() => setFile(null)} className="remove-file">
                  ×
                </button>
              </div>
            )}
          </div>

          <p className="file-info">
            Hỗ trợ định dạng: <strong>.doc, .docx, .pdf</strong> | Kích thước
            tối đa: <strong>5MB</strong>
          </p>

          <button
            onClick={handleUpload}
            disabled={!file}
            className={`btn-upload-final ${file ? "active" : ""}`}
          >
            <span>Tải CV lên ngay</span>
          </button>
        </div>
      </div>

     
    </>
  );
}
