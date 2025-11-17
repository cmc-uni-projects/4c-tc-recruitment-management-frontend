import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyCV.css";

export default function MyCV() {
  const [createdCVs, setCreatedCVs] = useState([]);
  const [uploadedCVs, setUploadedCVs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockCreatedCVs = [
    {
      id: 1,
      name: "CV thực tập 1",
      updatedAt: "18-08-2025",
      image: "/images/cv-template-1.png",
    },
    {
      id: 2,
      name: "CV thực tập 2",
      updatedAt: "10-08-2025",
      image: "/images/cv-template-2.png",
    },
  ];

  const mockUploadedCVs = [
    {
      id: 3,
      name: "CV đã tải lên",
      updatedAt: "05-08-2025",
      image: "/images/cv-uploaded.png",
    },
  ];

  useEffect(() => {
    // Giả lập gọi API
    const timer = setTimeout(() => {
      setCreatedCVs(mockCreatedCVs);
      setUploadedCVs(mockUploadedCVs);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="mycv-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="mycv-layout">
      {/* Cột trái */}
      <div className="mycv-left">
        

        {/* CV đã tạo */}
        <div className="cv-section">
          <div className="cv-section-header">
            <h2>CV đã tạo trên SmartHire</h2>
            <button className="btn-create-cv">+ Tạo CV</button>
          </div>
          <div className="cv-list">
            {createdCVs.map((cv) => (
              <div key={cv.id} className="cv-card">
                <img src={cv.image} alt={cv.name} className="cv-image" />
                <p className="cv-name">{cv.name}</p>
                <p className="cv-date">Cập nhật: {cv.updatedAt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CV đã tải lên */}
        <div className="cv-section">
          <div className="cv-section-header">
            <h2>CV đã tải lên SmartHire</h2>
            <button className="btn-upload-cv">+ Tải CV lên</button>
          </div>
          <div className="cv-list">
            {uploadedCVs.map((cv) => (
              <div key={cv.id} className="cv-card">
                <img src={cv.image} alt={cv.name} className="cv-image" />
                <p className="cv-name">{cv.name}</p>
                <p className="cv-date">Cập nhật: {cv.updatedAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

     
    </div>
  );
}