import HomeSection from "../../components/Home/HomeSection";
import Navbar from "../../components/Layout/Navbar";
import AboutSection from '../../components/About/AboutSection';
import BlogSection from "../../components/Blog/BlogSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HomeSection />
        <AboutSection />
<BlogSection />

    </>
  );
}
