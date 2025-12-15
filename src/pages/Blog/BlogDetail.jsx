
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./BlogDetail.css";
import Navbar from "../../components/Layout/Navbar";

// Ảnh mẫu (giữ nguyên như project của bạn)
import tipImage from "../../assets/tips.webp";
import aiRecruitmentImage from "../../assets/ai-in-recruitment.webp";
import learningSkillsImage from "../../assets/Learning-skills.webp";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dữ liệu demo: 3 bài viết với nội dung mở rộng (nhiều chữ hơn)
  const fakeBlogs = [
    {
      id: 1,
      title: "5 mẹo giúp CV nổi bật trong mắt nhà tuyển dụng",
      content: `Một CV nổi bật không chỉ thể hiện kinh nghiệm, mà còn là cách bạn kể câu chuyện nghề nghiệp của mình. Khi nhà tuyển dụng mở hồ sơ, họ chỉ có vài chục giây để quyết định có đọc tiếp hay không. Vì vậy, mục tiêu của bạn là tạo ra một bố cục rõ ràng, súc tích, vừa truyền tải được giá trị, vừa tạo cảm giác chuyên nghiệp ngay từ ánh nhìn đầu tiên.

Hãy bắt đầu bằng phần Tóm tắt/Objective ngắn gọn (2–3 câu) thể hiện mục tiêu nghề nghiệp và đóng góp bạn có thể mang lại cho vị trí. Tránh các câu chung chung như “Làm việc chăm chỉ, ham học hỏi”, thay vào đó hãy nêu rõ thế mạnh định lượng: ví dụ “Tối ưu quy trình tuyển dụng, giảm 25% thời gian tuyển cho vai trò công nghệ trong 6 tháng”.

🔹 Sử dụng từ khóa phù hợp với mô tả công việc: Đọc kỹ JD và nhấn mạnh kỹ năng/kinh nghiệm liên quan ở phần Kỹ năng và Kinh nghiệm.  
🔹 Đảm bảo bố cục rõ ràng, dễ đọc: Dùng tiêu đề, khoảng trắng và bullet để mắt lướt nhanh.  
🔹 Nhấn mạnh thành tựu thay vì chỉ liệt kê đầu việc: Gắn số liệu (%, thời gian, doanh thu, chi phí) để tăng độ tin cậy.  
🔹 Tùy chỉnh CV cho từng vị trí: Thay đổi thứ tự kỹ năng và dự án để khớp với yêu cầu.  
🔹 Kiểm tra lỗi chính tả và định dạng trước khi gửi: Một lỗi nhỏ có thể làm giảm chuyên nghiệp.

Phần Kinh nghiệm nên bắt đầu bằng kết quả, sau đó mô tả ngắn cách bạn đạt được. Ví dụ: “Tăng 35% tỷ lệ phản hồi email tuyển dụng thông qua thử nghiệm A/B tiêu đề và tối ưu CTA”. Cấu trúc STAR (Situation–Task–Action–Result) là khung rất hữu ích để cô đọng thành tựu trong 1–2 dòng.

Về kỹ năng, hãy phân nhóm: “Kỹ năng chuyên môn” (VD: phân tích dữ liệu, marketing automation, tuyển dụng kỹ sư), “Kỹ năng công cụ” (VD: Excel nâng cao, SQL cơ bản, ATS, Jira, Figma), và “Kỹ năng mềm” (VD: giao tiếp, đàm phán, quản lý thời gian). Tránh danh sách quá dài thiếu trọng số; tốt nhất chọn 6–8 kỹ năng trọng yếu và sắp xếp theo mức độ liên quan.

Nếu có khoảng trống nghề nghiệp, hãy trình bày minh bạch: “2023–2024: học chứng chỉ Data Analytics, thực hiện dự án cá nhân phân tích xu hướng tuyển dụng ngành Fintech”. Khoảng trống được lấp đầy bằng hoạt động học tập hoặc đóng góp cộng đồng sẽ tạo ấn tượng tích cực.

Cuối cùng, đừng quên kiểm tra tính nhất quán: tên công ty, thời gian làm việc, định dạng ngày (DD/MM/YYYY hoặc MM/YYYY) dùng thống nhất; tên file đặt chuyên nghiệp (Ví dụ: Lam_NguyenQuang_CV_2025.pdf). Nếu ứng tuyển nhiều vị trí, tạo phiên bản CV khác nhau để nâng cao tỷ lệ phù hợp.

Tổng kết: Một CV tốt là chiếc “pitch deck” cô đọng về con người bạn. Hãy ưu tiên rõ ràng, đo lường được thành tựu và liên kết chặt chẽ với nhu cầu của JD.`,
      thumbnail: tipImage,
      date: "01/11/2025",
      author: "CMC Talent Team",
      tags: ["CV", "Career Tips", "HR"],
    },
    {
      id: 2,
      title: "Công nghệ AI đang thay đổi tuyển dụng thế nào?",
      content: `AI đang cách mạng hóa quy trình tuyển dụng bằng cách tự động lọc hồ sơ và đánh giá ứng viên dựa trên dữ liệu. Điều này giúp đội ngũ nhân sự tiết kiệm thời gian ở các khâu lặp lại, đồng thời đưa ra nhận định nhất quán hơn khi sàng lọc số lượng lớn hồ sơ.

Ở giai đoạn đầu, hệ thống ATS tích hợp AI có thể phân tích từ khóa, nhận diện kỹ năng tương đương (ví dụ: “JavaScript” vs “JS”), và gợi ý xếp hạng hồ sơ dựa trên tiêu chí do doanh nghiệp thiết lập. Các mô hình NLP hỗ trợ đọc hiểu mô tả công việc, so khớp với kinh nghiệm của ứng viên, đồng thời gợi ý những “khoảng trống” kỹ năng cần đào tạo.

🔹 Tự động hóa liên lạc: Chatbot tuyển dụng có thể trả lời câu hỏi thường gặp, xác nhận lịch phỏng vấn, nhắc ứng viên hoàn thiện bài test.  
🔹 Đánh giá sớm: Bài kiểm tra năng lực trực tuyến và phân tích câu trả lời giúp sàng lọc trước khi đến vòng phỏng vấn.  
🔹 Dự báo phù hợp: Các mô hình học máy có thể dự đoán xác suất phù hợp văn hóa, tỷ lệ gắn bó dựa trên dữ liệu lịch sử (với điều kiện tuân thủ bảo mật và đạo đức dữ liệu).

Tuy nhiên, AI không phải “cây gậy thần”. Tính công bằng (fairness) và tránh thiên lệch (bias) là trọng tâm. Do dữ liệu quá khứ có thể chứa thiên lệch, doanh nghiệp cần thiết lập cơ chế kiểm tra và hiệu chỉnh thường xuyên: đánh giá độ chính xác theo nhóm, ẩn thuộc tính nhạy cảm, và có kênh phúc tra nếu ứng viên thấy bất thường.

Một nguyên tắc quan trọng là “human-in-the-loop”: AI hỗ trợ, còn quyết định cuối cùng thuộc về con người. Điều này giúp đảm bảo tính nhân văn, xem xét các yếu tố mà mô hình khó định lượng, như động lực, tiềm năng phát triển, và sự phù hợp với đội ngũ hiện tại.

Về mặt trải nghiệm ứng viên (candidate experience), AI có thể rút ngắn thời gian phản hồi, minh bạch quy trình và cung cấp nhận xét sau vòng test. Các tính năng như tự động lên lịch phỏng vấn đa múi giờ, đề xuất khung giờ tối ưu cho cả đôi bên, hay gửi checklist chuẩn bị phỏng vấn giúp trải nghiệm liền mạch hơn.

Nhìn chung, AI đưa tuyển dụng tiến gần hơn tới mô hình “data-driven”, nơi quyết định dựa trên bằng chứng và quy trình tối ưu liên tục. Doanh nghiệp nên bắt đầu từ các bài toán nhỏ: sàng lọc từ khóa, lịch phỏng vấn tự động, đánh giá năng lực cơ bản; sau đó mở rộng dần với phân tích dự báo và tối ưu nguồn ứng viên.`,
      thumbnail: aiRecruitmentImage,
      date: "02/11/2025",
      author: "Tech & HR",
      tags: ["AI", "Recruitment", "Automation"],
    },
    {
      id: 3,
      title: "Những kỹ năng cần có trong thời đại số",
      content: `Trong thời đại số, việc am hiểu công nghệ không còn là lợi thế — nó là điều bắt buộc. Dù bạn thuộc khối kỹ thuật hay kinh doanh, năng lực sử dụng dữ liệu, công cụ số và hợp tác đa chức năng sẽ quyết định hiệu quả công việc.

Trước hết, hãy xây dựng nền tảng kỹ năng “tổ hợp”: kỹ năng chuyên môn (domain) + kỹ năng số (digital) + kỹ năng mềm (soft). Sự giao thoa này tạo ra năng lực giải quyết vấn đề từ nhiều góc độ, ví dụ một chuyên viên tuyển dụng biết đọc dashboard dữ liệu nguồn ứng viên, thử nghiệm A/B thông điệp, và giao tiếp thuyết phục với các nhóm kỹ thuật.

🔹 Kỹ năng dữ liệu cơ bản: Hiểu các chỉ số, trực quan hóa dữ liệu và đặt câu hỏi đúng (data questioning).  
🔹 Tư duy hệ thống & tối ưu quy trình: Nhận diện nút thắt, thử nghiệm cải tiến nhỏ, đo lường kết quả.  
🔹 Hợp tác đa chức năng: Làm việc với kỹ sư, marketing, vận hành; thống nhất mục tiêu và ngôn ngữ chung.

Bên cạnh đó, khả năng học nhanh (learning agility) là “đòn bẩy” bền vững. Công nghệ thay đổi liên tục, nên thói quen học theo chu kỳ: xác định mục tiêu học, thực hành dự án nhỏ, nhận phản hồi, chia sẻ lại kiến thức cho đồng đội. Khi bạn có quy trình học, việc tiếp thu công cụ mới (như AI trợ lý, automation) sẽ trở nên tự nhiên.

Kỹ năng mềm giữ vai trò trung tâm: giao tiếp, thuyết trình, viết rõ ràng giúp bạn truyền tải ý tưởng và thuyết phục stakeholder. Quản lý thời gian và năng lượng giúp bạn duy trì nhịp làm việc, tránh “context switching” quá mức bằng cách gom việc cùng loại, dùng lịch khối (time-blocking), và đặt ranh giới cho nhiệm vụ ưu tiên.

Cuối cùng, hãy xây dựng “hồ sơ năng lực” sống động: ghi chép dự án, đóng gói case study, số hóa thành tựu dưới dạng bài blog/bản trình bày. Khi cơ hội đến, bạn có thể nhanh chóng đưa ra bằng chứng giá trị thực tế, thay vì chỉ mô tả chung chung.

Kỹ năng cho thời đại số không nằm ở những “chiêu thức” rời rạc, mà ở tư duy hệ thống, dữ liệu và học liên tục. Nếu kiên trì bồi đắp mỗi ngày, bạn sẽ tạo lợi thế cạnh tranh bền vững trong bất kỳ ngành nghề nào.`,
      thumbnail: learningSkillsImage,
      date: "03/11/2025",
      author: "CMC Academy",
      tags: ["Skills", "Digital", "Growth"],
    },
  ];

  const blog = useMemo(
    () => fakeBlogs.find((b) => b.id === Number(id)),
    [id]
  );

  if (!blog) {
    return (
      <>
        <Navbar />
        <div className="container not-found">
          <div className="card">
            <h2>😕 Bài viết không tồn tại</h2>
            <p>Bạn kiểm tra lại đường dẫn hoặc quay về trang blog.</p>
            <Link to="/" className="btn btn-primary">← Về trang chủ</Link>
          </div>
        </div>
      </>
    );
  }

  // Ước lượng thời gian đọc (200 từ/phút)
  const readingTime = useMemo(() => {
    const words = blog.content.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }, [blog.content]);

  // Tiến độ đọc
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const article = document.querySelector(".article");
      if (!article) return;
      const total = article.scrollHeight - window.innerHeight;
      const current = Math.min(total, window.scrollY);
      const pct = total > 0 ? Math.round((current / total) * 100) : 0;
      setProgress(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [imgLoaded, setImgLoaded] = useState(false);

  // Dark mode
  const [dark, setDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  // Chia sẻ
  const shareLink = async () => {
    const shareData = {
      title: blog.title,
      text: blog.title,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Đã sao chép liên kết vào clipboard!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Bài liên quan
  const related = fakeBlogs.filter((b) => b.id !== blog.id).slice(0, 2);

  // Render nội dung: tách đoạn và bullet
  const renderContent = (text) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const bullets = [];
    const paragraphs = [];
    lines.forEach((l) => {
      if (l.startsWith("🔹") || l.startsWith("-")) {
        bullets.push(l.replace(/^🔹\s?|-?\s?/, "").trim());
      } else {
        paragraphs.push(l);
      }
    });
    return (
      <>
        {paragraphs.map((p, idx) => (
          <p key={`p-${idx}`} className="lead">{p}</p>
        ))}
        {bullets.length > 0 && (
          <ul className="list">
            {bullets.map((item, idx) => (
              <li key={`li-${idx}`}>{item}</li>
            ))}
          </ul>
        )}
      </>
    );
  };

  return (
    <>
      <Navbar />
      {/* Thanh tiến độ đọc */}
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      <section className="blog">
        <div className="container">
          {/* Header + Theme toggle */}
          <div className="topbar">
            <nav className="breadcrumbs">
              <Link to="/" className="crumb">Trang chủ</Link>
              <span className="sep">/</span>
              <Link to="/" className="crumb">Blog</Link>
              <span className="sep">/</span>
              <span className="crumb current">{blog.title}</span>
            </nav>
          </div>

          {/* Hero */}
          <div className="hero">
            <div className={`hero-media ${imgLoaded ? "loaded" : ""}`}>
              <img
                src={blog.thumbnail}
                alt={blog.title}
                onLoad={() => setImgLoaded(true)}
              />
              <div className="hero-overlay" />
            </div>
            <div className="hero-content">
              <h1 className="title">{blog.title}</h1>
              <div className="meta">
                <span className="chip">🖊 {blog.author}</span>
                <span className="chip">📅 {blog.date}</span>
                <span className="chip">⏱ {readingTime} phút đọc</span>
              </div>
              <div className="tags">
                {blog.tags?.map((t) => (
                  <span key={t} className="tag">#{t}</span>
                ))}
              </div>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={shareLink}>
                  🔗 Chia sẻ
                </button>
                <button className="btn btn-outline" onClick={() => navigate(-1)}>
                  ← Quay lại
                </button>
              </div>
            </div>
          </div>

          {/* Nội dung + Sidebar */}
          <div className="grid">
            <article className="article card">
              {renderContent(blog.content)}

              <div className="divider" />

              <div className="share-row">
                <span className="muted">Thấy hữu ích?</span>
                <button className="btn btn-success" onClick={shareLink}>
                  📣 Chia sẻ bài viết
                </button>
              </div>
            </article>

            <aside className="sidebar">
              <div className="card author-card">
                <div className="author">
                  <div className="avatar" aria-hidden="true">👤</div>
                  <div>
                    <div className="author-name">{blog.author}</div>
                    <div className="author-role">Biên tập viên</div>
                  </div>
                </div>
                <p className="muted">
                  Chúng tôi chia sẻ kiến thức tuyển dụng, phát triển sự nghiệp và công nghệ.
                </p>
              </div>

              <div className="card related-card">
                <h3 className="card-title">Bài viết liên quan</h3>
                <ul className="related-list">
                  {related.map((b) => (
                    <li key={b.id} className="related-item">
                      <Link to={`/blog/${b.id}`} className="related-link">
                        <img src={b.thumbnail} alt={b.title} />
                        <div className="related-meta">
                          <span className="related-title">{b.title}</span>
                          <span className="related-date">📅 {b.date}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          {/* Điều hướng dưới */}
          <div className="bottom-nav">
            <Link to="/" className="btn btn-ghost">← Về trang chủ</Link>
            <Link to="/" className="btn btn-outline">Xem thêm bài viết</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetail;
``
