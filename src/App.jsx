import { Canvas } from "@react-three/fiber";
import { useState } from "react";

import LoadingSection from "./sections/LoadingSection";
import IntroSection from "./sections/IntroSection";
import MainSection from "./sections/MainSection";
import AboutSection from "./sections/AboutSection";
import ContactSection from "./sections/ContactSection";
import TransitionPlane from "./components/TransitionPlane";
import StaticPaperBackground from "./components/StaticPaperBackground";

export default function App() {
  const [currentSection, setCurrentSection] = useState("loading");
  const [transitioning, setTransitioning] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const changeSection = (nextSection) => {
    console.log("onClicked");
    if (transitioning || nextSection === currentSection) return;
    setTransitioning(true);
    setTrigger((prev) => prev + 1); // 항상 새로운 값
    setTimeout(() => {
      setCurrentSection(nextSection);
      setTransitioning(false);
    }, 2500);
  };

  return (
    <>
      {/* 배경 */}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
        <Canvas
          style={{ pointerEvents: "none" }}
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ alpha: false }}
        >
          <StaticPaperBackground color="#f5ebd7" />
        </Canvas>
      </div>

      {/* nav 버튼 - 항상 상단 고정 */}
      <nav className="fixed top-0 left-0 w-full z-50  px-4 py-2 flex gap-4">
        <button onClick={() => changeSection("intro")}>Intro</button>
        <button onClick={() => changeSection("main")}>Main</button>
        <button onClick={() => changeSection("about")}>About</button>
        <button onClick={() => changeSection("contact")}>Contact</button>
      </nav>

      {/* 섹션 컨텐츠 - nav 밑으로 내려오게 */}
      <main className="relative z-20 pt-20 px-4">
        {currentSection === "loading" && <LoadingSection />}
        {currentSection === "intro" && <IntroSection />}
        {currentSection === "main" && <MainSection />}
        {currentSection === "about" && <AboutSection />}
        {currentSection === "contact" && <ContactSection />}
      </main>

      {/* 전환 효과 오버레이 */}
      <div className="fixed inset-0 z-100 pointer-events-none">
        <Canvas
          style={{ pointerEvents: "none" }}
          gl={{ alpha: true }}
          camera={{ position: [0, 0, 5], fov: 75 }}
        >
          <TransitionPlane trigger={trigger} />
        </Canvas>
      </div>
    </>
  );
}
