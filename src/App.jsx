import { useState } from "react";
import TransitionPlane from "./TransitionPlane";
import LoadingSection from "./sections/Loading";
import IntroSection from "./sections/Intro";
import MainSection from "./sections/Main";
import AboutSection from "./sections/About";
import ContactSection from "./sections/Contact";

export default function App() {
  const [currentSection, setCurrentSection] = useState("loading");
  const [transitioning, setTransitioning] = useState(false);
  const [trigger, setTrigger] = useState(false);

  const changeSection = (nextSection) => {
    if (transitioning || nextSection === currentSection) return;
    setTransitioning(true);
    setTrigger((prev) => !prev);
    setTimeout(() => {
      setCurrentSection(nextSection);
      setTransitioning(false);
    }, 2500);
  };

  return (
    <>
      <TransitionPlane trigger={trigger} />

      {currentSection === "loading" && <LoadingSection />}
      {currentSection === "intro" && <IntroSection />}
      {currentSection === "main" && <MainSection />}
      {currentSection === "about" && <AboutSection />}
      {currentSection === "contact" && <ContactSection />}

      {/* 예시 버튼 */}
      <nav>
        <button onClick={() => changeSection("intro")}>Intro</button>
        <button onClick={() => changeSection("main")}>Main</button>
        <button onClick={() => changeSection("about")}>About</button>
        <button onClick={() => changeSection("contact")}>Contact</button>
      </nav>
    </>
  );
}
