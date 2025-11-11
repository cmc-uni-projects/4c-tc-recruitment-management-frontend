import React, { useState, useEffect } from "react";
import "./BlogSection.css";
import { Link } from "react-router-dom";

// Import ảnh thật từ src/assets
import tipImage from "../../assets/tips.webp";
import aiRecruitmentImage from "../../assets/ai-in-recruitment.webp";
import learningSkillsImage from "../../assets/Learning-skills.webp";

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fakeBlogs = [
      {
        id: 1,
        title: "5 mẹo giúp CV nổi bật trong mắt nhà tuyển dụng",
        description:
          "Tìm hiểu cách tối ưu CV để thu hút sự chú ý của HR và hệ thống AI Matching.",
        thumbnail: tipImage,
        date: "01/11/2025",
      },
      {
        id: 2,
        title: "Công nghệ AI đang thay đổi tuyển dụng thế nào?",
        description:
          "AI không chỉ tự động lọc hồ sơ mà còn dự đoán ứng viên phù hợp với vị trí công việc.",
        thumbnail: aiRecruitmentImage,
        date: "02/11/2025",
      },
      {
        id: 3,
        title: "Một số kỹ năng cần có trong thời đại số",
        description:
          "Không chỉ kỹ năng chuyên môn, kỹ năng mềm và hiểu biết công nghệ cũng là lợi thế.",
        thumbnail: learningSkillsImage,
        date: "03/11/2025",
      },
    ];
    setBlogs(fakeBlogs);
  }, []);

  return (
    <section className="blog-section">
      <h2 className="blog-title">Tin tức & Blog mới nhất</h2>
      <div className="blog-list">
        {blogs.map((blog) => (
          <div key={blog.id} className="blog-card">
            <img src={blog.thumbnail} alt={blog.title} className="blog-img" />
            <div className="blog-content">
              <p className="blog-date">🗓 {blog.date}</p>
              <h3>{blog.title}</h3>
              <p>{blog.description}</p>
              <Link to={`/blog/${blog.id}`} className="read-more">
                Đọc thêm →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;