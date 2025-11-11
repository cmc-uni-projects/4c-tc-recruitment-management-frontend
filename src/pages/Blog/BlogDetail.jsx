import React from "react";
import { useParams, Link } from "react-router-dom";
import "./BlogDetail.css";

// ✅ Import ảnh với tên file chính xác
import tipImage from "../../assets/tips.webp";
import aiRecruitmentImage from "../../assets/ai-in-recruitment.webp";
import learningSkillsImage from "../../assets/Learning-skills.webp";

const BlogDetail = () => {
  const { id } = useParams();

  const fakeBlogs = [
    {
      id: 1,
      title: "5 mẹo giúp CV nổi bật trong mắt nhà tuyển dụng",
      content: `
        Một CV nổi bật không chỉ thể hiện kinh nghiệm, mà còn là cách bạn kể câu chuyện nghề nghiệp của mình.  
        🔹 Sử dụng từ khóa phù hợp với mô tả công việc.  
        🔹 Đảm bảo bố cục rõ ràng, dễ đọc.  
        🔹 Nhấn mạnh thành tựu thay vì chỉ liệt kê công việc.  
        🔹 Tùy chỉnh CV cho từng vị trí.  
        🔹 Kiểm tra lỗi chính tả và định dạng trước khi gửi.  
      `,
      thumbnail: tipImage,
      date: "01/11/2025",
    },
    {
      id: 2,
      title: "Công nghệ AI đang thay đổi tuyển dụng thế nào?",
      content: `
        AI đang cách mạng hóa quá trình tuyển dụng bằng cách tự động lọc hồ sơ và đánh giá ứng viên dựa trên dữ liệu.  
        HR giờ đây có thể tập trung nhiều hơn vào yếu tố con người, trong khi AI đảm nhận phần "nặng" của quy trình.  
      `,
      thumbnail: aiRecruitmentImage,
      date: "02/11/2025",
    },
    {
      id: 3,
      title: "Những kỹ năng cần có trong thời đại số",
      content: `
        Trong thời đại số, việc am hiểu công nghệ không còn là lợi thế — nó là điều bắt buộc.  
        Hãy trau dồi thêm kỹ năng mềm, tư duy phản biện và học cách làm việc với AI, vì đó là tương lai.  
      `,
      thumbnail: learningSkillsImage,
      date: "03/11/2025",
    },
  ];

  const blog = fakeBlogs.find((b) => b.id === Number(id));

  if (!blog) {
    return (
      <p style={{ textAlign: "center", padding: "50px" }}>
        Bài viết không tồn tại.
      </p>
    );
  }

  return (
    <div className="blog-detail">
      <img
        src={blog.thumbnail}
        alt={blog.title}
        className="blog-detail-img"
        loading="lazy"
      />
      <div className="blog-detail-content">
        <h1>{blog.title}</h1>
        <p className="blog-detail-date">🗓 {blog.date}</p>
        <div className="blog-detail-text">
          {blog.content.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <Link to="/" className="back-btn">
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default BlogDetail;