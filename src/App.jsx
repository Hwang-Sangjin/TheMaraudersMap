import { useState, useEffect } from "react";
import CanvasBackground from "./components/CanvasBackground";
import TransitionOverlay from "./components/TransitionOverlay";
import Header from "./components/Header";

import LoadingSection from "./sections/LoadingSection";
import IntroSection from "./sections/IntroSection";
import MainSection from "./sections/MainSection";
import AboutSection from "./sections/AboutSection";
import ContactSection from "./sections/ContactSection";

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

  // section에 따라 body scroll 제어
  useEffect(() => {
    if (["loading", "intro"].includes(currentSection)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [currentSection]);

  return (
    <>
      <CanvasBackground />

      {(currentSection === "main" ||
        currentSection === "about" ||
        currentSection === "contact") && <Header onNavigate={changeSection} />}

      <main className="relative z-20 pt-20 px-4">
        {currentSection === "loading" && (
          <LoadingSection onComplete={() => changeSection("intro")} />
        )}
        {currentSection === "intro" && (
          <IntroSection onEnter={() => changeSection("main")} />
        )}
        {currentSection === "main" && <MainSection />}
        {currentSection === "about" && <AboutSection />}
        {currentSection === "contact" && <ContactSection />}
      </main>

      <TransitionOverlay trigger={trigger} />
    </>
  );
}
