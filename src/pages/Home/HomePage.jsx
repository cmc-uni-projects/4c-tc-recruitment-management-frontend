import HomeSection from "../../components/Home/HomeSection";
import Navbar from "../../components/Layout/Navbar";
import BlogSection from "../../components/Blog/BlogSection";
import AboutSection from "../../components/About/AboutSection";
export default function HomePage() {
  return (
    <>
      <Navbar />
      <HomeSection />
      <BlogSection />
      <AboutSection />
    </>
  );
}
