import { useState, useEffect } from "react";

import CanvasBackground from "./components/CanvasBackground";
import TransitionOverlay from "./components/TransitionOverlay";
import Header from "./components/Header";

import LoadingSection from "./sections/LoadingSection";
import ImageSection from "./sections/ImageSection"; // 추가
import IntroSection from "./sections/IntroSection";
import MainSection from "./sections/MainSection";
import AboutSection from "./sections/AboutSection";
import ContactSection from "./sections/ContactSection";
import CustomCursorLayer from "./components/Cursor/CustomCursorLayer";
import MapBackground from "./components/MapBackground";

export default function App() {
  const [currentSection, setCurrentSection] = useState("loading");
  const [transitioning, setTransitioning] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const changeSection = (nextSection) => {
    if (transitioning || nextSection === currentSection) return;

    setTransitioning(true);
    setTrigger((prev) => prev + 1);

    setTimeout(() => {
      setCurrentSection(nextSection);
      setTransitioning(false);
    }, 2500);
  };

  // 스크롤 제어
  useEffect(() => {
    if (["loading", "image", "intro"].includes(currentSection)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [currentSection]);

  return (
    <div className="relative cursor-none">
      {/* 3D Background */}
      <CanvasBackground currentSection={currentSection} />

      {/* Header - main 이후 섹션에서만 표시 */}
      {(currentSection === "main" ||
        currentSection === "about" ||
        currentSection === "contact") && <Header onNavigate={changeSection} />}

      {/* Main Section UI */}
      <main className="relative z-20 pt-20 px-4">
        {currentSection === "loading" && (
          <LoadingSection onComplete={() => changeSection("main")} /> //image
        )}
        {currentSection === "image" && (
          <ImageSection onComplete={() => changeSection("intro")} />
        )}
        {currentSection === "intro" && (
          <IntroSection onEnter={() => changeSection("main")} />
        )}
        {currentSection === "main" && <MainSection />}
        {currentSection === "about" && <AboutSection />}
        {currentSection === "contact" && <ContactSection />}
      </main>

      {/* Transition Shader Overlay */}
      <TransitionOverlay trigger={trigger} />

      <CustomCursorLayer enabled={!transitioning} />
    </div>
  );
}
